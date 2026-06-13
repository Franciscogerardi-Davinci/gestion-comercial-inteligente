import type { RequestHandler } from 'express';

import { prisma } from '../infrastructure/database/prisma.js';
import { AppError } from '../shared/errors/app-error.js';
import { verifyAuthToken } from '../shared/utils/jwt.js';

export const requireAuth: RequestHandler = async (request, _response, next) => {
  const authorization = request.header('authorization');

  if (!authorization?.startsWith('Bearer ')) {
    throw new AppError(401, 'AUTH_REQUIRED', 'Se requiere autenticacion.');
  }

  const token = authorization.slice('Bearer '.length).trim();

  if (!token) {
    throw new AppError(401, 'AUTH_REQUIRED', 'Se requiere autenticacion.');
  }

  const payload = verifyAuthToken(token);
  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    select: {
      id: true,
      businessId: true,
      role: true,
      isActive: true,
      business: { select: { isActive: true } },
    },
  });

  if (!user?.isActive || !user.business.isActive) {
    throw new AppError(401, 'INVALID_SESSION', 'La sesión ya no es válida.');
  }

  request.auth = {
    userId: user.id,
    businessId: user.businessId,
    role: user.role,
  };

  next();
};
