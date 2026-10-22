'use client';

// =====================================================================
// Global search results — the target of the header search box. Reads ?q= and
// searches across the main in-context collections (bookings, guests, hotel
// vendors, fleet, hotel bookings, packages, staff), grouped by entity with a
// link to each record's page. MySQL-backed data is already hydrated into
// AppContext, so this searches the live lists.
// =====================================================================

import React, { useMemo } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Search, ArrowRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';

type Hit = { id: string; title: string; subtitle: string; href: string };
type Group = { label: string; hits: Hit[] };

export const GlobalSearchView: React.FC = () => {
  const {
    bookings,
    guests,
    hotelVendors,
    fleetVehicles,
    hotelBookings,
    packages,
    employees,
  } = useApp();
  const params = useSearchParams();
  const q = (params.get('q') || '').trim();

  const groups = useMemo<Group[]>(() => {
    if (!q) return [];
    const needle = q.toLowerCase();
    const has = (...vals: (string | number | undefined | null)[]) =>
      vals.some((v) => String(v ?? '').toLowerCase().includes(needle));

    const out: Group[] = [];
    const push = (label: string, hits: Hit[]) => {
      if (hits.length) out.push({ label, hits: hits.slice(0, 25) });
    };

    push(
      'Bookings',
      bookings
        .filter((b) => has(b.passengerName, b.pnr, b.flightNumber, b.id, b.passengerPhone))
        .map((b) => ({
          id: b.id,
          title: `${b.passengerName} · ${b.pnr}`,
          subtitle: `${b.flightNumber || ''} ${b.packageName || ''}`.trim(),
          href: `/dashboard/bookings/${b.id}`,
        }))
    );
    push(
      'Guests',
      guests
        .filter((g) => has(g.name, g.id, (g as { phone?: string }).phone, (g as { email?: string }).email))
        .map((g) => ({
          id: g.id,
          title: g.name,
          subtitle: (g as { nationality?: string }).nationality || g.id,
          href: `/dashboard/guests/${g.id}`,
        }))
    );
    push(
      'Hotel Vendors',
      hotelVendors
        .filter((v) => has(v.name, v.id, (v as { zone?: string }).zone))
        .map((v) => ({ id: v.id, title: v.name, subtitle: (v as { zone?: string }).zone || '', href: `/dashboard/vendors/${v.id}` }))
    );
    push(
      'Fleet',
      fleetVehicles
        .filter((f) => has(f.name, (f as { plateNumber?: string }).plateNumber, f.category, f.id))
        .map((f) => ({ id: f.id, title: f.name, subtitle: (f as { plateNumber?: string }).plateNumber || f.category || '', href: `/dashboard/dispatch/${f.id}` }))
    );
    push(
      'Hotel Bookings',
      hotelBookings
        .filter((h) => has((h as { guestName?: string }).guestName, (h as { hotelName?: string }).hotelName, h.id))
        .map((h) => ({ id: h.id, title: (h as { guestName?: string }).guestName || h.id, subtitle: (h as { hotelName?: string }).hotelName || '', href: `/dashboard/hotel-bookings/${h.id}` }))
    );
    push(
      'Packages & Services',
      packages
        .filter((p) => has(p.name, (p as { category?: string }).category, p.id))
        .map((p) => ({ id: p.id, title: p.name, subtitle: (p as { category?: string }).category || '', href: `/dashboard/services/${p.id}` }))
    );
    push(
      'Staff',
      employees
        .filter((e) => has(e.name, (e as { phone?: string }).phone, (e as { role?: string }).role, e.id))
        .map((e) => ({ id: e.id, title: e.name, subtitle: (e as { role?: string }).role || '', href: `/dashboard/employees/${e.id}` }))
    );

    return out;
  }, [q, bookings, guests, hotelVendors, fleetVehicles, hotelBookings, packages, employees]);

  const total = groups.reduce((n, g) => n + g.hits.length, 0);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-5">
        <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
          <Search className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-lg font-black text-slate-900 dark:text-white">Search results</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {q ? (
              <>
                {total} result{total === 1 ? '' : 's'} for <span className="font-bold">“{q}”</span>
              </>
            ) : (
              'Type in the search box above to search across bookings, guests, vendors, fleet and more.'
            )}
          </p>
        </div>
      </div>

      {q && total === 0 && (
        <div className="py-16 text-center text-slate-400 text-sm">
          <Search className="w-8 h-8 mx-auto mb-2 opacity-40" />
          No records match “{q}”.
        </div>
      )}

      <div className="space-y-6">
        {groups.map((group) => (
          <div key={group.label}>
            <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              {group.label} ({group.hits.length})
            </h2>
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden bg-white dark:bg-slate-900">
              {group.hits.map((hit) => (
                <Link
                  key={hit.id}
                  href={hit.href}
                  className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
                >
                  <div className="min-w-0">
                    <div className="text-sm font-bold text-slate-900 dark:text-white truncate">{hit.title}</div>
                    {hit.subtitle && (
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{hit.subtitle}</div>
                    )}
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 shrink-0 rtl:rotate-180" />
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
