import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';

import { requireAuth } from '../../middlewares/require-auth.js';
import type { ApiErrorBody } from '../../shared/types/api.js';
import * as authController from './auth.controller.js';

export const authRouter = Router();

const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  handler: (_request, response) => {
    const body: ApiErrorBody = {
      success: false,
      error: {
        code: 'TOO_MANY_AUTH_ATTEMPTS',
        message: 'Demasiados intentos. Espere unos minutos antes de volver a intentar.',
      },
    };
    response.status(429).json(body);
  },
});

authRouter.post('/register', authRateLimit, authController.register);
authRouter.post('/login', authRateLimit, authController.login);
authRouter.get('/me', requireAuth, authController.me);
authRouter.post('/logout', requireAuth, authController.logout);
