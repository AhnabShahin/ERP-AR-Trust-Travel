// =====================================================================
// Generic key/value settings — for singletons & config that don't fit the
// list-CRUD pattern (exchange rates, shift drawer, package categories, the
// category→service map, …). Stored in the AppSetting table as JSON.
//   GET /api/settings/:key   -> the stored value (or null)
//   PUT /api/settings/:key   -> upsert { value }
// =====================================================================

import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../config/prisma.js';
import { authenticate } from '../../middleware/auth.js';
import { asyncHandler } from '../../middleware/error.js';

export const settingsRouter = Router();
settingsRouter.use(authenticate);

settingsRouter.get(
  '/:key',
  asyncHandler(async (req, res) => {
    const row = await prisma.appSetting.findUnique({ where: { key: req.params.key } });
    res.json({ ok: true, data: row ? row.value : null });
  })
);

const putSchema = z.object({ value: z.unknown() });

settingsRouter.put(
  '/:key',
  asyncHandler(async (req, res) => {
    const { value } = putSchema.parse(req.body);
    const row = await prisma.appSetting.upsert({
      where: { key: req.params.key },
      create: { key: req.params.key, value: value as never },
      update: { value: value as never },
    });
    res.json({ ok: true, data: row.value });
  })
);
