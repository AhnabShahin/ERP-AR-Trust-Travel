'use client';

// =====================================================================
// Invoices — BizBill-style billing. One view that dispatches on the URL to:
//   /dashboard/invoices            -> list (stats, filters, table)
//   /dashboard/invoices/new        -> create form
//   /dashboard/invoices/<id>       -> detail (action bar + printable document)
//   /dashboard/invoices/<id>/edit  -> edit form
// Backed by /api/invoices (auto number + public share token, totals, payments).
// =====================================================================

import React, { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  Plus, Loader2, ReceiptText, ArrowLeft, Link2, Printer, FileDown, Mail, MessageCircle,
  Pencil, Trash2, Eye, CreditCard, X, Search, FileText, Wallet,
} from 'lucide-react';
import { api } from '../../../lib/api';
import { useRealtimeRefresh } from '../../../lib/realtime';
import type { Invoice, InvoiceItem, PaymentAccount, Booking } from '../../types';
import { InvoiceDocument } from '../invoices/InvoiceDocument';
import { printInvoice } from '../invoices/invoicePrint';
import {
  money, fmtDate, publicInvoiceUrl, useInvoiceProfile, STATUS_STYLE, invoiceStatus,
} from '../invoices/invoiceShared';

export function InvoicesView() {
  const pathname = usePathname() || '';
  // segments after /dashboard/invoices
  const rest = pathname.replace(/^\/dashboard\/invoices\/?/, '').split('/').filter(Boolean);

  if (rest[0] === 'new') return <InvoiceForm mode="new" />;
  if (rest[0] && rest[1] === 'edit') return <InvoiceForm mode="edit" id={rest[0]} />;
  if (rest[0]) return <InvoiceDetail id={rest[0]} />;
  return <InvoiceList />;
}

// ---------------------------------------------------------------------
// List
// ---------------------------------------------------------------------
type StatusFilter = 'all' | 'paid' | 'partial' | 'unpaid';

function InvoiceList() {
  const router = useRouter();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<StatusFilter>('all');
  const [query, setQuery] = useState('');
  const [msg, setMsg] = useState('');

  const load = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const data = await api.get<Invoice[]>('/api/invoices?take=200');
      setInvoices(Array.isArray(data) ? data : []);
    } catch {
      if (!silent) setMsg('Failed to load invoices.');
    } finally {
      if (!silent) setLoading(false);
    }
  };
  useEffect(() => {
    void load();
  }, []);
  // Live-refresh when an invoice or its payments change in another session.
  useRealtimeRefresh(['invoices'], () => { void load(true); });

  const remove = async (id: string) => {
    if (!window.confirm('Delete this invoice? This cannot be undone.')) return;
    try {
      await api.delete(`/api/invoices/${id}`);
      await load();
    } catch (e) {
      setMsg(`Delete failed: ${(e as Error).message}`);
    }
  };

  const stats = useMemo(() => {
    const totalBilled = invoices.reduce((s, i) => s + (i.grandTotal || 0), 0);
    const paid = invoices.reduce((s, i) => s + (i.amountPaid || 0), 0);
    const unpaid = invoices.reduce((s, i) => s + (i.balanceDue || 0), 0);
    return { totalBilled, paid, unpaid };
  }, [invoices]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return invoices.filter((i) => {
      if (filter !== 'all' && invoiceStatus(i) !== filter) return false;
      if (!q) return true;
      return (
        i.invoiceNumber.toLowerCase().includes(q) ||
        i.customerName.toLowerCase().includes(q) ||
        (i.customerPhone || '').toLowerCase().includes(q) ||
        (i.bookingPnr || '').toLowerCase().includes(q)
      );
    });
  }, [invoices, filter, query]);

  return (
    <div className="space-y-5 pb-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ReceiptText className="w-5 h-5 text-teal-500" /> Invoices &amp; Billing
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Create, send and track every invoice.</p>
        </div>
        <button
          onClick={() => router.push('/dashboard/invoices/new')}
          className="px-4 py-2 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-500 text-white flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" /> New Invoice
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <StatCard icon={<FileText className="w-5 h-5" />} tone="blue" label="Total billed" value={money(stats.totalBilled)} />
        <StatCard icon={<CreditCard className="w-5 h-5" />} tone="green" label="Paid" value={money(stats.paid)} />
        <StatCard icon={<Wallet className="w-5 h-5" />} tone="amber" label="Unpaid" value={money(stats.unpaid)} />
      </div>

      {msg && <div className="text-xs font-medium px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200">{msg}</div>}

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="p-4 flex flex-wrap items-center gap-3 justify-between border-b border-slate-100 dark:border-slate-800">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search invoice or customer…"
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
            />
          </div>
          <div className="flex items-center gap-1 p-1 rounded-lg bg-slate-100 dark:bg-slate-800">
            {(['all', 'paid', 'partial', 'unpaid'] as StatusFilter[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-md text-[11px] font-bold capitalize transition ${
                  filter === f ? 'bg-teal-600 text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
                }`}
              >
                {f === 'partial' ? 'Partially Paid' : f}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="py-20 flex justify-center text-slate-400"><Loader2 className="w-6 h-6 animate-spin" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[11px] uppercase tracking-wide text-slate-400 border-b border-slate-100 dark:border-slate-800">
                  <th className="px-4 py-3 font-semibold">Invoice #</th>
                  <th className="px-4 py-3 font-semibold">Invoice To</th>
                  <th className="px-4 py-3 font-semibold">Invoice Date</th>
                  <th className="px-4 py-3 font-semibold">Due Date</th>
                  <th className="px-4 py-3 font-semibold text-right">Grand Total</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold text-right">Due</th>
                  <th className="px-4 py-3 font-semibold text-right">Paid</th>
                  <th className="px-4 py-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((inv) => {
                  const st = STATUS_STYLE[invoiceStatus(inv)];
                  return (
                    <tr
                      key={inv.id}
                      className="border-b border-slate-50 dark:border-slate-800/60 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer"
                      onClick={() => router.push(`/dashboard/invoices/${inv.id}`)}
                    >
                      <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">{inv.invoiceNumber}</td>
                      <td className="px-4 py-3">{inv.customerName}</td>
                      <td className="px-4 py-3">{fmtDate(inv.invoiceDate)}</td>
                      <td className="px-4 py-3">{inv.dueDate ? fmtDate(inv.dueDate) : '—'}</td>
                      <td className="px-4 py-3 text-right font-semibold">{money(inv.grandTotal, inv.currency)}</td>
                      <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${st.cls}`}>{st.label}</span></td>
                      <td className="px-4 py-3 text-right text-red-500">{money(inv.balanceDue, inv.currency)}</td>
                      <td className="px-4 py-3 text-right text-emerald-600 dark:text-emerald-400">{money(inv.amountPaid, inv.currency)}</td>
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button onClick={() => router.push(`/dashboard/invoices/${inv.id}`)} className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-teal-500" title="View"><Eye className="w-3.5 h-3.5" /></button>
                          <button onClick={() => router.push(`/dashboard/invoices/${inv.id}/edit`)} className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-500/10 text-amber-600 hover:bg-amber-100" title="Edit"><Pencil className="w-3.5 h-3.5" /></button>
                          <button onClick={() => remove(inv.id)} className="p-1.5 rounded-lg bg-red-50 dark:bg-red-500/10 text-red-600 hover:bg-red-100" title="Delete"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr><td colSpan={9} className="px-4 py-10 text-center text-sm text-slate-500">No invoices found. Create your first one.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, tone }: { icon: React.ReactNode; label: string; value: string; tone: 'blue' | 'green' | 'amber' }) {
  const tones = {
    blue: 'from-blue-500/10 text-blue-600 dark:text-blue-400',
    green: 'from-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    amber: 'from-amber-500/10 text-amber-600 dark:text-amber-400',
  }[tone];
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 flex items-center gap-3">
      <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${tones} to-transparent flex items-center justify-center`}>{icon}</div>
      <div>
        <p className="text-[11px] uppercase tracking-wide text-slate-400 font-semibold">{label}</p>
        <p className="text-lg font-black text-slate-900 dark:text-white">{value}</p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------
// Detail
// ---------------------------------------------------------------------
function InvoiceDetail({ id }: { id: string }) {
  const router = useRouter();
  const { profile } = useInvoiceProfile();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [toast, setToast] = useState('');
  const [payOpen, setPayOpen] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await api.get<Invoice>(`/api/invoices/${id}`);
      setInvoice(data);
    } catch {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    void load();
  }, [id]);

  const flash = (m: string) => {
    setToast(m);
    setTimeout(() => setToast(''), 2500);
  };

  if (loading) return <div className="py-24 flex justify-center text-slate-400"><Loader2 className="w-7 h-7 animate-spin" /></div>;
  if (notFound || !invoice) {
    return (
      <div className="py-24 text-center">
        <p className="text-lg font-bold text-slate-700 dark:text-slate-200">Invoice not found</p>
        <button onClick={() => router.push('/dashboard/invoices')} className="text-teal-600 text-sm mt-2 hover:underline">Back to invoices</button>
      </div>
    );
  }

  const url = publicInvoiceUrl(invoice.publicToken);
  const payments = Array.isArray(invoice.payments) ? invoice.payments : [];

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      flash('Public invoice link copied');
    } catch {
      flash(url);
    }
  };
  const emailInvoice = () => {
    const subject = encodeURIComponent(`Invoice ${invoice.invoiceNumber} — ${profile.companyName}`);
    const body = encodeURIComponent(
      `Dear ${invoice.customerName},\n\nPlease find your invoice ${invoice.invoiceNumber} (${money(invoice.grandTotal, invoice.currency)}).\nView it online: ${url}\n\nThank you,\n${profile.companyName}`
    );
    window.location.href = `mailto:${invoice.customerEmail || ''}?subject=${subject}&body=${body}`;
  };
  const whatsappInvoice = () => {
    const text = encodeURIComponent(`Invoice ${invoice.invoiceNumber} — ${money(invoice.grandTotal, invoice.currency)}\nView: ${url}`);
    const phone = (invoice.customerPhone || '').replace(/[^\d]/g, '');
    window.open(`https://wa.me/${phone}?text=${text}`, '_blank');
  };

  const Action = ({ icon, label, onClick, tone = 'slate' }: { icon: React.ReactNode; label: string; onClick: () => void; tone?: string }) => {
    const tones: Record<string, string> = {
      slate: 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800',
      teal: 'text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-500/10',
      green: 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-500/10',
    };
    return (
      <button onClick={onClick} className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 border border-slate-200 dark:border-slate-700 ${tones[tone]}`}>
        {icon} <span className="hidden sm:inline">{label}</span>
      </button>
    );
  };

  return (
    <div className="space-y-4 pb-10">
      {/* Action bar */}
      <div className="flex flex-wrap items-center gap-2 justify-between">
        <div className="flex items-center gap-2">
          <button onClick={() => router.push('/dashboard/invoices')} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"><ArrowLeft className="w-4 h-4" /></button>
          <h1 className="text-lg font-black text-slate-900 dark:text-white">{invoice.invoiceNumber}</h1>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${STATUS_STYLE[invoiceStatus(invoice)].cls}`}>{STATUS_STYLE[invoiceStatus(invoice)].label}</span>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <Action icon={<Link2 className="w-4 h-4" />} label="Invoice Link" onClick={copyLink} tone="teal" />
          <Action icon={<Printer className="w-4 h-4" />} label="Print" onClick={() => printInvoice(invoice, profile, 'a4', url)} />
          <Action icon={<ReceiptText className="w-4 h-4" />} label="Thermal Print" onClick={() => printInvoice(invoice, profile, 'thermal', url)} />
          <Action icon={<FileDown className="w-4 h-4" />} label="PDF" onClick={() => printInvoice(invoice, profile, 'a4', url)} />
          <Action icon={<Mail className="w-4 h-4" />} label="Email" onClick={emailInvoice} />
          <Action icon={<MessageCircle className="w-4 h-4" />} label="WhatsApp" onClick={whatsappInvoice} tone="green" />
          <button onClick={() => router.push(`/dashboard/invoices/${invoice.id}/edit`)} className="px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-white"><Pencil className="w-4 h-4" /> <span className="hidden sm:inline">Edit</span></button>
        </div>
      </div>

      {toast && <div className="text-xs font-medium px-3 py-2 rounded-lg bg-teal-50 dark:bg-teal-500/10 text-teal-700 dark:text-teal-300">{toast}</div>}

      {/* Payment records */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2"><CreditCard className="w-4 h-4 text-teal-500" /> Payment records</h2>
            <p className="text-[11px] text-slate-500">Track partial and full payments against this invoice.</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-wide text-slate-400 font-semibold">Balance Due</p>
            <p className={`text-base font-black ${invoice.balanceDue > 0 ? 'text-red-500' : 'text-emerald-600 dark:text-emerald-400'}`}>{money(invoice.balanceDue, invoice.currency)}</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-[11px] uppercase text-slate-400 border-b border-slate-100 dark:border-slate-800">
                <th className="text-left py-2 font-semibold">Date</th>
                <th className="text-left py-2 font-semibold">Method</th>
                <th className="text-left py-2 font-semibold">Note</th>
                <th className="text-right py-2 font-semibold">Amount</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p.id} className="border-b border-slate-50 dark:border-slate-800/50 text-slate-700 dark:text-slate-200">
                  <td className="py-2">{fmtDate(p.date)}</td>
                  <td className="py-2">{p.method}</td>
                  <td className="py-2 text-slate-500">{p.note || '—'}</td>
                  <td className="py-2 text-right font-semibold">{money(p.amount, invoice.currency)}</td>
                </tr>
              ))}
              {payments.length === 0 && <tr><td colSpan={4} className="py-4 text-center text-slate-400">No payments recorded yet.</td></tr>}
            </tbody>
            {payments.length > 0 && (
              <tfoot>
                <tr className="font-bold text-slate-900 dark:text-white"><td colSpan={3} className="py-2 text-right">Total paid</td><td className="py-2 text-right text-emerald-600 dark:text-emerald-400">{money(invoice.amountPaid, invoice.currency)}</td></tr>
              </tfoot>
            )}
          </table>
        </div>
        {invoice.balanceDue > 0 && (
          <button onClick={() => setPayOpen(true)} className="mt-3 px-4 py-2 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-500 text-white flex items-center gap-1.5">
            <Plus className="w-4 h-4" /> Make Payment
          </button>
        )}
      </div>

      {/* Printable document */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <InvoiceDocument invoice={invoice} profile={profile} publicUrl={url} />
      </div>

      {payOpen && (
        <PaymentModal invoice={invoice} onClose={() => setPayOpen(false)} onDone={() => { setPayOpen(false); void load(); flash('Payment recorded'); }} />
      )}
    </div>
  );
}

function PaymentModal({ invoice, onClose, onDone }: { invoice: Invoice; onClose: () => void; onDone: () => void }) {
  const [accounts, setAccounts] = useState<PaymentAccount[]>([]);
  const [accountId, setAccountId] = useState('');
  const [method, setMethod] = useState('Cash');
  const [amount, setAmount] = useState(invoice.balanceDue);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => {
    api.get<PaymentAccount[]>('/api/payment-accounts?take=200').then((d) => setAccounts(Array.isArray(d) ? d : [])).catch(() => {});
  }, []);

  const save = async () => {
    if (!amount || amount <= 0) { setErr('Enter a valid amount.'); return; }
    setSaving(true); setErr('');
    try {
      const acc = accounts.find((a) => a.id === accountId);
      await api.post(`/api/invoices/${invoice.id}/payments`, {
        amount: Number(amount),
        method: acc ? acc.title : method,
        accountId: acc ? acc.id : undefined,
        date,
        note: note || undefined,
      });
      onDone();
    } catch (e) {
      setErr(`Could not record payment: ${(e as Error).message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-sm font-bold text-slate-800 dark:text-white">Record payment</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-5 space-y-3">
          {err && <p className="text-xs text-red-500">{err}</p>}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Amount ({invoice.currency})</label>
            <input type="number" step="0.01" value={amount} onChange={(e) => setAmount(Number(e.target.value))} className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Payment account / method</label>
            {accounts.length > 0 ? (
              <select value={accountId} onChange={(e) => setAccountId(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white">
                <option value="">— choose account —</option>
                {accounts.map((a) => <option key={a.id} value={a.id}>{a.title} ({a.currency})</option>)}
              </select>
            ) : (
              <input value={method} onChange={(e) => setMethod(e.target.value)} placeholder="e.g. Cash" className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white" />
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Date</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Note</label>
              <input value={note} onChange={(e) => setNote(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white" />
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 px-5 py-3 border-t border-slate-100 dark:border-slate-800">
          <button onClick={save} disabled={saving} className="px-4 py-2 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-500 text-white disabled:opacity-40 flex items-center gap-1.5">
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CreditCard className="w-3.5 h-3.5" />} Record
          </button>
          <button onClick={onClose} className="px-3 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300">Cancel</button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------
// Form (new / edit)
// ---------------------------------------------------------------------
const emptyItem = (vat = 0): InvoiceItem => ({ name: '', description: '', qty: 1, unit: '', unitCost: 0, vatPercent: vat, vatAmount: 0, amount: 0 });

function InvoiceForm({ mode, id }: { mode: 'new' | 'edit'; id?: string }) {
  const router = useRouter();
  const { profile } = useInvoiceProfile();
  const [loading, setLoading] = useState(mode === 'edit');
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');
  const [bookings, setBookings] = useState<Booking[]>([]);

  const [form, setForm] = useState({
    customerName: '', customerPhone: '', customerEmail: '', customerAddress: '', customerTRN: '',
    invoiceDate: new Date().toISOString().slice(0, 10), dueDate: '', currency: 'QAR',
    discount: 0, notes: '', terms: '', bookingId: '', bookingPnr: '',
  });
  const [items, setItems] = useState<InvoiceItem[]>([emptyItem()]);

  // Hydrate defaults from profile for a new invoice.
  useEffect(() => {
    if (mode === 'new') {
      setForm((f) => ({ ...f, notes: f.notes || profile.defaultNotes || '', terms: f.terms || profile.defaultTerms || '' }));
      setItems((its) => its.map((it) => (it.vatPercent === 0 ? { ...it, vatPercent: profile.defaultVatPercent || 0 } : it)));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile]);

  useEffect(() => {
    api.get<Booking[]>('/api/bookings?take=200').then((d) => setBookings(Array.isArray(d) ? d : [])).catch(() => {});
  }, []);

  useEffect(() => {
    if (mode !== 'edit' || !id) return;
    (async () => {
      try {
        const inv = await api.get<Invoice>(`/api/invoices/${id}`);
        setForm({
          customerName: inv.customerName, customerPhone: inv.customerPhone || '', customerEmail: inv.customerEmail || '',
          customerAddress: inv.customerAddress || '', customerTRN: inv.customerTRN || '',
          invoiceDate: inv.invoiceDate, dueDate: inv.dueDate || '', currency: inv.currency || 'QAR',
          discount: inv.discount || 0, notes: inv.notes || '', terms: inv.terms || '', bookingId: inv.bookingId || '', bookingPnr: inv.bookingPnr || '',
        });
        setItems(Array.isArray(inv.items) && inv.items.length ? inv.items : [emptyItem()]);
      } catch {
        setErr('Could not load invoice.');
      } finally {
        setLoading(false);
      }
    })();
  }, [mode, id]);

  const prefillFromBooking = (bid: string) => {
    const b = bookings.find((x) => x.id === bid);
    if (!b) { setForm((f) => ({ ...f, bookingId: '', bookingPnr: '' })); return; }
    setForm((f) => ({
      ...f,
      bookingId: b.id, bookingPnr: b.pnr,
      customerName: b.passengerName, customerPhone: b.passengerPhone || '', customerEmail: b.passengerEmail || '',
      currency: (b.paymentCurrency as string) || 'QAR',
    }));
    setItems([{ ...emptyItem(profile.defaultVatPercent || 0), name: b.packageName || 'Service', description: `PNR ${b.pnr}`, qty: b.paxCount || 1, unit: 'pax', unitCost: (b.totalQAR || 0) / (b.paxCount || 1) }]);
  };

  // Live totals preview.
  const totals = useMemo(() => {
    let subTotal = 0, vatTotal = 0;
    for (const it of items) {
      const base = (Number(it.qty) || 0) * (Number(it.unitCost) || 0);
      subTotal += base;
      vatTotal += (base * (Number(it.vatPercent) || 0)) / 100;
    }
    const grand = subTotal + vatTotal - (Number(form.discount) || 0);
    return { subTotal, vatTotal, grand };
  }, [items, form.discount]);

  const setItem = (i: number, patch: Partial<InvoiceItem>) => setItems((arr) => arr.map((it, idx) => (idx === i ? { ...it, ...patch } : it)));
  const addItem = () => setItems((arr) => [...arr, emptyItem(profile.defaultVatPercent || 0)]);
  const removeItem = (i: number) => setItems((arr) => (arr.length > 1 ? arr.filter((_, idx) => idx !== i) : arr));

  const save = async () => {
    if (!form.customerName.trim()) { setErr('Customer name is required.'); return; }
    const cleanItems = items.filter((it) => it.name.trim());
    if (!cleanItems.length) { setErr('Add at least one line item with a name.'); return; }
    setSaving(true); setErr('');
    try {
      const payload = {
        ...form,
        discount: Number(form.discount) || 0,
        source: form.bookingId ? 'Booking' : 'Manual',
        items: cleanItems.map((it) => ({ name: it.name, description: it.description || undefined, qty: Number(it.qty) || 0, unit: it.unit || undefined, unitCost: Number(it.unitCost) || 0, vatPercent: Number(it.vatPercent) || 0 })),
      };
      if (mode === 'edit' && id) {
        await api.patch(`/api/invoices/${id}`, payload);
        router.push(`/dashboard/invoices/${id}`);
      } else {
        const created = await api.post<Invoice>('/api/invoices', payload);
        router.push(`/dashboard/invoices/${created.id}`);
      }
    } catch (e) {
      setErr(`Save failed: ${(e as Error).message}`);
      setSaving(false);
    }
  };

  if (loading) return <div className="py-24 flex justify-center text-slate-400"><Loader2 className="w-7 h-7 animate-spin" /></div>;

  const inputCls = 'w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white';

  return (
    <div className="space-y-5 pb-10 max-w-5xl">
      <div className="flex items-center gap-2">
        <button onClick={() => router.back()} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"><ArrowLeft className="w-4 h-4" /></button>
        <h1 className="text-lg font-bold text-slate-900 dark:text-white">{mode === 'edit' ? 'Edit invoice' : 'New invoice'}</h1>
      </div>

      {err && <div className="text-xs font-medium px-3 py-2 rounded-lg bg-red-50 dark:bg-red-500/10 text-red-600">{err}</div>}

      {/* Generate from booking */}
      {mode === 'new' && bookings.length > 0 && (
        <div className="bg-teal-50 dark:bg-teal-500/10 border border-teal-100 dark:border-teal-500/20 rounded-2xl p-4">
          <label className="block text-xs font-bold text-teal-700 dark:text-teal-300 mb-1">Generate from an existing booking (optional)</label>
          <select value={form.bookingId} onChange={(e) => prefillFromBooking(e.target.value)} className={inputCls + ' sm:max-w-md'}>
            <option value="">— start blank —</option>
            {bookings.map((b) => <option key={b.id} value={b.id}>{b.pnr} · {b.passengerName} · {b.packageName}</option>)}
          </select>
        </div>
      )}

      {/* Customer */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-4">
        <h2 className="text-sm font-bold text-slate-800 dark:text-white">Bill to</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Labeled label="Customer name *"><input value={form.customerName} onChange={(e) => setForm({ ...form, customerName: e.target.value })} className={inputCls} /></Labeled>
          <Labeled label="Phone"><input value={form.customerPhone} onChange={(e) => setForm({ ...form, customerPhone: e.target.value })} className={inputCls} placeholder="+974…" /></Labeled>
          <Labeled label="Email"><input value={form.customerEmail} onChange={(e) => setForm({ ...form, customerEmail: e.target.value })} className={inputCls} /></Labeled>
          <Labeled label="Customer TRN"><input value={form.customerTRN} onChange={(e) => setForm({ ...form, customerTRN: e.target.value })} className={inputCls} /></Labeled>
          <Labeled label="Address"><input value={form.customerAddress} onChange={(e) => setForm({ ...form, customerAddress: e.target.value })} className={inputCls} /></Labeled>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Labeled label="Invoice date *"><input type="date" value={form.invoiceDate} onChange={(e) => setForm({ ...form, invoiceDate: e.target.value })} className={inputCls} /></Labeled>
          <Labeled label="Due date"><input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} className={inputCls} /></Labeled>
          <Labeled label="Currency">
            <select value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })} className={inputCls}>
              {['QAR', 'USD', 'EUR', 'GBP', 'SAR'].map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </Labeled>
        </div>
      </div>

      {/* Items */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-slate-800 dark:text-white">Line items</h2>
          <button onClick={addItem} className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center gap-1"><Plus className="w-3.5 h-3.5" /> Add item</button>
        </div>
        <div className="space-y-2">
          <div className="hidden sm:grid grid-cols-12 gap-2 text-[10px] uppercase text-slate-400 font-semibold px-1">
            <div className="col-span-4">Name / description</div><div className="col-span-1 text-right">Qty</div><div className="col-span-1">Unit</div>
            <div className="col-span-2 text-right">Unit cost</div><div className="col-span-1 text-right">VAT %</div><div className="col-span-2 text-right">Amount</div><div className="col-span-1" />
          </div>
          {items.map((it, i) => {
            const base = (Number(it.qty) || 0) * (Number(it.unitCost) || 0);
            const amount = base + (base * (Number(it.vatPercent) || 0)) / 100;
            return (
              <div key={i} className="grid grid-cols-12 gap-2 items-start">
                <div className="col-span-12 sm:col-span-4 space-y-1">
                  <input value={it.name} onChange={(e) => setItem(i, { name: e.target.value })} placeholder="Item name" className={inputCls} />
                  <input value={it.description || ''} onChange={(e) => setItem(i, { description: e.target.value })} placeholder="Description (optional)" className={inputCls + ' text-[11px]'} />
                </div>
                <input type="number" step="0.01" value={it.qty} onChange={(e) => setItem(i, { qty: Number(e.target.value) })} className={inputCls + ' col-span-4 sm:col-span-1 text-right'} />
                <input value={it.unit || ''} onChange={(e) => setItem(i, { unit: e.target.value })} placeholder="unit" className={inputCls + ' col-span-4 sm:col-span-1'} />
                <input type="number" step="0.01" value={it.unitCost} onChange={(e) => setItem(i, { unitCost: Number(e.target.value) })} className={inputCls + ' col-span-4 sm:col-span-2 text-right'} />
                <input type="number" step="0.01" value={it.vatPercent} onChange={(e) => setItem(i, { vatPercent: Number(e.target.value) })} className={inputCls + ' col-span-6 sm:col-span-1 text-right'} />
                <div className="col-span-5 sm:col-span-2 text-right text-xs font-semibold text-slate-700 dark:text-slate-200 pt-2">{money(amount, form.currency)}</div>
                <button onClick={() => removeItem(i)} className="col-span-1 pt-2 text-slate-400 hover:text-red-500 flex justify-end"><Trash2 className="w-4 h-4" /></button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Notes + totals */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-4">
          <Labeled label="Notes"><textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} className={inputCls} /></Labeled>
          <Labeled label="Terms"><textarea value={form.terms} onChange={(e) => setForm({ ...form, terms: e.target.value })} rows={2} className={inputCls} /></Labeled>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-2 text-sm self-start">
          <div className="flex justify-between text-slate-600 dark:text-slate-300"><span>Sub Total</span><span>{money(totals.subTotal, form.currency)}</span></div>
          <div className="flex justify-between items-center text-slate-600 dark:text-slate-300">
            <span>Discount</span>
            <input type="number" step="0.01" value={form.discount} onChange={(e) => setForm({ ...form, discount: Number(e.target.value) })} className="w-28 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-right text-slate-900 dark:text-white" />
          </div>
          <div className="flex justify-between text-slate-600 dark:text-slate-300"><span>VAT</span><span>{money(totals.vatTotal, form.currency)}</span></div>
          <div className="flex justify-between font-bold text-slate-900 dark:text-white border-t border-slate-100 dark:border-slate-800 pt-2"><span>Grand Total</span><span>{money(totals.grand, form.currency)}</span></div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button onClick={save} disabled={saving} className="px-5 py-2.5 rounded-xl text-sm font-bold bg-teal-600 hover:bg-teal-500 text-white disabled:opacity-40 flex items-center gap-2">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <ReceiptText className="w-4 h-4" />} {mode === 'edit' ? 'Save changes' : 'Create invoice'}
        </button>
        <button onClick={() => router.back()} className="px-4 py-2.5 rounded-xl text-sm font-semibold border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300">Cancel</button>
      </div>
    </div>
  );
}

function Labeled({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">{label}</label>
      {children}
    </div>
  );
}
