// =====================================================================
// AR Trust — production seed (real operational data).
//
// Running it:
//   1. WIPES every table (empties the database).
//   2. Creates the super-admin "ar-trust" + 3 driver accounts (role
//      driver-guide — drivers live in the users table, managed from the
//      dedicated "Drivers" menu).
//   3. Loads AR Trust's real data from "Ar Trust det — Hotel.pdf":
//      5 hotels (with desk-rep contact numbers), tour + airport-transfer
//      platforms, airport/hotel-desk staff, and 13 fleet vehicles (with
//      make/model/colour) — the first three linked to the three drivers.
//   4. Seeds Qatar's currency (QAR base) + USD/EUR/GBP so money/reports work.
//
// Run with:  npm run db:seed -w @ar-trust/api
// Full reset (drop + re-migrate + seed): npx prisma migrate reset -w @ar-trust/api
//
// Credentials (override with env before seeding):
//   SUPERADMIN_USERNAME (default "ar-trust"), SUPERADMIN_EMAIL,
//   SUPERADMIN_PASSWORD (default "ArTrust@2026" — change after first login)
//   DRIVER_PASSWORD     (default "Driver@2026")
// =====================================================================

import bcrypt from 'bcryptjs';
import { PrismaClient, UserRole } from '@prisma/client';

const prisma = new PrismaClient();

const slug = (n: string) => n.toLowerCase().replace(/[^a-z0-9]+/g, '.').replace(/^\.|\.$/g, '');

// ---------------------------------------------------------------------
// 1. Wipe every table (best-effort per table).
// ---------------------------------------------------------------------
async function wipeDatabase() {
  const steps: Array<[string, () => Promise<unknown>]> = [
    ['invoices', () => prisma.invoice.deleteMany({})],
    ['payment_accounts', () => prisma.paymentAccount.deleteMany({})],
    ['platforms', () => prisma.platform.deleteMany({})],
    ['staff_ledger_entries', () => prisma.staffLedgerEntry.deleteMany({})],
    ['bookings', () => prisma.booking.deleteMany({})],
    ['hotel_bookings', () => prisma.hotelBooking.deleteMany({})],
    ['hotel_vendors', () => prisma.hotelVendor.deleteMany({})],
    ['desk_assignments', () => prisma.deskAssignment.deleteMany({})],
    ['notifications', () => prisma.notification.deleteMany({})],
    ['system_audit_logs', () => prisma.systemAuditLog.deleteMany({})],
    ['salary_records', () => prisma.salaryRecord.deleteMany({})],
    ['commission_rules', () => prisma.commissionRule.deleteMany({})],
    ['reviews', () => prisma.review.deleteMany({})],
    ['site_content', () => prisma.siteContent.deleteMany({})],
    ['uploads', () => prisma.upload.deleteMany({})],
    ['app_settings', () => prisma.appSetting.deleteMany({})],
    ['finance_expenses', () => prisma.financeExpense.deleteMany({})],
    ['currency_history', () => prisma.currencyHistory.deleteMany({})],
    ['currency_items', () => prisma.currencyItem.deleteMany({})],
    ['tour_packages', () => prisma.tourPackage.deleteMany({})],
    ['service_categories', () => prisma.serviceCategory.deleteMany({})],
    ['airport_desks', () => prisma.airportDesk.deleteMany({})],
    ['locations', () => prisma.location.deleteMany({})],
    ['guests', () => prisma.guest.deleteMany({})],
    ['guest_tiers', () => prisma.guestTier.deleteMany({})],
    ['employees', () => prisma.employee.deleteMany({})],
    ['tour_guides', () => prisma.tourGuide.deleteMany({})],
    ['drivers', () => prisma.driver.deleteMany({})],
    ['fleet_vehicles', () => prisma.fleetVehicle.deleteMany({})],
    ['users', () => prisma.user.deleteMany({})],
  ];
  for (const [name, run] of steps) {
    try {
      await run();
    } catch (err) {
      console.warn(`  • skip wipe ${name}: ${(err as Error).message.split('\n')[0]}`);
    }
  }
  console.log('✓ database emptied');
}

// ---------------------------------------------------------------------
// 2. Users: the super-admin + the drivers (role driver-guide).
// ---------------------------------------------------------------------
async function seedSuperAdmin() {
  const username = (process.env.SUPERADMIN_USERNAME ?? 'ar-trust').toLowerCase().trim();
  const email = (process.env.SUPERADMIN_EMAIL ?? 'admin@artrust.qa').toLowerCase().trim();
  const password = process.env.SUPERADMIN_PASSWORD ?? 'ArTrust@2026';
  await prisma.user.create({
    data: {
      name: 'AR Trust Administrator',
      username,
      email,
      passwordHash: await bcrypt.hash(password, 10),
      role: UserRole.super_admin,
      status: 'active',
      isEmailVerified: true,
      department: 'Executive Management',
    },
  });
  console.log(`✓ super-admin: "${username}" / "${email}" (change the password after first login)`);
}

const DRIVERS: Array<{ name: string; phone: string }> = [
  { name: 'Shojib Mohammed', phone: '+974 7778 0821' },
  { name: 'Ohidul Islam Kabir', phone: '+974 3335 8618' },
  { name: 'Golam Nafiul Hasan', phone: '+974 5072 9789' },
];

/** Drivers are USERS with role driver-guide. Returns their {id, name}. */
async function seedDrivers(): Promise<Array<{ id: string; name: string }>> {
  const password = process.env.DRIVER_PASSWORD ?? 'Driver@2026';
  const out: Array<{ id: string; name: string }> = [];
  for (const d of DRIVERS) {
    const user = await prisma.user.create({
      data: {
        name: d.name,
        username: slug(d.name),
        email: `${slug(d.name)}@artrust.qa`,
        passwordHash: await bcrypt.hash(password, 10),
        role: UserRole.driver_guide,
        status: 'active',
        isEmailVerified: true,
        phone: d.phone,
        department: 'Chauffeur Fleet & Transfers',
        jobTitle: 'Driver',
        staffStatus: 'Available',
      },
    });
    out.push({ id: user.id, name: user.name });
  }
  console.log(`✓ drivers (users, role driver-guide): ${out.length}`);
  return out;
}

// ---------------------------------------------------------------------
// 3. Fleet — 13 vehicles. make/model/colour now have their own columns;
//    the first three are linked to the three drivers.
// ---------------------------------------------------------------------
const VEHICLES: Array<{ plate: string; type: string; make: string; model: string; color: string; year: string; pax: number }> = [
  { plate: '124547', type: 'Coaster 22 Pax', make: 'Toyota', model: 'Coaster', color: 'White', year: '2022', pax: 22 },
  { plate: '141632', type: 'Minivan 12 Pax', make: 'Toyota', model: 'Hiace', color: 'White', year: '2022', pax: 12 },
  { plate: '782924', type: 'Minivan 9 Pax', make: 'Volkswagen', model: 'Caravelle', color: 'Black', year: '2020', pax: 9 },
  { plate: '347672', type: 'Minivan 7 Pax', make: 'Kia', model: 'Carnival', color: 'White', year: '2023', pax: 7 },
  { plate: '780282', type: 'Comfort Van 7 Pax', make: 'Hyundai', model: 'Staria', color: 'Black', year: '2025', pax: 7 },
  { plate: '987139', type: 'Comfort Van 7 Pax', make: 'Kia', model: 'Carnival', color: 'Black', year: '2025', pax: 7 },
  { plate: '85256', type: 'Economy 7 Pax', make: 'Toyota', model: 'Innova', color: 'White', year: '2022', pax: 7 },
  { plate: '9479', type: 'Medium 6 Pax', make: 'Mitsubishi', model: 'Xpander', color: 'Green Bronze', year: '2024', pax: 6 },
  { plate: '417792', type: 'MPV / 6–7 Seater', make: 'Kia', model: 'Carens', color: 'White', year: '2024', pax: 7 },
  { plate: '987140', type: 'MPV / 6–7 Seater', make: 'Kia', model: 'Carens', color: 'Gray', year: '2024', pax: 7 },
  { plate: '542105', type: 'Compact SUV', make: 'Changan', model: 'CS55', color: 'White', year: '2024', pax: 5 },
  { plate: '886896', type: 'Sedan 3 Pax', make: 'Changan', model: 'Eado', color: 'Gray', year: '2024', pax: 3 },
  { plate: '631416', type: 'Sedan 3 Pax', make: 'Toyota', model: 'Camry', color: 'White', year: '2022', pax: 3 },
];

async function seedFleet(drivers: Array<{ id: string; name: string }>) {
  let created = 0;
  for (let i = 0; i < VEHICLES.length; i++) {
    const v = VEHICLES[i];
    const driver = drivers[i]; // first three vehicles get a driver; rest unassigned
    await prisma.fleetVehicle.create({
      data: {
        name: `${v.make} ${v.model}`,
        category: v.type,
        passengers: v.pax,
        luggage: Math.max(1, Math.round(v.pax / 3)),
        priceQAR: 0,
        rateType: 'Per Trip',
        features: [v.type, v.color, `Model year ${v.year}`],
        image: '',
        idealFor: `Up to ${v.pax} passengers`,
        plateNumber: v.plate,
        modelYear: v.year,
        make: v.make,
        model: v.model,
        color: v.color,
        assignedDriverId: driver?.id,
        assignedDriverName: driver?.name,
        showOnWebsite: true,
      },
    });
    created++;
  }
  console.log(`✓ fleet vehicles: ${created} (${drivers.length} linked to drivers)`);
}

// ---------------------------------------------------------------------
// 4. Hotels — names + desk-rep contact numbers (number field = contactPhone).
// ---------------------------------------------------------------------
const HOTELS: Array<{ name: string; rep: string; phone: string }> = [
  { name: 'The Royal Riviera Hotel', rep: 'Arafat', phone: '+974 7011 9084' },
  { name: 'C - Hotel and Suites Doha', rep: 'Ali', phone: '+974 3044 1512' },
  { name: 'Central Inn Souq Waqif', rep: 'Tamim Ikbal', phone: '+974 3375 6839' },
  { name: 'The Avenue Hotel', rep: '', phone: '' },
  { name: 'West Walk Retaj Hotel', rep: '', phone: '' },
];

async function seedHotels() {
  const data = HOTELS.map((h) => ({
    name: h.name,
    locationZone: 'Doha',
    starRating: 0,
    contactPerson: h.rep,
    contactPhone: h.phone,
    contactEmail: '',
    address: 'Doha, Qatar',
    desks: [],
    roomOptions: [],
    contractStatus: 'Active',
    amenities: [],
    notes: h.rep ? `Hotel desk representative: ${h.rep}` : null,
  }));
  const res = await prisma.hotelVendor.createMany({ data, skipDuplicates: true });
  console.log(`✓ hotels: ${res.count}`);
}

// ---------------------------------------------------------------------
// 5. Platforms — tour + airport-transfer booking channels.
// ---------------------------------------------------------------------
const TOUR_PLATFORMS = ['Trip Advisor', 'GetYourGuide', 'Tour Radar', 'Tour HQ'];
const TRANSFER_PLATFORMS = [
  'World-Transfer (WT)', 'Talixo', 'My Transfer', 'City Guide', 'Sixt Ride', 'Rimo',
  'Kiwi Taxi', 'Airport Taxi', 'Get Transfer', 'Welcome Pickup', 'Connecto Transfers', 'TRANSFERO', 'iWay',
];

async function seedPlatforms() {
  const data = [
    ...TOUR_PLATFORMS.map((name, i) => ({ name, type: 'tour', sortOrder: i })),
    ...TRANSFER_PLATFORMS.map((name, i) => ({ name, type: 'airport-transfer', sortOrder: i })),
  ];
  const res = await prisma.platform.createMany({ data, skipDuplicates: true });
  console.log(`✓ platforms: ${res.count} (tour ${TOUR_PLATFORMS.length}, airport-transfer ${TRANSFER_PLATFORMS.length})`);
}

// ---------------------------------------------------------------------
// 6. Staff — airport + hotel-desk representatives (Employee records).
// ---------------------------------------------------------------------
const STAFF: Array<{ name: string; phone: string; role: string; department: string }> = [
  { name: 'Ahad', phone: '+974 5527 8092', role: 'Airport Representative', department: 'Airport Operations — Day Shift' },
  { name: 'Ratul', phone: '+974 7044 8640', role: 'Airport Representative', department: 'Airport Operations — Day Shift' },
  { name: 'Sazid', phone: '+974 5992 4154', role: 'Airport Representative', department: 'Airport Operations — Night Shift' },
  { name: 'Mahfuz', phone: '+974 6661 6957', role: 'Airport Representative', department: 'Airport Operations — Night Shift' },
  { name: 'Arafat', phone: '+974 7011 9084', role: 'Hotel Desk Representative', department: 'The Royal Riviera Hotel' },
  { name: 'Ali', phone: '+974 3044 1512', role: 'Hotel Desk Representative', department: 'C - Hotel and Suites Doha' },
  { name: 'Tamim Ikbal', phone: '+974 3375 6839', role: 'Hotel Desk Representative', department: 'Central Inn Souq Waqif' },
];

async function seedStaff() {
  const today = new Date().toISOString().slice(0, 10);
  const data = STAFF.map((s) => ({
    name: s.name,
    email: `${slug(s.name)}@artrust.qa`,
    phone: s.phone,
    role: s.role,
    department: s.department,
    status: 'Available',
    hireDate: today,
  }));
  const res = await prisma.employee.createMany({ data, skipDuplicates: true });
  console.log(`✓ staff (employees): ${res.count}`);
}

// ---------------------------------------------------------------------
// 7. Currencies + rates (QAR base).
// ---------------------------------------------------------------------
async function seedConfig() {
  await prisma.appSetting.create({
    data: { key: 'rates', value: { USD: 3.64, EUR: 3.96, GBP: 4.74, SAR: 0.97, lastUpdated: new Date().toISOString() } as never },
  });
  const currencies = [
    { code: 'QAR', name: 'Qatari Riyal', symbol: 'QAR', rateToQAR: 1, isPegged: true },
    { code: 'USD', name: 'US Dollar', symbol: '$', rateToQAR: 3.64, isPegged: true },
    { code: 'EUR', name: 'Euro', symbol: '€', rateToQAR: 3.96, isPegged: false },
    { code: 'GBP', name: 'British Pound', symbol: '£', rateToQAR: 4.74, isPegged: false },
  ];
  const res = await prisma.currencyItem.createMany({ data: currencies, skipDuplicates: true });
  console.log(`✓ currencies: ${res.count} (QAR base) + rates`);
}

async function main() {
  console.log('Seeding AR Trust database (real data)…\n');
  await wipeDatabase();
  await seedSuperAdmin();
  const drivers = await seedDrivers();
  await seedFleet(drivers);
  await seedHotels();
  await seedPlatforms();
  await seedStaff();
  await seedConfig();
  console.log('\n✅ Seed complete — super-admin + drivers + the PDF data + base currency only.');
}

main()
  .catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
