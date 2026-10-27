// =====================================================================
// Local copy of the auth-related contract types from @ar-trust/shared.
// apps/web is deployed standalone (zipped on its own for Hostinger), so
// it can't rely on the npm workspace link to packages/shared — keep
// these in sync with packages/shared/src/index.ts by hand if they change.
// =====================================================================

export type UserRole =
  | 'super-admin'
  | 'admin'
  | 'operations-manager'
  | 'transit-agent'
  | 'driver-guide'
  | 'finance-accountant'
  | 'vendor-partner'
  | 'staff'
  | 'customer';

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
  staffStatus?: string | null;
  driverType?: string | null;
}

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
