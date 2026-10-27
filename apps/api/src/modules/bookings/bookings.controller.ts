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
  terminalGate: z.string().optional(),
  pickupBay: z.string().optional(),
  packageId: z.string().min(1),
  packageName: z.string().min(1),
  packageNameAr: z.string().optional(),
  paxCount: z.number().int().positive().default(1),
  totalQAR: z.number().nonnegative().default(0),
  paymentCurrency: z.string().default('QAR'),
  paymentMethod: z.string().min(1),
  qrStatus: z.string().default('pending'),
  qrCodeUrl: z.string().optional(),
  voucherSent: z.boolean().optional(),
  source: z.string().default('Airport Desk'),
  leadType: z.string().optional(),
  driverId: z.string().optional(),
  driverName: z.string().optional(),
  driverPhone: z.string().optional(),
  driverVehicle: z.string().optional(),
  guideId: z.string().optional(),
  guideName: z.string().optional(),
  deskId: z.string().optional(),
  deskCode: z.string().optional(),
  bookingDate: z.string().optional(),
  bookingTime: z.string().optional(),
  notes: z.string().optional(),
  // ---- Service / trip layer ----
  serviceType: z.string().optional(),
  customerId: z.string().optional(),
  vehicleId: z.string().optional(),
  vehicleName: z.string().optional(),
  vehiclePlate: z.string().optional(),
  tripStatus: z.string().optional(),
  scheduledStart: z.string().datetime().optional(),
  scheduledEnd: z.string().datetime().optional(),
  startedAt: z.string().datetime().optional(),
  completedAt: z.string().datetime().optional(),
  invoiceId: z.string().optional(),
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
  if (req.user) {
    input.createdBy = req.user.id;
    input.createdByName = req.user.username;
    input.updatedBy = req.user.id;
    input.updatedByName = req.user.username;
  }
  res.status(201).json({ ok: true, data: await service.create(input as never) });
}

export async function update(req: Request, res: Response) {
  const input = updateSchema.parse(req.body) as Record<string, unknown>;
  if (req.user) {
    input.updatedBy = req.user.id;
    input.updatedByName = req.user.username;
  }
  res.json({ ok: true, data: await service.update(req.params.id, input as never) });
}

export async function remove(req: Request, res: Response) {
  await service.remove(req.params.id);
  res.json({ ok: true, data: { id: req.params.id } });
}

const assignSchema = z.object({
  driverId: z.string().nullish(),
  driverName: z.string().nullish(),
  driverPhone: z.string().nullish(),
  vehicleId: z.string().nullish(),
  vehicleName: z.string().nullish(),
  vehiclePlate: z.string().nullish(),
  guideId: z.string().nullish(),
  guideName: z.string().nullish(),
});

export async function assign(req: Request, res: Response) {
  const input = assignSchema.parse(req.body);
  res.json({ ok: true, data: await service.assign(req.params.id, input, req.user) });
}

const transitionSchema = z.object({
  status: z.enum(['Scheduled', 'On Trip', 'Completed', 'Cancelled', 'No Show']),
  note: z.string().optional(),
});

export async function transition(req: Request, res: Response) {
  const { status, note } = transitionSchema.parse(req.body);
  res.json({ ok: true, data: await service.transition(req.params.id, status, req.user, note) });
}
