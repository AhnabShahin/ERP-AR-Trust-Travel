'use client';

// Shared helpers for the invoice feature: company profile (from settings),
// money/format helpers, public-link builder and status styling. Kept framework
// -light so both the dashboard detail view and the public page can reuse them.

import { useEffect, useState } from 'react';
import { api } from '../../../lib/api';
import type { Invoice, InvoiceProfile, InvoiceStatus } from '../../types';

export const DEFAULT_PROFILE: InvoiceProfile = {
  companyName: 'AR Trust Travel & Tourism W.L.L.',
  companyNameAr: 'شركة الثقة العربية للسفر والسياحة',
  address: 'West Bay, Doha, Qatar',
  phone: '+974 4000 0000',
  email: 'info@artrust.qa',
  helpline: '+974 4000 0000',
  website: 'www.artrust.qa',
  trn: '',
  licenseNo: 'QTA-DMC-8819',
  logo: '',
  signatureImage: '',
  signatureName: '',
  signatureTitle: 'Authorised Signatory',
  footerNote: 'Thank you for your business!',
  defaultVatPercent: 0,
  invoicePrefix: 'INV-',
  defaultNotes: 'Thank you for your business!',
  defaultTerms: '',
};

/** Merge a (possibly partial / null) stored profile over the defaults. */
export function normalizeProfile(p?: Partial<InvoiceProfile> | null): InvoiceProfile {
  return { ...DEFAULT_PROFILE, ...(p || {}) };
}

/** Load the invoice company profile from settings (client-side). */
export function useInvoiceProfile(): { profile: InvoiceProfile; loading: boolean } {
  const [profile, setProfile] = useState<InvoiceProfile>(DEFAULT_PROFILE);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const p = await api.get<Partial<InvoiceProfile> | null>('/api/settings/invoiceProfile');
        if (!cancelled) setProfile(normalizeProfile(p));
      } catch {
        /* keep defaults */
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);
  return { profile, loading };
}

export const money = (n: number | undefined, ccy = 'QAR') =>
  `${ccy} ${(Number(n) || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export const fmtDate = (d?: string) => {
  if (!d) return '—';
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return d;
  return dt.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
};

/** Absolute public URL for the shareable invoice page. */
export function publicInvoiceUrl(token: string): string {
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  return `${origin}/invoice/${token}`;
}

export const STATUS_STYLE: Record<InvoiceStatus, { label: string; cls: string }> = {
  paid: { label: 'Paid', cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300' },
  partial: { label: 'Partially Paid', cls: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300' },
  unpaid: { label: 'Unpaid', cls: 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300' },
};

export function invoiceStatus(inv: Pick<Invoice, 'status'>): InvoiceStatus {
  return (['paid', 'partial', 'unpaid'] as InvoiceStatus[]).includes(inv.status as InvoiceStatus)
    ? (inv.status as InvoiceStatus)
    : 'unpaid';
}
