import cors from 'cors';
import express from 'express';
import { env } from './config/env.js';
import { errorHandler, notFound } from './middleware/error.js';
import { authRouter } from './modules/auth/auth.routes.js';
import { bookingsRouter } from './modules/bookings/bookings.routes.js';
import { invoicesRouter } from './modules/invoices/invoices.routes.js';
import { reportsRouter } from './modules/reports/reports.routes.js';
import { notificationsRouter } from './modules/notifications/notifications.routes.js';
import { registerResourceRoutes, resourcePaths } from './modules/resources.js';
import { rolesRouter } from './modules/roles/roles.routes.js';
import { staffRouter } from './modules/staff/staff.routes.js';
import { settingsRouter } from './modules/settings/settings.routes.js';
import { siteContentRouter } from './modules/site-content/site-content.routes.js';
import { uploadsRouter } from './modules/uploads/uploads.routes.js';
import { usersRouter } from './modules/users/users.routes.js';
import { eventsRouter, changeBroadcast } from './modules/events/events.routes.js';

export function createApp() {
  const app = express();

  app.use(cors({ origin: env.corsOrigin, credentials: true }));
  // 16mb to accommodate base64 image uploads (optimized again server-side).
  app.use(express.json({ limit: '16mb' }));

  // Health check for uptime monitors / Hostinger.
  app.get('/health', (_req, res) => res.json({ ok: true, data: 'healthy' }));

  // Real-time change stream (clients subscribe here; see lib/events.ts).
  app.use('/api/events', eventsRouter);

  // Broadcast middleware (defined alongside the SSE route so they share one
  // client registry). Must run before the feature routes.
  app.use(changeBroadcast);

  // API index — lists the available resource collections.
  app.get('/api', (_req, res) =>
    res.json({ ok: true, data: { auth: ['login', 'register', 'me'], roles: true, bookings: true, resources: resourcePaths } })
  );

  // Hand-written feature modules.
  app.use('/api/auth', authRouter);
  app.use('/api/users', usersRouter);
  app.use('/api/roles', rolesRouter);
  app.use('/api/staff', staffRouter);
  app.use('/api/bookings', bookingsRouter);
  // Invoices (auto number + public share token, totals, payment ledger). Its
  // GET /public/:token route is open; all other routes require auth.
  app.use('/api/invoices', invoicesRouter);
  // Read-only reporting aggregation over the existing tables.
  app.use('/api/reports', reportsRouter);
  // Notifications feed (bulk read-all / clear-all + CRUD). Mounted before the
  // generated resources so its custom bulk routes take precedence.
  app.use('/api/notifications', notificationsRouter);

  // Generated CRUD modules (fleet, drivers, guests, hotels, finance, …).
  registerResourceRoutes(app);

  // Key/value settings (exchange rates, shift drawer, config…).
  app.use('/api/settings', settingsRouter);

  // Public website CMS content (hero text, sections, contact, footer, …).
  app.use('/api/site-content', siteContentRouter);

  // Image uploads (optimized, stored on disk under UPLOAD_DIR, host-less refs).
  app.use('/api/uploads', uploadsRouter);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
