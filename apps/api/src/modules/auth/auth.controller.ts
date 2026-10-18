import type { Request, Response } from 'express';
import { z } from 'zod';
import * as authService from './auth.service.js';
import { HttpError } from '../../middleware/error.js';

const roleEnum = z.enum([
  'super-admin',
  'operations-manager',
  'transit-agent',
  'driver-guide',
  'finance-accountant',
  'vendor-partner',
  'customer',
]);

const registerSchema = z.object({
  name: z.string().min(2),
  username: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(6),
  role: roleEnum.optional(),
  phone: z.string().optional(),
});

const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

export async function register(req: Request, res: Response) {
  const input = registerSchema.parse(req.body);
  const result = await authService.register(input);
  res.status(201).json({ ok: true, data: result });
}

export async function login(req: Request, res: Response) {
  const { username, password } = loginSchema.parse(req.body);
  const result = await authService.login(username, password);
  res.json({ ok: true, data: result });
}

export async function me(req: Request, res: Response) {
  if (!req.user) throw new HttpError(401, 'Authentication required');
  const user = await authService.getById(req.user.id);
  res.json({ ok: true, data: user });
}
