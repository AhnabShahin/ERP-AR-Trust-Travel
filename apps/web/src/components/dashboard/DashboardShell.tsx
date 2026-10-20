'use client';

// =====================================================================
// Dashboard / ERP console shell (client-side rendered by design).
//
// This is the authenticated operations console ported out of the old
// src/App.tsx MainLayout. It is intentionally client-only: it depends on
// the auth token (localStorage), live data hydration and heavy interactive
// state, none of which benefit from SSR. Each role route renders this with
// its `role`, which selects the active role in AppContext.
// =====================================================================

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Globe } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import { getRoleDashboardSlug } from '../../utils/roleSlugs';
import { Sidebar } from '../Sidebar';
import { Header } from '../Header';
import { DashboardView } from '../views/DashboardView';
import { UnifiedBookingsView } from '../views/UnifiedBookingsView';
import { AgentDeskPOSView } from '../views/AirportDeskPOSView';
import { VendorsView } from '../views/VendorsView';
import { HotelBookingView } from '../views/HotelBookingView';
import { FleetPersonnelView } from '../views/FleetPersonnelView';
import { EODShiftView } from '../views/EODShiftView';
import { PayrollCommissionView } from '../views/PayrollCommissionView';
import { MultiCurrencyLedgerView } from '../views/MultiCurrencyLedgerView';
import { FinancialReportsView } from '../views/FinancialReportsView';
import { AuditLogsView } from '../views/AuditLogsView';
import { DriverPortalView } from '../views/DriverPortalView';
import { ServicesManagementView } from '../views/ServicesManagementView';
import { EmployeesView } from '../views/EmployeesView';
import { GuestsView } from '../views/GuestsView';
import { ExpensesView } from '../views/ExpensesView';
import { SettingsView } from '../views/SettingsView';
import { UserAccountsManagerView } from '../views/UserAccountsManagerView';
import { MyAccountView } from '../views/MyAccountView';
import { VendorDashboardView } from '../views/VendorDashboardView';
import { NewBookingModal } from '../modals/NewBookingModal';
import { QRVoucherModal } from '../modals/QRVoucherModal';
import { QRVerificationModal } from '../modals/QRVerificationModal';
import { AddHotelRoomModal } from '../modals/AddHotelRoomModal';
import { EODAuditModal } from '../modals/EODAuditModal';
import { FlightDetailModal } from '../modals/FlightDetailModal';
import { RealtimeNotificationToast } from '../common/RealtimeNotificationToast';

export default function DashboardShell({ role }: { role?: UserRole }) {
  const {
    activeTab,
    activeModal,
    currentUser,
    isAuthenticated,
    dataHydrated,
  } = useApp();
  const router = useRouter();

  // Auth state lives in localStorage (client-only). Gate everything behind
  // `mounted` so the server render and the first client render both show the
  // loader — otherwise the two renders disagree and React throws a hydration
  // mismatch.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Guard: the console requires a logged-in user. Anonymous visitors are
  // bounced to the login screen (client-side; the public site is the SSR part).
  useEffect(() => {
    if (mounted && !isAuthenticated) router.replace('/login');
  }, [mounted, isAuthenticated, router]);

  // Enforce one-user-one-role: a user's role is fixed on their account, so if
  // the URL points at a different role's dashboard than the signed-in user's,
  // send them to their own. (No runtime role switching.)
  useEffect(() => {
    if (!mounted || !isAuthenticated || !currentUser) return;
    if (role && currentUser.role !== role) {
      router.replace(getRoleDashboardSlug(currentUser.role));
    }
  }, [mounted, role, currentUser, isAuthenticated, router]);

  // Until mounted + authenticated + data loaded, show a stable loader (also
  // what the server renders), so hydration matches and no view renders against
  // empty collections or for an anonymous visitor.
  if (!mounted || !isAuthenticated || !dataHydrated) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center gap-4 bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
        <div className="w-10 h-10 rounded-full border-2 border-teal-500/30 border-t-teal-500 animate-spin" />
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
          Loading live operations data…
        </p>
      </div>
    );
  }

  return (
    <div className="h-screen w-full overflow-hidden flex bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors">
      {/* 1. Left Sidebar Navigation */}
      <Sidebar />

      {/* 2. Main Content Wrapper */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Header Bar */}
        <Header onNavigateToHome={() => router.push('/')} />

        {/* Scrollable View Content */}
        <main className="flex-1 overflow-y-auto px-6 py-6 overscroll-contain">
          <div className="max-w-[1600px] mx-auto">
            {activeTab === 'dashboard' && <DashboardView />}
            {activeTab === 'bookings' && <UnifiedBookingsView />}
            {activeTab === 'hotel-bookings' && <HotelBookingView />}
            {activeTab === 'vendors' && <VendorsView />}
            {activeTab === 'pos' && <AgentDeskPOSView />}
            {activeTab === 'guests' && <GuestsView />}
            {activeTab === 'services' && <ServicesManagementView />}
            {activeTab === 'employees' && <EmployeesView />}
            {activeTab === 'dispatch' && <FleetPersonnelView />}
            {activeTab === 'eod' && <EODShiftView />}
            {activeTab === 'payroll' && <PayrollCommissionView />}
            {activeTab === 'expenses' && <ExpensesView />}
            {activeTab === 'ledger' && <MultiCurrencyLedgerView />}
            {activeTab === 'reports' && <FinancialReportsView />}
            {activeTab === 'audit-logs' && <AuditLogsView />}
            {activeTab === 'driver-portal' && <DriverPortalView />}
            {activeTab === 'vendor-portal' && <VendorDashboardView />}
            {activeTab === 'my-account' && <MyAccountView />}
            {activeTab === 'accounts' && <UserAccountsManagerView />}
            {activeTab === 'settings' && <SettingsView />}
          </div>
        </main>
      </div>

      {/* Real-time live notification toast */}
      <RealtimeNotificationToast />

      {/* 3. Conditional Interactive Modals */}
      {activeModal === 'new-booking' && <NewBookingModal />}
      {activeModal === 'qr-voucher' && <QRVoucherModal />}
      {activeModal === 'qr-verification' && <QRVerificationModal />}
      {activeModal === 'add-hotel-room' && <AddHotelRoomModal />}
      {activeModal === 'eod-audit' && <EODAuditModal />}
      {activeModal === 'flight-detail' && <FlightDetailModal />}

      {/* Floating Switch to Public Website */}
      <button
        type="button"
        onClick={() => router.push('/')}
        className="fixed bottom-6 left-6 z-40 px-3.5 py-2.5 rounded-2xl bg-slate-900/95 hover:bg-teal-900/90 text-white border border-slate-700 hover:border-teal-500 shadow-2xl flex items-center gap-2 text-xs font-semibold backdrop-blur-md transition-all active:scale-95 cursor-pointer"
        title="View Public Website"
      >
        <Globe className="w-4 h-4 text-teal-400" />
        <span className="hidden sm:inline">View Public Website</span>
      </button>
    </div>
  );
}
