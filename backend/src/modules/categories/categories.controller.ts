import type { RequestHandler } from 'express';

import { AppError } from '../../shared/errors/app-error.js';
import { sendSuccess } from '../../shared/http/api-response.js';
import { idParamsSchema } from '../../shared/schemas/common.schemas.js';
import { createCategorySchema, updateCategorySchema } from './categories.schemas.js';
import * as categoriesService from './categories.service.js';

function getBusinessId(request: Parameters<RequestHandler>[0]) {
  if (!request.auth) {
    throw new AppError(401, 'AUTH_REQUIRED', 'Se requiere autenticacion.');
  }
  return request.auth.businessId;
}

export const list: RequestHandler = async (request, response) => {
  const categories = await categoriesService.listCategories(getBusinessId(request));
  sendSuccess(response, { categories });
};

export const create: RequestHandler = async (request, response) => {
  const { body } = createCategorySchema.parse({ body: request.body });
  const category = await categoriesService.createCategory(getBusinessId(request), body);
  sendSuccess(response, { category }, { statusCode: 201, message: 'Categoria creada.' });
};

export const update: RequestHandler = async (request, response) => {
  const { params } = idParamsSchema.parse({ params: request.params });
  const { body } = updateCategorySchema.parse({ body: request.body });
  const category = await categoriesService.updateCategory(getBusinessId(request), params.id, body);
  sendSuccess(response, { category }, { message: 'Categoria actualizada.' });
};

export const remove: RequestHandler = async (request, response) => {
  const { params } = idParamsSchema.parse({ params: request.params });
  await categoriesService.deleteCategory(getBusinessId(request), params.id);
  sendSuccess(response, null, { message: 'Categoria desactivada.' });
};
