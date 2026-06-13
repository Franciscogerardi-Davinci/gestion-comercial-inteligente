import type { RequestHandler } from 'express';

import { AppError } from '../../shared/errors/app-error.js';
import { sendSuccess } from '../../shared/http/api-response.js';
import { loginSchema, registerSchema } from './auth.schemas.js';
import * as authService from './auth.service.js';

export const register: RequestHandler = async (request, response) => {
  const { body } = registerSchema.parse({ body: request.body });
  const session = await authService.register(body);

  sendSuccess(response, session, {
    statusCode: 201,
    message: 'Usuario registrado correctamente.',
  });
};

export const login: RequestHandler = async (request, response) => {
  const { body } = loginSchema.parse({ body: request.body });
  const session = await authService.login(body);

  sendSuccess(response, session, { message: 'Inicio de sesion correcto.' });
};

export const me: RequestHandler = async (request, response) => {
  if (!request.auth) {
    throw new AppError(401, 'AUTH_REQUIRED', 'Se requiere autenticacion.');
  }

  const user = await authService.getAuthenticatedUser(request.auth.userId);
  sendSuccess(response, { user });
};

export const logout: RequestHandler = async (_request, response) => {
  sendSuccess(response, null, {
    message: 'Sesion cerrada correctamente. Elimine el token almacenado en el cliente.',
  });
};
