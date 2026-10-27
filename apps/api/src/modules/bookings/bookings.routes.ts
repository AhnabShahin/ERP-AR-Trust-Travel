import { Router } from 'express';
import * as controller from './bookings.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { asyncHandler } from '../../middleware/error.js';

export const bookingsRouter = Router();

// All booking routes require a valid token.
bookingsRouter.use(authenticate);

bookingsRouter.get('/', asyncHandler(controller.list));
bookingsRouter.get('/:id', asyncHandler(controller.get));
bookingsRouter.post('/', asyncHandler(controller.create));
bookingsRouter.patch('/:id', asyncHandler(controller.update));
bookingsRouter.delete('/:id', asyncHandler(controller.remove));

// Service / trip workflow
bookingsRouter.post('/:id/assign', asyncHandler(controller.assign));
bookingsRouter.post('/:id/transition', asyncHandler(controller.transition));
