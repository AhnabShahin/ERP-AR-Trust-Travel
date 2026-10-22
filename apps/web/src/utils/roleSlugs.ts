import { UserRole } from '../types';

// =====================================================================
// Single role-adaptive console: EVERY role lands on /dashboard. The menu
// items and data shown there are gated per role (see roleConfig.allowedTabs
// and the role-adaptive DashboardView), but the URL is always /dashboard —
// no role-specific dashboard routes, no hidden redirects.
// =====================================================================

/** The one console landing path, the same for every role. */
export const DASHBOARD_PATH = '/dashboard';

/** Kept for call-site compatibility — always the unified /dashboard. */
export const getRoleDashboardSlug = (_role?: UserRole): string => DASHBOARD_PATH;
