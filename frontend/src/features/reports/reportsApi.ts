import axios from 'axios';

import { httpClient } from '../../api/httpClient';
import type { ApiErrorResponse, ApiSuccess } from '../../types/auth';
import type { ExpensesReport, SalesReport } from '../../types/reports';

export interface ReportFilters {
  dateFrom: string;
  dateTo: string;
}

export async function getSalesReport(filters: ReportFilters) {
  const response = await httpClient.get<ApiSuccess<{ report: SalesReport }>>('/v1/reports/sales', {
    params: filters,
  });
  return response.data.data.report;
}

export async function getExpensesReport(filters: ReportFilters) {
  const response = await httpClient.get<ApiSuccess<{ report: ExpensesReport }>>(
    '/v1/reports/expenses',
    { params: filters },
  );
  return response.data.data.report;
}

export async function downloadReport(
  type: 'sales' | 'expenses',
  format: 'pdf' | 'excel',
  filters: ReportFilters,
) {
  let response;
  try {
    response = await httpClient.get<Blob>(`/v1/reports/${type}/export/${format}`, {
      params: filters,
      responseType: 'blob',
    });
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.data instanceof Blob) {
      try {
        const body = JSON.parse(await error.response.data.text()) as ApiErrorResponse;
        throw new Error(body.error.message, { cause: error });
      } catch (parseError) {
        if (parseError instanceof SyntaxError) throw error;
        throw parseError;
      }
    }
    throw error;
  }

  const extension = format === 'excel' ? 'xlsx' : 'pdf';
  const url = URL.createObjectURL(response.data);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${type}-${filters.dateFrom}-${filters.dateTo}.${extension}`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
