'use client';

// Invoice & Billing settings card (lives in Settings → General). Edits the
// company header/footer/signature shown on every invoice + print, stored under
// the `invoiceProfile` settings key. Self-contained load/save.

import React, { useEffect, useState } from 'react';
import { ReceiptText, Save, Loader2, CheckCircle2 } from 'lucide-react';
import { api } from '../../../lib/api';
import { ImageUploadField } from '../common/ImageUploadField';
import type { InvoiceProfile } from '../../types';
import { DEFAULT_PROFILE, normalizeProfile } from './invoiceShared';

export function InvoiceBillingSettings() {
  const [profile, setProfile] = useState<InvoiceProfile>(DEFAULT_PROFILE);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

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

  const set = (patch: Partial<InvoiceProfile>) => setProfile((p) => ({ ...p, ...patch }));

  const save = async () => {
    setSaving(true);
    setError('');
    try {
      await api.put('/api/settings/invoiceProfile', { value: profile });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e) {
      setError((e as Error).message || 'Could not save');
    } finally {
      setSaving(false);
    }
  };

  const inputCls =
    'w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-medium';

  if (loading) {
    return (
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex justify-center">
        <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 text-xs">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <ReceiptText className="w-4 h-4 text-teal-500" />
          <span>Invoice &amp; Billing — header, signature &amp; footer</span>
        </h3>
        {saved && (
          <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
            <CheckCircle2 className="w-4 h-4" /> Saved
          </span>
        )}
        {error && <span className="text-xs font-semibold text-rose-500">{error}</span>}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <ImageUploadField value={profile.logo} onChange={(ref) => set({ logo: ref || '' })} label="Company logo" shape="square" className="w-full min-w-0" />
        <ImageUploadField value={profile.signatureImage} onChange={(ref) => set({ signatureImage: ref || '' })} label="Authorised signature" shape="square" className="w-full min-w-0" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <L label="Company name (English)"><input className={inputCls} value={profile.companyName} onChange={(e) => set({ companyName: e.target.value })} /></L>
        <L label="Company name (Arabic)"><input className={inputCls} dir="rtl" value={profile.companyNameAr || ''} onChange={(e) => set({ companyNameAr: e.target.value })} /></L>
        <L label="Address"><input className={inputCls} value={profile.address || ''} onChange={(e) => set({ address: e.target.value })} /></L>
        <L label="Website"><input className={inputCls} value={profile.website || ''} onChange={(e) => set({ website: e.target.value })} /></L>
        <L label="Email"><input className={inputCls} value={profile.email || ''} onChange={(e) => set({ email: e.target.value })} /></L>
        <L label="Phone"><input className={inputCls} value={profile.phone || ''} onChange={(e) => set({ phone: e.target.value })} /></L>
        <L label="Helpline"><input className={inputCls} value={profile.helpline || ''} onChange={(e) => set({ helpline: e.target.value })} /></L>
        <L label="TRN / VAT Reg. No."><input className={inputCls} value={profile.trn || ''} onChange={(e) => set({ trn: e.target.value })} /></L>
        <L label="Company license no."><input className={inputCls} value={profile.licenseNo || ''} onChange={(e) => set({ licenseNo: e.target.value })} /></L>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <L label="Signatory name"><input className={inputCls} value={profile.signatureName || ''} onChange={(e) => set({ signatureName: e.target.value })} /></L>
        <L label="Signatory title"><input className={inputCls} value={profile.signatureTitle || ''} onChange={(e) => set({ signatureTitle: e.target.value })} /></L>
        <L label="Invoice prefix"><input className={inputCls} value={profile.invoicePrefix || 'INV-'} onChange={(e) => set({ invoicePrefix: e.target.value })} /></L>
        <L label="Default VAT %"><input type="number" step="0.01" className={inputCls} value={profile.defaultVatPercent ?? 0} onChange={(e) => set({ defaultVatPercent: Number(e.target.value) })} /></L>
        <L label="Footer note"><input className={inputCls} value={profile.footerNote || ''} onChange={(e) => set({ footerNote: e.target.value })} /></L>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <L label="Default invoice notes"><textarea rows={2} className={inputCls} value={profile.defaultNotes || ''} onChange={(e) => set({ defaultNotes: e.target.value })} /></L>
        <L label="Default terms"><textarea rows={2} className={inputCls} value={profile.defaultTerms || ''} onChange={(e) => set({ defaultTerms: e.target.value })} /></L>
      </div>

      <p className="text-[11px] text-slate-400">
        The invoice prefix applies to the <b>next</b> invoice you create; existing numbers don&apos;t change.
      </p>

      <div className="flex justify-end">
        <button onClick={save} disabled={saving} className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-semibold flex items-center gap-2 disabled:opacity-40">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>Save invoice settings</span>
        </button>
      </div>
    </div>
  );
}

function L({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-slate-500 font-medium mb-1">{label}</label>
      {children}
    </div>
  );
}
