// =====================================================================
// User accounts CRUD (admin). Passwords are hashed here; responses never
// include the hash (toPublicUser). Client-supplied ids are honoured so the
// frontend and DB stay in sync, mirroring the generic CRUD modules.
// =====================================================================

import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { Prisma, UserRole as PrismaRole } from '@prisma/client';
import { prisma } from '../../config/prisma.js';
import { authenticate } from '../../middleware/auth.js';
import { asyncHandler, HttpError } from '../../middleware/error.js';
import { toPublicUser } from '../auth/auth.service.js';

const toPrismaRole = (r?: string): PrismaRole | undefined =>
  r ? (r.replace(/-/g, '_') as PrismaRole) : undefined;

// admin & super-admin may manage other users' accounts.
const isAdminRole = (role?: string): boolean =>
  role === 'super-admin' || role === 'admin';

// Profile fields anyone may change on their own account. `status` and `role`
// are deliberately excluded here — they are privileged and handled separately.
const EDITABLE = [
  'name', 'nameAr', 'phone', 'department', 'vendorId', 'avatar',
  'address', 'city', 'country', 'nationality', 'passportNumber', 'companyName', 'bio',
  // Staff/driver duty status — set from the dispatch board + staff screen.
  'staffStatus', 'jobTitle',
] as const;

export const usersRouter = Router();
usersRouter.use(authenticate);

usersRouter.get(
  '/',
  asyncHandler(async (_req, res) => {
    const users = await prisma.user.findMany({ orderBy: { createdAt: 'desc' } });
    res.json({ ok: true, data: users.map(toPublicUser), meta: { total: users.length } });
  })
);

usersRouter.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const user = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!user) throw new HttpError(404, 'User not found');
    res.json({ ok: true, data: toPublicUser(user) });
  })
);

usersRouter.post(
  '/',
  asyncHandler(async (req, res) => {
    // Only admins / super-admins create accounts from the dashboard.
    if (!isAdminRole(req.user?.role)) {
      throw new HttpError(403, 'Only an admin or super-admin can create accounts');
    }
    const b = req.body as Record<string, unknown>;
    if (!b.name || !b.username || !b.email) {
      throw new HttpError(422, 'name, username and email are required');
    }
    const role = toPrismaRole(b.role as string) ?? PrismaRole.customer;
    // The single super-admin is created only via the create-superadmin command.
    if (role === PrismaRole.super_admin) {
      throw new HttpError(403, 'The super-admin account can only be created via the server command');
    }
    const data: Prisma.UserCreateInput = {
      name: String(b.name),
      username: String(b.username).toLowerCase(),
      email: String(b.email).toLowerCase(),
      passwordHash: await bcrypt.hash(String(b.password || 'changeme123'), 10),
      role,
      // Every new account starts inactive and must be activated afterwards.
      status: 'inactive',
    };
    for (const k of EDITABLE) if (b[k] !== undefined) (data as Record<string, unknown>)[k] = b[k];
    if (typeof b.id === 'string' && b.id) (data as Record<string, unknown>).id = b.id;
    if (req.user) {
      const d = data as Record<string, unknown>;
      d.createdBy = req.user.id;
      d.createdByName = req.user.username;
      d.updatedBy = req.user.id;
      d.updatedByName = req.user.username;
    }
    try {
      const user = await prisma.user.create({ data });
      res.status(201).json({ ok: true, data: toPublicUser(user) });
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
        throw new HttpError(409, 'Username or email already exists');
      }
      throw err;
    }
  })
);

usersRouter.patch(
  '/:id',
  asyncHandler(async (req, res) => {
    const existing = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!existing) throw new HttpError(404, 'User not found');

    const b = req.body as Record<string, unknown>;
    const isSelf = req.user?.id === existing.id;
    const requesterIsAdmin = isAdminRole(req.user?.role);
    const targetIsSuperAdmin = existing.role === PrismaRole.super_admin;

    // You may edit your own profile; editing anyone else needs admin rights.
    if (!isSelf && !requesterIsAdmin) {
      throw new HttpError(403, 'Not allowed to edit this account');
    }

    const data: Record<string, unknown> = {};
    for (const k of EDITABLE) if (b[k] !== undefined) data[k] = b[k];
    if (b.email) data.email = String(b.email).toLowerCase();

    // Status (activate / deactivate) — only when it actually changes:
    // admin-only, and a super-admin can never be deactivated.
    if (b.status !== undefined && b.status !== existing.status) {
      if (!requesterIsAdmin) throw new HttpError(403, 'Only an admin can change account status');
      if (targetIsSuperAdmin && b.status === 'inactive') {
        throw new HttpError(403, 'The super-admin account cannot be deactivated');
      }
      data.status = b.status;
    }

    // Role changes — only when the role actually changes: admin-only, a
    // super-admin's role is immutable, and no one can be promoted to
    // super-admin here (that role is command-created).
    if (b.role !== undefined) {
      const newRole = toPrismaRole(b.role as string);
      if (newRole && newRole !== existing.role) {
        if (!requesterIsAdmin) throw new HttpError(403, 'Only an admin can change roles');
        if (targetIsSuperAdmin) throw new HttpError(403, 'The super-admin role cannot be changed');
        if (newRole === PrismaRole.super_admin) {
          throw new HttpError(403, 'Cannot assign the super-admin role');
        }
        data.role = newRole;
      }
    }

    // Password: the super-admin's password can only be changed by themselves;
    // otherwise self or an admin may set it.
    if (b.password) {
      if (targetIsSuperAdmin && !isSelf) {
        throw new HttpError(403, 'The super-admin password can only be changed by the super-admin');
      }
      if (!isSelf && !requesterIsAdmin) {
        throw new HttpError(403, 'Not allowed to change this password');
      }
      data.passwordHash = await bcrypt.hash(String(b.password), 10);
    }

    if (req.user) {
      const d = data as Record<string, unknown>;
      d.updatedBy = req.user.id;
      d.updatedByName = req.user.username;
    }

    const user = await prisma.user.update({ where: { id: req.params.id }, data });
    res.json({ ok: true, data: toPublicUser(user) });
  })
);

usersRouter.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    if (!isAdminRole(req.user?.role)) {
      throw new HttpError(403, 'Only an admin or super-admin can delete accounts');
    }
    const existing = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!existing) throw new HttpError(404, 'User not found');
    // The super-admin account can never be deleted.
    if (existing.role === PrismaRole.super_admin) {
      throw new HttpError(403, 'The super-admin account cannot be deleted');
    }
    await prisma.user.delete({ where: { id: req.params.id } });
    res.json({ ok: true, data: { id: req.params.id } });
  })
);
