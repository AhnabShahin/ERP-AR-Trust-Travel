import { Router } from 'express';
import * as controller from './invoices.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { asyncHandler } from '../../middleware/error.js';

export const invoicesRouter = Router();

// Public, token-based read for the shareable /invoice/<token> page. Declared
// BEFORE the authenticate guard so it stays open (no token required).
invoicesRouter.get('/public/:token', asyncHandler(controller.getPublic));

// Everything else requires a valid session token.
invoicesRouter.use(authenticate);

invoicesRouter.get('/', asyncHandler(controller.list));
invoicesRouter.get('/:id', asyncHandler(controller.get));
invoicesRouter.post('/', asyncHandler(controller.create));
invoicesRouter.post('/:id/payments', asyncHandler(controller.addPayment));
invoicesRouter.patch('/:id', asyncHandler(controller.update));
invoicesRouter.delete('/:id', asyncHandler(controller.remove));
