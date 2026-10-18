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

type OnError = (message: string) => void;

export function useResourceSync(
  path: string,
  items: Row[],
  enabled: boolean,
  onError?: OnError
) {
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
    const fail = (verb: string) => (e: { message: string }) => {
      console.error(`[sync] ${verb} ${path}:`, e.message);
      onError?.(`Couldn't ${verb} ${path.replace(/-/g, ' ')}`);
    };

    // Creates & updates.
    for (const it of items) {
      if (!it || it.id == null) continue;
      const id = String(it.id);
      const snapshot = next.get(id)!;
      const previous = prev.get(id);
      if (previous === undefined) {
        api.post(`/api/${path}`, toPayload(it, { forUpdate: false })).catch((e) => {
          // 409 = the row already exists (e.g. created via another path); fine.
          if ((e as { status?: number })?.status === 409) return;
          fail('save')(e);
        });
      } else if (previous !== snapshot) {
        api.patch(`/api/${path}/${id}`, toPayload(it, { forUpdate: true })).catch(fail('update'));
      }
    }

    // Deletes.
    for (const id of prev.keys()) {
      if (!next.has(id)) {
        api.delete(`/api/${path}/${id}`).catch(fail('delete'));
      }
    }

    baseline.current = next;
    // onError is a stable callback; excluded so the deps length never changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, enabled, path]);
}

/**
 * Sync a singleton / config value (exchange rates, shift drawer, package
 * categories, …) to the key/value settings endpoint whenever it changes.
 */
export function useSettingSync(
  key: string,
  value: unknown,
  enabled: boolean,
  onError?: OnError
) {
  const baseline = useRef<string | null>(null);

  useEffect(() => {
    if (!enabled) return;
    const snapshot = JSON.stringify(value ?? null);
    if (baseline.current === null) {
      baseline.current = snapshot;
      return;
    }
    if (baseline.current === snapshot) return;
    baseline.current = snapshot;
    api.put(`/api/settings/${key}`, { value }).catch((e) => {
      console.error(`[sync] setting ${key}:`, e.message);
      onError?.(`Couldn't save ${key}`);
    });
    // onError is a stable callback; excluded so the deps length never changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, enabled, key]);
}
