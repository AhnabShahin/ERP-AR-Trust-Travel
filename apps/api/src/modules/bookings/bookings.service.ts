import { Prisma } from '@prisma/client';
import { prisma } from '../../config/prisma.js';
import { HttpError } from '../../middleware/error.js';

export interface ListBookingsQuery {
  status?: string;
  source?: string;
  search?: string;
  skip?: number;
  take?: number;
}

export function list(query: ListBookingsQuery) {
  const where: Prisma.BookingWhereInput = {};
  if (query.status) where.qrStatus = query.status;
  if (query.source) where.source = query.source;
  if (query.search) {
    where.OR = [
      { passengerName: { contains: query.search } },
      { pnr: { contains: query.search } },
      { flightNumber: { contains: query.search } },
    ];
  }
  return prisma.$transaction([
    prisma.booking.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: query.skip ?? 0,
      take: Math.min(query.take ?? 50, 200),
    }),
    prisma.booking.count({ where }),
  ]);
}

export async function getById(id: string) {
  const booking = await prisma.booking.findUnique({ where: { id } });
  if (!booking) throw new HttpError(404, 'Booking not found');
  return booking;
}

export function create(data: Prisma.BookingCreateInput) {
  return prisma.booking.create({ data });
}

export async function update(id: string, data: Prisma.BookingUpdateInput) {
  await getById(id);
  return prisma.booking.update({ where: { id }, data });
}

export async function remove(id: string) {
  await getById(id);
  await prisma.booking.delete({ where: { id } });
}

// =====================================================================
// Service / trip workflow — assignment + status lifecycle with automatic
// driver & vehicle occupancy. A driver or vehicle is considered "busy" while
// it has any booking in tripStatus "On Trip".
// =====================================================================

type Actor = { id: string; username: string } | undefined;

export interface AssignInput {
  driverId?: string | null;
  driverName?: string | null;
  driverPhone?: string | null;
  vehicleId?: string | null;
  vehicleName?: string | null;
  vehiclePlate?: string | null;
  guideId?: string | null;
  guideName?: string | null;
}

const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  Scheduled: ['On Trip', 'Cancelled', 'No Show'],
  'On Trip': ['Completed', 'Cancelled'],
  Completed: [],
  Cancelled: [],
  'No Show': [],
};

type Tx = Prisma.TransactionClient;

async function driverBusy(client: Pick<typeof prisma, 'booking'> | Tx, driverId: string, exceptId: string) {
  const n = await client.booking.count({ where: { driverId, tripStatus: 'On Trip', id: { not: exceptId } } });
  return n > 0;
}
async function vehicleBusy(client: Pick<typeof prisma, 'booking'> | Tx, vehicleId: string, exceptId: string) {
  const n = await client.booking.count({ where: { vehicleId, tripStatus: 'On Trip', id: { not: exceptId } } });
  return n > 0;
}

/** Assign (or re-assign) a driver / vehicle / guide to a booking. */
export async function assign(id: string, input: AssignInput, actor: Actor) {
  const booking = await getById(id);
  if (input.driverId && (await driverBusy(prisma, input.driverId, id))) {
    throw new HttpError(409, 'That driver is already on another active trip.');
  }
  if (input.vehicleId && (await vehicleBusy(prisma, input.vehicleId, id))) {
    throw new HttpError(409, 'That vehicle is already on another active trip.');
  }
  return prisma.booking.update({
    where: { id },
    data: {
      driverId: input.driverId ?? undefined,
      driverName: input.driverName ?? undefined,
      driverPhone: input.driverPhone ?? undefined,
      vehicleId: input.vehicleId ?? undefined,
      vehicleName: input.vehicleName ?? undefined,
      vehiclePlate: input.vehiclePlate ?? undefined,
      guideId: input.guideId ?? undefined,
      guideName: input.guideName ?? undefined,
      updatedBy: actor?.id,
      updatedByName: actor?.username,
    },
  });
}

/** Move a booking through its trip lifecycle, flipping driver/vehicle occupancy. */
export async function transition(id: string, toStatus: string, actor: Actor, note?: string) {
  const booking = await getById(id);
  const from = booking.tripStatus;
  if (from === toStatus) return booking;
  if (!ALLOWED_TRANSITIONS[from]?.includes(toStatus)) {
    throw new HttpError(400, `Cannot change trip status from "${from}" to "${toStatus}".`);
  }

  if (toStatus === 'On Trip') {
    if (booking.driverId && (await driverBusy(prisma, booking.driverId, id))) {
      throw new HttpError(409, 'The assigned driver is already on another active trip.');
    }
    if (booking.vehicleId && (await vehicleBusy(prisma, booking.vehicleId, id))) {
      throw new HttpError(409, 'The assigned vehicle is already on another active trip.');
    }
  }

  const data: Prisma.BookingUpdateInput = {
    tripStatus: toStatus,
    updatedBy: actor?.id,
    updatedByName: actor?.username,
  };
  if (toStatus === 'On Trip') data.startedAt = new Date();
  if (toStatus === 'Completed') data.completedAt = new Date();

  await prisma.$transaction(async (tx) => {
    await tx.booking.update({ where: { id }, data });
    await tx.tripStatusLog.create({
      data: {
        bookingId: id,
        serviceType: booking.serviceType,
        fromStatus: from,
        toStatus,
        driverId: booking.driverId,
        vehicleId: booking.vehicleId,
        actorId: actor?.id,
        actorName: actor?.username,
        note,
      },
    });

    // Drivers are USERS (role driver-guide); their duty state lives on
    // User.staffStatus. Vehicles live in fleet_vehicles.
    if (toStatus === 'On Trip') {
      if (booking.driverId) {
        await tx.user.updateMany({ where: { id: booking.driverId }, data: { staffStatus: 'On Trip' } });
      }
      if (booking.vehicleId) {
        await tx.fleetVehicle.updateMany({ where: { id: booking.vehicleId }, data: { status: 'On Trip' } });
      }
    } else if (toStatus === 'Completed' || toStatus === 'Cancelled' || toStatus === 'No Show') {
      // Release the driver / vehicle unless still busy on another active trip.
      if (booking.driverId && !(await driverBusy(tx, booking.driverId, id))) {
        await tx.user.updateMany({ where: { id: booking.driverId }, data: { staffStatus: 'Available' } });
      }
      if (booking.vehicleId && !(await vehicleBusy(tx, booking.vehicleId, id))) {
        await tx.fleetVehicle.updateMany({ where: { id: booking.vehicleId }, data: { status: 'Available' } });
      }
    }
  });

  return getById(id);
}
