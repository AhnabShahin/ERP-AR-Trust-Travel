import { Router } from 'express';
import * as controller from './reports.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { asyncHandler } from '../../middleware/error.js';

export const reportsRouter = Router();

// All report routes require a valid token (financial data).
reportsRouter.use(authenticate);

reportsRouter.get('/overview', asyncHandler(controller.overview));
