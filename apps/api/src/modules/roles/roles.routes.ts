// =====================================================================
// Roles catalogue endpoint.
//   GET /api/roles        -> the fixed list of role definitions
//   GET /api/roles/:key   -> a single role definition
// The catalogue is static config (see roles.data.ts); reads require auth
// since roles are only needed inside the authenticated console (e.g. the
// user-management role dropdown).
// =====================================================================

import { Router } from 'express';
import { authenticate } from '../../middleware/auth.js';
import { asyncHandler, HttpError } from '../../middleware/error.js';
import { ROLES, getRoleByKey } from './roles.data.js';

export const rolesRouter = Router();
rolesRouter.use(authenticate);

rolesRouter.get(
  '/',
  asyncHandler(async (_req, res) => {
    res.json({ ok: true, data: ROLES });
  })
);

rolesRouter.get(
  '/:key',
  asyncHandler(async (req, res) => {
    const role = getRoleByKey(req.params.key);
    if (!role) throw new HttpError(404, 'Role not found');
    res.json({ ok: true, data: role });
  })
);
