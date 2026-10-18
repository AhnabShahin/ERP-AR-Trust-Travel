import bcrypt from 'bcryptjs';
import { PrismaClient, UserRole } from '@prisma/client';

const prisma = new PrismaClient();

const toPrismaRole = (r: string): UserRole => r.replace(/-/g, '_') as UserRole;

// Demo accounts (one per role) mirrored from the app's original mock data.
// Passwords are the mock plaintext values, hashed here. Change for production.
const demoUsers: Array<{
  name: string;
  nameAr?: string;
  username: string;
  email: string;
  password: string;
  role: string;
  department?: string;
  phone?: string;
  vendorId?: string;
  isEmailVerified?: boolean;
}> = [
  { name: 'Sheikh Nasser Al-Thani', nameAr: 'الشيخ ناصر آل ثاني', username: 'admin', email: 'admin@artrust.qa', password: 'admin123', role: 'super-admin', department: 'Executive Management & Board', phone: '+974 4499 5000', isEmailVerified: true },
  { name: 'Tariq Al-Sulaiti', nameAr: 'طارق السليطي', username: 'ops', email: 'ops@artrust.qa', password: 'ops123', role: 'operations-manager', department: 'Operations & Dispatch Desk', phone: '+974 5512 8841', isEmailVerified: true },
  { name: 'Zaid Qasim', nameAr: 'زيد قاسم', username: 'agent', email: 'agent@artrust.qa', password: 'agent123', role: 'transit-agent', department: 'Airport Arrivals Counter 4 & Hotels', phone: '+974 6690 1243' },
  { name: 'Tariq Al-Kuwari', nameAr: 'طارق الكواري', username: 'driver', email: 'driver@artrust.qa', password: 'driver123', role: 'driver-guide', department: 'Chauffeur Fleet & Desert Guides', phone: '+974 7741 9920' },
  { name: 'Khalid Al-Nuaimi CPA', nameAr: 'خالد النعيمي', username: 'finance', email: 'finance@artrust.qa', password: 'finance123', role: 'finance-accountant', department: 'Treasury & Audit Division', phone: '+974 3321 0098', isEmailVerified: true },
  { name: 'Bader Al-Husseini (The Ritz-Carlton)', nameAr: 'بدر الحسيني', username: 'ritz', email: 'concierge.doha@ritzcarlton.com', password: 'ritz123', role: 'vendor-partner', vendorId: 'h-ritz', department: 'The Ritz-Carlton, Doha', phone: '+974 4484 8000', isEmailVerified: true },
  { name: 'Marc de Saint-Germain (Fairmont)', nameAr: 'مارك دي سان جيرمان', username: 'fairmont', email: 'vipconcierge.doha@fairmont.com', password: 'fairmont123', role: 'vendor-partner', vendorId: 'h-fairmont', department: 'Fairmont & Raffles Doha', phone: '+974 4030 7777' },
  { name: 'Layla Al-Kuwari (Marsa Malaz)', nameAr: 'ليلى الكواري', username: 'kempinski', email: 'reservations.marsamalaz@kempinski.com', password: 'marsa123', role: 'vendor-partner', vendorId: 'h-marsamalaz', department: 'Marsa Malaz Kempinski', phone: '+974 4035 5555', isEmailVerified: true },
  { name: 'Alexander Wright', nameAr: 'ألكسندر رايت', username: 'customer', email: 'traveler.wright@gmail.com', password: 'customer123', role: 'customer', department: 'VIP Leisure Traveler', phone: '+44 7911 123456' },
];

async function main() {
  for (const u of demoUsers) {
    const passwordHash = await bcrypt.hash(u.password, 10);
    await prisma.user.upsert({
      where: { username: u.username },
      update: {},
      create: {
        name: u.name,
        nameAr: u.nameAr,
        username: u.username,
        email: u.email,
        passwordHash,
        role: toPrismaRole(u.role),
        department: u.department,
        phone: u.phone,
        vendorId: u.vendorId,
        status: 'active',
        isEmailVerified: u.isEmailVerified ?? false,
      },
    });
  }
  console.log(`✅ Seeded ${demoUsers.length} demo users (admin/admin123, ops/ops123, agent/agent123, driver/driver123, finance/finance123, customer/customer123, + 3 vendor-partners).`);
}

main()
  .catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
