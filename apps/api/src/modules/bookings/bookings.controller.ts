import type { Request, Response } from 'express';
import { z } from 'zod';
import * as service from './bookings.service.js';

const createSchema = z.object({
  pnr: z.string().min(1),
  passengerName: z.string().min(1),
  passengerPhone: z.string().min(1),
  passengerEmail: z.string().email(),
  nationality: z.string().min(1),
  flightNumber: z.string().min(1),
  arrivalAirport: z.string().min(1),
  arrivalTime: z.string().min(1),
  packageId: z.string().min(1),
  packageName: z.string().min(1),
  paxCount: z.number().int().positive().default(1),
  totalQAR: z.number().nonnegative().default(0),
  paymentCurrency: z.string().default('QAR'),
  paymentMethod: z.string().min(1),
  qrStatus: z.string().default('pending'),
  source: z.string().default('Airport Desk'),
  driverId: z.string().optional(),
  driverName: z.string().optional(),
  guideId: z.string().optional(),
  guideName: z.string().optional(),
  bookingDate: z.string().optional(),
  bookingTime: z.string().optional(),
  notes: z.string().optional(),
});

const updateSchema = createSchema.partial();

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

export async function create(req: Request, res: Response) {
  const input = createSchema.parse(req.body) as Record<string, unknown>;
  // Honour a client-supplied id so the frontend and DB stay in sync.
  const bodyId = (req.body as { id?: unknown })?.id;
  if (typeof bodyId === 'string' && bodyId) input.id = bodyId;
  res.status(201).json({ ok: true, data: await service.create(input as never) });
}

export async function update(req: Request, res: Response) {
  const input = updateSchema.parse(req.body);
  res.json({ ok: true, data: await service.update(req.params.id, input) });
}

export async function remove(req: Request, res: Response) {
  await service.remove(req.params.id);
  res.json({ ok: true, data: { id: req.params.id } });
}
