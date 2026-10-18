// =====================================================================
// @ar-trust/shared — contract types shared by the web app and the API.
// Add domain types here as each backend module is built so that the
// frontend and backend always agree on the same shapes.
// =====================================================================

// ---- Primitives / enums -------------------------------------------------

export type Currency = 'QAR' | 'USD' | 'EUR' | 'GBP';
export type Language = 'en' | 'ar';

export type UserRole =
  | 'super-admin'
  | 'operations-manager'
  | 'transit-agent'
  | 'driver-guide'
  | 'finance-accountant'
  | 'vendor-partner'
  | 'customer';

export type BookingStatus =
  | 'pending'
  | 'confirmed'
  | 'driver-assigned'
  | 'in-progress'
  | 'checked-in'
  | 'in-transit'
  | 'scheduled'
  | 'completed'
  | 'cancelled';

// ---- Domain entities (mirror the Prisma models) -------------------------

/** Public-safe user shape — never includes the password hash. */
export interface UserAccount {
  id: string;
  name: string;
  nameAr?: string | null;
  username: string;
  email: string;
  role: UserRole;
  phone?: string | null;
  avatar?: string | null;
  department?: string | null;
  vendorId?: string | null;
  status: 'active' | 'inactive';
  lastLogin?: string | null;
  createdAt: string;
  isEmailVerified?: boolean;
  country?: string | null;
  nationality?: string | null;
  companyName?: string | null;
  bio?: string | null;
}

export interface Booking {
  id: string;
  pnr: string;
  passengerName: string;
  passengerPhone: string;
  passengerEmail: string;
  nationality: string;
  flightNumber: string;
  arrivalAirport: string;
  arrivalTime: string;
  packageId: string;
  packageName: string;
  paxCount: number;
  totalQAR: number;
  paymentCurrency: Currency;
  paymentMethod: string;
  driverId?: string | null;
  driverName?: string | null;
  guideId?: string | null;
  guideName?: string | null;
  qrStatus: BookingStatus;
  voucherSent: boolean;
  bookingDate?: string | null;
  bookingTime?: string | null;
  notes?: string | null;
  source: string;
  createdAt: string;
}

// ---- API transport ------------------------------------------------------

/** Every API response is wrapped in this envelope. */
export type ApiResponse<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; details?: unknown };

export interface LoginDto {
  username: string;
  password: string;
}

export interface RegisterDto {
  name: string;
  username: string;
  email: string;
  password: string;
  role?: UserRole;
  phone?: string;
}

export interface AuthResponse {
  token: string;
  user: UserAccount;
}
