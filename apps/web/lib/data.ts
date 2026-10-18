// =====================================================================
// Live write-through sync for AppContext collections.
// `useResourceSync` watches a collection and mirrors every create / update /
// delete to the API so MySQL stays the source of truth — no localStorage.
// It diffs the array against the previous snapshot by `id`, so the existing
// context mutators keep calling setState exactly as before.
// =====================================================================

import { useEffect, useRef } from 'react';
import { api } from './api';

type Row = Record<string, unknown> & { id?: unknown };

// Build a payload the API will accept: drop null/undefined (the schemas treat
// optional fields as "may be absent", not "may be null") and server-managed
// timestamps. For updates we also drop the id (it's in the URL).
function toPayload(row: Row, { forUpdate }: { forUpdate: boolean }): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(row)) {
    if (value === null || value === undefined) continue;
    if (key === 'createdAt' || key === 'updatedAt') continue;
    if (forUpdate && key === 'id') continue;
    out[key] = value;
  }
  return out;
}

export function useResourceSync(path: string, items: Row[], enabled: boolean) {
  const baseline = useRef<Map<string, string> | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const next = new Map<string, string>();
    for (const it of items) {
      if (it && it.id != null) next.set(String(it.id), JSON.stringify(it));
    }

    // First run after hydration: snapshot only, don't re-send the loaded rows.
    if (baseline.current === null) {
      baseline.current = next;
      return;
    }

    const prev = baseline.current;

    // Creates & updates.
    for (const it of items) {
      if (!it || it.id == null) continue;
      const id = String(it.id);
      const snapshot = next.get(id)!;
      const previous = prev.get(id);
      if (previous === undefined) {
        api
          .post(`/api/${path}`, toPayload(it, { forUpdate: false }))
          .catch((e) => console.error(`[sync] create ${path}:`, e.message));
      } else if (previous !== snapshot) {
        api
          .patch(`/api/${path}/${id}`, toPayload(it, { forUpdate: true }))
          .catch((e) => console.error(`[sync] update ${path}:`, e.message));
      }
    }

    // Deletes.
    for (const id of prev.keys()) {
      if (!next.has(id)) {
        api.delete(`/api/${path}/${id}`).catch((e) => console.error(`[sync] delete ${path}:`, e.message));
      }
    }

    baseline.current = next;
  }, [items, enabled, path]);
}
