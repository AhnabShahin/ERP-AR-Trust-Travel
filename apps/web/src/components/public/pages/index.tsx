'use client';

// =====================================================================
// Thin client wrappers that adapt the existing public page views to the
// App Router. Each server route (app/(public)/.../page.tsx) renders one of
// these; the wrapper supplies navigation (Next router) and the booking
// drawer (PublicUIProvider) so the underlying view components stay
// unchanged. The views still SSR — only the glue lives here.
// =====================================================================

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { usePublicUI } from '../PublicUIProvider';
import { ToursSafarisPageView } from '../../views/pages/ToursSafarisPageView';
import { AirportFleetPageView } from '../../views/pages/AirportFleetPageView';
import { HolidayPackagesPageView } from '../../views/pages/HolidayPackagesPageView';
import { ServicesPageView } from '../../views/pages/ServicesPageView';
import { WhyUsPageView } from '../../views/pages/WhyUsPageView';
import { ReviewsPageView } from '../../views/pages/ReviewsPageView';
import { ContactPageView } from '../../views/pages/ContactPageView';
import { ExploreSearchView } from '../../views/ExploreSearchView';

function useRoutePublicUI() {
  const router = useRouter();
  const { openBookingDrawer } = usePublicUI();
  return {
    goHome: () => router.push('/'),
    book: (idOrTitle?: string) => openBookingDrawer(idOrTitle),
    push: (path: string) => router.push(path),
  };
}

export function ToursRoute() {
  const { goHome, book } = useRoutePublicUI();
  return <ToursSafarisPageView onSelectBooking={book} onNavigateHome={goHome} />;
}

export function FleetRoute() {
  const { goHome, book } = useRoutePublicUI();
  return <AirportFleetPageView onSelectBooking={book} onNavigateHome={goHome} />;
}

export function PackagesRoute() {
  const { goHome, book } = useRoutePublicUI();
  return <HolidayPackagesPageView onSelectBooking={book} onNavigateHome={goHome} />;
}

export function ServicesRoute({ slug = null }: { slug?: string | null }) {
  const { goHome, book } = useRoutePublicUI();
  return (
    <ServicesPageView onSelectBooking={book} onNavigateHome={goHome} initialSlug={slug} />
  );
}

export function WhyUsRoute() {
  const { goHome, book, push } = useRoutePublicUI();
  return (
    <WhyUsPageView
      onSelectBooking={() => book()}
      onNavigateHome={goHome}
      onNavigateContact={() => push('/contact')}
    />
  );
}

export function ReviewsRoute() {
  const { goHome, book } = useRoutePublicUI();
  return <ReviewsPageView onSelectBooking={() => book()} onNavigateHome={goHome} />;
}

export function ContactRoute() {
  const { goHome } = useRoutePublicUI();
  return <ContactPageView onNavigateHome={goHome} />;
}

export function SearchRoute() {
  const { goHome, book } = useRoutePublicUI();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') ?? '';
  return (
    <ExploreSearchView
      initialSearchQuery={initialQuery}
      onBackToHome={goHome}
      onSelectBooking={(title) => book(title)}
    />
  );
}
