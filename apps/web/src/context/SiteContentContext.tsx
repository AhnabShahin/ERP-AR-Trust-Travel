'use client';

// =====================================================================
// Website content provider. Loads the editable CMS content map from
// /api/site-content once (public endpoint) and exposes `c(key)` to read a
// value, falling back to the built-in defaults in data/siteContent.ts so the
// site always renders. First client render uses the defaults (matching SSR),
// then re-renders with the saved values after the fetch resolves.
// =====================================================================

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../../lib/api';
import { SITE_CONTENT_DEFAULTS, defaultContent } from '../data/siteContent';

interface SiteContentValue {
  /** Read a content value by key (saved value, else built-in default). */
  c: <T = unknown>(key: string, fallback?: T) => T;
  /** Read a string value (coerced; empty string when missing). */
  cs: (key: string, fallback?: string) => string;
  /** Read a string[] value (list kind). */
  cl: (key: string, fallback?: string[]) => string[];
  /** Raw saved map (without defaults). */
  map: Record<string, unknown>;
  loaded: boolean;
  refresh: () => Promise<void>;
}

const SiteContentContext = createContext<SiteContentValue | null>(null);

export function SiteContentProvider({ children }: { children: React.ReactNode }) {
  const [map, setMap] = useState<Record<string, unknown>>({});
  const [loaded, setLoaded] = useState(false);

  const refresh = async () => {
    try {
      const data = await api.get<Record<string, unknown>>('/api/site-content');
      if (data && typeof data === 'object') setMap(data);
    } catch {
      /* keep defaults */
    } finally {
      setLoaded(true);
    }
  };

  useEffect(() => {
    void refresh();
  }, []);

  const value = useMemo<SiteContentValue>(() => {
    const get = (key: string): unknown => (key in map ? map[key] : defaultContent(key));
    return {
      map,
      loaded,
      refresh,
      c: <T,>(key: string, fallback?: T): T => {
        const v = get(key);
        return (v === undefined || v === null ? fallback : v) as T;
      },
      cs: (key: string, fallback = '') => {
        const v = get(key);
        return typeof v === 'string' ? v : v == null ? fallback : String(v);
      },
      cl: (key: string, fallback: string[] = []) => {
        const v = get(key);
        return Array.isArray(v) ? (v as string[]) : fallback;
      },
    };
  }, [map, loaded]);

  return <SiteContentContext.Provider value={value}>{children}</SiteContentContext.Provider>;
}

export function useSiteContent(): SiteContentValue {
  const ctx = useContext(SiteContentContext);
  if (ctx) return ctx;
  // Safe fallback if a component renders outside the provider (e.g. isolated
  // previews): serve the built-in defaults only.
  return {
    map: {},
    loaded: true,
    refresh: async () => {},
    c: <T,>(key: string, fallback?: T): T => {
      const v = defaultContent(key);
      return (v === undefined || v === null ? fallback : v) as T;
    },
    cs: (key: string, fallback = '') => {
      const v = defaultContent(key);
      return typeof v === 'string' ? v : v == null ? fallback : String(v);
    },
    cl: (key: string, fallback: string[] = []) => {
      const v = defaultContent(key);
      return Array.isArray(v) ? (v as string[]) : fallback;
    },
  };
}

/** The content keys/metadata the editor shows (from the defaults catalogue). */
export const CONTENT_CATALOGUE = SITE_CONTENT_DEFAULTS;
