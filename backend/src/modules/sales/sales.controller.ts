import type { RequestHandler } from 'express';

import { AppError } from '../../shared/errors/app-error.js';
import { sendSuccess } from '../../shared/http/api-response.js';
import { idParamsSchema } from '../../shared/schemas/common.schemas.js';
import { createSaleSchema, listSalesSchema } from './sales.schemas.js';
import * as salesService from './sales.service.js';

function getAuth(request: Parameters<RequestHandler>[0]) {
  if (!request.auth) {
    throw new AppError(401, 'AUTH_REQUIRED', 'Se requiere autenticacion.');
  }
  return request.auth;
}

export const list: RequestHandler = async (request, response) => {
  const { query } = listSalesSchema.parse({ query: request.query });
  const sales = await salesService.listSales(getAuth(request).businessId, query);
  sendSuccess(response, { sales });
};

export const getById: RequestHandler = async (request, response) => {
  const { params } = idParamsSchema.parse({ params: request.params });
  const sale = await salesService.getSale(getAuth(request).businessId, params.id);
  sendSuccess(response, { sale });
};

export const create: RequestHandler = async (request, response) => {
  const auth = getAuth(request);
  const { body } = createSaleSchema.parse({ body: request.body });
  const sale = await salesService.createSale(auth.businessId, auth.userId, body);
  sendSuccess(response, { sale }, { statusCode: 201, message: 'Venta confirmada.' });
};

export const cancel: RequestHandler = async (request, response) => {
  const auth = getAuth(request);
  const { params } = idParamsSchema.parse({ params: request.params });
  const sale = await salesService.cancelSale(auth.businessId, auth.userId, params.id);
  sendSuccess(response, { sale }, { message: 'Venta anulada y stock restaurado.' });
};
