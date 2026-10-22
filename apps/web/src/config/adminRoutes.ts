// =====================================================================
// Admin console route registry — the single source of truth mapping a URL
// slug (the segment after /dashboard/) to the view component that renders it.
// Navigation, the [tab] route page, and activeTab derivation all use this so
// every menu item is a real, reload-stable URL under /dashboard/<slug>.
//
// The slug is identical to the legacy `activeTab` id, so the ~11 existing
// setActiveTab(tabId) call sites keep working unchanged — setActiveTab now just
// pushes /dashboard/<tabId> (see AppContext).
// =====================================================================

import type { ComponentType } from 'react';

export { DEFAULT_TAB, KNOWN_TABS, isKnownTab, adminPath, tabFromPath } from './adminTabs';

import { DashboardView } from '../components/views/DashboardView';
import { UnifiedBookingsView } from '../components/views/UnifiedBookingsView';
import { HotelBookingView } from '../components/views/HotelBookingView';
import { VendorsView } from '../components/views/VendorsView';
import { AgentDeskPOSView } from '../components/views/AirportDeskPOSView';
import { GuestsView } from '../components/views/GuestsView';
import { ServicesManagementView } from '../components/views/ServicesManagementView';
import { EmployeesView } from '../components/views/EmployeesView';
import { FleetPersonnelView } from '../components/views/FleetPersonnelView';
import { EODShiftView } from '../components/views/EODShiftView';
import { PayrollCommissionView } from '../components/views/PayrollCommissionView';
import { ExpensesView } from '../components/views/ExpensesView';
import { MultiCurrencyLedgerView } from '../components/views/MultiCurrencyLedgerView';
import { FinancialReportsView } from '../components/views/FinancialReportsView';
import { AuditLogsView } from '../components/views/AuditLogsView';
import { DriverPortalView } from '../components/views/DriverPortalView';
import { VendorDashboardView } from '../components/views/VendorDashboardView';
import { MyAccountView } from '../components/views/MyAccountView';
import { UserAccountsManagerView } from '../components/views/UserAccountsManagerView';
import { SettingsView } from '../components/views/SettingsView';
import { GlobalSearchView } from '../components/views/GlobalSearchView';
import { WebsiteContentView } from '../components/views/WebsiteContentView';
import { ReviewsManagerView } from '../components/views/ReviewsManagerView';

/** slug (URL segment after /dashboard/) -> view component. */
export const ADMIN_VIEWS: Record<string, ComponentType> = {
  dashboard: DashboardView,
  bookings: UnifiedBookingsView,
  'hotel-bookings': HotelBookingView,
  vendors: VendorsView,
  pos: AgentDeskPOSView,
  guests: GuestsView,
  services: ServicesManagementView,
  employees: EmployeesView,
  dispatch: FleetPersonnelView,
  eod: EODShiftView,
  payroll: PayrollCommissionView,
  expenses: ExpensesView,
  ledger: MultiCurrencyLedgerView,
  reports: FinancialReportsView,
  'audit-logs': AuditLogsView,
  'driver-portal': DriverPortalView,
  'vendor-portal': VendorDashboardView,
  'my-account': MyAccountView,
  accounts: UserAccountsManagerView,
  settings: SettingsView,
  search: GlobalSearchView,
  'website-content': WebsiteContentView,
  reviews: ReviewsManagerView,
};
