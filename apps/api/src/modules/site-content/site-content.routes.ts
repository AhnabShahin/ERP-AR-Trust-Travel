// =====================================================================
// Site content — the public website CMS store. Every editable piece of text /
// content on the public pages is a key here, with a JSON value (string, block
// of text, image ref, or structured list). Reads are PUBLIC so the website can
// render for anyone; writes require a valid token (dashboard editor).
//
//   GET    /api/site-content          (public) -> { key: value, ... } map
//   GET    /api/site-content/list     (public) -> full rows (key,value,group,…)
//   GET    /api/site-content/:key     (public) -> one value (or null)
//   PUT    /api/site-content/:key     (auth)   -> upsert { value, group?, label?, kind?, sortOrder? }
//   POST   /api/site-content/bulk     (auth)   -> upsert many { items: [{ key, value, ... }] }
//   DELETE /api/site-content/:key     (auth)
// =====================================================================

import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../config/prisma.js';
import { authenticate } from '../../middleware/auth.js';
import { asyncHandler } from '../../middleware/error.js';

export const siteContentRouter = Router();

// ---- public reads ----------------------------------------------------------

// Flat { key: value } map — what the website provider consumes.
siteContentRouter.get(
  '/',
  asyncHandler(async (_req, res) => {
    const rows = await prisma.siteContent.findMany({ orderBy: { sortOrder: 'asc' } });
    const map: Record<string, unknown> = {};
    for (const r of rows) map[r.key] = r.value;
    res.json({ ok: true, data: map });
  })
);

// Full rows with editor metadata — what the dashboard editor consumes.
siteContentRouter.get(
  '/list',
  asyncHandler(async (_req, res) => {
    const rows = await prisma.siteContent.findMany({ orderBy: [{ group: 'asc' }, { sortOrder: 'asc' }] });
    res.json({ ok: true, data: rows });
  })
);

siteContentRouter.get(
  '/:key',
  asyncHandler(async (req, res) => {
    const row = await prisma.siteContent.findUnique({ where: { key: req.params.key } });
    res.json({ ok: true, data: row ? row.value : null });
  })
);

// ---- authenticated writes --------------------------------------------------

const upsertSchema = z.object({
  value: z.unknown(),
  group: z.string().optional(),
  label: z.string().optional(),
  kind: z.string().optional(),
  sortOrder: z.number().int().optional(),
});

function stamp(req: { user?: { id: string; username: string } }) {
  return req.user ? { updatedBy: req.user.id, updatedByName: req.user.username } : {};
}

siteContentRouter.put(
  '/:key',
  authenticate,
  asyncHandler(async (req, res) => {
    const body = upsertSchema.parse(req.body);
    const base = {
      value: body.value as never,
      group: body.group,
      label: body.label,
      kind: body.kind,
      sortOrder: body.sortOrder,
      ...stamp(req),
    };
    const row = await prisma.siteContent.upsert({
      where: { key: req.params.key },
      create: { key: req.params.key, ...base },
      update: base,
    });
    res.json({ ok: true, data: row });
  })
);

const bulkSchema = z.object({
  items: z.array(
    z.object({
      key: z.string().min(1),
      value: z.unknown(),
      group: z.string().optional(),
      label: z.string().optional(),
      kind: z.string().optional(),
      sortOrder: z.number().int().optional(),
    })
  ),
});

siteContentRouter.post(
  '/bulk',
  authenticate,
  asyncHandler(async (req, res) => {
    const { items } = bulkSchema.parse(req.body);
    const audit = stamp(req);
    await prisma.$transaction(
      items.map((it) => {
        const base = {
          value: it.value as never,
          group: it.group,
          label: it.label,
          kind: it.kind,
          sortOrder: it.sortOrder,
          ...audit,
        };
        return prisma.siteContent.upsert({
          where: { key: it.key },
          create: { key: it.key, ...base },
          update: base,
        });
      })
    );
    res.json({ ok: true, data: { count: items.length } });
  })
);

siteContentRouter.delete(
  '/:key',
  authenticate,
  asyncHandler(async (req, res) => {
    await prisma.siteContent.deleteMany({ where: { key: req.params.key } });
    res.json({ ok: true, data: { key: req.params.key } });
  })
);
