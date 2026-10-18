import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './components/views/DashboardView';
import { UnifiedBookingsView } from './components/views/UnifiedBookingsView';
import { AgentDeskPOSView } from './components/views/AirportDeskPOSView';
import { VendorsView } from './components/views/VendorsView';
import { HotelBookingView } from './components/views/HotelBookingView';
import { FleetPersonnelView } from './components/views/FleetPersonnelView';
import { EODShiftView } from './components/views/EODShiftView';
import { PayrollCommissionView } from './components/views/PayrollCommissionView';
import { MultiCurrencyLedgerView } from './components/views/MultiCurrencyLedgerView';
import { FinancialReportsView } from './components/views/FinancialReportsView';
import { AuditLogsView } from './components/views/AuditLogsView';
import { DriverPortalView } from './components/views/DriverPortalView';
import { ServicesManagementView } from './components/views/ServicesManagementView';
import { EmployeesView } from './components/views/EmployeesView';
import { GuestsView } from './components/views/GuestsView';
import { ExpensesView } from './components/views/ExpensesView';
import { SettingsView } from './components/views/SettingsView';
import { UserAccountsManagerView } from './components/views/UserAccountsManagerView';
import { MyAccountView } from './components/views/MyAccountView';
import { VendorDashboardView } from './components/views/VendorDashboardView';
import { AuthView } from './components/views/AuthView';
import { HomepageView } from './components/views/HomepageView';
import { Globe } from 'lucide-react';
import { WebsiteLanguageProvider } from './context/WebsiteLanguageContext';
import { WebsiteCurrencyProvider } from './context/WebsiteCurrencyContext';

import { NewBookingModal } from './components/modals/NewBookingModal';
import { QRVoucherModal } from './components/modals/QRVoucherModal';
import { QRVerificationModal } from './components/modals/QRVerificationModal';
import { AddHotelRoomModal } from './components/modals/AddHotelRoomModal';
import { EODAuditModal } from './components/modals/EODAuditModal';
import { FlightDetailModal } from './components/modals/FlightDetailModal';
import { RealtimeNotificationToast } from './components/common/RealtimeNotificationToast';
import {
  getRoleDashboardSlug,
  getRoleFromSlug,
  isDashboardSlug,
} from './utils/roleSlugs';

const resolveViewModeFromUrl = (): 'homepage' | 'auth' | 'erp' => {
  if (typeof window === 'undefined') return 'homepage';
  const pathname = window.location.pathname.toLowerCase();
  const hash = window.location.hash.replace(/^#\/?/, '').toLowerCase().trim();

  // If URL path is /dashboard or role-based dashboard slug (e.g. /customer-dashboard) or hash is #/dashboard
  if (
    pathname === '/dashboard' ||
    pathname.startsWith('/dashboard/') ||
    pathname === '/erp' ||
    isDashboardSlug(pathname) ||
    hash === 'dashboard' ||
    hash.startsWith('dashboard/') ||
    hash === 'erp' ||
    isDashboardSlug(hash)
  ) {
    return 'erp';
  }

  // If URL path is /login or /auth
  if (
    pathname === '/login' ||
    pathname === '/auth' ||
    hash === 'login' ||
    hash === 'auth'
  ) {
    return 'auth';
  }

  return 'homepage';
};

const MainLayout: React.FC = () => {
  const { activeTab, activeModal, currentRole, setRole, isAuthenticated } = useApp();

  // Navigation mode: 'homepage' (Public Website) | 'auth' (Login/Signup) | 'erp' (Operations Console)
  const [viewMode, setViewMode] = React.useState<'homepage' | 'auth' | 'erp'>(resolveViewModeFromUrl);

  // Sync state when browser back/forward or hash changes occur
  React.useEffect(() => {
    const handleUrlChange = () => {
      const mode = resolveViewModeFromUrl();
      setViewMode(mode);

      // If URL slug points to a specific role dashboard, auto-activate that role
      const roleFromUrl =
        getRoleFromSlug(window.location.pathname) ||
        getRoleFromSlug(window.location.hash.replace(/^#\/?/, ''));
      if (roleFromUrl && roleFromUrl !== currentRole) {
        setRole(roleFromUrl);
      }
    };

    window.addEventListener('popstate', handleUrlChange);
    window.addEventListener('hashchange', handleUrlChange);
    return () => {
      window.removeEventListener('popstate', handleUrlChange);
      window.removeEventListener('hashchange', handleUrlChange);
    };
  }, [currentRole, setRole]);

  // When viewMode is 'erp', synchronize URL to role-specific dashboard slug (e.g. /customer-dashboard, /dashboard)
  React.useEffect(() => {
    if (viewMode === 'erp') {
      const targetSlug = getRoleDashboardSlug(currentRole);
      const currentPath = window.location.pathname.toLowerCase();
      if (
        currentPath === '/dashboard' ||
        isDashboardSlug(currentPath) ||
        currentPath === '/erp' ||
        activeTab === 'dashboard'
      ) {
        if (window.location.pathname !== targetSlug) {
          window.history.pushState(null, '', targetSlug);
        }
      }
    }
  }, [viewMode, currentRole, activeTab]);

  // When user logs in, automatically transition to ERP operations console on their role's dashboard slug
  React.useEffect(() => {
    if (isAuthenticated && viewMode === 'auth') {
      setViewMode('erp');
      const targetSlug = getRoleDashboardSlug(currentRole);
      if (window.location.pathname !== targetSlug) {
        window.history.pushState(null, '', targetSlug);
      }
    }
  }, [isAuthenticated, viewMode, currentRole]);

  const navigateToERP = () => {
    if (isAuthenticated) {
      setViewMode('erp');
      const targetSlug = getRoleDashboardSlug(currentRole);
      if (window.location.pathname !== targetSlug) {
        window.history.pushState(null, '', targetSlug);
      }
    } else {
      setViewMode('auth');
      if (window.location.pathname !== '/login') {
        window.history.pushState(null, '', '/login');
      }
    }
  };

  const navigateToHomepage = () => {
    setViewMode('homepage');
    if (window.location.pathname !== '/') {
      window.history.pushState(null, '', '/');
    }
  };

  // If viewing Public Homepage
  if (viewMode === 'homepage') {
    return (
      <HomepageView
        onNavigateToAuth={navigateToERP}
      />
    );
  }

  // If not authenticated or explicitly navigating to Auth screen
  if (!isAuthenticated || viewMode === 'auth') {
    return <AuthView onNavigateToHome={navigateToHomepage} />;
  }

  return (
    <div className="h-screen w-full overflow-hidden flex bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors">
      {/* 1. Left Sidebar Navigation */}
      <Sidebar />

      {/* 2. Main Content Wrapper */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Header Bar */}
        <Header onNavigateToHome={navigateToHomepage} />

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
        onClick={navigateToHomepage}
        className="fixed bottom-6 left-6 z-40 px-3.5 py-2.5 rounded-2xl bg-slate-900/95 hover:bg-teal-900/90 text-white border border-slate-700 hover:border-teal-500 shadow-2xl flex items-center gap-2 text-xs font-semibold backdrop-blur-md transition-all active:scale-95 cursor-pointer"
        title="View Public Website"
      >
        <Globe className="w-4 h-4 text-teal-400" />
        <span className="hidden sm:inline">View Public Website</span>
      </button>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <WebsiteLanguageProvider>
        <WebsiteCurrencyProvider>
          <MainLayout />
        </WebsiteCurrencyProvider>
      </WebsiteLanguageProvider>
    </AppProvider>
  );
}
