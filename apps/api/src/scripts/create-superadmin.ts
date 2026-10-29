// =====================================================================
// One-time super-admin bootstrap command.
//
// Run AFTER deploying the app to create the single super-admin account.
// The super-admin is the only account that can never be deleted, whose role
// can never change, and whose password only they can change.
//
//   npm run create-superadmin -w @ar-trust/api
//
// Credentials come from env vars (preferred) or CLI flags:
//   SUPERADMIN_NAME, SUPERADMIN_USERNAME, SUPERADMIN_EMAIL, SUPERADMIN_PASSWORD
//   --name "..." --username ... --email ... --password ...
//
// If a super-admin already exists the command refuses to run (there can be
// only one). Pass --force to reset the EXISTING super-admin's password/email.
// =====================================================================

import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { PrismaClient, UserRole } from '@prisma/client';

const prisma = new PrismaClient();

function arg(flag: string): string | undefined {
  const i = process.argv.indexOf(`--${flag}`);
  return i !== -1 ? process.argv[i + 1] : undefined;
}

function pick(envKey: string, flag: string): string | undefined {
  return process.env[envKey] ?? arg(flag);
}

async function main() {
  const force = process.argv.includes('--force');

  const name = pick('SUPERADMIN_NAME', 'name') ?? 'Super Administrator';
  const username = (pick('SUPERADMIN_USERNAME', 'username') ?? '').toLowerCase().trim();
  const email = (pick('SUPERADMIN_EMAIL', 'email') ?? '').toLowerCase().trim();
  const password = pick('SUPERADMIN_PASSWORD', 'password') ?? '';

  if (!username || !email || !password) {
    console.error(
      '\n✖ Missing credentials. Provide them via env vars or flags:\n' +
        '  SUPERADMIN_USERNAME, SUPERADMIN_EMAIL, SUPERADMIN_PASSWORD\n' +
        '  (or --username ... --email ... --password ... [--name "..."])\n'
    );
    process.exit(1);
  }
  if (password.length < 8) {
    console.error('\n✖ Password must be at least 8 characters.\n');
    process.exit(1);
  }

  const existing = await prisma.user.findFirst({ where: { role: UserRole.super_admin } });

  if (existing && !force) {
    console.error(
      `\n✖ A super-admin already exists (username: "${existing.username}"). ` +
        'There can be only one.\n  Use --force to reset its email/password instead.\n'
    );
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(password, 10);

  if (existing && force) {
    const updated = await prisma.user.update({
      where: { id: existing.id },
      data: { email, passwordHash, status: 'active', name, isEmailVerified: true, emailVerifiedAt: new Date() },
    });
    console.log(`\n✅ Reset the existing super-admin "${updated.username}" (${updated.email}).\n`);
    return;
  }

  const created = await prisma.user.create({
    data: {
      name,
      username,
      email,
      passwordHash,
      role: UserRole.super_admin,
      // The super-admin is the bootstrap account — created already active.
      status: 'active',
      isEmailVerified: true,
      department: 'Executive Management',
    },
  });
  console.log(`\n✅ Created super-admin "${created.username}" (${created.email}). You can now sign in.\n`);
}

main()
  .catch((err) => {
    console.error('\n✖ Failed to create super-admin:', err instanceof Error ? err.message : err, '\n');
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
