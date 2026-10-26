'use client';

// =====================================================================
// Payment Accounts — the bank / cash / wallet accounts used as payment
// methods when recording invoice payments (BizBill-style "Account" page).
// Backed by /api/payment-accounts (standard CRUD resource).
// =====================================================================

import React, { useEffect, useMemo, useState } from 'react';
import { Plus, Trash2, Save, Loader2, Wallet, Pencil, X } from 'lucide-react';
import { api } from '../../../lib/api';
import type { PaymentAccount } from '../../types';

const CURRENCIES = ['QAR', 'USD', 'EUR', 'GBP', 'SAR'];

const blank = (): Partial<PaymentAccount> => ({
  title: '',
  openingDate: new Date().toISOString().slice(0, 10),
  accountNumber: '',
  currency: 'QAR',
  openingBalance: 0,
  note: '',
  isActive: true,
});

const money = (n: number, ccy = 'QAR') =>
  `${ccy} ${(Number(n) || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export function PaymentAccountsView() {
  const [accounts, setAccounts] = useState<PaymentAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<PaymentAccount> | null>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [query, setQuery] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const data = await api.get<PaymentAccount[]>('/api/payment-accounts?take=200');
      setAccounts(Array.isArray(data) ? data : []);
    } catch {
      setMsg('Failed to load accounts.');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    void load();
  }, []);

  const save = async () => {
    if (!editing) return;
    if (!editing.title?.trim()) {
      setMsg('Account title is required.');
      return;
    }
    setSaving(true);
    setMsg('');
    try {
      const payload = {
        title: editing.title,
        openingDate: editing.openingDate || new Date().toISOString().slice(0, 10),
        accountNumber: editing.accountNumber || undefined,
        currency: editing.currency || 'QAR',
        openingBalance: Number(editing.openingBalance) || 0,
        note: editing.note || undefined,
        isActive: editing.isActive ?? true,
      };
      if (editing.id) {
        await api.patch(`/api/payment-accounts/${editing.id}`, payload);
      } else {
        // A new account's current balance starts at its opening balance.
        await api.post('/api/payment-accounts', {
          ...payload,
          currentBalance: payload.openingBalance,
          sortOrder: accounts.length,
        });
      }
      setEditing(null);
      await load();
    } catch (e) {
      setMsg(`Save failed: ${(e as Error).message}`);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    if (!window.confirm('Delete this payment account?')) return;
    try {
      await api.delete(`/api/payment-accounts/${id}`);
      await load();
    } catch (e) {
      setMsg(`Delete failed: ${(e as Error).message}`);
    }
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return accounts;
    return accounts.filter(
      (a) => a.title.toLowerCase().includes(q) || (a.accountNumber || '').toLowerCase().includes(q)
    );
  }, [accounts, query]);

  const totalBalance = useMemo(
    () => accounts.reduce((s, a) => s + (Number(a.currentBalance) || 0), 0),
    [accounts]
  );

  return (
    <div className="space-y-6 pb-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Wallet className="w-5 h-5 text-indigo-500" /> Payment Accounts
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Bank, cash & wallet accounts used as payment methods when recording invoice payments.
          </p>
        </div>
        <button
          onClick={() => setEditing(blank())}
          className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" /> Add account
        </button>
      </div>

      {msg && (
        <div className="text-xs font-medium px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200">
          {msg}
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search account…"
            className="w-full sm:w-72 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
          />
        </div>
        {loading ? (
          <div className="py-20 flex justify-center text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[11px] uppercase tracking-wide text-slate-400 border-b border-slate-100 dark:border-slate-800">
                  <th className="px-4 py-3 font-semibold">Account Title</th>
                  <th className="px-4 py-3 font-semibold">Opening Date</th>
                  <th className="px-4 py-3 font-semibold">Account Number</th>
                  <th className="px-4 py-3 font-semibold">Currency</th>
                  <th className="px-4 py-3 font-semibold text-right">Opening Balance</th>
                  <th className="px-4 py-3 font-semibold text-right">Current Balance</th>
                  <th className="px-4 py-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((a) => (
                  <tr key={a.id} className="border-b border-slate-50 dark:border-slate-800/60 text-xs text-slate-700 dark:text-slate-200">
                    <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">{a.title}</td>
                    <td className="px-4 py-3">{a.openingDate || '—'}</td>
                    <td className="px-4 py-3">{a.accountNumber || '—'}</td>
                    <td className="px-4 py-3">{a.currency}</td>
                    <td className="px-4 py-3 text-right">{money(a.openingBalance, a.currency)}</td>
                    <td className={`px-4 py-3 text-right font-semibold ${Number(a.currentBalance) < 0 ? 'text-red-500' : 'text-emerald-600 dark:text-emerald-400'}`}>
                      {money(a.currentBalance, a.currency)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1.5">
                        <button onClick={() => setEditing(a)} className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-500/10 text-amber-600 hover:bg-amber-100" title="Edit">
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => remove(a.id)} className="p-1.5 rounded-lg bg-red-50 dark:bg-red-500/10 text-red-600 hover:bg-red-100" title="Delete">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-10 text-center text-sm text-slate-500">
                      No accounts yet. Add one (e.g. Cash, Qatar Bank).
                    </td>
                  </tr>
                )}
              </tbody>
              {accounts.length > 0 && (
                <tfoot>
                  <tr className="text-xs font-bold text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800/50">
                    <td className="px-4 py-3" colSpan={5}>Total Balance</td>
                    <td className="px-4 py-3 text-right">{money(totalBalance)}</td>
                    <td />
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        )}
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setEditing(null)}>
          <div
            className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-sm font-bold text-slate-800 dark:text-white">{editing.id ? 'Edit account' : 'Add account'}</h2>
              <button onClick={() => setEditing(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <Field label="Account Title *" value={editing.title || ''} onChange={(v) => setEditing({ ...editing, title: v })} placeholder="e.g. Qatar Bank" />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Opening Date *</label>
                  <input type="date" value={editing.openingDate || ''} onChange={(e) => setEditing({ ...editing, openingDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Currency</label>
                  <select value={editing.currency || 'QAR'} onChange={(e) => setEditing({ ...editing, currency: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white">
                    {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <Field label="Account Number" value={editing.accountNumber || ''} onChange={(v) => setEditing({ ...editing, accountNumber: v })} />
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Opening Balance *</label>
                <input type="number" step="0.01" value={editing.openingBalance ?? 0} onChange={(e) => setEditing({ ...editing, openingBalance: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white" />
                {editing.id && (
                  <p className="text-[10px] text-slate-400 mt-1">Editing opening balance does not recompute the current balance.</p>
                )}
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Note</label>
                <textarea value={editing.note || ''} onChange={(e) => setEditing({ ...editing, note: e.target.value })} rows={2}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white" />
              </div>
            </div>
            <div className="flex items-center gap-2 px-5 py-3 border-t border-slate-100 dark:border-slate-800">
              <button onClick={save} disabled={saving}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-40 flex items-center gap-1.5">
                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />} Save
              </button>
              <button onClick={() => setEditing(null)} className="px-3 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">{label}</label>
      <input type="text" value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white" />
    </div>
  );
}
