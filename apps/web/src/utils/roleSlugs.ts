import { UserRole } from '../types';

export const ROLE_DASHBOARD_SLUGS: Record<UserRole, string> = {
  'super-admin': '/dashboard',
  'admin': '/admin-dashboard',
  'customer': '/customer-dashboard',
  'vendor-partner': '/vendor-dashboard',
  'operations-manager': '/manager-dashboard',
  'transit-agent': '/agent-dashboard',
  'driver-guide': '/driver-dashboard',
  'finance-accountant': '/finance-dashboard',
  'staff': '/staff-dashboard',
};

export const SLUG_TO_ROLE: Record<string, UserRole> = {
  'dashboard': 'super-admin',
  'super-admin-dashboard': 'super-admin',
  'admin-dashboard': 'admin',
  'customer-dashboard': 'customer',
  'vendor-dashboard': 'vendor-partner',
  'partner-dashboard': 'vendor-partner',
  'manager-dashboard': 'operations-manager',
  'operations-dashboard': 'operations-manager',
  'agent-dashboard': 'transit-agent',
  'transit-dashboard': 'transit-agent',
  'driver-dashboard': 'driver-guide',
  'finance-dashboard': 'finance-accountant',
  'accountant-dashboard': 'finance-accountant',
  'staff-dashboard': 'staff',
};

export const getRoleDashboardSlug = (role: UserRole): string => {
  return ROLE_DASHBOARD_SLUGS[role] || '/dashboard';
};

export const getRoleFromSlug = (slugOrPath: string): UserRole | null => {
  const clean = slugOrPath.toLowerCase().replace(/^\/+|\/+$/g, '').trim();
  return SLUG_TO_ROLE[clean] || null;
};

export const isDashboardSlug = (slugOrPath: string): boolean => {
  const clean = slugOrPath.toLowerCase().replace(/^\/+|\/+$/g, '').trim();
  return Boolean(SLUG_TO_ROLE[clean]);
};
