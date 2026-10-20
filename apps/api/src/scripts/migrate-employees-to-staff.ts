// =====================================================================
// One-time migration: copy rows from the legacy `employees` table into the
// users table as staff accounts (role = staff) plus staff_ledger_entries.
//
//   npm run migrate:staff -w @ar-trust/api
//
// Idempotent: an employee already migrated (a staff user with the same id or
// email) is skipped. Migrated staff are created ACTIVE (they are existing
// staff). The legacy `employees` table is left untouched.
// =====================================================================

import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { PrismaClient, UserRole } from '@prisma/client';

const prisma = new PrismaClient();

const num = (v: unknown, d = 0) => (typeof v === 'number' && !isNaN(v) ? v : d);
const int = (v: unknown, d = 0) => (typeof v === 'number' && !isNaN(v) ? Math.trunc(v) : d);

async function uniqueUsername(email: string, name: string): Promise<string> {
  const base =
    (email.split('@')[0] || name.replace(/\s+/g, '.'))
      .toLowerCase()
      .replace(/[^a-z0-9._-]/g, '')
      .slice(0, 24) || 'staff';
  let candidate = base;
  let n = 1;
  while (await prisma.user.findUnique({ where: { username: candidate } })) {
    candidate = `${base}${n++}`;
  }
  return candidate;
}

async function main() {
  const employees = await prisma.employee.findMany();
  console.log(`Found ${employees.length} legacy employees.`);

  let created = 0;
  let skipped = 0;

  for (const e of employees) {
    const email = (e.email || '').toLowerCase();

    // Already migrated? (staff user with same id, or any user with same email)
    const byId = await prisma.user.findUnique({ where: { id: e.id } });
    const byEmail = email ? await prisma.user.findUnique({ where: { email } }) : null;
    if (byId || byEmail) {
      skipped++;
      console.log(`  • skip "${e.name}" (${email}) — a user already exists`);
      continue;
    }

    const username = await uniqueUsername(email || e.name, e.name);
    const records = Array.isArray(e.monthlyRecords) ? (e.monthlyRecords as Record<string, unknown>[]) : [];

    await prisma.user.create({
      data: {
        id: e.id, // keep the same id so references stay stable
        name: e.name,
        nameAr: e.nameAr,
        username,
        email: email || `${username}@staff.local`,
        passwordHash: await bcrypt.hash('staff12345', 10),
        role: UserRole.staff,
        status: 'active', // existing staff are active
        phone: e.phone,
        department: e.department,
        emergencyContact: e.emergencyContact,
        jobTitle: e.role,
        assignedAirport: e.assignedAirport,
        assignedDeskId: e.assignedDeskId,
        assignedDeskName: e.assignedDeskName,
        staffStatus: e.status,
        hireDate: e.hireDate,
        baseSalaryMonthlyQAR: e.baseSalaryMonthlyQAR,
        monthlyServiceTarget: e.monthlyServiceTarget,
        commissionPerServiceQAR: e.commissionPerServiceQAR,
        rating: e.rating,
        totalExpensesQAR: e.totalExpensesQAR,
        ledgerEntries: {
          create: records
            .filter((r) => r && r.month)
            .map((r) => ({
              month: String(r.month),
              baseSalaryQAR: num(r.baseSalaryQAR),
              targetServices: int(r.targetServices),
              completedServices: int(r.completedServices),
              excessServices: int(r.excessServices),
              commissionRatePerService: num(r.commissionRatePerService),
              commissionEarnedQAR: num(r.commissionEarnedQAR),
              expensesReimbursedQAR: num(r.expensesReimbursedQAR),
              deductionsQAR: num(r.deductionsQAR),
              grossPayableQAR: num(r.grossPayableQAR),
              amountPaidQAR: num(r.amountPaidQAR),
              amountDueQAR: num(r.amountDueQAR),
              status: String(r.status ?? 'Pending Payout'),
              paidDate: r.paidDate ? String(r.paidDate) : null,
              notes: r.notes ? String(r.notes) : null,
            })),
        },
      },
    });
    created++;
    console.log(`  ✓ migrated "${e.name}" as staff user "${username}" (${records.length} ledger rows)`);
  }

  console.log(`\nDone. Created ${created} staff users, skipped ${skipped}.`);
}

main()
  .catch((err) => {
    console.error('\n✖ Migration failed:', err instanceof Error ? err.message : err, '\n');
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
