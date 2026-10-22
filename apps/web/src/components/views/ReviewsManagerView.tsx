'use client';

// =====================================================================
// Dashboard editor for public customer reviews (the Review table). Lists the
// reviews shown on the website and lets an admin add, edit, delete, reorder and
// toggle visibility. Backed by /api/reviews (the standard CRUD resource).
// =====================================================================

import React, { useEffect, useState } from 'react';
import { Star, Plus, Trash2, Save, Loader2, Eye, EyeOff, MessageSquareQuote } from 'lucide-react';
import { api } from '../../../lib/api';
import { imgSrc } from '../../../lib/uploads';

interface Review {
  id: string;
  author: string;
  country?: string;
  rating: number;
  date?: string;
  tour?: string;
  comment: string;
  avatar?: string;
  showOnWebsite: boolean;
  sortOrder: number;
}

const blank = (): Partial<Review> => ({ author: '', country: '', rating: 5, date: '', tour: '', comment: '', avatar: '', showOnWebsite: true, sortOrder: 0 });

export function ReviewsManagerView() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<Review> | null>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const data = await api.get<Review[]>('/api/reviews?take=200');
      setReviews(Array.isArray(data) ? data : []);
    } catch { setMsg('Failed to load reviews.'); } finally { setLoading(false); }
  };
  useEffect(() => { void load(); }, []);

  const save = async () => {
    if (!editing) return;
    if (!editing.author?.trim() || !editing.comment?.trim()) { setMsg('Author and comment are required.'); return; }
    setSaving(true); setMsg('');
    try {
      if (editing.id) await api.patch(`/api/reviews/${editing.id}`, editing);
      else await api.post('/api/reviews', { ...editing, sortOrder: reviews.length });
      setEditing(null);
      await load();
    } catch (e) { setMsg(`Save failed: ${(e as Error).message}`); } finally { setSaving(false); }
  };

  const remove = async (id: string) => {
    try { await api.delete(`/api/reviews/${id}`); await load(); } catch (e) { setMsg(`Delete failed: ${(e as Error).message}`); }
  };

  const toggle = async (r: Review) => {
    try { await api.patch(`/api/reviews/${r.id}`, { showOnWebsite: !r.showOnWebsite }); await load(); } catch { /* ignore */ }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <MessageSquareQuote className="w-5 h-5 text-amber-500" /> Customer Reviews
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Manage the reviews shown on the public website.</p>
        </div>
        <button onClick={() => setEditing(blank())}
          className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white flex items-center gap-1.5">
          <Plus className="w-4 h-4" /> Add review
        </button>
      </div>

      {msg && <div className="text-xs font-medium px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200">{msg}</div>}

      {editing && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-4">
          <h2 className="text-sm font-bold text-slate-800 dark:text-white">{editing.id ? 'Edit review' : 'New review'}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Author" value={editing.author || ''} onChange={(v) => setEditing({ ...editing, author: v })} />
            <Field label="Country" value={editing.country || ''} onChange={(v) => setEditing({ ...editing, country: v })} />
            <Field label="Date label" value={editing.date || ''} onChange={(v) => setEditing({ ...editing, date: v })} placeholder="e.g. February 2026" />
            <Field label="Tour / experience" value={editing.tour || ''} onChange={(v) => setEditing({ ...editing, tour: v })} />
            <Field label="Avatar URL" value={editing.avatar || ''} onChange={(v) => setEditing({ ...editing, avatar: v })} />
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Rating</label>
              <select value={editing.rating ?? 5} onChange={(e) => setEditing({ ...editing, rating: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white">
                {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} star{n > 1 ? 's' : ''}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Comment</label>
            <textarea value={editing.comment || ''} onChange={(e) => setEditing({ ...editing, comment: e.target.value })} rows={3}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white" />
          </div>
          <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
            <input type="checkbox" checked={editing.showOnWebsite ?? true} onChange={(e) => setEditing({ ...editing, showOnWebsite: e.target.checked })} />
            Show on website
          </label>
          <div className="flex items-center gap-2">
            <button onClick={save} disabled={saving}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-500 text-white disabled:opacity-40 flex items-center gap-1.5">
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />} Save
            </button>
            <button onClick={() => setEditing(null)} className="px-3 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300">Cancel</button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="py-20 flex justify-center text-slate-400"><Loader2 className="w-6 h-6 animate-spin" /></div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {reviews.map((r) => (
            <div key={r.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 flex gap-3">
              <img src={imgSrc(r.avatar) || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80'} alt={r.author}
                className="w-11 h-11 rounded-full object-cover shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{r.author} <span className="font-normal text-slate-400">{r.country}</span></p>
                  <span className="flex items-center gap-0.5 text-amber-500 shrink-0">{Array.from({ length: r.rating }).map((_, i) => <Star key={i} className="w-3 h-3 fill-current" />)}</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">{r.tour} {r.date && `· ${r.date}`}</p>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 line-clamp-3">{r.comment}</p>
                <div className="flex items-center gap-2 mt-2">
                  <button onClick={() => toggle(r)} className="text-[11px] font-semibold flex items-center gap-1 text-slate-500 hover:text-teal-500">
                    {r.showOnWebsite ? <><Eye className="w-3.5 h-3.5" /> Visible</> : <><EyeOff className="w-3.5 h-3.5" /> Hidden</>}
                  </button>
                  <button onClick={() => setEditing(r)} className="text-[11px] font-semibold text-slate-500 hover:text-blue-500">Edit</button>
                  <button onClick={() => remove(r.id)} className="text-[11px] font-semibold text-slate-500 hover:text-red-500 flex items-center gap-1"><Trash2 className="w-3.5 h-3.5" /> Delete</button>
                </div>
              </div>
            </div>
          ))}
          {reviews.length === 0 && <div className="py-10 text-center text-sm text-slate-500 col-span-full">No reviews yet. Add one, or run the seed.</div>}
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
