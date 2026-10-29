import { Router } from 'express';
import * as controller from './auth.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { asyncHandler } from '../../middleware/error.js';

export const authRouter = Router();

authRouter.post('/register', asyncHandler(controller.register));
authRouter.post('/verify-email', asyncHandler(controller.verifyEmail));
authRouter.post('/resend-code', asyncHandler(controller.resendCode));
authRouter.post('/login', asyncHandler(controller.login));
authRouter.get('/me', authenticate, asyncHandler(controller.me));
