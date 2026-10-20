// =====================================================================
// Seed the Location catalogue (airports + resorts) and back-fill each agent
// desk's locationId. Idempotent — safe to re-run.
//
//   npm run seed:locations -w @ar-trust/api
// =====================================================================

import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function upsertLocation(data: {
  code: string;
  name: string;
  nameAr?: string | null;
  type: 'airport' | 'resort';
  city?: string | null;
  hotelVendorId?: string | null;
}) {
  return prisma.location.upsert({
    where: { code: data.code },
    update: { name: data.name, type: data.type, city: data.city ?? undefined, hotelVendorId: data.hotelVendorId ?? undefined },
    create: {
      code: data.code,
      name: data.name,
      nameAr: data.nameAr ?? undefined,
      type: data.type,
      city: data.city ?? 'Doha',
      hotelVendorId: data.hotelVendorId ?? undefined,
      active: true,
    },
  });
}

async function main() {
  // 1) Airports. The desks store the IATA code in `airportCode` (DOH for Hamad
  // International, DIA for the old Doha International), so the Location codes
  // must match those values.
  await prisma.location.deleteMany({ where: { code: 'HIA', desks: { none: {} } } }).catch(() => {});
  const hia = await upsertLocation({ code: 'DOH', name: 'Hamad International Airport', nameAr: 'مطار حمد الدولي', type: 'airport', city: 'Doha' });
  const dia = await upsertLocation({ code: 'DIA', name: 'Doha International Airport', nameAr: 'مطار الدوحة الدولي', type: 'airport', city: 'Doha' });
  const airportByCode: Record<string, string> = { DOH: hia.id, DIA: dia.id, HIA: hia.id };

  // 2) Resorts — one Location per hotel vendor.
  const vendors = await prisma.hotelVendor.findMany();
  const resortByVendorId: Record<string, string> = {};
  for (const v of vendors) {
    const loc = await upsertLocation({
      code: v.id.toUpperCase(), // unique, e.g. H-RITZ
      name: v.name,
      nameAr: (v as { nameAr?: string }).nameAr ?? null,
      type: 'resort',
      city: (v as { locationZone?: string }).locationZone ?? 'Doha',
      hotelVendorId: v.id,
    });
    resortByVendorId[v.id] = loc.id;
  }
  console.log(`Locations: 2 airports + ${vendors.length} resorts.`);

  // 3) Back-fill desks' locationId.
  const desks = await prisma.airportDesk.findMany();
  let linked = 0;
  for (const d of desks) {
    if (d.locationId) continue;
    let locationId: string | undefined;
    const isHotel = (d.deskType || '').toLowerCase().includes('hotel') || !!d.hotelVendorId;
    if (isHotel && d.hotelVendorId && resortByVendorId[d.hotelVendorId]) {
      locationId = resortByVendorId[d.hotelVendorId];
    } else if (!isHotel && airportByCode[d.airportCode]) {
      locationId = airportByCode[d.airportCode];
    } else if (d.hotelName) {
      // Fall back to matching a resort by name.
      const match = await prisma.location.findFirst({ where: { type: 'resort', name: d.hotelName } });
      if (match) locationId = match.id;
    }
    if (locationId) {
      await prisma.airportDesk.update({ where: { id: d.id }, data: { locationId } });
      linked++;
    } else {
      console.log(`  • no location matched for desk ${d.deskCode} (airportCode=${d.airportCode}, vendor=${d.hotelVendorId})`);
    }
  }
  console.log(`Linked ${linked}/${desks.length} desks to a location.`);
}

main()
  .catch((err) => {
    console.error('\n✖ seed:locations failed:', err instanceof Error ? err.message : err, '\n');
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
