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

const EDITABLE = [
  'name', 'nameAr', 'phone', 'department', 'vendorId', 'status', 'avatar',
  'address', 'city', 'country', 'nationality', 'passportNumber', 'companyName', 'bio',
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
    const b = req.body as Record<string, unknown>;
    if (!b.name || !b.username || !b.email) {
      throw new HttpError(422, 'name, username and email are required');
    }
    const data: Prisma.UserCreateInput = {
      name: String(b.name),
      username: String(b.username).toLowerCase(),
      email: String(b.email).toLowerCase(),
      passwordHash: await bcrypt.hash(String(b.password || 'changeme123'), 10),
      role: toPrismaRole(b.role as string) ?? PrismaRole.customer,
    };
    for (const k of EDITABLE) if (b[k] !== undefined) (data as Record<string, unknown>)[k] = b[k];
    if (typeof b.id === 'string' && b.id) (data as Record<string, unknown>).id = b.id;
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
    const data: Record<string, unknown> = {};
    for (const k of EDITABLE) if (b[k] !== undefined) data[k] = b[k];
    if (b.email) data.email = String(b.email).toLowerCase();
    if (b.role) data.role = toPrismaRole(b.role as string);
    if (b.password) data.passwordHash = await bcrypt.hash(String(b.password), 10);
    const user = await prisma.user.update({ where: { id: req.params.id }, data });
    res.json({ ok: true, data: toPublicUser(user) });
  })
);

usersRouter.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const existing = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!existing) throw new HttpError(404, 'User not found');
    await prisma.user.delete({ where: { id: req.params.id } });
    res.json({ ok: true, data: { id: req.params.id } });
  })
);
