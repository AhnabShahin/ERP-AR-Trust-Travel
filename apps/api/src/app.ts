import cors from 'cors';
import express from 'express';
import { env } from './config/env.js';
import { errorHandler, notFound } from './middleware/error.js';
import { authRouter } from './modules/auth/auth.routes.js';
import { bookingsRouter } from './modules/bookings/bookings.routes.js';
import { registerResourceRoutes, resourcePaths } from './modules/resources.js';
import { settingsRouter } from './modules/settings/settings.routes.js';
import { usersRouter } from './modules/users/users.routes.js';

export function createApp() {
  const app = express();

  app.use(cors({ origin: env.corsOrigin, credentials: true }));
  app.use(express.json({ limit: '2mb' }));

  // Health check for uptime monitors / Hostinger.
  app.get('/health', (_req, res) => res.json({ ok: true, data: 'healthy' }));

  // API index — lists the available resource collections.
  app.get('/api', (_req, res) =>
    res.json({ ok: true, data: { auth: ['login', 'register', 'me'], bookings: true, resources: resourcePaths } })
  );

  // Hand-written feature modules.
  app.use('/api/auth', authRouter);
  app.use('/api/users', usersRouter);
  app.use('/api/bookings', bookingsRouter);

  // Generated CRUD modules (fleet, drivers, guests, hotels, finance, …).
  registerResourceRoutes(app);

  // Key/value settings (exchange rates, shift drawer, config…).
  app.use('/api/settings', settingsRouter);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
