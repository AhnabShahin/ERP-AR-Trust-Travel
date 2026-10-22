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

function LoginInner() {
  const { isAuthenticated } = useApp();
  const router = useRouter();

  // Unified console: everyone lands on /dashboard, which is role-adaptive.
  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/dashboard');
    }
  }, [isAuthenticated, router]);

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
