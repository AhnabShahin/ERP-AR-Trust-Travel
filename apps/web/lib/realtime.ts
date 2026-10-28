// =====================================================================
// Client-side real-time bus.
// A single EventSource connection (shared across the whole app, ref-counted)
// subscribes to the API change stream (/api/events). Every component that owns
// data — AppContext for the shared collections, and the self-fetching views
// (platforms, invoices, payment accounts, reviews, settings, …) — registers a
// listener via `useRealtimeRefresh` and refetches when a relevant change is
// reported by ANOTHER tab / browser / role. The originating tab ignores the
// echo of its own writes. Net effect: changes reflect live everywhere, no
// page reload. See apps/api/src/lib/events.ts for the server side.
// =====================================================================

import { useEffect, useRef } from 'react';
import { API_BASE, getClientId } from './api';

export interface ChangeEvent {
  resource: string;
  action: 'create' | 'update' | 'delete';
  id?: string;
  key?: string;
  origin?: string;
  actor?: string;
  at: number;
}

type Listener = (ev: ChangeEvent) => void;

let source: EventSource | null = null;
let refCount = 0;
const listeners = new Set<Listener>();

function handle(ev: MessageEvent) {
  let data: ChangeEvent;
  try {
    data = JSON.parse(ev.data) as ChangeEvent;
  } catch {
    return;
  }
  // Ignore the echo of our own writes — this tab already has that change.
  if (data.origin && data.origin === getClientId()) return;
  for (const l of [...listeners]) {
    try {
      l(data);
    } catch {
      /* a listener threw — don't let it break the others */
    }
  }
}

function connect() {
  if (source || typeof window === 'undefined') return;
  try {
    source = new EventSource(`${API_BASE}/api/events`);
  } catch {
    source = null;
    return;
  }
  source.addEventListener('change', handle as EventListener);
  source.onmessage = handle;
  // EventSource reconnects automatically on error; nothing to do here.
}

function disconnect() {
  source?.close();
  source = null;
}

/** Low-level: register a change listener. Returns an unsubscribe function. */
export function subscribeRealtime(listener: Listener): () => void {
  listeners.add(listener);
  refCount += 1;
  connect();
  return () => {
    listeners.delete(listener);
    refCount -= 1;
    if (refCount <= 0) {
      refCount = 0;
      disconnect();
    }
  };
}

/**
 * Refetch hook: calls `onChange` (debounced) whenever another session reports a
 * change to one of `resources` (or any change when '*'). The connection is
 * shared, so using this in many components costs one stream, not one per view.
 *
 * @param resources resource path segments to watch, or '*' for all.
 * @param onChange  refetch callback — kept current via a ref, so you can pass
 *                  an inline closure without re-subscribing every render.
 * @param enabled   set false to not subscribe (e.g. before auth).
 */
export function useRealtimeRefresh(
  resources: string[] | '*',
  onChange: (ev: ChangeEvent) => void,
  { enabled = true, debounceMs = 300 }: { enabled?: boolean; debounceMs?: number } = {}
) {
  const cb = useRef(onChange);
  cb.current = onChange;

  // Stable key so the effect only re-subscribes when the watch set truly changes.
  const key = resources === '*' ? '*' : [...resources].sort().join(',');

  useEffect(() => {
    if (!enabled) return;
    const want = resources === '*' ? null : new Set(resources);
    let timer: ReturnType<typeof setTimeout> | null = null;

    const unsub = subscribeRealtime((ev) => {
      if (want && !want.has(ev.resource)) return;
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => cb.current(ev), debounceMs);
    });

    return () => {
      if (timer) clearTimeout(timer);
      unsub();
    };
    // `resources` is captured via `key`; cb via ref. Intentionally minimal deps.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, enabled, debounceMs]);
}
