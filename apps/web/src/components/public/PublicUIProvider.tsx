'use client';

// =====================================================================
// Public website UI state (client island).
//
// Replaces the old window-based SPA plumbing in HomepageView: the booking
// and auth slide-over drawers are global UI, so their open/close state lives
// here and the drawers are rendered once at the layout level. Any public
// component can trigger them via the `usePublicUI()` hook instead of passing
// `onOpenDrawer` / `onOpenAuthDrawer` callbacks down the tree.
// =====================================================================

import React, { createContext, useContext, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '../../context/AppContext';
import { getRoleDashboardSlug } from '../../utils/roleSlugs';
import { BookingDrawer } from '../booking/BookingDrawer';
import { AuthDrawer } from '../auth/AuthDrawer';

interface PublicUIContextType {
  /** Open the booking drawer, optionally pre-selecting a tour/fleet id or title. */
  openBookingDrawer: (tourIdOrTitle?: string) => void;
  closeBookingDrawer: () => void;
  /** Open the login/signup slide-over. */
  openAuthDrawer: (mode?: 'login' | 'signup') => void;
  closeAuthDrawer: () => void;
}

const PublicUIContext = createContext<PublicUIContextType | undefined>(undefined);

export const PublicUIProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter();
  const { isAuthenticated, currentRole } = useApp();

  const [bookingOpen, setBookingOpen] = useState(false);
  const [preselectedTourId, setPreselectedTourId] = useState<string | undefined>(undefined);

  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');

  const value = useMemo<PublicUIContextType>(
    () => ({
      openBookingDrawer: (tourIdOrTitle?: string) => {
        setPreselectedTourId(tourIdOrTitle);
        setBookingOpen(true);
      },
      closeBookingDrawer: () => setBookingOpen(false),
      openAuthDrawer: (mode: 'login' | 'signup' = 'login') => {
        setAuthMode(mode);
        setAuthOpen(true);
      },
      closeAuthDrawer: () => setAuthOpen(false),
    }),
    []
  );

  // After a successful login the auth drawer asks us to enter the console.
  const goToDashboard = () => {
    setAuthOpen(false);
    router.push(isAuthenticated ? getRoleDashboardSlug(currentRole) : '/login');
  };

  return (
    <PublicUIContext.Provider value={value}>
      {children}

      <BookingDrawer
        isOpen={bookingOpen}
        onClose={() => setBookingOpen(false)}
        preselectedTourId={preselectedTourId}
      />

      <AuthDrawer
        isOpen={authOpen}
        onClose={() => setAuthOpen(false)}
        initialMode={authMode}
        onNavigateToERP={goToDashboard}
        onNavigateHome={() => {
          setAuthOpen(false);
          router.push('/');
        }}
        onOpenBookingDrawer={() => {
          setAuthOpen(false);
          setPreselectedTourId(undefined);
          setBookingOpen(true);
        }}
      />
    </PublicUIContext.Provider>
  );
};

export const usePublicUI = (): PublicUIContextType => {
  const ctx = useContext(PublicUIContext);
  if (!ctx) {
    // Graceful no-op fallback if used outside the provider (e.g. during an
    // isolated unit render) so components never crash.
    return {
      openBookingDrawer: () => {},
      closeBookingDrawer: () => {},
      openAuthDrawer: () => {},
      closeAuthDrawer: () => {},
    };
  }
  return ctx;
};
