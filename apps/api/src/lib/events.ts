// =====================================================================
// Real-time change bus (Server-Sent Events).
// Every mutating API request (POST / PATCH / PUT / DELETE that succeeds)
// publishes a lightweight {resource, action, …} event here; it is fanned out
// to every connected dashboard over an open SSE stream (/api/events). Clients
// then refetch the affected data, so a change made in one tab / browser / role
// reflects live in all the others without a page reload.
//
// Events carry NO row payloads — only which collection changed and by whom —
// so the open stream never leaks business data; clients pull the real rows
// through the normal authenticated endpoints.
// =====================================================================

import type { Response } from 'express';

export type ChangeAction = 'create' | 'update' | 'delete';

export interface ChangeEvent {
  /** Resource path segment, e.g. 'bookings', 'settings', 'site-content'. */
  resource: string;
  action: ChangeAction;
  /** Affected row id, when known (best-effort). */
  id?: string;
  /** For settings writes: the settings key (/api/settings/:key). */
  key?: string;
  /** Client id of the writer, so its own tab can ignore the echo. */
  origin?: string;
  /** Username of the actor, for "updated by …" UX. */
  actor?: string;
  at: number;
}

const clients = new Set<Response>();

export function addClient(res: Response) {
  clients.add(res);
}

export function removeClient(res: Response) {
  clients.delete(res);
}

export function clientCount() {
  return clients.size;
}

/** Fan a change event out to every connected SSE client. */
export function publish(event: ChangeEvent) {
  if (clients.size === 0) return;
  const payload = `event: change\ndata: ${JSON.stringify(event)}\n\n`;
  for (const res of clients) {
    try {
      res.write(payload);
    } catch {
      // A dead socket — drop it; the 'close' handler usually beats us to it.
      clients.delete(res);
    }
  }
}
