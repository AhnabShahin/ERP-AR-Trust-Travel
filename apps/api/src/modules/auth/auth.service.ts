import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import type { AuthResponse, UserAccount, UserRole } from '@ar-trust/shared';
import { Prisma, UserRole as PrismaRole, type User } from '@prisma/client';
import { prisma } from '../../config/prisma.js';
import { env } from '../../config/env.js';
import { HttpError } from '../../middleware/error.js';

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
  };
}

function signToken(user: User): string {
  return jwt.sign(
    { id: user.id, role: toApiRole(user.role), username: user.username },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn } as jwt.SignOptions
  );
}

export async function register(input: {
  name: string;
  username: string;
  email: string;
  password: string;
  phone?: string;
}): Promise<{ user: UserAccount; pendingActivation: true }> {
  const passwordHash = await bcrypt.hash(input.password, 10);
  try {
    const user = await prisma.user.create({
      data: {
        name: input.name,
        username: input.username.toLowerCase(),
        email: input.email.toLowerCase(),
        passwordHash,
        phone: input.phone,
        // Public signups are always customers and start inactive — an admin
        // must activate the account before the user can sign in.
        role: PrismaRole.customer,
        status: 'inactive',
      },
    });
    // No token: the account is inactive, so there is no session yet. The user
    // must be activated by an admin before they can sign in.
    return { user: toPublicUser(user), pendingActivation: true };
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      throw new HttpError(409, 'A user with that username or email already exists');
    }
    throw err;
  }
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
  if (user.status === 'inactive') throw new HttpError(403, 'This account is inactive');

  await prisma.user.update({ where: { id: user.id }, data: { lastLogin: new Date() } });
  return { token: signToken(user), user: toPublicUser(user) };
}

export async function getById(id: string): Promise<UserAccount> {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw new HttpError(404, 'User not found');
  return toPublicUser(user);
}
