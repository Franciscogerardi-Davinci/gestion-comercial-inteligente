import type { RequestHandler } from 'express';

import { AppError } from '../../shared/errors/app-error.js';
import { sendSuccess } from '../../shared/http/api-response.js';
import { idParamsSchema } from '../../shared/schemas/common.schemas.js';
import { createProductSchema, updateProductSchema } from './products.schemas.js';
import * as productsService from './products.service.js';

function getBusinessId(request: Parameters<RequestHandler>[0]) {
  if (!request.auth) {
    throw new AppError(401, 'AUTH_REQUIRED', 'Se requiere autenticacion.');
  }
  return request.auth.businessId;
}

export const list: RequestHandler = async (request, response) => {
  const products = await productsService.listProducts(getBusinessId(request));
  sendSuccess(response, { products });
};

export const getById: RequestHandler = async (request, response) => {
  const { params } = idParamsSchema.parse({ params: request.params });
  const product = await productsService.getProduct(getBusinessId(request), params.id);
  sendSuccess(response, { product });
};

export const create: RequestHandler = async (request, response) => {
  const { body } = createProductSchema.parse({ body: request.body });
  const product = await productsService.createProduct(getBusinessId(request), body);
  sendSuccess(response, { product }, { statusCode: 201, message: 'Producto creado.' });
};

export const update: RequestHandler = async (request, response) => {
  const { params } = idParamsSchema.parse({ params: request.params });
  const { body } = updateProductSchema.parse({ body: request.body });
  const product = await productsService.updateProduct(getBusinessId(request), params.id, body);
  sendSuccess(response, { product }, { message: 'Producto actualizado.' });
};

export const remove: RequestHandler = async (request, response) => {
  const { params } = idParamsSchema.parse({ params: request.params });
  await productsService.deleteProduct(getBusinessId(request), params.id);
  sendSuccess(response, null, { message: 'Producto desactivado.' });
};
