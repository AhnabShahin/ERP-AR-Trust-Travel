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
