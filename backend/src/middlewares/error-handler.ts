import { Prisma } from '@prisma/client';
import type { ErrorRequestHandler } from 'express';
import jsonwebtoken from 'jsonwebtoken';
import { ZodError } from 'zod';

import { AppError } from '../shared/errors/app-error.js';
import type { ApiErrorBody } from '../shared/types/api.js';

export const errorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
  void _next;
  let appError: AppError;

  if (error instanceof AppError) {
    appError = error;
  } else if (error instanceof ZodError) {
    appError = new AppError(
      400,
      'VALIDATION_ERROR',
      'Los datos enviados no son validos.',
      error.issues,
    );
  } else if (error instanceof jsonwebtoken.TokenExpiredError) {
    appError = new AppError(401, 'TOKEN_EXPIRED', 'La sesión ha expirado.');
  } else if (error instanceof jsonwebtoken.JsonWebTokenError) {
    appError = new AppError(401, 'INVALID_TOKEN', 'El token de autenticacion no es valido.');
  } else if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
    appError = new AppError(409, 'RESOURCE_CONFLICT', 'Ya existe un registro con esos datos.');
  } else {
    console.error(error);
    appError = new AppError(500, 'INTERNAL_ERROR', 'Ocurrio un error interno.');
  }

  const body: ApiErrorBody = {
    success: false,
    error: {
      code: appError.code,
      message: appError.message,
      ...(appError.details ? { details: appError.details } : {}),
    },
  };

  response.status(appError.statusCode).json(body);
};
