// =====================================================================
// Server-only fetch helpers for the public website (SSR).
//
// Unlike `lib/api.ts` (which runs in the browser and reads the auth token
// from localStorage), this module runs during server rendering. It talks to
// the API over an absolute URL, hits only the *public* read endpoints
// (fleet, tour-packages, currencies, service-categories), and never touches
// localStorage or the request's auth header.
//
// Every helper is resilient: on any network/parse error it returns an empty
// list so the page still renders (the components merge in their static
// fallback data from `src/data/websiteData.ts`).
// =====================================================================

// NOTE: This module is intended for server components only. It is kept out of
// client bundles by convention (only imported from `page.tsx` server
// components) and because `API_INTERNAL_URL` is a non-public env var that is
// `undefined` in the browser build.

import type {
  CurrencyItem,
  FleetVehicle,
  ServiceCategoryDef,
  TourPackage,
} from '@/types';

// On the server we prefer an internal URL (e.g. http://127.0.0.1:4000 or a
// private service hostname) and fall back to the browser-facing public URL.
const API_BASE =
  process.env.API_INTERNAL_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  'http://localhost:4000';

// How long (seconds) a fetched catalogue response may be cached before Next
// revalidates it. Keeps the public site fast while still reflecting dashboard
// edits within a minute. Override per-call where a page needs it fresher.
const DEFAULT_REVALIDATE = 60;

interface ListEnvelope<T> {
  ok: boolean;
  data?: T[];
  error?: string;
}

async function fetchList<T>(
  path: string,
  { revalidate = DEFAULT_REVALIDATE }: { revalidate?: number } = {}
): Promise<T[]> {
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      next: { revalidate },
    });
    if (!res.ok) return [];
    const body = (await res.json()) as ListEnvelope<T>;
    if (!body.ok || !Array.isArray(body.data)) return [];
    return body.data;
  } catch {
    // API unreachable during build / render — let the caller fall back to
    // its static dataset instead of crashing the page.
    return [];
  }
}

/** Website-visible fleet vehicles (public read). */
export function getPublicFleet(): Promise<FleetVehicle[]> {
  return fetchList<FleetVehicle>('/api/fleet?take=200');
}

/** Tour packages + holiday packages (public read). */
export function getPublicTourPackages(): Promise<TourPackage[]> {
  return fetchList<TourPackage>('/api/tour-packages?take=200');
}

/** Currencies for the public currency switcher (public read). */
export function getPublicCurrencies(): Promise<CurrencyItem[]> {
  return fetchList<CurrencyItem>('/api/currencies?take=200');
}

/** Service categories used by the services pages (public read). */
export function getPublicServiceCategories(): Promise<ServiceCategoryDef[]> {
  return fetchList<ServiceCategoryDef>('/api/service-categories?take=200');
}

export interface PublicCatalog {
  fleet: FleetVehicle[];
  packages: TourPackage[];
  currencies: CurrencyItem[];
  serviceCategories: ServiceCategoryDef[];
}

/** Fetch everything the public shell / home page needs in one call site. */
export async function getPublicCatalog(): Promise<PublicCatalog> {
  const [fleet, packages, currencies, serviceCategories] = await Promise.all([
    getPublicFleet(),
    getPublicTourPackages(),
    getPublicCurrencies(),
    getPublicServiceCategories(),
  ]);
  return { fleet, packages, currencies, serviceCategories };
}
