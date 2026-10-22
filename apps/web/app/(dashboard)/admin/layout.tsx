'use client';

// =====================================================================
// Unified admin console chrome. Every console page lives under /admin/<tab>
// (route-based, so a reload or shared link lands on the exact page). This
// layout renders the persistent shell — Sidebar, Header, notification toast and
// the shared modals — and gates everything behind an authenticated, hydrated
// session. The individual route pages render into {children}.
//
// Replaces the old state-switching DashboardShell; role landing is handled by
// DashboardView (role-adaptive) at /admin.
// =====================================================================

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Globe } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { NewBookingModal } from '@/components/modals/NewBookingModal';
import { QRVoucherModal } from '@/components/modals/QRVoucherModal';
import { QRVerificationModal } from '@/components/modals/QRVerificationModal';
import { AddHotelRoomModal } from '@/components/modals/AddHotelRoomModal';
import { EODAuditModal } from '@/components/modals/EODAuditModal';
import { FlightDetailModal } from '@/components/modals/FlightDetailModal';
import { RealtimeNotificationToast } from '@/components/common/RealtimeNotificationToast';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { activeModal, isAuthenticated, dataHydrated } = useApp();
  const router = useRouter();

  // Auth lives in localStorage (client-only); gate behind `mounted` so the
  // server render and first client render agree (no hydration mismatch).
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (mounted && !isAuthenticated) router.replace('/login');
  }, [mounted, isAuthenticated, router]);

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
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <Header onNavigateToHome={() => router.push('/')} />

        <main className="flex-1 overflow-y-auto px-6 py-6 overscroll-contain">
          <div className="max-w-[1600px] mx-auto">{children}</div>
        </main>
      </div>

      <RealtimeNotificationToast />

      {activeModal === 'new-booking' && <NewBookingModal />}
      {activeModal === 'qr-voucher' && <QRVoucherModal />}
      {activeModal === 'qr-verification' && <QRVerificationModal />}
      {activeModal === 'add-hotel-room' && <AddHotelRoomModal />}
      {activeModal === 'eod-audit' && <EODAuditModal />}
      {activeModal === 'flight-detail' && <FlightDetailModal />}

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
