// =====================================================================
// Single unified seed — one command sets up a ready-to-use database:
//   1. Demo users, one per role (so you can sign in as each role).
//   2. The full catalogue + operational data, loaded from the app's own
//      mock dataset (fleet, tour packages, vendors, guests, bookings, finance,
//      currencies, desks, …) so the dashboard AND the public website have data.
//   3. Singleton config (rates, shift drawer, package categories, service map).
//
// mockData.ts imports image assets, so we bundle it with esbuild (stubbing image
// imports to their /media public path) before importing it under Node. Field
// selection is driven by the Prisma DMMF, so only columns that exist on each
// model are inserted and invalid date strings fall back to defaults.
//
// Run with:  npm run db:seed          (or: npm run prisma:seed -w @ar-trust/api)
// The super-admin is NOT seeded here — create it once after deploy with:
//            npm run create-superadmin -w @ar-trust/api
// =====================================================================

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import bcrypt from 'bcryptjs';
import * as esbuild from 'esbuild';
import { Prisma, PrismaClient, UserRole } from '@prisma/client';

const prisma = new PrismaClient();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const mockPath = path.resolve(__dirname, '../../web/src/data/mockData.ts');

const toPrismaRole = (r: string): UserRole => r.replace(/-/g, '_') as UserRole;

// ---------------------------------------------------------------------
// 1. Demo users (one per role). Passwords are the mock plaintext values,
//    hashed here. Upserted so re-seeding never duplicates accounts.
// ---------------------------------------------------------------------
const demoUsers: Array<{
  name: string; nameAr?: string; username: string; email: string; password: string;
  role: string; department?: string; phone?: string; vendorId?: string; isEmailVerified?: boolean;
}> = [
  { name: 'Tariq Al-Sulaiti', nameAr: 'طارق السليطي', username: 'ops', email: 'ops@artrust.qa', password: 'ops123', role: 'operations-manager', department: 'Operations & Dispatch Desk', phone: '+974 5512 8841', isEmailVerified: true },
  { name: 'Zaid Qasim', nameAr: 'زيد قاسم', username: 'agent', email: 'agent@artrust.qa', password: 'agent123', role: 'transit-agent', department: 'Airport Arrivals Counter 4 & Hotels', phone: '+974 6690 1243' },
  { name: 'Tariq Al-Kuwari', nameAr: 'طارق الكواري', username: 'driver', email: 'driver@artrust.qa', password: 'driver123', role: 'driver-guide', department: 'Chauffeur Fleet & Desert Guides', phone: '+974 7741 9920' },
  { name: 'Khalid Al-Nuaimi CPA', nameAr: 'خالد النعيمي', username: 'finance', email: 'finance@artrust.qa', password: 'finance123', role: 'finance-accountant', department: 'Treasury & Audit Division', phone: '+974 3321 0098', isEmailVerified: true },
  { name: 'Bader Al-Husseini (The Ritz-Carlton)', nameAr: 'بدر الحسيني', username: 'ritz', email: 'concierge.doha@ritzcarlton.com', password: 'ritz123', role: 'vendor-partner', vendorId: 'h-ritz', department: 'The Ritz-Carlton, Doha', phone: '+974 4484 8000', isEmailVerified: true },
  { name: 'Marc de Saint-Germain (Fairmont)', nameAr: 'مارك دي سان جيرمان', username: 'fairmont', email: 'vipconcierge.doha@fairmont.com', password: 'fairmont123', role: 'vendor-partner', vendorId: 'h-fairmont', department: 'Fairmont & Raffles Doha', phone: '+974 4030 7777' },
  { name: 'Layla Al-Kuwari (Marsa Malaz)', nameAr: 'ليلى الكواري', username: 'kempinski', email: 'reservations.marsamalaz@kempinski.com', password: 'marsa123', role: 'vendor-partner', vendorId: 'h-marsamalaz', department: 'Marsa Malaz Kempinski', phone: '+974 4035 5555', isEmailVerified: true },
  { name: 'Alexander Wright', nameAr: 'ألكسندر رايت', username: 'customer', email: 'traveler.wright@gmail.com', password: 'customer123', role: 'customer', department: 'VIP Leisure Traveler', phone: '+44 7911 123456' },
];

async function seedUsers() {
  for (const u of demoUsers) {
    const passwordHash = await bcrypt.hash(u.password, 10);
    await prisma.user.upsert({
      where: { username: u.username },
      update: {},
      create: {
        name: u.name, nameAr: u.nameAr, username: u.username, email: u.email, passwordHash,
        role: toPrismaRole(u.role), department: u.department, phone: u.phone, vendorId: u.vendorId,
        status: 'active', isEmailVerified: u.isEmailVerified ?? false,
      },
    });
  }
  console.log(`✓ users: ${demoUsers.length} demo accounts (ops/ops123, agent/agent123, driver/driver123, finance/finance123, customer/customer123, + 3 vendor-partners)`);
}

// ---------------------------------------------------------------------
// 2. Catalogue + operational data from the app's mock dataset.
// ---------------------------------------------------------------------
const imageStub: esbuild.Plugin = {
  name: 'image-stub',
  setup(build) {
    build.onResolve({ filter: /\.(jpg|jpeg|png|gif|webp|svg)$/ }, (args) => ({ path: args.path, namespace: 'img-stub' }));
    build.onLoad({ filter: /.*/, namespace: 'img-stub' }, (args) => ({
      contents: `export default ${JSON.stringify('/media/' + path.basename(args.path))}`,
      loader: 'js',
    }));
  },
};

async function loadMockData(): Promise<Record<string, unknown>> {
  const outFile = path.join(os.tmpdir(), `artrust-mock-${Date.now()}.mjs`);
  await esbuild.build({
    entryPoints: [mockPath], bundle: true, format: 'esm', platform: 'node',
    outfile: outFile, plugins: [imageStub], logLevel: 'silent',
  });
  const mod = await import('file://' + outFile.replace(/\\/g, '/'));
  try { fs.unlinkSync(outFile); } catch { /* ignore */ }
  return mod as Record<string, unknown>;
}

const modelByName = Object.fromEntries(Prisma.dmmf.datamodel.models.map((m) => [m.name, m]));

function delegateFor(modelName: string) {
  const key = modelName.charAt(0).toLowerCase() + modelName.slice(1);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (prisma as any)[key];
}

/** Keep only columns that exist on the model; coerce/skip DateTime strings. */
function sanitise(modelName: string, row: Record<string, unknown>) {
  const model = modelByName[modelName];
  const out: Record<string, unknown> = {};
  for (const field of model.fields) {
    if (field.relationName) continue;
    if (field.kind === 'object') continue;
    const value = row[field.name];
    if (value === undefined || value === null) continue;
    if (field.type === 'DateTime') {
      const d = new Date(value as string);
      if (Number.isNaN(d.getTime())) continue;
      out[field.name] = d;
    } else {
      out[field.name] = value;
    }
  }
  return out;
}

async function seedModel(modelName: string, rows: unknown): Promise<void> {
  if (!Array.isArray(rows) || rows.length === 0) { console.log(`• ${modelName}: no data`); return; }
  const delegate = delegateFor(modelName);
  const data = rows.map((r) => sanitise(modelName, r as Record<string, unknown>));
  try {
    await delegate.deleteMany({});
    const res = await delegate.createMany({ data, skipDuplicates: true });
    console.log(`✓ ${modelName}: inserted ${res.count}/${rows.length}`);
  } catch (err) {
    console.error(`✗ ${modelName}: ${(err as Error).message.split('\n')[0]}`);
  }
}

async function seedCatalogue() {
  const mock = await loadMockData();

  // Prisma model -> mock export name.
  const plan: Array<[string, string]> = [
    ['GuestTier', 'INITIAL_GUEST_TIERS'],
    ['FleetVehicle', 'INITIAL_FLEET_VEHICLES'],
    ['Driver', 'INITIAL_DRIVERS'],
    ['TourGuide', 'INITIAL_TOUR_GUIDES'],
    ['Guest', 'INITIAL_GUESTS'],
    ['Booking', 'INITIAL_BOOKINGS'],
    ['HotelVendor', 'INITIAL_HOTEL_VENDORS'],
    ['HotelBooking', 'INITIAL_HOTEL_BOOKINGS'],
    ['Employee', 'INITIAL_EMPLOYEES'],
    ['FinanceExpense', 'INITIAL_FINANCE_EXPENSES'],
    ['CurrencyItem', 'INITIAL_CURRENCIES'],
    ['CurrencyHistory', 'INITIAL_CURRENCY_HISTORY'],
    ['TourPackage', 'TOUR_PACKAGES'],
    ['AirportDesk', 'INITIAL_AIRPORT_DESKS'],
    ['DeskAssignment', 'INITIAL_DESK_ASSIGNMENT_HISTORY'],
    // Notifications are NOT seeded — the feed is real-time only.
    ['SalaryRecord', 'INITIAL_SALARY_RECORDS'],
    ['CommissionRule', 'INITIAL_COMMISSION_RULES'],
    ['SystemAuditLog', 'INITIAL_SYSTEM_LOGS'],
  ];
  for (const [modelName, exportName] of plan) {
    await seedModel(modelName, mock[exportName]);
  }

  // Singletons & config → AppSetting key/value rows.
  const settings: Array<[string, unknown]> = [
    ['rates', mock.INITIAL_RATES],
    ['shiftDrawer', mock.INITIAL_SHIFT_DRAWER],
    ['packageCategories', mock.INITIAL_PACKAGE_CATEGORIES],
    ['categoryServiceMap', mock.INITIAL_CATEGORY_SERVICE_MAP],
  ];
  for (const [key, value] of settings) {
    if (value === undefined) continue;
    await prisma.appSetting.upsert({
      where: { key },
      create: { key, value: value as never },
      update: { value: value as never },
    });
    console.log(`✓ setting: ${key}`);
  }
}

async function main() {
  console.log('Seeding database…\n');
  await seedUsers();
  await seedCatalogue();
  console.log('\n✅ Seed complete. Create the super-admin with: npm run create-superadmin -w @ar-trust/api');
}

main()
  .catch((err) => { console.error('Seed failed:', err); process.exit(1); })
  .finally(() => prisma.$disconnect());
