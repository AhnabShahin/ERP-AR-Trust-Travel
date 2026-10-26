'use client';

// =====================================================================
// Online Platforms — the OTA booking channels AR Trust works with, grouped
// into Tour and Airport Transfer. Backed by /api/platforms (CRUD resource).
// Hotels are managed separately (Hotel Vendors).
// =====================================================================

import React, { useEffect, useMemo, useState } from 'react';
import { Plus, Trash2, Save, Loader2, Share2, Pencil, X, Plane, Compass } from 'lucide-react';
import { api } from '../../../lib/api';
import type { Platform, PlatformType } from '../../types';

const blank = (type: PlatformType): Partial<Platform> => ({ name: '', type, contactPhone: '', website: '', notes: '', isActive: true });

export function PlatformsView() {
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<PlatformType>('tour');
  const [editing, setEditing] = useState<Partial<Platform> | null>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const data = await api.get<Platform[]>('/api/platforms?take=200');
      setPlatforms(Array.isArray(data) ? data : []);
    } catch {
      setMsg('Failed to load platforms.');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { void load(); }, []);

  const save = async () => {
    if (!editing) return;
    if (!editing.name?.trim()) { setMsg('Name is required.'); return; }
    setSaving(true); setMsg('');
    try {
      const payload = {
        name: editing.name, type: editing.type, contactPhone: editing.contactPhone || undefined,
        website: editing.website || undefined, notes: editing.notes || undefined, isActive: editing.isActive ?? true,
      };
      if (editing.id) await api.patch(`/api/platforms/${editing.id}`, payload);
      else await api.post('/api/platforms', { ...payload, sortOrder: platforms.filter((p) => p.type === editing.type).length });
      setEditing(null);
      await load();
    } catch (e) {
      setMsg(`Save failed: ${(e as Error).message}`);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    if (!window.confirm('Delete this platform?')) return;
    try { await api.delete(`/api/platforms/${id}`); await load(); } catch (e) { setMsg(`Delete failed: ${(e as Error).message}`); }
  };

  const list = useMemo(() => platforms.filter((p) => p.type === tab), [platforms, tab]);
  const count = (t: PlatformType) => platforms.filter((p) => p.type === t).length;

  return (
    <div className="space-y-5 pb-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Share2 className="w-5 h-5 text-violet-500" /> Online Platforms
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">OTA booking channels — Tour &amp; Airport Transfer partners.</p>
        </div>
        <button onClick={() => setEditing(blank(tab))} className="px-4 py-2 rounded-xl text-xs font-bold bg-violet-600 hover:bg-violet-500 text-white flex items-center gap-1.5">
          <Plus className="w-4 h-4" /> Add platform
        </button>
      </div>

      {/* Type tabs */}
      <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 w-fit">
        <TabBtn active={tab === 'tour'} onClick={() => setTab('tour')} icon={<Compass className="w-3.5 h-3.5" />} label={`Tour (${count('tour')})`} />
        <TabBtn active={tab === 'airport-transfer'} onClick={() => setTab('airport-transfer')} icon={<Plane className="w-3.5 h-3.5" />} label={`Airport Transfer (${count('airport-transfer')})`} />
      </div>

      {msg && <div className="text-xs font-medium px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200">{msg}</div>}

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {loading ? (
          <div className="py-20 flex justify-center text-slate-400"><Loader2 className="w-6 h-6 animate-spin" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[11px] uppercase tracking-wide text-slate-400 border-b border-slate-100 dark:border-slate-800">
                  <th className="px-4 py-3 font-semibold">#</th>
                  <th className="px-4 py-3 font-semibold">Name</th>
                  <th className="px-4 py-3 font-semibold">Contact</th>
                  <th className="px-4 py-3 font-semibold">Website</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {list.map((p, i) => (
                  <tr key={p.id} className="border-b border-slate-50 dark:border-slate-800/60 text-xs text-slate-700 dark:text-slate-200">
                    <td className="px-4 py-3 text-slate-400">{i + 1}</td>
                    <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">{p.name}</td>
                    <td className="px-4 py-3">{p.contactPhone || '—'}</td>
                    <td className="px-4 py-3">{p.website || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${p.isActive !== false ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300' : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300'}`}>
                        {p.isActive !== false ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1.5">
                        <button onClick={() => setEditing(p)} className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-500/10 text-amber-600 hover:bg-amber-100" title="Edit"><Pencil className="w-3.5 h-3.5" /></button>
                        <button onClick={() => remove(p.id)} className="p-1.5 rounded-lg bg-red-50 dark:bg-red-500/10 text-red-600 hover:bg-red-100" title="Delete"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {list.length === 0 && <tr><td colSpan={6} className="px-4 py-10 text-center text-sm text-slate-500">No platforms in this group yet.</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setEditing(null)}>
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-sm font-bold text-slate-800 dark:text-white">{editing.id ? 'Edit platform' : 'Add platform'}</h2>
              <button onClick={() => setEditing(null)} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-5 space-y-4">
              <Field label="Name *" value={editing.name || ''} onChange={(v) => setEditing({ ...editing, name: v })} />
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Type</label>
                <select value={editing.type} onChange={(e) => setEditing({ ...editing, type: e.target.value as PlatformType })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white">
                  <option value="tour">Tour</option>
                  <option value="airport-transfer">Airport Transfer</option>
                </select>
              </div>
              <Field label="Contact phone" value={editing.contactPhone || ''} onChange={(v) => setEditing({ ...editing, contactPhone: v })} />
              <Field label="Website" value={editing.website || ''} onChange={(v) => setEditing({ ...editing, website: v })} />
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Notes</label>
                <textarea value={editing.notes || ''} onChange={(e) => setEditing({ ...editing, notes: e.target.value })} rows={2}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white" />
              </div>
              <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                <input type="checkbox" checked={editing.isActive ?? true} onChange={(e) => setEditing({ ...editing, isActive: e.target.checked })} /> Active
              </label>
            </div>
            <div className="flex items-center gap-2 px-5 py-3 border-t border-slate-100 dark:border-slate-800">
              <button onClick={save} disabled={saving} className="px-4 py-2 rounded-xl text-xs font-bold bg-violet-600 hover:bg-violet-500 text-white disabled:opacity-40 flex items-center gap-1.5">
                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />} Save
              </button>
              <button onClick={() => setEditing(null)} className="px-3 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TabBtn({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button onClick={onClick} className={`px-3 py-1.5 rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition ${active ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs' : 'text-slate-500 dark:text-slate-400'}`}>
      {icon} {label}
    </button>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">{label}</label>
      <input type="text" value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white" />
    </div>
  );
}
