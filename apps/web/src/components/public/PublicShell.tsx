'use client';

// =====================================================================
// Public website shell (client island mounted by the SSR (public) layout).
//
// The (public)/layout.tsx server component fetches the live catalogue and
// hands it here as `catalog`. This component mounts the client providers
// (seeded with that catalogue so the first paint already has live data),
// then renders the fixed WebsiteHeader + WebsiteFooter around the routed
// page content. Navigation and the slide-over drawers are wired to the
// Next router / PublicUIProvider instead of the old window-based SPA code.
// =====================================================================

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { AppProvider, InitialCatalog, useApp } from '../../context/AppContext';
import { WebsiteLanguageProvider, useWebsiteLanguage } from '../../context/WebsiteLanguageContext';
import { WebsiteCurrencyProvider } from '../../context/WebsiteCurrencyContext';
import { PublicUIProvider, usePublicUI } from './PublicUIProvider';
import { SiteContentProvider } from '../../context/SiteContentContext';
import { WebsiteHeader, PublicPageSlug } from '../common/WebsiteHeader';
import { WebsiteFooter } from '../common/WebsiteFooter';
import { getRoleDashboardSlug } from '../../utils/roleSlugs';

function slugFromPathname(pathname: string): PublicPageSlug {
  const path = pathname.replace(/^\/+|\/+$/g, '').toLowerCase().trim();
  if (path === '') return 'home';
  if (path === 'tours' || path === 'tours-safaris') return 'tours';
  if (path === 'fleet' || path === 'airport-fleet') return 'fleet';
  if (path === 'packages' || path === 'holiday-packages') return 'packages';
  if (path === 'services' || path.startsWith('services/')) return 'services';
  if (path === 'why-us' || path === 'about') return 'why-us';
  if (path === 'reviews') return 'reviews';
  if (path === 'contact') return 'contact';
  if (path === 'search' || path === 'explore') return 'search';
  return 'home';
}

const PublicChrome: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname() || '/';
  const slug = slugFromPathname(pathname);
  const isHome = slug === 'home';

  const { websiteLang, setWebsiteLang } = useWebsiteLanguage();
  const { openBookingDrawer, openAuthDrawer } = usePublicUI();
  const { isAuthenticated, currentRole } = useApp();

  const navigate = (next: PublicPageSlug) => {
    router.push(next === 'home' ? '/' : `/${next}`);
  };

  const goToConsole = () => {
    router.push(isAuthenticated ? getRoleDashboardSlug(currentRole) : '/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#05161D] text-slate-900 dark:text-slate-100 font-sans selection:bg-[#C0AB6F] selection:text-[#05161D] transition-colors flex flex-col">
      <WebsiteHeader
        currentSlug={slug}
        onNavigate={navigate}
        onOpenDrawer={(id) => openBookingDrawer(id)}
        onNavigateToAuth={goToConsole}
        onOpenAuthDrawer={(mode) => openAuthDrawer(mode)}
        isTransparentHero={isHome}
        websiteLang={websiteLang}
        onSelectWebsiteLang={setWebsiteLang}
      />

      <main className="flex-1">{children}</main>

      <WebsiteFooter onNavigate={navigate} onNavigateToAuth={goToConsole} />
    </div>
  );
};

export default function PublicShell({
  catalog,
  children,
}: {
  catalog: InitialCatalog;
  children: React.ReactNode;
}) {
  return (
    <AppProvider initialCatalog={catalog}>
      <SiteContentProvider>
        <WebsiteLanguageProvider>
          <WebsiteCurrencyProvider>
            <PublicUIProvider>
              <PublicChrome>{children}</PublicChrome>
            </PublicUIProvider>
          </WebsiteCurrencyProvider>
        </WebsiteLanguageProvider>
      </SiteContentProvider>
    </AppProvider>
  );
}
