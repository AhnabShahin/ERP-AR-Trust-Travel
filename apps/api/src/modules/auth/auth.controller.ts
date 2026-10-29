import type { Request, Response } from 'express';
import { z } from 'zod';
import * as authService from './auth.service.js';
import { HttpError } from '../../middleware/error.js';

// Public self-service signup can only ever create a customer account, so the
// request body does NOT accept a role — it is forced to `customer` in the
// service. (Staff/admin accounts are created from the dashboard via
// /api/users by an admin or super-admin.)
const registerSchema = z.object({
  name: z.string().min(2),
  username: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(6),
  phone: z.string().optional(),
});

const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

const verifySchema = z.object({
  email: z.string().email(),
  code: z.string().regex(/^\d{6}$/, 'The code must be 6 digits'),
});

const resendSchema = z.object({
  email: z.string().email(),
});

export async function register(req: Request, res: Response) {
  const input = registerSchema.parse(req.body);
  const result = await authService.register(input);
  res.status(201).json({ ok: true, data: result });
}

export async function verifyEmail(req: Request, res: Response) {
  const { email, code } = verifySchema.parse(req.body);
  const result = await authService.verifyEmail(email, code);
  res.json({ ok: true, data: result });
}

export async function resendCode(req: Request, res: Response) {
  const { email } = resendSchema.parse(req.body);
  const result = await authService.resendCode(email);
  res.json({ ok: true, data: result });
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
