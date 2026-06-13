import axios from 'axios';

import type { ApiErrorResponse } from '../types/auth';

export function getApiErrorMessage(error: unknown) {
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    const data: unknown = error.response?.data;
    if (
      data &&
      typeof data === 'object' &&
      'error' in data &&
      data.error &&
      typeof data.error === 'object' &&
      'message' in data.error &&
      typeof data.error.message === 'string'
    ) {
      return data.error.message;
    }

    return 'No fue posible completar la solicitud.';
  }

  if (error instanceof Error) return error.message;

  return 'Ocurrio un error inesperado.';
}
