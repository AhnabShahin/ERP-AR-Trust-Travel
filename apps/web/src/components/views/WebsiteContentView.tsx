'use client';

// =====================================================================
// Dashboard editor for the public website CMS content (SiteContent). Loads the
// content rows (with their editor metadata), groups them, and lets an admin
// edit each value — plain text, multi-line text, a list of lines, or a JSON
// block — then saves everything back via /api/site-content/bulk.
// =====================================================================

import React, { useEffect, useMemo, useState } from 'react';
import { Globe, Save, RotateCcw, Loader2 } from 'lucide-react';
import { api } from '../../../lib/api';

interface ContentRow {
  key: string;
  value: unknown;
  group?: string | null;
  label?: string | null;
  kind?: string | null;
  sortOrder?: number;
}

/** A value becomes an editable string for the textarea/list editors. */
function toEditable(kind: string, value: unknown): string {
  if (kind === 'list') return Array.isArray(value) ? (value as string[]).join('\n') : String(value ?? '');
  if (kind === 'json') return JSON.stringify(value ?? null, null, 2);
  return typeof value === 'string' ? value : value == null ? '' : String(value);
}

/** Parse the edited string back into the stored value per kind. */
function fromEditable(kind: string, text: string): { value: unknown; error?: string } {
  if (kind === 'list') return { value: text.split('\n').map((s) => s.trim()).filter(Boolean) };
  if (kind === 'json') {
    try { return { value: JSON.parse(text) }; } catch (e) { return { value: null, error: (e as Error).message }; }
  }
  return { value: text };
}

export function WebsiteContentView() {
  const [rows, setRows] = useState<ContentRow[]>([]);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string>('');

  const load = async () => {
    setLoading(true);
    try {
      const data = await api.get<ContentRow[]>('/api/site-content/list');
      const list = Array.isArray(data) ? data : [];
      setRows(list);
      const d: Record<string, string> = {};
      for (const r of list) d[r.key] = toEditable(r.kind || 'text', r.value);
      setDrafts(d);
    } catch {
      setMsg('Failed to load content.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, []);

  const groups = useMemo(() => {
    const m = new Map<string, ContentRow[]>();
    for (const r of rows) {
      const g = r.group || 'General';
      if (!m.has(g)) m.set(g, []);
      m.get(g)!.push(r);
    }
    return Array.from(m.entries());
  }, [rows]);

  const dirty = useMemo(
    () => rows.some((r) => drafts[r.key] !== toEditable(r.kind || 'text', r.value)),
    [rows, drafts]
  );

  const save = async () => {
    setSaving(true);
    setMsg('');
    try {
      const items: Array<{ key: string; value: unknown; group?: string; label?: string; kind?: string; sortOrder?: number }> = [];
      for (const r of rows) {
        const kind = r.kind || 'text';
        const parsed = fromEditable(kind, drafts[r.key] ?? '');
        if (parsed.error) { setMsg(`Invalid JSON in "${r.label || r.key}": ${parsed.error}`); setSaving(false); return; }
        items.push({ key: r.key, value: parsed.value, group: r.group || undefined, label: r.label || undefined, kind, sortOrder: r.sortOrder });
      }
      await api.post('/api/site-content/bulk', { items });
      setMsg(`Saved ${items.length} content fields. Changes are live on the website.`);
      await load();
    } catch (e) {
      setMsg(`Save failed: ${(e as Error).message}`);
    } finally {
      setSaving(false);
    }
  };

  const reset = () => {
    const d: Record<string, string> = {};
    for (const r of rows) d[r.key] = toEditable(r.kind || 'text', r.value);
    setDrafts(d);
    setMsg('');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Globe className="w-5 h-5 text-teal-500" /> Website Content
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Edit the text and content shown on the public website. Changes go live after saving.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={reset} disabled={!dirty || saving}
            className="px-3 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 disabled:opacity-40 flex items-center gap-1.5">
            <RotateCcw className="w-3.5 h-3.5" /> Reset
          </button>
          <button onClick={save} disabled={!dirty || saving}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-500 text-white disabled:opacity-40 flex items-center gap-1.5">
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />} Save changes
          </button>
        </div>
      </div>

      {msg && <div className="text-xs font-medium px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200">{msg}</div>}

      {loading ? (
        <div className="py-20 flex justify-center text-slate-400"><Loader2 className="w-6 h-6 animate-spin" /></div>
      ) : rows.length === 0 ? (
        <div className="py-16 text-center text-sm text-slate-500 dark:text-slate-400">
          No content yet. Run the database seed to populate editable website content.
        </div>
      ) : (
        <div className="space-y-6">
          {groups.map(([group, items]) => (
            <section key={group} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
              <h2 className="text-sm font-bold text-slate-800 dark:text-white mb-4">{group}</h2>
              <div className="space-y-4">
                {items.map((r) => {
                  const kind = r.kind || 'text';
                  return (
                    <div key={r.key}>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                        {r.label || r.key} <span className="text-slate-400 font-mono font-normal">· {r.key}</span>
                      </label>
                      {kind === 'text' ? (
                        <input
                          type="text"
                          value={drafts[r.key] ?? ''}
                          onChange={(e) => setDrafts((d) => ({ ...d, [r.key]: e.target.value }))}
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                        />
                      ) : (
                        <textarea
                          value={drafts[r.key] ?? ''}
                          onChange={(e) => setDrafts((d) => ({ ...d, [r.key]: e.target.value }))}
                          rows={kind === 'json' ? 10 : kind === 'list' ? 4 : 3}
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white font-mono"
                        />
                      )}
                      {kind === 'list' && <p className="text-[10px] text-slate-400 mt-1">One item per line.</p>}
                      {kind === 'json' && <p className="text-[10px] text-slate-400 mt-1">Structured JSON — keep it valid.</p>}
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
