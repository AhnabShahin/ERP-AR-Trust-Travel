import type { Request, Response } from 'express';
import { z } from 'zod';
import * as service from './invoices.service.js';

const itemSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  qty: z.number().nonnegative().default(1),
  unit: z.string().optional(),
  unitCost: z.number().nonnegative().default(0),
  vatPercent: z.number().nonnegative().optional(),
});

const createSchema = z.object({
  prefix: z.string().optional(),
  customerId: z.string().optional(),
  customerName: z.string().min(1),
  customerPhone: z.string().optional(),
  customerEmail: z.string().optional(),
  customerAddress: z.string().optional(),
  customerTRN: z.string().optional(),
  invoiceDate: z.string().min(1),
  dueDate: z.string().optional(),
  currency: z.string().optional(),
  items: z.array(itemSchema).min(1),
  discount: z.number().nonnegative().optional(),
  notes: z.string().optional(),
  terms: z.string().optional(),
  source: z.string().optional(),
  bookingId: z.string().optional(),
  bookingPnr: z.string().optional(),
});

const updateSchema = createSchema.partial().extend({
  status: z.string().optional(),
});

const paymentSchema = z.object({
  date: z.string().optional(),
  method: z.string().min(1),
  accountId: z.string().optional(),
  note: z.string().optional(),
  amount: z.number().positive(),
});

export async function list(req: Request, res: Response) {
  const [data, total] = await service.list({
    status: req.query.status as string | undefined,
    source: req.query.source as string | undefined,
    search: req.query.search as string | undefined,
    skip: req.query.skip ? Number(req.query.skip) : undefined,
    take: req.query.take ? Number(req.query.take) : undefined,
  });
  res.json({ ok: true, data, meta: { total } });
}

export async function get(req: Request, res: Response) {
  res.json({ ok: true, data: await service.getById(req.params.id) });
}

// Public (no auth) — fetch by opaque share token. Returns the invoice bundled
// with the company profile so the standalone share page can render fully.
export async function getPublic(req: Request, res: Response) {
  res.json({ ok: true, data: await service.getPublicPayload(req.params.token) });
}

export async function create(req: Request, res: Response) {
  const input = createSchema.parse(req.body);
  const bodyId = (req.body as { id?: unknown })?.id;
  const created = await service.create({
    ...input,
    id: typeof bodyId === 'string' && bodyId ? bodyId : undefined,
    audit: req.user ? { id: req.user.id, username: req.user.username } : undefined,
  });
  res.status(201).json({ ok: true, data: created });
}

export async function update(req: Request, res: Response) {
  const input = updateSchema.parse(req.body);
  const updated = await service.update(req.params.id, {
    ...input,
    audit: req.user ? { id: req.user.id, username: req.user.username } : undefined,
  });
  res.json({ ok: true, data: updated });
}

export async function addPayment(req: Request, res: Response) {
  const input = paymentSchema.parse(req.body);
  const updated = await service.addPayment(
    req.params.id,
    input,
    req.user ? { id: req.user.id, username: req.user.username } : undefined
  );
  res.json({ ok: true, data: updated });
}

export async function remove(req: Request, res: Response) {
  await service.remove(req.params.id);
  res.json({ ok: true, data: { id: req.params.id } });
}
