import type { RequestHandler } from 'express';

import { AppError } from '../../shared/errors/app-error.js';
import { sendSuccess } from '../../shared/http/api-response.js';
import { createStockMovementSchema } from './stock-movements.schemas.js';
import * as stockMovementsService from './stock-movements.service.js';

function getAuth(request: Parameters<RequestHandler>[0]) {
  if (!request.auth) {
    throw new AppError(401, 'AUTH_REQUIRED', 'Se requiere autenticacion.');
  }
  return request.auth;
}

export const list: RequestHandler = async (request, response) => {
  const movements = await stockMovementsService.listStockMovements(getAuth(request).businessId);
  sendSuccess(response, { movements });
};

export const create: RequestHandler = async (request, response) => {
  const auth = getAuth(request);
  const { body } = createStockMovementSchema.parse({ body: request.body });
  const movement = await stockMovementsService.createStockMovement(
    auth.businessId,
    auth.userId,
    body,
  );
  sendSuccess(response, { movement }, { statusCode: 201, message: 'Stock actualizado.' });
};
