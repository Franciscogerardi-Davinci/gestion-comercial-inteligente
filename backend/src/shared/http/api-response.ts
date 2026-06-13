import type { Response } from 'express';

import type { ApiSuccess } from '../types/api.js';

export function sendSuccess<T>(
  response: Response,
  data: T,
  options: { statusCode?: number; message?: string } = {},
) {
  const body: ApiSuccess<T> = {
    success: true,
    data,
    ...(options.message ? { message: options.message } : {}),
  };

  return response.status(options.statusCode ?? 200).json(body);
}
