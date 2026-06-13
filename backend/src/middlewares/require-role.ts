import type { UserRole } from '@prisma/client';
import type { RequestHandler } from 'express';

import { AppError } from '../shared/errors/app-error.js';

export function requireRole(...allowedRoles: UserRole[]): RequestHandler {
  return (request, _response, next) => {
    if (!request.auth) {
      throw new AppError(401, 'AUTH_REQUIRED', 'Se requiere autenticacion.');
    }

    if (!allowedRoles.includes(request.auth.role)) {
      throw new AppError(403, 'FORBIDDEN', 'No tiene permisos para realizar esta accion.');
    }

    next();
  };
}
