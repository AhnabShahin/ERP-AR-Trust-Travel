// =====================================================================
// Staff module — the "Employees & Desk Staff" screen now reads from the
// users table (role = staff) plus the staff_ledger_entries table, instead of
// the old standalone `employees` table.
//
// To keep the frontend unchanged, this endpoint speaks the legacy
// Employee shape: GET assembles it from a staff user + its ledger rows, and
// POST/PATCH decompose an Employee-shaped body back into the user's staff
// fields and its monthly ledger entries.
//   GET    /api/staff        list (Employee-shaped)
//   GET    /api/staff/:id    one
//   POST   /api/staff        create a staff user (+ ledger)
//   PATCH  /api/staff/:id    update staff fields (+ replace ledger)
//   DELETE /api/staff/:id    remove the staff user (ledger cascades)
// =====================================================================

import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { Prisma, UserRole as PrismaRole, type User, type StaffLedgerEntry } from '@prisma/client';
import { prisma } from '../../config/prisma.js';
import { authenticate } from '../../middleware/auth.js';
import { asyncHandler, HttpError } from '../../middleware/error.js';

// Roles allowed to create / edit / delete staff from the console.
const canManageStaff = (role?: string): boolean =>
  role === 'super-admin' || role === 'admin' || role === 'operations-manager';

type LedgerInput = Record<string, unknown>;

/** Map a StaffLedgerEntry row to the legacy EmployeeMonthlyRecord shape. */
function toMonthlyRecord(l: StaffLedgerEntry) {
  return {
    month: l.month,
    baseSalaryQAR: l.baseSalaryQAR,
    targetServices: l.targetServices,
    completedServices: l.completedServices,
    targetMet: l.completedServices >= l.targetServices,
    excessServices: l.excessServices,
    commissionRatePerService: l.commissionRatePerService,
    commissionEarnedQAR: l.commissionEarnedQAR,
    expensesReimbursedQAR: l.expensesReimbursedQAR,
    deductionsQAR: l.deductionsQAR,
    grossPayableQAR: l.grossPayableQAR,
    amountPaidQAR: l.amountPaidQAR,
    amountDueQAR: l.amountDueQAR,
    status: l.status,
    paidDate: l.paidDate ?? undefined,
    notes: l.notes ?? undefined,
  };
}

/** Assemble the legacy Employee shape from a staff user + its ledger rows. */
function toEmployeeShape(user: User & { ledgerEntries: StaffLedgerEntry[] }) {
  return {
    id: user.id,
    name: user.name,
    nameAr: user.nameAr ?? '',
    email: user.email,
    phone: user.phone ?? '',
    role: user.jobTitle ?? '',
    department: user.department ?? 'Operations',
    assignedAirport: user.assignedAirport ?? '',
    assignedDeskId: user.assignedDeskId ?? '',
    assignedDeskName: user.assignedDeskName ?? '',
    status: user.staffStatus ?? 'Available',
    hireDate: user.hireDate ?? '',
    baseSalaryMonthlyQAR: user.baseSalaryMonthlyQAR,
    monthlyServiceTarget: user.monthlyServiceTarget,
    commissionPerServiceQAR: user.commissionPerServiceQAR,
    monthlyRecords: (user.ledgerEntries ?? [])
      .slice()
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
      .map(toMonthlyRecord),
    totalExpensesQAR: user.totalExpensesQAR,
    rating: user.rating,
    emergencyContact: user.emergencyContact ?? '',
    // Expose the account status too so the UI can show activation state.
    accountStatus: user.status,
  };
}

const num = (v: unknown, d = 0): number => (typeof v === 'number' && !isNaN(v) ? v : d);
const int = (v: unknown, d = 0): number => (typeof v === 'number' && !isNaN(v) ? Math.trunc(v) : d);

/** Map an incoming EmployeeMonthlyRecord to StaffLedgerEntry columns. */
function ledgerColumns(r: LedgerInput) {
  return {
    month: String(r.month ?? ''),
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
  };
}

/** Build the user-level staff fields from an Employee-shaped body. */
function staffUserFields(b: Record<string, unknown>) {
  const out: Record<string, unknown> = {};
  if (b.name !== undefined) out.name = String(b.name);
  if (b.nameAr !== undefined) out.nameAr = b.nameAr ? String(b.nameAr) : null;
  if (b.phone !== undefined) out.phone = b.phone ? String(b.phone) : null;
  if (b.role !== undefined) out.jobTitle = b.role ? String(b.role) : null;
  if (b.department !== undefined) out.department = b.department ? String(b.department) : null;
  if (b.assignedAirport !== undefined) out.assignedAirport = b.assignedAirport ? String(b.assignedAirport) : null;
  if (b.assignedDeskId !== undefined) out.assignedDeskId = b.assignedDeskId ? String(b.assignedDeskId) : null;
  if (b.assignedDeskName !== undefined) out.assignedDeskName = b.assignedDeskName ? String(b.assignedDeskName) : null;
  if (b.status !== undefined) out.staffStatus = b.status ? String(b.status) : null;
  if (b.hireDate !== undefined) out.hireDate = b.hireDate ? String(b.hireDate) : null;
  if (b.baseSalaryMonthlyQAR !== undefined) out.baseSalaryMonthlyQAR = num(b.baseSalaryMonthlyQAR);
  if (b.monthlyServiceTarget !== undefined) out.monthlyServiceTarget = int(b.monthlyServiceTarget);
  if (b.commissionPerServiceQAR !== undefined) out.commissionPerServiceQAR = num(b.commissionPerServiceQAR);
  if (b.rating !== undefined) out.rating = num(b.rating);
  if (b.totalExpensesQAR !== undefined) out.totalExpensesQAR = num(b.totalExpensesQAR);
  if (b.emergencyContact !== undefined) out.emergencyContact = b.emergencyContact ? String(b.emergencyContact) : null;
  return out;
}

/** Generate a unique username from an email / name. */
async function uniqueUsername(email: string, name: string): Promise<string> {
  const base =
    (email.split('@')[0] || name.replace(/\s+/g, '.'))
      .toLowerCase()
      .replace(/[^a-z0-9._-]/g, '')
      .slice(0, 24) || 'staff';
  let candidate = base;
  let n = 1;
  // Try base, then base1, base2, … until free.
  while (await prisma.user.findUnique({ where: { username: candidate } })) {
    candidate = `${base}${n++}`;
  }
  return candidate;
}

export const staffRouter = Router();
staffRouter.use(authenticate);

async function loadStaff(id: string) {
  return prisma.user.findFirst({
    where: { id, role: PrismaRole.staff },
    include: { ledgerEntries: true },
  });
}

staffRouter.get(
  '/',
  asyncHandler(async (_req, res) => {
    const users = await prisma.user.findMany({
      where: { role: PrismaRole.staff },
      include: { ledgerEntries: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ ok: true, data: users.map(toEmployeeShape), meta: { total: users.length } });
  })
);

staffRouter.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const user = await loadStaff(req.params.id);
    if (!user) throw new HttpError(404, 'Staff member not found');
    res.json({ ok: true, data: toEmployeeShape(user) });
  })
);

staffRouter.post(
  '/',
  asyncHandler(async (req, res) => {
    if (!canManageStaff(req.user?.role)) {
      throw new HttpError(403, 'Only an admin or operations manager can add staff');
    }
    const b = req.body as Record<string, unknown>;
    if (!b.name || !b.email) throw new HttpError(422, 'name and email are required');

    const email = String(b.email).toLowerCase();
    const username =
      (typeof b.username === 'string' && b.username) ||
      (await uniqueUsername(email, String(b.name)));
    const records = Array.isArray(b.monthlyRecords) ? (b.monthlyRecords as LedgerInput[]) : [];

    const data: Prisma.UserCreateInput = {
      ...(staffUserFields(b) as object),
      name: String(b.name),
      email,
      username: String(username).toLowerCase(),
      // A fresh staff account starts inactive (must be activated to sign in)
      // and gets a default password the admin can reset.
      passwordHash: await bcrypt.hash(String(b.password || 'staff12345'), 10),
      role: PrismaRole.staff,
      status: 'inactive',
      ledgerEntries: records.length
        ? { create: records.map(ledgerColumns) }
        : undefined,
    };
    if (typeof b.id === 'string' && b.id) (data as Record<string, unknown>).id = b.id;
    if (req.user) {
      const d = data as Record<string, unknown>;
      d.createdBy = req.user.id;
      d.createdByName = req.user.username;
      d.updatedBy = req.user.id;
      d.updatedByName = req.user.username;
    }

    try {
      await prisma.user.create({ data });
      const created = await loadStaff(
        typeof b.id === 'string' && b.id ? b.id : (await prisma.user.findUnique({ where: { username: String(username).toLowerCase() } }))!.id
      );
      res.status(201).json({ ok: true, data: created ? toEmployeeShape(created) : null });
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
        throw new HttpError(409, 'A user with that username or email already exists');
      }
      throw err;
    }
  })
);

staffRouter.patch(
  '/:id',
  asyncHandler(async (req, res) => {
    if (!canManageStaff(req.user?.role)) {
      throw new HttpError(403, 'Only an admin or operations manager can edit staff');
    }
    const existing = await loadStaff(req.params.id);
    if (!existing) throw new HttpError(404, 'Staff member not found');
    const b = req.body as Record<string, unknown>;

    const userData = staffUserFields(b);
    if (b.email) userData.email = String(b.email).toLowerCase();
    if (req.user) {
      (userData as Record<string, unknown>).updatedBy = req.user.id;
      (userData as Record<string, unknown>).updatedByName = req.user.username;
    }

    await prisma.user.update({ where: { id: existing.id }, data: userData });

    // When the body carries monthlyRecords, treat it as the full ledger and
    // upsert each month (replacing the stored set for any months provided).
    if (Array.isArray(b.monthlyRecords)) {
      const records = b.monthlyRecords as LedgerInput[];
      for (const r of records) {
        const cols = ledgerColumns(r);
        if (!cols.month) continue;
        await prisma.staffLedgerEntry.upsert({
          where: { userId_month: { userId: existing.id, month: cols.month } },
          create: { ...cols, userId: existing.id },
          update: cols,
        });
      }
    }

    const updated = await loadStaff(existing.id);
    res.json({ ok: true, data: updated ? toEmployeeShape(updated) : null });
  })
);

staffRouter.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    if (!canManageStaff(req.user?.role)) {
      throw new HttpError(403, 'Only an admin or operations manager can remove staff');
    }
    const existing = await loadStaff(req.params.id);
    if (!existing) throw new HttpError(404, 'Staff member not found');
    await prisma.user.delete({ where: { id: existing.id } });
    res.json({ ok: true, data: { id: existing.id } });
  })
);
