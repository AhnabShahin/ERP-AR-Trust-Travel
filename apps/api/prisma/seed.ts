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

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import bcrypt from 'bcryptjs';
import * as esbuild from 'esbuild';
import { PrismaClient, UserRole } from '@prisma/client';

const prisma = new PrismaClient();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const webDataDir = path.resolve(__dirname, '../../web/src/data');

const slug = (n: string) => n.toLowerCase().replace(/[^a-z0-9]+/g, '.').replace(/^\.|\.$/g, '');

// Bundle a web `src/data` module (which imports image assets) under Node,
// stubbing image imports to their committed `/media/<file>` public path so the
// seeded refs point at files shipped in the repo.
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

async function loadBundle(entry: string): Promise<Record<string, unknown>> {
  const outFile = path.join(os.tmpdir(), `artrust-seed-${Date.now()}-${Math.random().toString(36).slice(2)}.mjs`);
  await esbuild.build({ entryPoints: [entry], bundle: true, format: 'esm', platform: 'node', outfile: outFile, plugins: [imageStub], logLevel: 'silent' });
  const mod = await import('file://' + outFile.replace(/\\/g, '/'));
  try { fs.unlinkSync(outFile); } catch { /* ignore */ }
  return mod as Record<string, unknown>;
}

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
        department: 'Driver Fleet & Transfers',
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

// Committed /media car image + demo day-rate, matched by model name.
const FLEET_MEDIA: Record<string, { image: string; price: number }> = {
  Coaster: { image: '/media/toyota-coaster.jpg', price: 1500 },
  Hiace: { image: '/media/mercedes-v-class.jpg', price: 900 },
  Caravelle: { image: '/media/mercedes-v-class.jpg', price: 850 },
  Carnival: { image: '/media/kia-carnival.jpg', price: 700 },
  Staria: { image: '/media/hyundai-staria.jpg', price: 750 },
  Innova: { image: '/media/toyota-veloz.jpg', price: 500 },
  Xpander: { image: '/media/mitsubishi-xpander.jpg', price: 450 },
  Carens: { image: '/media/kia-carens.jpg', price: 450 },
  CS55: { image: '/media/changan-sedan.jpg', price: 400 },
  Eado: { image: '/media/changan-sedan.jpg', price: 350 },
  Camry: { image: '/media/kia-k5.jpg', price: 350 },
};

async function seedFleet(drivers: Array<{ id: string; name: string }>) {
  let created = 0;
  for (let i = 0; i < VEHICLES.length; i++) {
    const v = VEHICLES[i];
    const driver = drivers[i]; // first three vehicles get a driver; rest unassigned
    const media = FLEET_MEDIA[v.model] ?? { image: '/media/mercedes-v-class.jpg', price: 500 };
    await prisma.fleetVehicle.create({
      data: {
        name: `${v.make} ${v.model}`,
        category: v.type,
        passengers: v.pax,
        luggage: Math.max(1, Math.round(v.pax / 3)),
        priceQAR: media.price,
        rateType: 'Per Trip',
        features: [v.type, v.color, `Model year ${v.year}`],
        image: media.image,
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

// ---------------------------------------------------------------------
// 8. Public website CMS content (hero text + images, sections, contact,
//    footer) — seeded from the single source of truth in web/src/data so the
//    landing page is fully populated. Image refs resolve to committed /media.
// ---------------------------------------------------------------------
async function seedSiteContent() {
  const mod = await loadBundle(path.join(webDataDir, 'siteContent.ts'));
  const defs = mod.SITE_CONTENT_DEFAULTS as
    | Record<string, { value: unknown; group?: string; label?: string; kind?: string }>
    | undefined;
  if (!defs) { console.log('• site content: no defaults'); return; }
  let order = 0;
  for (const [key, def] of Object.entries(defs)) {
    await prisma.siteContent.create({
      data: { key, value: def.value as never, group: def.group, label: def.label, kind: def.kind ?? 'text', sortOrder: order++ },
    });
  }
  console.log(`✓ site content: ${Object.keys(defs).length} keys (hero, sections, contact, footer)`);
}

// ---------------------------------------------------------------------
// 9. Tour packages (tours + multi-day holiday packages) — committed /media
//    images, so the Popular Tours & Holiday Packages sections are full.
// ---------------------------------------------------------------------
const TOURS = [
  { name: 'Half-Day Desert Safari & Inland Sea', nameAr: 'سفاري نصف يوم والبحر الداخلي', category: 'Desert Safari', duration: '6 Hours', priceQAR: 320, image: '/media/inland-sea-safari-hero.jpg', badge: 'Best Seller', groupSize: '1 - 6 Guests', rating: 4.9, reviewCount: 428, description: 'Thrilling dune bashing across Qatar’s golden sands to the UNESCO Khor Al Adaid inland sea, with Bedouin tea and camel rides.', includes: ['Hotel pickup & drop-off', '4x4 Land Cruiser dune bashing', 'Inland Sea (Khor Al Adaid) visit', 'Bedouin camp refreshments'] },
  { name: 'Doha City Tour & Dhow Cruise', nameAr: 'جولة الدوحة ورحلة الداو', category: 'City Tour', duration: '5 Hours', priceQAR: 250, image: '/media/dhow-cruise-heritage-hero.jpg', badge: 'Popular', groupSize: '1 - 10 Guests', rating: 4.8, reviewCount: 356, description: 'Discover Souq Waqif, Katara Cultural Village, the Pearl-Qatar and a traditional wooden dhow cruise across Doha Bay.', includes: ['Private AC vehicle', 'Souq Waqif & Katara', 'Corniche & Pearl-Qatar', 'Traditional dhow cruise'] },
  { name: 'Private Transit Layover City Tour', nameAr: 'جولة الترانزيت الخاصة', category: 'Airport Transit', duration: '4 Hours', priceQAR: 290, image: '/media/vip-airport-transit-hero.jpg', badge: 'Guaranteed Return', groupSize: '1 - 4 Guests', rating: 5.0, reviewCount: 512, description: 'Make the most of your Hamad International layover with a private highlights tour and guaranteed on-time airport return.', includes: ['Airport meet & greet', 'Private driver', 'Key Doha landmarks', 'Guaranteed on-time return'] },
  { name: 'Sunset Dune Buggy Adventure', nameAr: 'مغامرة عربة الكثبان عند الغروب', category: 'Desert Safari', duration: '4 Hours', priceQAR: 450, image: '/media/explore-qatar-hero.jpg', badge: 'Adventure', groupSize: '1 - 2 Guests', rating: 4.9, reviewCount: 187, description: 'Self-drive dune buggy thrills across the desert at golden hour with a professional safari guide escort.', includes: ['Dune buggy & safety gear', 'Professional guide', 'Sunset photo stop', 'Bottled water'] },
  { name: 'Private Luxury Doha Experience', nameAr: 'تجربة الدوحة الفاخرة الخاصة', category: 'Private Luxury', duration: '8 Hours', priceQAR: 980, image: '/media/mercedes-v-class.jpg', badge: 'VIP', groupSize: '1 - 6 Guests', rating: 5.0, reviewCount: 143, description: 'A bespoke full-day private tour in a Mercedes V-Class with a dedicated guide, fine dining and premium experiences.', includes: ['Mercedes V-Class + driver', 'Dedicated private guide', 'Lunch at a 5-star venue', 'Flexible custom itinerary'] },
  { name: 'Full-Day North Qatar Heritage Tour', nameAr: 'جولة شمال قطر التراثية', category: 'City Tour', duration: '7 Hours', priceQAR: 390, image: '/media/toyota-land-cruiser.jpg', badge: 'New', groupSize: '1 - 6 Guests', rating: 4.7, reviewCount: 98, description: 'Explore Al Zubarah UNESCO fort, Purple Island mangroves and the northern coast’s historic sites.', includes: ['Private 4x4 vehicle', 'Al Zubarah Fort', 'Purple Island mangroves', 'Snacks & water'] },
];

const HOLIDAY_PACKAGES = [
  { name: '3-Day Doha Discovery Escape', nameAr: 'باقة اكتشاف الدوحة 3 أيام', category: 'Holiday Package', duration: '3 Days / 2 Nights', priceQAR: 2450, image: '/media/holiday-packages-hero.jpg', badge: 'All-Inclusive', days: 3, nights: 2, description: 'A perfectly balanced short break: city highlights, desert safari and cultural immersion with 5-star comfort.', includes: ['2 nights 5-star hotel', 'Private airport transfers', 'Daily breakfast', 'City tour + desert safari'], highlights: ['Day 1: VIP airport reception & Doha city orientation', 'Day 2: Full-day desert safari & inland sea', 'Day 3: Souq Waqif & departure transfer'], excluded: ['International airfare', 'Personal expenses', 'Travel insurance'] },
  { name: '5-Day Qatar Luxury Explorer', nameAr: 'باقة قطر الفاخرة 5 أيام', category: 'Holiday Package', duration: '5 Days / 4 Nights', priceQAR: 4850, image: '/media/explore-qatar-hero.jpg', badge: 'Premium', days: 5, nights: 4, description: 'The complete Qatar experience — desert, sea, culture and luxury — across five curated days.', includes: ['4 nights luxury hotel', 'Private driver throughout', 'Daily breakfast & 2 dinners', 'All tours & entrance fees'], highlights: ['Day 1: Arrival & Pearl-Qatar evening', 'Day 2: Desert safari & dune buggy', 'Day 3: Dhow cruise & Katara', 'Day 4: North Qatar heritage', 'Day 5: Leisure & departure'], excluded: ['International airfare', 'Personal shopping', 'Optional spa treatments'] },
  { name: '4-Day Family Adventure Package', nameAr: 'باقة المغامرة العائلية 4 أيام', category: 'Holiday Package', duration: '4 Days / 3 Nights', priceQAR: 3600, image: '/media/dhow-cruise-heritage-hero.jpg', badge: 'Family', days: 4, nights: 3, description: 'Kid-friendly adventure blending desert fun, cultural stops and family-sized comfort transport.', includes: ['3 nights family hotel', 'Family MPV transfers', 'Daily breakfast', 'Desert safari + dhow cruise'], highlights: ['Day 1: Airport welcome & Corniche', 'Day 2: Family desert safari', 'Day 3: Dhow cruise & Katara', 'Day 4: Souq Waqif & departure'], excluded: ['International airfare', 'Personal expenses'] },
];

async function seedTourPackages() {
  const base = (p: Record<string, unknown>) => ({
    serviceType: 'Tour Package' as const, pickupLocation: 'Doha, Qatar', departure: 'Daily departures',
    includes: p.includes as never, isFeatured: true, showOnWebsite: true, originalPriceQAR: 0,
  });
  const tours = TOURS.map((t) => ({
    name: t.name, nameAr: t.nameAr, category: t.category, duration: t.duration, priceQAR: t.priceQAR,
    description: t.description, image: t.image, badge: t.badge, groupSize: t.groupSize, rating: t.rating,
    reviewCount: t.reviewCount, isMultiDay: false, ...base(t),
  }));
  const pkgs = HOLIDAY_PACKAGES.map((p) => ({
    name: p.name, nameAr: p.nameAr, category: p.category, duration: p.duration, priceQAR: p.priceQAR,
    description: p.description, image: p.image, badge: p.badge, groupSize: 'Up to 6 Guests', rating: 4.9,
    reviewCount: 120, isMultiDay: true, days: p.days, nights: p.nights, highlights: p.highlights as never,
    excluded: p.excluded as never, ...base(p),
  }));
  const res = await prisma.tourPackage.createMany({ data: [...tours, ...pkgs] as never });
  console.log(`✓ tour packages: ${res.count} (${TOURS.length} tours, ${HOLIDAY_PACKAGES.length} holiday packages)`);
}

// ---------------------------------------------------------------------
// 10. Customer reviews (committed avatar placeholder).
// ---------------------------------------------------------------------
const REVIEWS = [
  { author: 'David Sterling', country: 'United Kingdom', rating: 5, tour: 'Desert Safari & Inland Sea', comment: 'Absolutely world-class. The dune bashing was exhilarating and our guide made the inland sea unforgettable. Punctual, professional, premium.' },
  { author: 'Elena Rostova', country: 'Russia', rating: 5, tour: 'Doha City Tour & Dhow Cruise', comment: 'The dhow cruise at sunset was magical and Souq Waqif came alive with our guide’s stories. AR Trust exceeded every expectation.' },
  { author: 'Sultan Al-Otaibi', country: 'Saudi Arabia', rating: 5, tour: 'Private Luxury Experience', comment: 'Flawless VIP service in a spotless Mercedes V-Class. The driver and private guide were exceptional. Highly recommended.' },
  { author: 'Maria Gonzalez', country: 'Spain', rating: 5, tour: 'Transit Layover City Tour', comment: 'Perfect for a long layover — they got us back to the airport with time to spare. Saw all the highlights of Doha stress-free.' },
  { author: 'James Carter', country: 'United States', rating: 5, tour: 'Sunset Dune Buggy Adventure', comment: 'The dune buggy ride at golden hour was the highlight of our Qatar trip. Safe, thrilling and beautifully organised.' },
  { author: 'Aiko Tanaka', country: 'Japan', rating: 5, tour: 'Family Adventure Package', comment: 'Our family felt cared for from airport to departure. The kids loved the desert and the team was warm and attentive throughout.' },
];

async function seedReviews() {
  const data = REVIEWS.map((r, i) => ({
    author: r.author, country: r.country, rating: r.rating, tour: r.tour, comment: r.comment,
    date: 'October 2026', avatar: '/media/avatar-placeholder.svg', showOnWebsite: true, sortOrder: i,
  }));
  const res = await prisma.review.createMany({ data });
  console.log(`✓ reviews: ${res.count}`);
}

async function seedAirportDesks() {
  const data = [
    { id: 'desk-hia-01', airportCode: 'DOH', airportName: 'Hamad International Airport (DOH)', deskCode: 'HIA-CTR-04', deskName: 'Main Arrivals Concourse Counter 4', deskNameAr: 'صالة القادمون الرئيسية - كاونتر 4', terminal: 'Terminal 1 - Arrivals Hall', zone: 'Arrivals Ground Level, Opposite Carousel Belt 4-6', assignedEmployeeId: 'emp-102', assignedEmployeeName: 'Zaid Qasim', assignedEmployeeRole: 'Transit Desk Lead Agent', status: 'Active', shiftTiming: '06:00 AM - 14:30 PM (Morning Shift)', phoneExt: '+974 4010 8841', notes: 'Primary walk-in sales counter for layover passengers and desert safari pickups.' },
    { id: 'desk-hia-02', airportCode: 'DOH', airportName: 'Hamad International Airport (DOH)', deskCode: 'HIA-CTR-07', deskName: 'Transit Concourse C & D Service Desk', deskNameAr: 'كونكورس C و D - مكتب الترانزيت السريع', terminal: 'Airside Transit Hub', zone: 'Duty Free Plaza, Near Lamp Bear Sculpture', assignedEmployeeId: 'emp-101', assignedEmployeeName: 'Tariq Al-Sulaiti', assignedEmployeeRole: 'Airport Operations Lead', status: 'Active', shiftTiming: '14:00 PM - 22:30 PM (Evening Shift)', phoneExt: '+974 4010 8847', notes: 'Handles 4-hour to 8-hour international transit city tours and express vouchers.' },
    { id: 'desk-hia-03', airportCode: 'DOH', airportName: 'Hamad International Airport (DOH)', deskCode: 'HIA-VIP-01', deskName: 'Al Maha VIP Lounge Concierge Desk', deskNameAr: 'مكتب استقبال صالة المها لكبار الشخصيات', terminal: 'Al Maha VIP Terminal', zone: 'Private VIP Meet & Assist Lounge Concourse', assignedEmployeeId: 'emp-103', assignedEmployeeName: 'Noor Al-Huda', assignedEmployeeRole: 'VIP Concierge Specialist', status: 'Active', shiftTiming: '24/7 Rotational Concierge', phoneExt: '+974 4010 9901', notes: 'Dedicated Mercedes-Benz S-Class driver dispatch and fast-track immigration.' },
  ];
  const res = await prisma.airportDesk.createMany({ data, skipDuplicates: true });
  console.log(`✓ airport desks: ${res.count}`);
}

async function seedGuestTiers() {
  const data = [
    { name: 'Standard', nameAr: 'عادي', discountPercentage: 0, badgeColor: 'blue', minSpendQAR: 0, description: 'Entry level — standard pricing on all tours, services and hotel stays.' },
    { name: 'VIP Silver', nameAr: 'فضي VIP', discountPercentage: 5, badgeColor: 'slate', minSpendQAR: 10000, description: 'Loyalty tier with 5% discount on all tours & services.' },
    { name: 'VIP Gold', nameAr: 'ذهبي VIP', discountPercentage: 10, badgeColor: 'amber', minSpendQAR: 25000, description: 'Premium tier with 10% discount plus priority airport desk service.' },
    { name: 'VIP Platinum', nameAr: 'بلاتيني VIP', discountPercentage: 15, badgeColor: 'purple', minSpendQAR: 50000, description: 'Top tier with 15% discount, dedicated concierge and VIP lounge access.' },
  ];
  const res = await prisma.guestTier.createMany({ data, skipDuplicates: true });
  console.log(`✓ guest tiers: ${res.count}`);
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
  await seedSiteContent();
  await seedTourPackages();
  await seedReviews();
  await seedGuestTiers();
  await seedAirportDesks();
  console.log('\n✅ Seed complete — super-admin, drivers, PDF fleet/hotels/platforms, full website content + tours + reviews + guest tiers.');
}

main()
  .catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
