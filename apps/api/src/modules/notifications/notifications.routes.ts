// =====================================================================
// Notifications — real-time alert feed backed by MySQL.
// Standard list/create/update/delete (via the generic CRUD factory) plus two
// bulk operations the UI needs:
//   PATCH  /api/notifications/read-all   -> mark every unread as read
//   DELETE /api/notifications/clear-all  -> remove every notification
// The bulk routes are declared BEFORE the CRUD router so they aren't captured
// by its `/:id` handlers (which would treat "read-all" / "clear-all" as ids).
// =====================================================================

import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../config/prisma.js';
import { authenticate } from '../../middleware/auth.js';
import { asyncHandler } from '../../middleware/error.js';
import { createCrudRouter, type CrudDelegate } from '../../lib/crud.factory.js';

const str = z.string();
const bool = z.boolean();

// Create schema; update is a partial of it so unknown keys are stripped.
const createSchema = z.object({
  title: str,
  titleAr: str.optional(),
  message: str,
  messageAr: str.optional(),
  time: str.optional(),
  type: str, // flight | driver | cash | vip | booking | hotel
  read: bool.optional(),
  actionLabel: str.optional(),
});

export const notificationsRouter = Router();

// Mark all unread notifications as read.
notificationsRouter.patch(
  '/read-all',
  authenticate,
  asyncHandler(async (_req, res) => {
    const result = await prisma.notification.updateMany({
      where: { read: false },
      data: { read: true },
    });
    res.json({ ok: true, data: { updated: result.count } });
  })
);

// Delete every notification (clear the feed).
notificationsRouter.delete(
  '/clear-all',
  authenticate,
  asyncHandler(async (_req, res) => {
    const result = await prisma.notification.deleteMany({});
    res.json({ ok: true, data: { deleted: result.count } });
  })
);

// Standard REST CRUD for the rest (GET /, GET /:id, POST /, PATCH /:id, DELETE /:id).
notificationsRouter.use(
  createCrudRouter({
    name: 'Notification',
    delegate: prisma.notification as unknown as CrudDelegate,
    createSchema,
    updateSchema: createSchema.partial(),
    filterFields: ['type'],
    defaultOrderBy: { createdAt: 'desc' },
  })
);
