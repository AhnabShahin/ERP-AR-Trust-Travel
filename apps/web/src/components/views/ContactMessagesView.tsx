'use client';

// =====================================================================
// Dashboard inbox for contact / concierge enquiries (the ContactMessage
// table) submitted from the public website's "Send Message to Concierge"
// form (contact page and any other page carrying it). Lists messages
// newest-first with search, status/service filters and pagination; a row
// opens a detail panel showing the full message, with status, internal notes
// and delete. Live-refreshes via the SSE change stream. Backed by
// /api/contact-messages.
// =====================================================================

import React, { useCallback, useEffect, useState } from 'react';
import {
  MessageSquare,
  Search,
  Trash2,
  Loader2,
  X,
  Mail,
  Phone,
  Globe,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  Save,
} from 'lucide-react';
import { api, type ListMeta } from '../../../lib/api';
import { useRealtimeRefresh } from '../../../lib/realtime';

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone?: string;
  service?: string;
  message: string;
  source?: string;
  status: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

const PAGE_SIZE = 20;

const STATUSES = ['new', 'read', 'replied', 'archived'] as const;
const SERVICES = [
  'Desert Safari Tour',
  'Airport Limousine Transfer',
  'Doha City & Dhow Cruise',
  'Multi-Day Holiday Package',
  'Airline Ticket & Qatar Visa',
  'Corporate Fleet / Event Logistics',
] as const;

const STATUS_STYLES: Record<string, string> = {
  new: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
  read: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30',
  replied: 'bg-sky-500/15 text-sky-600 dark:text-sky-400 border-sky-500/30',
  archived: 'bg-slate-500/15 text-slate-500 dark:text-slate-400 border-slate-500/30',
};

function fmtDate(iso?: string): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString(undefined, {
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

export function ContactMessagesView() {
  const [rows, setRows] = useState<ContactMessage[]>([]);
  const [meta, setMeta] = useState<ListMeta>({ total: 0, skip: 0, take: PAGE_SIZE });
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [status, setStatus] = useState('');
  const [service, setService] = useState('');
  const [page, setPage] = useState(0);

  const [selected, setSelected] = useState<ContactMessage | null>(null);
  const [savingStatus, setSavingStatus] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 350);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => { setPage(0); }, [debouncedSearch, status, service]);

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    const params = new URLSearchParams();
    params.set('take', String(PAGE_SIZE));
    params.set('skip', String(page * PAGE_SIZE));
    if (debouncedSearch) params.set('search', debouncedSearch);
    if (status) params.set('status', status);
    if (service) params.set('service', service);
    try {
      const res = await api.getPage<ContactMessage>(`/api/contact-messages?${params.toString()}`);
      setRows(res.data);
      setMeta(res.meta);
    } catch {
      if (!silent) setMsg('Failed to load messages.');
    } finally {
      if (!silent) setLoading(false);
    }
  }, [page, debouncedSearch, status, service]);

  useEffect(() => { void load(); }, [load]);
  useRealtimeRefresh(['contact-messages'], () => { void load(true); });

  // Opening a NEW message marks it read so the inbox reflects what's seen.
  const open = (m: ContactMessage) => {
    setSelected(m);
    if (m.status === 'new') void updateStatus(m, 'read');
  };

  const updateStatus = async (m: ContactMessage, next: string) => {
    setSavingStatus(true);
    try {
      await api.patch(`/api/contact-messages/${m.id}`, { status: next });
      setSelected((s) => (s && s.id === m.id ? { ...s, status: next } : s));
      await load(true);
    } catch (e) {
      setMsg(`Update failed: ${(e as Error).message}`);
    } finally {
      setSavingStatus(false);
    }
  };

  const saveNotes = async (m: ContactMessage, notes: string) => {
    setSavingStatus(true);
    try {
      await api.patch(`/api/contact-messages/${m.id}`, { notes });
      await load(true);
      setMsg('Saved.');
      setTimeout(() => setMsg(''), 1500);
    } catch (e) {
      setMsg(`Save failed: ${(e as Error).message}`);
    } finally {
      setSavingStatus(false);
    }
  };

  const remove = async (m: ContactMessage) => {
    if (!confirm(`Delete this message from ${m.name}? This cannot be undone.`)) return;
    try {
      await api.delete(`/api/contact-messages/${m.id}`);
      if (selected?.id === m.id) setSelected(null);
      await load(true);
    } catch (e) {
      setMsg(`Delete failed: ${(e as Error).message}`);
    }
  };

  const totalPages = Math.max(1, Math.ceil(meta.total / PAGE_SIZE));
  const from = meta.total === 0 ? 0 : page * PAGE_SIZE + 1;
  const to = Math.min((page + 1) * PAGE_SIZE, meta.total);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-[#D4AF37]" /> Contact Messages
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Enquiries from the public “Send Message to Concierge” form. {meta.total} total.
          </p>
        </div>
        {msg && <span className="text-xs text-slate-500 dark:text-slate-400">{msg}</span>}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, email, phone, message, source…"
            className="w-full bg-white dark:bg-[#09232C] border border-slate-200 dark:border-[#C0AB6F]/30 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-900 dark:text-white outline-none focus:border-[#D4AF37]"
          />
        </div>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="bg-white dark:bg-[#09232C] border border-slate-200 dark:border-[#C0AB6F]/30 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-white outline-none focus:border-[#D4AF37]"
        >
          <option value="">All statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s[0].toUpperCase() + s.slice(1)}</option>)}
        </select>
        <select
          value={service}
          onChange={(e) => setService(e.target.value)}
          className="bg-white dark:bg-[#09232C] border border-slate-200 dark:border-[#C0AB6F]/30 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-white outline-none focus:border-[#D4AF37] max-w-[200px]"
        >
          <option value="">All services</option>
          {SERVICES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="bg-white dark:bg-[#05161D] rounded-2xl border border-slate-200 dark:border-[#C0AB6F]/20 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-white/10">
                <th className="px-4 py-3 font-semibold">Date</th>
                <th className="px-4 py-3 font-semibold">Name</th>
                <th className="px-4 py-3 font-semibold">Contact</th>
                <th className="px-4 py-3 font-semibold">Service</th>
                <th className="px-4 py-3 font-semibold">Message</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="px-4 py-10 text-center text-slate-400">
                  <Loader2 className="w-5 h-5 animate-spin inline" />
                </td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-10 text-center text-slate-400">No messages found.</td></tr>
              ) : (
                rows.map((m) => (
                  <tr
                    key={m.id}
                    onClick={() => open(m)}
                    className={`border-b border-slate-50 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5 cursor-pointer transition ${m.status === 'new' ? 'font-semibold' : ''}`}
                  >
                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400 whitespace-nowrap">{fmtDate(m.createdAt)}</td>
                    <td className="px-4 py-3 text-slate-900 dark:text-white">{m.name}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                      <div>{m.email}</div>
                      {m.phone && <div className="text-slate-400 text-[11px]">{m.phone}</div>}
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{m.service || '—'}</td>
                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400 max-w-[260px] truncate">{m.message}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wide ${STATUS_STYLES[m.status] ?? STATUS_STYLES.new}`}>
                        {m.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={(e) => { e.stopPropagation(); void remove(m); }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 dark:border-white/10 text-xs text-slate-500 dark:text-slate-400">
          <span>{from}–{to} of {meta.total}</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-white/10 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-white/5 transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span>Page {page + 1} / {totalPages}</span>
            <button
              onClick={() => setPage((p) => (p + 1 < totalPages ? p + 1 : p))}
              disabled={page + 1 >= totalPages}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-white/10 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-white/5 transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSelected(null)} />
          <div className="relative w-full max-w-md h-full bg-white dark:bg-[#05161D] border-l border-slate-200 dark:border-[#C0AB6F]/30 shadow-2xl overflow-y-auto">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-white/10 sticky top-0 bg-white dark:bg-[#05161D] z-10">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-[#D4AF37]" /> Message Details
              </h2>
              <button onClick={() => setSelected(null)} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 transition">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-5 text-xs">
              <Field label="Name">{selected.name}</Field>
              <Field icon={<Mail className="w-3.5 h-3.5" />} label="Email">
                <a href={`mailto:${selected.email}`} className="text-[#C0AB6F] hover:underline">{selected.email}</a>
              </Field>
              {selected.phone && (
                <Field icon={<Phone className="w-3.5 h-3.5" />} label="Phone / WhatsApp">
                  <a href={`tel:${selected.phone}`} className="text-[#C0AB6F] hover:underline">{selected.phone}</a>
                </Field>
              )}
              <Field icon={<Briefcase className="w-3.5 h-3.5" />} label="Interested service">{selected.service || '—'}</Field>
              <Field label="Message">
                <p className="whitespace-pre-wrap leading-relaxed bg-slate-50 dark:bg-[#09232C] border border-slate-100 dark:border-white/10 rounded-xl p-3">{selected.message}</p>
              </Field>
              <Field icon={<Globe className="w-3.5 h-3.5" />} label="Submitted from">
                <span className="font-mono">{selected.source || '—'}</span>
              </Field>
              <Field label="Received">{fmtDate(selected.createdAt)}</Field>

              <div>
                <label className="block text-[11px] uppercase tracking-wider font-bold text-slate-400 mb-2">Status</label>
                <div className="flex flex-wrap gap-2">
                  {STATUSES.map((s) => (
                    <button
                      key={s}
                      disabled={savingStatus}
                      onClick={() => void updateStatus(selected, s)}
                      className={`px-3 py-1.5 rounded-xl border text-[11px] font-bold uppercase tracking-wide transition disabled:opacity-50 ${
                        selected.status === s ? STATUS_STYLES[s] : 'border-slate-200 dark:border-white/10 text-slate-500 hover:border-[#D4AF37]'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <NotesEditor key={selected.id} initial={selected.notes ?? ''} saving={savingStatus} onSave={(n) => void saveNotes(selected, n)} />

              <button
                onClick={() => void remove(selected)}
                className="w-full mt-2 py-2.5 rounded-xl border border-rose-500/30 text-rose-500 hover:bg-rose-500/10 text-xs font-bold flex items-center justify-center gap-2 transition"
              >
                <Trash2 className="w-4 h-4" /> Delete Message
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ icon, label, children }: { icon?: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider font-bold text-slate-400 mb-1">
        {icon}{label}
      </div>
      <div className="text-slate-800 dark:text-slate-200 break-words">{children}</div>
    </div>
  );
}

function NotesEditor({ initial, saving, onSave }: { initial: string; saving: boolean; onSave: (n: string) => void }) {
  const [notes, setNotes] = useState(initial);
  return (
    <div>
      <label className="block text-[11px] uppercase tracking-wider font-bold text-slate-400 mb-2">Internal Notes</label>
      <textarea
        rows={3}
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Add a private note about this enquiry…"
        className="w-full bg-slate-50 dark:bg-[#09232C] border border-slate-200 dark:border-[#C0AB6F]/30 rounded-xl p-3 text-xs text-slate-900 dark:text-white outline-none focus:border-[#D4AF37]"
      />
      <button
        onClick={() => onSave(notes)}
        disabled={saving || notes === initial}
        className="mt-2 px-4 py-2 rounded-xl bg-[#0D3A48] text-[#E7CF8A] border border-[#C0AB6F]/40 text-[11px] font-bold flex items-center gap-2 hover:brightness-110 disabled:opacity-50 transition"
      >
        {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />} Save Notes
      </button>
    </div>
  );
}
