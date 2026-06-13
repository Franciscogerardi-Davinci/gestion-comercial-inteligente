import axios from 'axios';

import type { ApiErrorResponse } from '../types/auth';

export function getApiErrorMessage(error: unknown) {
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    return error.response?.data.error.message ?? 'No fue posible comunicarse con el servidor.';
  }

  return 'Ocurrio un error inesperado.';
}
