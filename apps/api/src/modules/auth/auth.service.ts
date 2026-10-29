import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import type { AuthResponse, UserAccount, UserRole } from '../../shared-types.js';
import { Prisma, UserRole as PrismaRole, type User } from '@prisma/client';
import { prisma } from '../../config/prisma.js';
import { env } from '../../config/env.js';
import { HttpError } from '../../middleware/error.js';
import { sendVerificationCodeEmail } from '../../lib/mailer.js';

// Prisma enum identifiers use underscores; the API contract uses hyphens.
const toApiRole = (r: PrismaRole): UserRole =>
  r.replace(/_/g, '-') as UserRole;
const toPrismaRole = (r: UserRole): PrismaRole =>
  r.replace(/-/g, '_') as PrismaRole;

/** Strip the password hash and normalise the role before returning a user. */
export function toPublicUser(user: User): UserAccount {
  return {
    id: user.id,
    name: user.name,
    nameAr: user.nameAr,
    username: user.username,
    email: user.email,
    role: toApiRole(user.role),
    phone: user.phone,
    avatar: user.avatar,
    department: user.department,
    vendorId: user.vendorId,
    status: user.status,
    lastLogin: user.lastLogin?.toISOString() ?? null,
    createdAt: user.createdAt.toISOString(),
    isEmailVerified: user.isEmailVerified,
    country: user.country,
    nationality: user.nationality,
    companyName: user.companyName,
    bio: user.bio,
    staffStatus: user.staffStatus,
    driverType: user.driverType,
    vipTier: user.vipTier,
  };
}

function signToken(user: User): string {
  return jwt.sign(
    { id: user.id, role: toApiRole(user.role), username: user.username },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn } as jwt.SignOptions
  );
}

/** Generate a fresh 6-digit code, persist its hash + expiry, and email it. */
async function issueVerificationCode(user: User): Promise<void> {
  // 6-digit numeric code, left-padded. crypto.randomInt is unbiased.
  const code = String(crypto.randomInt(0, 1_000_000)).padStart(6, '0');
  const codeHash = await bcrypt.hash(code, 10);
  const expiry = new Date(Date.now() + env.emailVerify.codeTtlMinutes * 60_000);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerifyCodeHash: codeHash,
      emailVerifyExpiry: expiry,
      emailVerifyAttempts: 0,
      emailVerifySentAt: new Date(),
    },
  });

  await sendVerificationCodeEmail({
    to: user.email,
    name: user.name,
    code,
    minutes: env.emailVerify.codeTtlMinutes,
  });
}

export async function register(input: {
  name: string;
  username: string;
  email: string;
  password: string;
  phone?: string;
}): Promise<{ user: UserAccount; requiresVerification: true }> {
  const passwordHash = await bcrypt.hash(input.password, 10);
  let user: User;
  try {
    user = await prisma.user.create({
      data: {
        name: input.name,
        username: input.username.toLowerCase(),
        email: input.email.toLowerCase(),
        passwordHash,
        phone: input.phone,
        // Public signups are always customers and start inactive + unverified.
        // The account is activated automatically once the emailed code is
        // confirmed (see verifyEmail), after which the user can sign in.
        role: PrismaRole.customer,
        status: 'inactive',
        isEmailVerified: false,
      },
    });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      throw new HttpError(409, 'A user with that username or email already exists');
    }
    throw err;
  }

  // Send the verification code. If the mail transport genuinely fails we still
  // keep the account (the user can request a resend), but surface the error.
  try {
    await issueVerificationCode(user);
  } catch (err) {
    console.error('[auth] failed to send verification code:', err);
  }

  // No token: the email isn't verified yet, so there is no session. The client
  // collects the code and calls verifyEmail next.
  return { user: toPublicUser(user), requiresVerification: true };
}

/**
 * Confirm an email verification code. On success the account is marked verified
 * AND activated (status → active) and a session token is returned so the user
 * is signed straight in.
 */
export async function verifyEmail(email: string, code: string): Promise<AuthResponse> {
  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (!user) throw new HttpError(404, 'No account found for that email address');

  if (user.isEmailVerified) {
    // Already verified — nothing to do; just issue a session if active.
    if (user.status === 'inactive') {
      throw new HttpError(403, 'This account is inactive — please contact an administrator.');
    }
    return { token: signToken(user), user: toPublicUser(user) };
  }

  if (!user.emailVerifyCodeHash || !user.emailVerifyExpiry) {
    throw new HttpError(400, 'No verification code is pending. Please request a new code.');
  }
  if (user.emailVerifyExpiry.getTime() < Date.now()) {
    throw new HttpError(400, 'This verification code has expired. Please request a new code.');
  }
  if (user.emailVerifyAttempts >= env.emailVerify.maxAttempts) {
    throw new HttpError(429, 'Too many incorrect attempts. Please request a new code.');
  }

  const matches = await bcrypt.compare(code.trim(), user.emailVerifyCodeHash);
  if (!matches) {
    await prisma.user.update({
      where: { id: user.id },
      data: { emailVerifyAttempts: { increment: 1 } },
    });
    throw new HttpError(400, 'That verification code is incorrect. Please try again.');
  }

  const verified = await prisma.user.update({
    where: { id: user.id },
    data: {
      isEmailVerified: true,
      emailVerifiedAt: new Date(),
      // Email verification activates the account so the user can sign in.
      status: 'active',
      emailVerifyCodeHash: null,
      emailVerifyExpiry: null,
      emailVerifyAttempts: 0,
      lastLogin: new Date(),
    },
  });

  return { token: signToken(verified), user: toPublicUser(verified) };
}

/**
 * Re-issue a verification code. Always resolves (no user enumeration) but
 * enforces a short cooldown between sends.
 */
export async function resendCode(email: string): Promise<{ ok: true }> {
  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (user && !user.isEmailVerified) {
    const last = user.emailVerifySentAt?.getTime() ?? 0;
    const waitMs = env.emailVerify.resendCooldownSeconds * 1000 - (Date.now() - last);
    if (waitMs > 0) {
      throw new HttpError(429, `Please wait ${Math.ceil(waitMs / 1000)}s before requesting a new code.`);
    }
    await issueVerificationCode(user);
  }
  return { ok: true };
}

export async function login(username: string, password: string): Promise<AuthResponse> {
  const user = await prisma.user.findFirst({
    where: {
      OR: [{ username: username.toLowerCase() }, { email: username.toLowerCase() }],
    },
  });
  if (!user) throw new HttpError(401, 'Invalid credentials');

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) throw new HttpError(401, 'Invalid credentials');

  // Combined gate: the email must be verified AND the account active. The
  // `email-not-verified` detail lets the client switch to the code-entry step.
  if (!user.isEmailVerified) {
    throw new HttpError(403, 'Please verify your email address to activate your account.', {
      code: 'email-not-verified',
      email: user.email,
    });
  }
  if (user.status === 'inactive') throw new HttpError(403, 'This account is inactive');

  await prisma.user.update({ where: { id: user.id }, data: { lastLogin: new Date() } });
  return { token: signToken(user), user: toPublicUser(user) };
}

export async function getById(id: string): Promise<UserAccount> {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw new HttpError(404, 'User not found');
  return toPublicUser(user);
}
