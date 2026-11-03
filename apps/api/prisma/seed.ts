// =====================================================================
// AR Trust — production seed (real operational data).
//
// Source of truth: the client's "ERP System Data Collection" workbook
// (Company Profile, Users, Staff, Drivers, Tour Guides, Fleet, Services,
// Categories, Customer Tiers, Hotels, Locations, Desks, Platforms,
// Currencies). The data below is transcribed from that sheet so running the
// seed reproduces the exact production baseline.
//
// Running it:
//   1. WIPES every table (empties the database — a clean production reset).
//   2. Creates the 11 real user accounts (1 super-admin, staff, driver-guides)
//      with their real usernames / emails / login passwords.
//   3. Loads the real fleet, drivers, guides, staff, hotels, locations, desks,
//      services/packages, categories, tiers, platforms and currencies.
//   4. Stores the company/invoice profile (AppSetting `invoiceProfile`).
//   5. Seeds the public-website CMS content + reviews (committed /media images)
//      so the landing page stays fully populated.
//
// IMAGES: the workbook carries no image columns, so image fields keep the
// committed /media artwork (fleet by model, tours by name, hero/site content
// and reviews from web/src/data). No image is blanked.
//
// Run with:  npm run db:seed -w @ar-trust/api
// Full reset (drop + re-migrate + seed): npx prisma migrate reset -w @ar-trust/api
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
const yes = (v?: string) => /^(yes|true|active)$/i.test((v ?? '').trim());
const num = (v?: string, d = 0) => {
  const n = parseFloat(String(v ?? '').replace(/[^0-9.\-]/g, ''));
  return Number.isFinite(n) ? n : d;
};

const ROLE: Record<string, UserRole> = {
  'super-admin': UserRole.super_admin,
  admin: UserRole.admin,
  'operations-manager': UserRole.operations_manager,
  'transit-agent': UserRole.transit_agent,
  'driver-guide': UserRole.driver_guide,
  'finance-accountant': UserRole.finance_accountant,
  'vendor-partner': UserRole.vendor_partner,
  staff: UserRole.staff,
  customer: UserRole.customer,
};

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
    ['trip_status_logs', () => prisma.tripStatusLog.deleteMany({})],
    ['hotel_bookings', () => prisma.hotelBooking.deleteMany({})],
    ['hotel_vendors', () => prisma.hotelVendor.deleteMany({})],
    ['desk_assignments', () => prisma.deskAssignment.deleteMany({})],
    ['notifications', () => prisma.notification.deleteMany({})],
    ['system_audit_logs', () => prisma.systemAuditLog.deleteMany({})],
    ['salary_records', () => prisma.salaryRecord.deleteMany({})],
    ['commission_rules', () => prisma.commissionRule.deleteMany({})],
    ['reviews', () => prisma.review.deleteMany({})],
    ['club_leads', () => prisma.clubLead.deleteMany({})],
    ['contact_messages', () => prisma.contactMessage.deleteMany({})],
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
    ['customer_tiers', () => prisma.customerTier.deleteMany({})],
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
// Company / invoice profile (workbook → AppSetting `invoiceProfile`).
// ---------------------------------------------------------------------
const COMPANY_PROFILE = {
  companyName: 'AR Trust Travel & Tourism W.L.L.',
  companyNameAr: 'شركة الثقة العربية للسفر والسياحة',
  address: 'Doha, Qatar',
  phone: '+974 5550 2878',
  helpline: '',
  email: 'info@artrusttravel.com',
  website: 'https://artrusttravel.com/',
  trn: '5006365340',
  licenseNo: '267120',
  footerNote: 'Thank you for your business!',
  defaultVatPercent: 0,
  invoicePrefix: 'INV-',
  logo: '', // kept empty — upload the company logo from the dashboard
};

// ---------------------------------------------------------------------
// Users — 11 real accounts. Drivers & staff ALSO live in the users table
// (role driver-guide / staff) so they can sign in; license/experience detail
// for drivers is attached here from the Drivers sheet.
// ---------------------------------------------------------------------
interface UserRow {
  name: string; username: string; email: string; password: string; role: string; department?: string;
}
const USERS: UserRow[] = [
  { name: 'MOHAMMAD UNUS HOSEN', username: 'rajib.artrust', email: 'md.unus.hr@gmail.com', password: 'ARtrust@2023R', role: 'super-admin', department: 'Executive Management' },
  { name: 'Tamim Ikbal', username: 'tamim.artrust', email: 'tamimikbal@artrusttravel.com', password: 'ARtrust@2023T', role: 'staff' },
  { name: 'Ahad', username: 'ahad.artrust', email: 'ahadfaruk4@gmail.com', password: 'ARtrust@2023A', role: 'staff' },
  { name: 'Ratul', username: 'ratul.artrust', email: 'official.ratul.b@gmail.com', password: 'ARtrust@2023R', role: 'staff' },
  { name: 'Sazid', username: 'sazid.artrust', email: 'alsazid88@gmail.com', password: 'ARtrust@2023S', role: 'staff' },
  { name: 'Mahfuz', username: 'ridoy.artrust', email: 'hridoy707186@gmail.com', password: 'ARtrust@2023M', role: 'staff' },
  { name: 'Arafat', username: 'arafat.artrust', email: 'arafatbole@gmail.com', password: 'ARtrust@2023A', role: 'staff' },
  { name: 'Ali', username: 'ali.artrust', email: 'enabdulali94@gmail.com', password: 'ARtrust@2023A', role: 'staff' },
  { name: 'Shojib Mohammed', username: 'sojib.artrust', email: 'mdsozib4499@gmail.com', password: 'ARtrust@2023S', role: 'driver-guide' },
  { name: 'Ohidul Islam Kabir', username: 'ohid.artrust', email: 'ohid.artrusttravel@gmail.com', password: 'ARtrust@2023O', role: 'driver-guide' },
  { name: 'Golam Nafiul Hasan', username: 'hasan.artrust', email: 'nafiulhasan95@gmail.com', password: 'ARtrust@2023G', role: 'driver-guide' },
];

// Drivers sheet — license / vehicle detail (keyed by full name). Used both to
// enrich the driver-guide user and to create the Driver registry row.
interface DriverRow {
  name: string; phone: string; driverType: string; status: string; location: string;
  plate: string; licenseNumber: string; licenseCategory: string; experienceYears: number; languages: string[];
}
const DRIVERS: DriverRow[] = [
  { name: 'Shojib Mohammed', phone: '+974 7778 0821', driverType: 'first-party', status: 'Available', location: 'Doha', plate: '987139', licenseNumber: '28505007890', licenseCategory: 'Light Vehicle / Car', experienceYears: 6, languages: ['English', 'Arabic', 'Hindi', 'Bengali'] },
  { name: 'Ohidul Islam Kabir', phone: '+974 3049 1832', driverType: 'first-party', status: 'Available', location: 'Doha', plate: '987140', licenseNumber: '29105014154', licenseCategory: 'Light Vehicle / Car', experienceYears: 8, languages: ['English', 'Arabic', 'Hindi', 'Bengali'] },
  { name: 'Golam Nafiul Hasan', phone: '+974 5072 9789', driverType: 'first-party', status: 'Available', location: 'Doha', plate: '542105', licenseNumber: '29605003617', licenseCategory: 'Light Vehicle / Car', experienceYears: 8, languages: ['English', 'Arabic', 'Hindi', 'Bengali'] },
];
const driverByName = new Map(DRIVERS.map((d) => [d.name, d]));

/** Create the 11 users; returns a name → {id} map for later linking (fleet). */
async function seedUsers(): Promise<Map<string, string>> {
  const idByName = new Map<string, string>();
  for (const u of USERS) {
    const d = driverByName.get(u.name);
    const user = await prisma.user.create({
      data: {
        name: u.name,
        username: u.username,
        email: u.email,
        passwordHash: await bcrypt.hash(u.password, 10),
        role: ROLE[u.role] ?? UserRole.staff,
        status: 'active',
        isEmailVerified: true,
        emailVerifiedAt: new Date(),
        department: u.department,
        ...(d
          ? {
              phone: d.phone,
              jobTitle: 'Driver',
              staffStatus: d.status,
              licenseNumber: d.licenseNumber,
              licenseCategory: d.licenseCategory,
              experienceYears: d.experienceYears,
              spokenLanguages: d.languages as never,
              driverType: d.driverType,
            }
          : {}),
      },
    });
    idByName.set(u.name, user.id);
  }
  const roles = USERS.reduce<Record<string, number>>((a, u) => ((a[u.role] = (a[u.role] ?? 0) + 1), a), {});
  console.log(`✓ users: ${USERS.length} (${Object.entries(roles).map(([r, n]) => `${r} ${n}`).join(', ')})`);
  return idByName;
}

// ---------------------------------------------------------------------
// Driver registry rows (the dedicated "Drivers" menu) — linked to the
// per-trip assigned vehicle by plate.
// ---------------------------------------------------------------------
async function seedDriverRegistry(fleetByPlate: Map<string, { id: string; name: string }>) {
  for (const d of DRIVERS) {
    const veh = fleetByPlate.get(d.plate);
    await prisma.driver.create({
      data: {
        name: d.name,
        phone: d.phone,
        driverType: d.driverType,
        status: d.status,
        location: d.location,
        plateNumber: d.plate,
        vehicle: veh?.name ?? null,
        vehicleType: d.licenseCategory,
        fleetVehicleId: veh?.id ?? null,
        rating: 0,
      },
    });
  }
  console.log(`✓ drivers (registry): ${DRIVERS.length}`);
}

// ---------------------------------------------------------------------
// Tour guides.
// ---------------------------------------------------------------------
const TOUR_GUIDES = [
  { name: 'Shojib Mohammed', phone: '+974 7778 0821', languages: ['English', 'Arabic', 'Hindi', 'Bangla'], specialty: 'Heritage & Modern Context', status: 'Available' },
  { name: 'Ohidul Islam Kabir', phone: '+974 3049 1832', languages: ['English', 'Arabic', 'Hindi', 'Bangla'], specialty: 'Heritage & Modern Context', status: 'Available' },
  { name: 'Golam Nafiul Hasan', phone: '+974 5072 9789', languages: ['English', 'Arabic', 'Hindi', 'Bangla'], specialty: 'Heritage & Modern Context', status: 'Available' },
];
async function seedTourGuides() {
  for (const g of TOUR_GUIDES) {
    await prisma.tourGuide.create({ data: { name: g.name, phone: g.phone, languages: g.languages as never, specialty: g.specialty, status: g.status } });
  }
  console.log(`✓ tour guides: ${TOUR_GUIDES.length}`);
}

// ---------------------------------------------------------------------
// Staff (employees) — airport & hotel desk representatives + drivers.
// ---------------------------------------------------------------------
const STAFF = [
  { name: 'Ahad', email: 'ahadfaruk4@gmail.com', phone: '+974 5527 8092', role: 'Airport Representative', department: 'Airport Operations — Day Shift', hireDate: '2024-01-01' },
  { name: 'Ratul', email: 'official.ratul.b@gmail.com', phone: '+974 7044 8640', role: 'Airport Representative', department: 'Airport Operations — Day Shift', hireDate: '2024-01-02' },
  { name: 'Sazid', email: 'alsazid88@gmail.com', phone: '+974 5992 4154', role: 'Airport Representative', department: 'Airport Operations — Night Shift', hireDate: '2024-01-03' },
  { name: 'Mahfuz', email: 'hridoy707186@gmail.com', phone: '+974 6661 6957', role: 'Airport Representative', department: 'Airport Operations — Night Shift', hireDate: '2024-01-04' },
  { name: 'Arafat', email: 'arafatbole@gmail.com', phone: '+974 7011 9084', role: 'Hotel Desk Representative', department: 'The Royal Riviera Hotel', hireDate: '2024-01-05' },
  { name: 'Ali', email: 'enabdulali94@gmail.com', phone: '+974 3044 1512', role: 'Hotel Desk Representative', department: 'C - Hotel and Suites Doha', hireDate: '2024-01-07' },
  { name: 'Shojib Mohammed', email: 'mdsozib4499@gmail.com', phone: '+974 7778 0821', role: 'driver-guide', department: 'Driver Fleet & Transfers', hireDate: '2024-01-08' },
  { name: 'Ohidul Islam Kabir', email: 'ohid.artrusttravel@gmail.com', phone: '+974 3049 1832', role: 'driver-guide', department: 'Driver Fleet & Transfers', hireDate: '2024-01-09' },
  { name: 'Golam Nafiul Hasan', email: 'nafiulhasan95@gmail.com', phone: '+974 5072 9789', role: 'driver-guide', department: 'Driver Fleet & Transfers', hireDate: '2024-01-10' },
];
async function seedStaff() {
  const data = STAFF.map((s) => ({
    name: s.name, email: s.email, phone: s.phone, role: s.role, department: s.department,
    status: 'Available', hireDate: s.hireDate,
  }));
  const res = await prisma.employee.createMany({ data });
  console.log(`✓ staff (employees): ${res.count}`);
}

// ---------------------------------------------------------------------
// Fleet — 13 vehicles. image kept from committed /media (by model); real
// price/plate/driver from the workbook. First-party drivers linked by name.
// ---------------------------------------------------------------------
interface VehicleRow {
  name: string; category: string; pax: number; luggage: number; price: number; rateType: string;
  make: string; model: string; color: string; year: string; plate: string; ownership: string;
  status: string; driver: string; show: boolean;
}
const VEHICLES: VehicleRow[] = [
  { name: 'Toyota Coaster', category: 'Coaster 22 Pax', pax: 22, luggage: 12, price: 1500, rateType: 'Per Trip', make: 'Toyota', model: 'Coaster', color: 'White', year: '2022', plate: '124547', ownership: 'owned', status: 'Available', driver: '', show: true },
  { name: 'Toyota Hiace', category: 'Minivan 12 Pax', pax: 12, luggage: 8, price: 900, rateType: 'Per Trip', make: 'Toyota', model: 'Hiace', color: 'White', year: '2022', plate: '141632', ownership: 'owned', status: 'Available', driver: '', show: true },
  { name: 'Volkswagen Caravelle', category: 'Minivan 9 Pax', pax: 9, luggage: 6, price: 850, rateType: 'Per Trip', make: 'Volkswagen', model: 'Caravelle', color: 'Black', year: '2020', plate: '782924', ownership: 'owned', status: 'Available', driver: '', show: true },
  { name: 'Kia Carnival', category: 'Minivan 7 Pax', pax: 7, luggage: 7, price: 700, rateType: 'Per Trip', make: 'Kia', model: 'Carnival', color: 'White', year: '2023', plate: '347672', ownership: 'owned', status: 'Available', driver: '', show: true },
  { name: 'Hyundai Staria', category: 'Comfort Van 7 Pax', pax: 7, luggage: 7, price: 750, rateType: 'Per Trip', make: 'Hyundai', model: 'Staria', color: 'Black', year: '2025', plate: '780282', ownership: 'owned', status: 'Available', driver: '', show: true },
  { name: 'Kia Carnival', category: 'Comfort Van 7 Pax', pax: 7, luggage: 2, price: 700, rateType: 'Per Trip', make: 'Kia', model: 'Carnival', color: 'Black', year: '2025', plate: '987139', ownership: 'owned', status: 'Available', driver: 'Shojib Mohammed', show: true },
  { name: 'Toyota Innova', category: 'Economy 7 Pax', pax: 6, luggage: 5, price: 500, rateType: 'Per Trip', make: 'Toyota', model: 'Innova', color: 'White', year: '2022', plate: '85256', ownership: 'owned', status: 'Available', driver: '', show: true },
  { name: 'Mitsubishi Xpander', category: 'Medium 6 Pax', pax: 6, luggage: 5, price: 450, rateType: 'Per Trip', make: 'Mitsubishi', model: 'Xpander', color: 'Green Bronze', year: '2024', plate: '9479', ownership: 'owned', status: 'Available', driver: '', show: true },
  { name: 'Kia Carens', category: 'MPV / 6–7 Seater', pax: 6, luggage: 4, price: 450, rateType: 'Per Trip', make: 'Kia', model: 'Carens', color: 'White', year: '2024', plate: '417792', ownership: 'owned', status: 'Available', driver: '', show: true },
  { name: 'Kia Carens', category: 'MPV / 6–7 Seater', pax: 6, luggage: 4, price: 450, rateType: 'Per Trip', make: 'Kia', model: 'Carens', color: 'Gray', year: '2024', plate: '987140', ownership: 'owned', status: 'Available', driver: 'Ohidul Islam Kabir', show: true },
  { name: 'Changan CS55', category: 'Compact SUV', pax: 5, luggage: 4, price: 400, rateType: 'Per Trip', make: 'Changan', model: 'CS55', color: 'White', year: '2024', plate: '542105', ownership: 'owned', status: 'Available', driver: 'Golam Nafiul Hasan', show: true },
  { name: 'Changan Eado', category: 'Sedan 3 Pax', pax: 3, luggage: 4, price: 350, rateType: 'Per Trip', make: 'Changan', model: 'Eado', color: 'Gray', year: '2024', plate: '886896', ownership: 'owned', status: 'Available', driver: '', show: true },
  { name: 'Toyota Camry', category: 'Sedan 3 Pax', pax: 3, luggage: 3, price: 350, rateType: 'Per Trip', make: 'Toyota', model: 'Camry', color: 'White', year: '2022', plate: '631416', ownership: 'owned', status: 'Available', driver: '', show: true },
];

// Committed /media car image, matched by model name (image kept from repo).
const FLEET_MEDIA: Record<string, string> = {
  Coaster: '/media/toyota-coaster.jpg',
  Hiace: '/media/mercedes-v-class.jpg',
  Caravelle: '/media/mercedes-v-class.jpg',
  Carnival: '/media/kia-carnival.jpg',
  Staria: '/media/hyundai-staria.jpg',
  Innova: '/media/toyota-veloz.jpg',
  Xpander: '/media/mitsubishi-xpander.jpg',
  Carens: '/media/kia-carens.jpg',
  CS55: '/media/changan-sedan.jpg',
  Eado: '/media/changan-sedan.jpg',
  Camry: '/media/kia-k5.jpg',
};

/** Returns a plate → {id,name} map so the driver registry can link vehicles. */
async function seedFleet(userIdByName: Map<string, string>): Promise<Map<string, { id: string; name: string }>> {
  const byPlate = new Map<string, { id: string; name: string }>();
  for (const v of VEHICLES) {
    const image = FLEET_MEDIA[v.model] ?? '/media/mercedes-v-class.jpg';
    const driverId = v.driver ? userIdByName.get(v.driver) : undefined;
    const row = await prisma.fleetVehicle.create({
      data: {
        name: v.name,
        category: v.category,
        passengers: v.pax,
        luggage: v.luggage,
        priceQAR: v.price,
        rateType: v.rateType,
        features: [v.category, v.color, `Model year ${v.year}`],
        image,
        idealFor: `Up to ${v.pax} passengers`,
        plateNumber: v.plate,
        modelYear: v.year,
        make: v.make,
        model: v.model,
        color: v.color,
        ownership: v.ownership,
        status: v.status,
        assignedDriverId: driverId,
        assignedDriverName: driverId ? v.driver : undefined,
        showOnWebsite: v.show,
      },
    });
    byPlate.set(v.plate, { id: row.id, name: v.name });
  }
  console.log(`✓ fleet vehicles: ${VEHICLES.length}`);
  return byPlate;
}

// ---------------------------------------------------------------------
// Service categories.
// ---------------------------------------------------------------------
const SERVICE_CATEGORIES = [
  { name: 'Desert Safari', nameAr: 'سفاري صحراوية', serviceType: 'Tour Service' },
  { name: 'City Tour', nameAr: 'جولة المدينة', serviceType: 'Tour Service' },
  { name: 'Airport Transit', nameAr: 'ترانزيت المطار', serviceType: 'Tour Service' },
  { name: 'Private Luxury', nameAr: 'فاخرة خاصة', serviceType: 'Tour Service' },
  { name: 'Holiday Package', nameAr: 'باقة عطلة', serviceType: 'Tour Package' },
  { name: 'Airport Transfer', nameAr: 'نقل المطار', serviceType: 'Transfer Service' },
];
async function seedServiceCategories() {
  const res = await prisma.serviceCategory.createMany({ data: SERVICE_CATEGORIES });
  console.log(`✓ service categories: ${res.count}`);
}

// ---------------------------------------------------------------------
// Services & packages. The workbook carries the production price/badge/
// duration; the rich marketing copy + /media hero image is kept here by name.
// ---------------------------------------------------------------------
interface ServiceRow {
  name: string; nameAr: string; serviceType: string; category: string; duration: string; price: number;
  badge: string; groupSize: string; multiDay: boolean; days?: number; nights?: number; featured: boolean; show: boolean;
}
const SERVICES: ServiceRow[] = [
  { name: 'Half-Day Desert Safari & Inland Sea', nameAr: 'سفاري نصف يوم والبحر الداخلي', serviceType: 'Tour Service', category: 'Desert Safari', duration: '6 Hours', price: 1150, badge: 'Best Seller', groupSize: '1 - 6 Guests', multiDay: false, featured: true, show: true },
  { name: 'Doha City Tour & Dhow Cruise', nameAr: 'جولة الدوحة ورحلة الداو', serviceType: 'Tour Service', category: 'City Tour', duration: '5 Hours', price: 850, badge: 'Popular', groupSize: '1 - 10 Guests', multiDay: false, featured: true, show: true },
  { name: 'Private Transit Layover City Tour', nameAr: 'جولة الترانزيت الخاصة', serviceType: 'Tour Service', category: 'Airport Transit', duration: '4 Hours', price: 365, badge: 'Guaranteed Return', groupSize: '1 - 4 Guests', multiDay: false, featured: true, show: true },
  { name: 'Sunset Dune Buggy Adventure', nameAr: 'مغامرة عربة الكثبان عند الغروب', serviceType: 'Tour Service', category: 'Desert Safari', duration: '4 Hours', price: 1050, badge: 'Adventure', groupSize: '1 - 2 Guests', multiDay: false, featured: true, show: true },
  { name: 'Private Luxury Doha Experience', nameAr: 'تجربة الدوحة الفاخرة الخاصة', serviceType: 'Tour Service', category: 'Private Luxury', duration: '8 Hours', price: 980, badge: 'VIP', groupSize: '1 - 6 Guests', multiDay: false, featured: true, show: true },
  { name: 'Full-Day North Qatar Heritage Tour', nameAr: 'جولة شمال قطر التراثية', serviceType: 'Tour Service', category: 'City Tour', duration: '7 Hours', price: 1050, badge: 'New', groupSize: '1 - 6 Guests', multiDay: false, featured: true, show: true },
  { name: '3-Day Doha Discovery Escape', nameAr: 'باقة اكتشاف الدوحة 3 أيام', serviceType: 'Tour Package', category: 'Holiday Package', duration: '3 Days / 2 Nights', price: 2450, badge: 'All-Inclusive', groupSize: 'Up to 6 Guests', multiDay: true, days: 3, nights: 2, featured: true, show: true },
  { name: '5-Day Qatar Luxury Explorer', nameAr: 'باقة قطر الفاخرة 5 أيام', serviceType: 'Tour Package', category: 'Holiday Package', duration: '5 Days / 4 Nights', price: 4850, badge: 'Premium', groupSize: 'Up to 6 Guests', multiDay: true, days: 5, nights: 4, featured: true, show: true },
  { name: '4-Day Family Adventure Package', nameAr: 'باقة المغامرة العائلية 4 أيام', serviceType: 'Tour Package', category: 'Holiday Package', duration: '4 Days / 3 Nights', price: 3600, badge: 'Family', groupSize: 'Up to 6 Guests', multiDay: true, days: 4, nights: 3, featured: true, show: true },
];

// Marketing copy + committed /media image, kept by service name.
const SERVICE_CONTENT: Record<string, { description: string; image: string; includes: string[]; highlights?: string[]; excluded?: string[] }> = {
  'Half-Day Desert Safari & Inland Sea': { description: 'Thrilling dune bashing across Qatar’s golden sands to the UNESCO Khor Al Adaid inland sea, with Bedouin tea and camel rides.', image: '/media/inland-sea-safari-hero.jpg', includes: ['Hotel pickup & drop-off', '4x4 Land Cruiser dune bashing', 'Inland Sea (Khor Al Adaid) visit', 'Bedouin camp refreshments'] },
  'Doha City Tour & Dhow Cruise': { description: 'Discover Souq Waqif, Katara Cultural Village, the Pearl-Qatar and a traditional wooden dhow cruise across Doha Bay.', image: '/media/dhow-cruise-heritage-hero.jpg', includes: ['Private AC vehicle', 'Souq Waqif & Katara', 'Corniche & Pearl-Qatar', 'Traditional dhow cruise'] },
  'Private Transit Layover City Tour': { description: 'Make the most of your Hamad International layover with a private highlights tour and guaranteed on-time airport return.', image: '/media/vip-airport-transit-hero.jpg', includes: ['Airport meet & greet', 'Private driver', 'Key Doha landmarks', 'Guaranteed on-time return'] },
  'Sunset Dune Buggy Adventure': { description: 'Self-drive dune buggy thrills across the desert at golden hour with a professional safari guide escort.', image: '/media/explore-qatar-hero.jpg', includes: ['Dune buggy & safety gear', 'Professional guide', 'Sunset photo stop', 'Bottled water'] },
  'Private Luxury Doha Experience': { description: 'A bespoke full-day private tour in a Mercedes V-Class with a dedicated guide, fine dining and premium experiences.', image: '/media/mercedes-v-class.jpg', includes: ['Mercedes V-Class + driver', 'Dedicated private guide', 'Lunch at a 5-star venue', 'Flexible custom itinerary'] },
  'Full-Day North Qatar Heritage Tour': { description: 'Explore Al Zubarah UNESCO fort, Purple Island mangroves and the northern coast’s historic sites.', image: '/media/toyota-land-cruiser.jpg', includes: ['Private 4x4 vehicle', 'Al Zubarah Fort', 'Purple Island mangroves', 'Snacks & water'] },
  '3-Day Doha Discovery Escape': { description: 'A perfectly balanced short break: city highlights, desert safari and cultural immersion with 5-star comfort.', image: '/media/holiday-packages-hero.jpg', includes: ['2 nights 5-star hotel', 'Private airport transfers', 'Daily breakfast', 'City tour + desert safari'], highlights: ['Day 1: VIP airport reception & Doha city orientation', 'Day 2: Full-day desert safari & inland sea', 'Day 3: Souq Waqif & departure transfer'], excluded: ['International airfare', 'Personal expenses', 'Travel insurance'] },
  '5-Day Qatar Luxury Explorer': { description: 'The complete Qatar experience — desert, sea, culture and luxury — across five curated days.', image: '/media/explore-qatar-hero.jpg', includes: ['4 nights luxury hotel', 'Private driver throughout', 'Daily breakfast & 2 dinners', 'All tours & entrance fees'], highlights: ['Day 1: Arrival & Pearl-Qatar evening', 'Day 2: Desert safari & dune buggy', 'Day 3: Dhow cruise & Katara', 'Day 4: North Qatar heritage', 'Day 5: Leisure & departure'], excluded: ['International airfare', 'Personal shopping', 'Optional spa treatments'] },
  '4-Day Family Adventure Package': { description: 'Kid-friendly adventure blending desert fun, cultural stops and family-sized comfort transport.', image: '/media/dhow-cruise-heritage-hero.jpg', includes: ['3 nights family hotel', 'Family MPV transfers', 'Daily breakfast', 'Desert safari + dhow cruise'], highlights: ['Day 1: Airport welcome & Corniche', 'Day 2: Family desert safari', 'Day 3: Dhow cruise & Katara', 'Day 4: Souq Waqif & departure'], excluded: ['International airfare', 'Personal expenses'] },
};

async function seedServices() {
  for (const s of SERVICES) {
    const c = SERVICE_CONTENT[s.name];
    await prisma.tourPackage.create({
      data: {
        name: s.name,
        nameAr: s.nameAr,
        serviceType: s.serviceType,
        category: s.category,
        duration: s.duration,
        priceQAR: s.price,
        description: c?.description ?? s.name,
        pickupLocation: 'Doha, Qatar',
        departure: 'Daily departures',
        includes: (c?.includes ?? []) as never,
        image: c?.image ?? '/media/explore-qatar-hero.jpg',
        badge: s.badge,
        groupSize: s.groupSize,
        rating: 4.9,
        reviewCount: 120,
        isMultiDay: s.multiDay,
        days: s.days,
        nights: s.nights,
        highlights: (c?.highlights ?? []) as never,
        excluded: (c?.excluded ?? []) as never,
        isFeatured: s.featured,
        showOnWebsite: s.show,
      },
    });
  }
  const tours = SERVICES.filter((s) => !s.multiDay).length;
  console.log(`✓ services & packages: ${SERVICES.length} (${tours} tours, ${SERVICES.length - tours} packages)`);
}

// ---------------------------------------------------------------------
// Customer / VIP tiers.
// ---------------------------------------------------------------------
const CUSTOMER_TIERS = [
  { name: 'Standard', nameAr: 'عادي', discountPercentage: 0, badgeColor: 'blue', minSpendQAR: 0, description: 'Entry level — standard pricing on all tours, services and hotel stays.' },
  { name: 'VIP Silver', nameAr: 'فضي VIP', discountPercentage: 5, badgeColor: 'slate', minSpendQAR: 10000, description: 'Loyalty tier with 5% discount on all tours & services.' },
  { name: 'VIP Gold', nameAr: 'ذهبي VIP', discountPercentage: 10, badgeColor: 'amber', minSpendQAR: 25000, description: 'Premium tier with 10% discount plus priority airport desk service.' },
  { name: 'VIP Platinum', nameAr: 'بلاتيني VIP', discountPercentage: 15, badgeColor: 'purple', minSpendQAR: 50000, description: 'Top tier with 15% discount, dedicated concierge and VIP lounge access.' },
];
async function seedCustomerTiers() {
  const res = await prisma.customerTier.createMany({ data: CUSTOMER_TIERS });
  console.log(`✓ customer tiers: ${res.count}`);
}

// ---------------------------------------------------------------------
// Hotel vendors / partners.
// ---------------------------------------------------------------------
const HOTELS = [
  { name: 'The Royal Riviera Hotel', rep: 'Arafat', phone: '+974 7011 9084' },
  { name: 'C - Hotel and Suites Doha', rep: 'Ali', phone: '+974 3044 1512' },
  { name: 'Central Inn Souq Waqif', rep: 'Tamim Ikbal', phone: '+974 3375 6839' },
  { name: 'The Avenue Hotel', rep: 'Tamim Ikbal', phone: '+974 3375 6840' },
  { name: 'West Walk Retaj Hotel', rep: 'Tamim Ikbal', phone: '+974 3375 6841' },
];
async function seedHotels() {
  const data = HOTELS.map((h) => ({
    name: h.name, locationZone: 'Doha', starRating: 4, contactPerson: h.rep, contactPhone: h.phone,
    contactEmail: '', address: 'Doha, Qatar', commissionRate: 0, desks: [], roomOptions: [],
    contractStatus: 'Active', amenities: [], notes: `Hotel desk representative: ${h.rep}`,
  }));
  const res = await prisma.hotelVendor.createMany({ data });
  console.log(`✓ hotels: ${res.count}`);
}

// ---------------------------------------------------------------------
// Locations (airports + resort/hotel zones). Hotel locations get a generated
// unique code since the workbook marked them "(auto)".
// ---------------------------------------------------------------------
interface LocationRow { name: string; nameAr?: string; type: string; code: string; city: string }
const LOCATIONS: LocationRow[] = [
  { name: 'Hamad International Airport', nameAr: 'مطار حمد الدولي', type: 'airport', code: 'DOH', city: 'Doha' },
  { name: 'Doha International Airport', nameAr: 'مطار الدوحة الدولي', type: 'airport', code: 'DIA', city: 'Doha' },
  { name: 'The Royal Riviera Hotel', type: 'resort', code: '', city: 'Doha' },
  { name: 'C - Hotel and Suites Doha', type: 'resort', code: '', city: 'Doha' },
  { name: 'Central Inn Souq Waqif', type: 'resort', code: '', city: 'Doha' },
  { name: 'The Avenue Hotel', type: 'resort', code: '', city: 'Doha' },
  { name: 'West Walk Retaj Hotel', type: 'resort', code: '', city: 'Doha' },
];
/** Returns code → id so desks can link their location. */
async function seedLocations(): Promise<Map<string, string>> {
  const used = new Set<string>();
  const idByCode = new Map<string, string>();
  for (const l of LOCATIONS) {
    let code = l.code;
    if (!code) {
      const initials = l.name.replace(/[^A-Za-z ]/g, '').split(/\s+/).filter(Boolean).map((w) => w[0]).join('').toUpperCase();
      code = initials.slice(0, 4) || 'LOC';
      let n = 2;
      while (used.has(code)) code = `${initials.slice(0, 3)}${n++}`;
    }
    used.add(code);
    const row = await prisma.location.create({
      data: { name: l.name, nameAr: l.nameAr, type: l.type, code, city: l.city, active: true },
    });
    idByCode.set(l.code || code, row.id);
    idByCode.set(code, row.id);
  }
  console.log(`✓ locations: ${LOCATIONS.length}`);
  return idByCode;
}

// ---------------------------------------------------------------------
// Airport / hotel desks.
// ---------------------------------------------------------------------
const DESKS = [
  { deskCode: 'HIA-CTR-04', deskName: 'Main Arrivals Concourse Counter 4', locationCode: 'DOH', airportName: 'Hamad International Airport (DOH)', terminal: 'Terminal 1 - Arrivals Hall', staff: 'Zaid Qasim', staffRole: 'Transit Desk Lead Agent', status: 'Active', shift: '06:00 AM - 14:30 PM (Morning Shift)', phoneExt: '+974 4010 8841', deskType: 'airport' },
  { deskCode: 'HIA-CTR-07', deskName: 'Transit Concourse C & D Service Desk', locationCode: 'DOH', airportName: 'Hamad International Airport (DOH)', terminal: 'Airside Transit Hub', staff: 'Tariq Al-Sulaiti', staffRole: 'Airport Operations Lead', status: 'Active', shift: '14:00 PM - 22:30 PM (Evening Shift)', phoneExt: '+974 4010 8847', deskType: 'airport' },
  { deskCode: 'HIA-VIP-01', deskName: 'Al Maha VIP Lounge Concierge Desk', locationCode: 'DOH', airportName: 'Hamad International Airport (DOH)', terminal: 'Al Maha VIP Terminal', staff: 'Noor Al-Huda', staffRole: 'VIP Concierge Specialist', status: 'Active', shift: '24/7 Rotational Concierge', phoneExt: '+974 4010 9901', deskType: 'airport' },
];
async function seedDesks(locationIdByCode: Map<string, string>) {
  for (const d of DESKS) {
    await prisma.airportDesk.create({
      data: {
        locationId: locationIdByCode.get(d.locationCode),
        airportCode: d.locationCode,
        airportName: d.airportName,
        deskCode: d.deskCode,
        deskName: d.deskName,
        terminal: d.terminal,
        assignedEmployeeName: d.staff,
        assignedEmployeeRole: d.staffRole,
        status: d.status,
        shiftTiming: d.shift,
        phoneExt: d.phoneExt,
        deskType: d.deskType,
      },
    });
  }
  console.log(`✓ airport desks: ${DESKS.length}`);
}

// ---------------------------------------------------------------------
// OTA platforms & channels.
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
  const res = await prisma.platform.createMany({ data });
  console.log(`✓ platforms: ${res.count} (tour ${TOUR_PLATFORMS.length}, airport-transfer ${TRANSFER_PLATFORMS.length})`);
}

// ---------------------------------------------------------------------
// Currencies + rates (QAR base) + company/invoice profile.
// ---------------------------------------------------------------------
const CURRENCIES = [
  { code: 'QAR', name: 'Qatari Riyal', symbol: 'QAR', rateToQAR: 1, isPegged: true, peggedNote: 'Base currency' },
  { code: 'USD', name: 'US Dollar', symbol: '$', rateToQAR: 3.64, isPegged: true },
  { code: 'EUR', name: 'Euro', symbol: '€', rateToQAR: 3.96, isPegged: false },
  { code: 'GBP', name: 'British Pound', symbol: '£', rateToQAR: 4.74, isPegged: false },
];
async function seedConfig() {
  await prisma.appSetting.create({
    data: { key: 'rates', value: { USD: 3.64, EUR: 3.96, GBP: 4.74, SAR: 0.97, lastUpdated: new Date().toISOString() } as never },
  });
  await prisma.appSetting.create({ data: { key: 'invoiceProfile', value: COMPANY_PROFILE as never } });
  const res = await prisma.currencyItem.createMany({ data: CURRENCIES });
  console.log(`✓ currencies: ${res.count} (QAR base) + rates + company profile`);
}

// ---------------------------------------------------------------------
// Public website CMS content (hero text + images, sections, contact,
// footer) — from the single source of truth in web/src/data so the landing
// page is fully populated. Image refs resolve to committed /media.
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
// Customer reviews (committed avatar placeholder).
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

async function main() {
  console.log('Seeding AR Trust database (production workbook data)…\n');
  await wipeDatabase();
  const userIdByName = await seedUsers();
  const fleetByPlate = await seedFleet(userIdByName);
  await seedDriverRegistry(fleetByPlate);
  await seedTourGuides();
  await seedStaff();
  await seedHotels();
  const locationIdByCode = await seedLocations();
  await seedDesks(locationIdByCode);
  await seedPlatforms();
  await seedServiceCategories();
  await seedServices();
  await seedCustomerTiers();
  await seedConfig();
  await seedSiteContent();
  await seedReviews();
  console.log('\n✅ Seed complete — users, fleet, drivers, guides, staff, hotels, locations, desks, platforms, services, tiers, currencies, company profile, website content + reviews.');
  console.log('   Super-admin login: "rajib.artrust" / "md.unus.hr@gmail.com" (password from the workbook).');
}

main()
  .catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
