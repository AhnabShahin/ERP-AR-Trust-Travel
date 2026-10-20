import { Router } from 'express';
import type { ZodTypeAny } from 'zod';
import { authenticate } from '../middleware/auth.js';
import { asyncHandler, HttpError } from '../middleware/error.js';

/**
 * Minimal surface of a Prisma model delegate (prisma.booking, prisma.guest…).
 * Typed loosely on purpose so one factory can serve every model.
 */
export interface CrudDelegate {
  findMany(args: unknown): Promise<unknown[]>;
  findUnique(args: unknown): Promise<unknown | null>;
  create(args: unknown): Promise<unknown>;
  update(args: unknown): Promise<unknown>;
  delete(args: unknown): Promise<unknown>;
  count(args: unknown): Promise<number>;
}

export interface CrudOptions {
  /** Human-readable name used in error messages, e.g. "Guest". */
  name: string;
  delegate: CrudDelegate;
  createSchema: ZodTypeAny;
  updateSchema: ZodTypeAny;
  /** Fields matched (contains) by the `?search=` query param. */
  searchFields?: string[];
  /** Extra exact-match filters allowed as query params, e.g. ['status']. */
  filterFields?: string[];
  defaultOrderBy?: Record<string, 'asc' | 'desc'>;
  /** When true, GET routes are public (no token); writes still require auth. */
  publicRead?: boolean;
  /**
   * When true (default), create/update stamp who did it onto the row
   * (createdBy / createdByName / updatedBy / updatedByName) from the
   * authenticated user. Set false for models that don't have those columns.
   */
  audit?: boolean;
}

/**
 * Builds a standard REST router for a Prisma model:
 *   GET /        list (?search, ?skip, ?take, + any filterFields)
 *   GET /:id     fetch one
 *   POST /       create (body validated by createSchema)
 *   PATCH /:id   update (body validated by updateSchema)
 *   DELETE /:id  remove
 * Every route requires a valid token.
 */
export function createCrudRouter(opts: CrudOptions): Router {
  const {
    name,
    delegate,
    createSchema,
    updateSchema,
    searchFields = [],
    filterFields = [],
    defaultOrderBy = { createdAt: 'desc' },
    publicRead = false,
    audit = true,
  } = opts;

  // Stamp audit columns from the authenticated user. `created` also sets the
  // updated-* fields so a freshly-created row shows a last-editor immediately.
  const stampAudit = (
    data: Record<string, unknown>,
    user: { id: string; username: string } | undefined,
    kind: 'create' | 'update'
  ) => {
    if (!audit || !user) return;
    if (kind === 'create') {
      data.createdBy = user.id;
      data.createdByName = user.username;
    }
    data.updatedBy = user.id;
    data.updatedByName = user.username;
  };

  const router = Router();
  // Reads may be public (catalogue data for the website); writes never are.
  const readGuard = publicRead ? [] : [authenticate];

  router.get(
    '/',
    ...readGuard,
    asyncHandler(async (req, res) => {
      const where: Record<string, unknown> = {};

      for (const field of filterFields) {
        const value = req.query[field];
        if (typeof value === 'string' && value !== '') where[field] = value;
      }

      const search = req.query.search;
      if (typeof search === 'string' && search !== '' && searchFields.length) {
        where.OR = searchFields.map((f) => ({ [f]: { contains: search } }));
      }

      const skip = req.query.skip ? Number(req.query.skip) : 0;
      const take = Math.min(req.query.take ? Number(req.query.take) : 50, 200);

      const [data, total] = await Promise.all([
        delegate.findMany({ where, orderBy: defaultOrderBy, skip, take }),
        delegate.count({ where }),
      ]);
      res.json({ ok: true, data, meta: { total, skip, take } });
    })
  );

  router.get(
    '/:id',
    ...readGuard,
    asyncHandler(async (req, res) => {
      const record = await delegate.findUnique({ where: { id: req.params.id } });
      if (!record) throw new HttpError(404, `${name} not found`);
      res.json({ ok: true, data: record });
    })
  );

  router.post(
    '/',
    authenticate,
    asyncHandler(async (req, res) => {
      const data = createSchema.parse(req.body) as Record<string, unknown>;
      // Honour a client-supplied id so the frontend and DB stay in sync.
      const bodyId = (req.body as { id?: unknown })?.id;
      if (typeof bodyId === 'string' && bodyId) data.id = bodyId;
      stampAudit(data, req.user, 'create');
      const created = await delegate.create({ data });
      res.status(201).json({ ok: true, data: created });
    })
  );

  router.patch(
    '/:id',
    authenticate,
    asyncHandler(async (req, res) => {
      const data = updateSchema.parse(req.body) as Record<string, unknown>;
      const existing = await delegate.findUnique({ where: { id: req.params.id } });
      if (!existing) throw new HttpError(404, `${name} not found`);
      stampAudit(data, req.user, 'update');
      const updated = await delegate.update({ where: { id: req.params.id }, data });
      res.json({ ok: true, data: updated });
    })
  );

  router.delete(
    '/:id',
    authenticate,
    asyncHandler(async (req, res) => {
      const existing = await delegate.findUnique({ where: { id: req.params.id } });
      if (!existing) throw new HttpError(404, `${name} not found`);
      await delegate.delete({ where: { id: req.params.id } });
      res.json({ ok: true, data: { id: req.params.id } });
    })
  );

  return router;
}
