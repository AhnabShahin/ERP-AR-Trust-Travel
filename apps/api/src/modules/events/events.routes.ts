// =====================================================================
// GET /api/events — Server-Sent Events stream, plus the broadcast middleware
// that feeds it. Both live in THIS module (alongside the client registry) so
// they share one and the same `clients` set: importing the bus into app.ts
// separately can yield a duplicate module instance under the tsx/esbuild ESM
// loader, which would leave the publisher writing to an empty set. Keeping the
// publisher and the subscriber in one file removes that hazard entirely.
//
// The stream carries only "collection X changed" signals, never row data, so
// no token is required to listen. A 25s heartbeat keeps the socket alive.
// =====================================================================

import { Router, type RequestHandler } from 'express';
import { addClient, removeClient, publish, type ChangeAction } from '../../lib/events.js';

export const eventsRouter = Router();

eventsRouter.get('/', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
    // Disable proxy buffering (nginx) so events flush immediately.
    'X-Accel-Buffering': 'no',
  });
  // Flush headers right away so the browser marks the connection open.
  res.write(': connected\n\n');
  res.flushHeaders?.();

  addClient(res);

  const heartbeat = setInterval(() => {
    try {
      res.write(': ping\n\n');
    } catch {
      /* socket gone — close handler cleans up */
    }
  }, 25_000);

  req.on('close', () => {
    clearInterval(heartbeat);
    removeClient(res);
    res.end();
  });
});

/**
 * After any successful mutating request, publish a change event so every
 * connected dashboard refetches that collection. One hook covers every current
 * and future module (CRUD factory, settings, site-content, staff, users, …)
 * with no per-module wiring. Mounted in app.ts before the feature routes.
 */
export const changeBroadcast: RequestHandler = (req, res, next) => {
  const method = req.method;
  if (method === 'GET' || method === 'HEAD' || method === 'OPTIONS') return next();

  // Snapshot everything we need NOW, at entry. Express rewrites req.url (and so
  // req.path) as it dispatches the request into the mounted sub-routers, and by
  // the time the 'finish' event fires those are no longer the original path —
  // reading them there would make the resource regex miss every write.
  const path = req.originalUrl.split('?')[0] || req.path;
  const clientId = req.header('X-Client-Id') || undefined;
  const bodyId = (req.body as { id?: unknown } | undefined)?.id;

  res.on('finish', () => {
    if (res.statusCode >= 400) return;
    const m = path.match(/^\/api\/([^/]+)(?:\/(.*))?$/);
    if (!m) return;
    const resource = m[1];
    // Auth (login/token), uploads (binary blobs), and the stream itself are
    // not collections dashboards mirror — skip them.
    if (resource === 'events' || resource === 'auth' || resource === 'uploads') return;

    const rest = m[2] || '';
    const action: ChangeAction =
      method === 'POST' ? 'create' : method === 'DELETE' ? 'delete' : 'update';
    publish({
      resource,
      action,
      id: typeof bodyId === 'string' && bodyId ? bodyId : rest || undefined,
      key: resource === 'settings' ? rest || undefined : undefined,
      origin: clientId,
      // req.user is set by the auth middleware during routing; the req object
      // identity is stable, so reading it here (after auth ran) is correct.
      actor: req.user?.username,
      at: Date.now(),
    });
  });

  next();
};
