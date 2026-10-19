'use client';

// =====================================================================
// Standalone login / signup route screen.
//
// Wraps the existing AuthView in its own provider stack (the console's
// providers only exist inside the (dashboard) group) and redirects to the
// role dashboard once authentication succeeds.
// =====================================================================

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AppProvider, useApp } from '../../context/AppContext';
import { WebsiteLanguageProvider } from '../../context/WebsiteLanguageContext';
import { WebsiteCurrencyProvider } from '../../context/WebsiteCurrencyContext';
import { AuthView } from '../views/AuthView';
import { getRoleDashboardSlug } from '../../utils/roleSlugs';

function LoginInner() {
  const { isAuthenticated, currentRole } = useApp();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      router.replace(getRoleDashboardSlug(currentRole));
    }
  }, [isAuthenticated, currentRole, router]);

  return <AuthView onNavigateToHome={() => router.push('/')} />;
}

export default function LoginScreen() {
  return (
    <AppProvider>
      <WebsiteLanguageProvider>
        <WebsiteCurrencyProvider>
          <LoginInner />
        </WebsiteCurrencyProvider>
      </WebsiteLanguageProvider>
    </AppProvider>
  );
}
