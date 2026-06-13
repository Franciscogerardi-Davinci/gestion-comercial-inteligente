import type { RequestHandler } from 'express';

import { AppError } from '../../shared/errors/app-error.js';
import { sendSuccess } from '../../shared/http/api-response.js';
import { getDashboardSummary } from './dashboard.service.js';

export const summary: RequestHandler = async (request, response) => {
  if (!request.auth) {
    throw new AppError(401, 'AUTH_REQUIRED', 'Se requiere autenticacion.');
  }

  const dashboard = await getDashboardSummary(request.auth.businessId);
  sendSuccess(response, { dashboard });
};
