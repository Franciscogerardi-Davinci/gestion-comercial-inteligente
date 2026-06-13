import type { RequestHandler } from 'express';

import { AppError } from '../shared/errors/app-error.js';
import { verifyAuthToken } from '../shared/utils/jwt.js';

export const requireAuth: RequestHandler = (request, _response, next) => {
  const authorization = request.header('authorization');

  if (!authorization?.startsWith('Bearer ')) {
    throw new AppError(401, 'AUTH_REQUIRED', 'Se requiere autenticacion.');
  }

  const token = authorization.slice('Bearer '.length).trim();

  if (!token) {
    throw new AppError(401, 'AUTH_REQUIRED', 'Se requiere autenticacion.');
  }

  const payload = verifyAuthToken(token);
  request.auth = {
    userId: payload.sub,
    businessId: payload.businessId,
    role: payload.role,
  };

  next();
};
