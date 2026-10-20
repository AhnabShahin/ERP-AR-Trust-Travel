// =====================================================================
// Full data seed — loads the app's original mock dataset and inserts every
// record into MySQL. mockData.ts imports image assets, so we bundle it with
// esbuild (stubbing image imports) before importing it under Node.
// Field selection is driven by the Prisma DMMF, so only columns that exist
// on each model are inserted and invalid date strings fall back to defaults.
// =====================================================================

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as esbuild from 'esbuild';
import { Prisma, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const mockPath = path.resolve(__dirname, '../../web/src/data/mockData.ts');

// esbuild plugin: resolve any image import to an empty-string default export.
const imageStub: esbuild.Plugin = {
  name: 'image-stub',
  setup(build) {
    build.onResolve({ filter: /\.(jpg|jpeg|png|gif|webp|svg)$/ }, (args) => ({
      path: args.path,
      namespace: 'img-stub',
    }));
    build.onLoad({ filter: /.*/, namespace: 'img-stub' }, (args) => ({
      // Map each imported image to its public path (copied to web/public/media).
      contents: `export default ${JSON.stringify('/media/' + path.basename(args.path))}`,
      loader: 'js',
    }));
  },
};

async function loadMockData(): Promise<Record<string, unknown>> {
  const outFile = path.join(os.tmpdir(), `artrust-mock-${Date.now()}.mjs`);
  await esbuild.build({
    entryPoints: [mockPath],
    bundle: true,
    format: 'esm',
    platform: 'node',
    outfile: outFile,
    plugins: [imageStub],
    logLevel: 'silent',
  });
  const mod = await import('file://' + outFile.replace(/\\/g, '/'));
  try {
    fs.unlinkSync(outFile);
  } catch {
    /* ignore */
  }
  return mod as Record<string, unknown>;
}

// Model name (Prisma) -> its DMMF definition, for field whitelisting.
const modelByName = Object.fromEntries(
  Prisma.dmmf.datamodel.models.map((m) => [m.name, m])
);

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
    if (field.relationName) continue; // skip relations
    if (field.kind === 'object') continue;
    const value = row[field.name];
    if (value === undefined || value === null) continue;
    if (field.type === 'DateTime') {
      const d = new Date(value as string);
      if (Number.isNaN(d.getTime())) continue; // invalid string -> use default
      out[field.name] = d;
    } else {
      out[field.name] = value;
    }
  }
  return out;
}

async function seedModel(modelName: string, rows: unknown): Promise<void> {
  if (!Array.isArray(rows) || rows.length === 0) {
    console.log(`• ${modelName}: no data`);
    return;
  }
  const delegate = delegateFor(modelName);
  const data = rows.map((r) => sanitise(modelName, r as Record<string, unknown>));
  try {
    // Fresh demo reset: clear the table, then insert (keeps ids from the mock).
    await delegate.deleteMany({});
    const res = await delegate.createMany({ data, skipDuplicates: true });
    console.log(`✓ ${modelName}: inserted ${res.count}/${rows.length}`);
  } catch (err) {
    console.error(`✗ ${modelName}: ${(err as Error).message.split('\n')[0]}`);
  }
}

async function main() {
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
    // Notifications are NOT seeded — the feed is real-time only, populated by
    // actual business events (bookings, approvals, payroll, EOD audits, …).
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

  console.log('\n✅ Full data seed complete.');
}

main()
  .catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
