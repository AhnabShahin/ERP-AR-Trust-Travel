'use client';

// The printable invoice body — a clean, always-light "paper" document shared by
// the dashboard detail view and the public /invoice/<token> page. Pure
// presentation: it takes a fully-computed Invoice + company profile.

import React from 'react';
import { Phone, Mail, MapPin, Globe } from 'lucide-react';
import { imgSrc } from '../../../lib/uploads';
import { QrCodeImage } from '../common/QrCodeImage';
import type { Invoice, InvoiceProfile } from '../../types';
import { money, fmtDate } from './invoiceShared';

export interface InvoiceDocumentProps {
  invoice: Invoice;
  profile: InvoiceProfile;
  /** URL encoded in the QR + used for "scan to view". */
  publicUrl?: string;
}

export function InvoiceDocument({ invoice, profile, publicUrl }: InvoiceDocumentProps) {
  const ccy = invoice.currency || 'QAR';
  const items = Array.isArray(invoice.items) ? invoice.items : [];
  const teal = '#0f766e';

  return (
    <div id="invoice-paper" className="bg-white text-slate-800 rounded-xl overflow-hidden" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Company header */}
      <div className="p-6 sm:p-8">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            {profile.logo ? (
              <img src={imgSrc(profile.logo)} alt={profile.companyName} className="w-16 h-16 rounded-lg object-contain border border-slate-100" />
            ) : (
              <div className="w-16 h-16 rounded-lg flex items-center justify-center text-white font-black text-xl" style={{ background: teal }}>
                {profile.companyName.slice(0, 2).toUpperCase()}
              </div>
            )}
            <div>
              <h2 className="text-lg font-black" style={{ color: teal }}>{profile.companyName}</h2>
              {profile.companyNameAr && <p className="text-sm text-slate-500" dir="rtl">{profile.companyNameAr}</p>}
              <div className="text-[11px] text-slate-500 mt-1 space-y-0.5">
                {profile.address && <p><span className="font-semibold">Address:</span> {profile.address}</p>}
                {profile.email && <p><span className="font-semibold">Email:</span> {profile.email}</p>}
                {profile.helpline && <p><span className="font-semibold">Helpline:</span> {profile.helpline}</p>}
              </div>
            </div>
          </div>
          <div className="text-right text-[11px] text-slate-500">
            {profile.trn && (
              <p className="mb-1"><span className="font-semibold">TRN (VAT Reg. No.)</span><br /><span className="text-slate-800 font-bold">{profile.trn}</span></p>
            )}
            {profile.licenseNo && (
              <p><span className="font-semibold">Company License No.</span><br /><span className="text-slate-800 font-bold">{profile.licenseNo}</span></p>
            )}
          </div>
        </div>

        <h1 className="text-center text-xl font-black tracking-wide my-5" style={{ color: teal }}>TAX INVOICE</h1>

        {/* Bill-to + invoice details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-lg border border-slate-200 overflow-hidden">
            <div className="px-3 py-2 text-xs font-bold text-white" style={{ background: teal }}>BILL TO</div>
            <div className="p-3 text-xs">
              <p className="font-bold text-slate-900">{invoice.customerName}</p>
              {invoice.customerPhone && <p className="text-slate-500 mt-0.5">{invoice.customerPhone}</p>}
              {invoice.customerEmail && <p className="text-slate-500">{invoice.customerEmail}</p>}
              {invoice.customerAddress && <p className="text-slate-500">{invoice.customerAddress}</p>}
              {invoice.customerTRN && <p className="text-slate-500 mt-0.5">TRN: {invoice.customerTRN}</p>}
            </div>
          </div>
          <div className="rounded-lg border border-slate-200 overflow-hidden">
            <div className="px-3 py-2 text-xs font-bold text-white" style={{ background: teal }}>INVOICE DETAILS</div>
            <div className="p-3 text-xs space-y-1">
              <Row label="Invoice #:" value={invoice.invoiceNumber} />
              <Row label="Invoice Date:" value={fmtDate(invoice.invoiceDate)} />
              {invoice.dueDate && <Row label="Due Date:" value={fmtDate(invoice.dueDate)} />}
              {invoice.bookingPnr && <Row label="Booking PNR:" value={invoice.bookingPnr} />}
              <div className="flex items-center gap-2 pt-1">
                <span className="text-slate-500 font-semibold">Payment Status:</span>
                <StatusPill status={invoice.status} />
              </div>
            </div>
          </div>
        </div>

        {/* Items */}
        <div className="mt-5 rounded-lg border border-slate-200 overflow-hidden">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-white" style={{ background: teal }}>
                <th className="text-left px-3 py-2 font-semibold">Name</th>
                <th className="text-right px-2 py-2 font-semibold">Qty</th>
                <th className="text-left px-2 py-2 font-semibold">Unit</th>
                <th className="text-right px-2 py-2 font-semibold">Unit Cost</th>
                <th className="text-right px-2 py-2 font-semibold">Taxable Amt</th>
                <th className="text-right px-2 py-2 font-semibold">VAT %</th>
                <th className="text-right px-2 py-2 font-semibold">VAT Amt</th>
                <th className="text-right px-3 py-2 font-semibold">Amount</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it, i) => {
                const taxable = (Number(it.qty) || 0) * (Number(it.unitCost) || 0);
                return (
                  <tr key={i} className="border-b border-slate-100 last:border-0">
                    <td className="px-3 py-2">
                      <span className="font-semibold text-slate-900">{it.name}</span>
                      {it.description && <span className="block text-slate-400 text-[11px]">{it.description}</span>}
                    </td>
                    <td className="px-2 py-2 text-right">{it.qty}</td>
                    <td className="px-2 py-2">{it.unit || '—'}</td>
                    <td className="px-2 py-2 text-right">{money(it.unitCost, ccy).replace(`${ccy} `, '')}</td>
                    <td className="px-2 py-2 text-right">{money(taxable, ccy).replace(`${ccy} `, '')}</td>
                    <td className="px-2 py-2 text-right">{it.vatPercent ? `${it.vatPercent}%` : '—'}</td>
                    <td className="px-2 py-2 text-right">{it.vatAmount ? money(it.vatAmount, ccy).replace(`${ccy} `, '') : '—'}</td>
                    <td className="px-3 py-2 text-right font-semibold">{money(it.amount, ccy).replace(`${ccy} `, '')}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Amount in words + QR + totals */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
          <div className="flex gap-4">
            <div>
              <p className="text-xs"><span className="font-bold text-slate-700">Amount in Words:</span></p>
              <p className="text-xs text-slate-600">{invoice.amountInWords || '—'}</p>
              {invoice.notes && <p className="text-xs text-slate-500 mt-2"><span className="font-semibold">Notes:</span> {invoice.notes}</p>}
            </div>
            {publicUrl && <QrCodeImage value={publicUrl} size={96} className="rounded border border-slate-100 shrink-0" />}
          </div>
          <div className="rounded-lg border border-slate-200 divide-y divide-slate-100 text-xs">
            <TotalRow label="Sub Total" value={money(invoice.subTotal, ccy)} />
            {invoice.discount > 0 && <TotalRow label="Discount" value={`- ${money(invoice.discount, ccy)}`} />}
            {invoice.vatTotal > 0 && <TotalRow label="VAT" value={money(invoice.vatTotal, ccy)} />}
            <TotalRow label="Grand Total (Incl. VAT)" value={money(invoice.grandTotal, ccy)} strong />
            <TotalRow label="Amount Paid" value={money(invoice.amountPaid, ccy)} tone="green" />
            <TotalRow label="Balance Due" value={money(invoice.balanceDue, ccy)} strong tone={invoice.balanceDue > 0 ? 'red' : 'green'} />
          </div>
        </div>

        {/* Signature */}
        <div className="mt-8 flex items-end justify-between gap-6">
          <div className="text-xs text-slate-500">
            <div className="h-10" />
            <div className="border-t border-slate-300 w-40 pt-1">Receiver&apos;s Signature</div>
          </div>
          <div className="text-center text-xs">
            {profile.signatureImage ? (
              <img src={imgSrc(profile.signatureImage)} alt="Signature" className="h-12 mx-auto object-contain" />
            ) : (
              <div className="h-12" />
            )}
            <p className="font-bold text-slate-800 mt-1 uppercase">{profile.signatureName || ''}</p>
            <p className="text-slate-500">{profile.signatureTitle || 'Authorised Signatory'}</p>
          </div>
        </div>
      </div>

      {/* Footer bar */}
      <div className="px-6 sm:px-8 py-3 border-t-4 text-[11px] text-slate-500 flex flex-wrap items-center gap-x-6 gap-y-1" style={{ borderColor: teal }}>
        {profile.phone && <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" style={{ color: teal }} /> {profile.phone}</span>}
        {profile.email && <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" style={{ color: teal }} /> {profile.email}</span>}
        {profile.website && <span className="flex items-center gap-1.5"><Globe className="w-3.5 h-3.5" style={{ color: teal }} /> {profile.website}</span>}
        {profile.address && <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" style={{ color: teal }} /> {profile.address}</span>}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-slate-500 font-semibold">{label}</span>
      <span className="text-slate-800 font-medium text-right">{value}</span>
    </div>
  );
}

function TotalRow({ label, value, strong, tone }: { label: string; value: string; strong?: boolean; tone?: 'green' | 'red' }) {
  const color = tone === 'green' ? 'text-emerald-600' : tone === 'red' ? 'text-red-600' : 'text-slate-800';
  return (
    <div className="flex justify-between px-3 py-2">
      <span className={strong ? 'font-bold text-slate-900' : 'text-slate-500'}>{label}</span>
      <span className={`${strong ? 'font-bold' : 'font-medium'} ${color}`}>{value}</span>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    paid: 'bg-emerald-100 text-emerald-700',
    partial: 'bg-amber-100 text-amber-700',
    unpaid: 'bg-red-100 text-red-700',
  };
  const label: Record<string, string> = { paid: 'PAID', partial: 'PARTIAL', unpaid: 'UNPAID' };
  return <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${map[status] || map.unpaid}`}>● {label[status] || 'UNPAID'}</span>;
}
