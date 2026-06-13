import type { RequestHandler } from 'express';

import { AppError } from '../../shared/errors/app-error.js';
import { sendSuccess } from '../../shared/http/api-response.js';
import { idParamsSchema } from '../../shared/schemas/common.schemas.js';
import {
  createExpenseSchema,
  listExpensesSchema,
  updateExpenseSchema,
} from './expenses.schemas.js';
import * as expensesService from './expenses.service.js';

function getAuth(request: Parameters<RequestHandler>[0]) {
  if (!request.auth) {
    throw new AppError(401, 'AUTH_REQUIRED', 'Se requiere autenticacion.');
  }
  return request.auth;
}

export const list: RequestHandler = async (request, response) => {
  const { query } = listExpensesSchema.parse({ query: request.query });
  const expenses = await expensesService.listExpenses(getAuth(request).businessId, query);
  sendSuccess(response, { expenses });
};

export const getById: RequestHandler = async (request, response) => {
  const { params } = idParamsSchema.parse({ params: request.params });
  const expense = await expensesService.getExpense(getAuth(request).businessId, params.id);
  sendSuccess(response, { expense });
};

export const create: RequestHandler = async (request, response) => {
  const auth = getAuth(request);
  const { body } = createExpenseSchema.parse({ body: request.body });
  const expense = await expensesService.createExpense(auth.businessId, auth.userId, body);
  sendSuccess(response, { expense }, { statusCode: 201, message: 'Gasto creado.' });
};

export const update: RequestHandler = async (request, response) => {
  const { params } = idParamsSchema.parse({ params: request.params });
  const { body } = updateExpenseSchema.parse({ body: request.body });
  const expense = await expensesService.updateExpense(getAuth(request).businessId, params.id, body);
  sendSuccess(response, { expense }, { message: 'Gasto actualizado.' });
};

export const remove: RequestHandler = async (request, response) => {
  const { params } = idParamsSchema.parse({ params: request.params });
  await expensesService.deleteExpense(getAuth(request).businessId, params.id);
  sendSuccess(response, null, { message: 'Gasto eliminado.' });
};
