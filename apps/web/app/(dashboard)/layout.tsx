'use client';

import type { ReactNode } from 'react';
import { AppProvider } from '@/context/AppContext';
import { WebsiteLanguageProvider } from '@/context/WebsiteLanguageContext';
import { WebsiteCurrencyProvider } from '@/context/WebsiteCurrencyContext';

// The ERP console is client-rendered. The providers are mounted here (not on
// the server) because they rely on the auth token and live data fetched in
// the browser. No server-fetched catalogue seeding is needed for the console.
export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <AppProvider>
      <WebsiteLanguageProvider>
        <WebsiteCurrencyProvider>{children}</WebsiteCurrencyProvider>
      </WebsiteLanguageProvider>
    </AppProvider>
  );
}
