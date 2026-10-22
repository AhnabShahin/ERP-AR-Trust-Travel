// =====================================================================
// Pure admin-tab slug helpers — NO component imports, so AppContext can use
// them without pulling in the view registry (which would create an import
// cycle: adminRoutes -> views -> AppContext). The component registry lives in
// adminRoutes.ts and reuses these.
// =====================================================================

/** The overview tab shown at /dashboard (role-adaptive via DashboardView). */
export const DEFAULT_TAB = 'dashboard';

/** Every menu/route slug (URL segment after /dashboard/). Keep in sync with ADMIN_VIEWS. */
export const KNOWN_TABS = [
  'dashboard',
  'bookings',
  'hotel-bookings',
  'vendors',
  'pos',
  'guests',
  'services',
  'employees',
  'dispatch',
  'eod',
  'payroll',
  'expenses',
  'ledger',
  'reports',
  'audit-logs',
  'driver-portal',
  'vendor-portal',
  'my-account',
  'accounts',
  'settings',
  'search',
  'website-content',
  'reviews',
] as const;

const TAB_SET = new Set<string>(KNOWN_TABS);

/** True when a slug maps to a known view/tab. */
export function isKnownTab(slug: string | undefined | null): slug is string {
  return !!slug && TAB_SET.has(slug);
}

/** Build the console URL for a tab id. The overview tab lives at /dashboard. */
export function adminPath(tab: string): string {
  return tab === DEFAULT_TAB ? '/dashboard' : `/dashboard/${tab}`;
}

/** Derive the active tab id from a pathname (…/dashboard or …/dashboard/<tab>/…). */
export function tabFromPath(pathname: string | null | undefined): string {
  if (!pathname || !pathname.startsWith('/dashboard')) return DEFAULT_TAB;
  const seg = pathname.split('/')[2]; // '', 'bookings', 'guests', …
  return isKnownTab(seg) ? seg : DEFAULT_TAB;
}
