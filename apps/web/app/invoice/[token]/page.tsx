'use client';

// =====================================================================
// Public, shareable invoice page — /invoice/<token>. Standalone (no app
// chrome): anyone with the link can view, print or save the invoice as PDF.
// Fetches the public endpoint (no auth) which bundles the company profile.
// =====================================================================

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Printer, FileDown, ReceiptText, Loader2 } from 'lucide-react';
import { api } from '../../../lib/api';
import type { Invoice, InvoiceProfile } from '../../../src/types';
import { InvoiceDocument } from '../../../src/components/invoices/InvoiceDocument';
import { printInvoice } from '../../../src/components/invoices/invoicePrint';
import { normalizeProfile, publicInvoiceUrl } from '../../../src/components/invoices/invoiceShared';

interface PublicPayload {
  invoice: Invoice;
  profile: Partial<InvoiceProfile> | null;
}

export default function PublicInvoicePage() {
  const params = useParams();
  const token = Array.isArray(params?.token) ? params.token[0] : (params?.token as string);
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [profile, setProfile] = useState<InvoiceProfile | null>(null);
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    (async () => {
      try {
        const data = await api.get<PublicPayload>(`/api/invoices/public/${token}`);
        if (cancelled) return;
        setInvoice(data.invoice);
        setProfile(normalizeProfile(data.profile));
        setState('ready');
      } catch {
        if (!cancelled) setState('error');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  if (state === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#f1f5f9' }}>
        <Loader2 className="w-7 h-7 animate-spin text-slate-400" />
      </div>
    );
  }

  if (state === 'error' || !invoice || !profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-2" style={{ background: '#f1f5f9' }}>
        <ReceiptText className="w-10 h-10 text-slate-300" />
        <p className="text-lg font-bold text-slate-700">Invoice not found</p>
        <p className="text-sm text-slate-500">This link may be invalid or the invoice was removed.</p>
      </div>
    );
  }

  const url = publicInvoiceUrl(invoice.publicToken);

  return (
    <div className="min-h-screen py-6 px-3 sm:px-4" style={{ background: '#f1f5f9' }}>
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2 text-slate-600">
            <ReceiptText className="w-5 h-5" style={{ color: '#0f766e' }} />
            <span className="font-bold text-slate-800">{invoice.invoiceNumber}</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => printInvoice(invoice, profile, 'a4', url)} className="px-3 py-2 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 flex items-center gap-1.5">
              <Printer className="w-4 h-4" /> Print
            </button>
            <button onClick={() => printInvoice(invoice, profile, 'a4', url)} className="px-3 py-2 rounded-lg text-xs font-semibold text-white flex items-center gap-1.5" style={{ background: '#0f766e' }}>
              <FileDown className="w-4 h-4" /> Download PDF
            </button>
          </div>
        </div>
        <div className="shadow-lg rounded-xl overflow-hidden bg-white">
          <InvoiceDocument invoice={invoice} profile={profile} publicUrl={url} />
        </div>
        <p className="text-center text-[11px] text-slate-400 mt-4">Powered by {profile.companyName}</p>
      </div>
    </div>
  );
}
