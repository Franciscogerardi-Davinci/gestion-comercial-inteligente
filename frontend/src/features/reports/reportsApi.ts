import { httpClient } from '../../api/httpClient';
import type { ApiSuccess } from '../../types/auth';
import type { ExpensesReport, ProfitReport, SalesReport } from '../../types/reports';

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

export async function getProfitReport(filters: ReportFilters) {
  const response = await httpClient.get<ApiSuccess<{ report: ProfitReport }>>(
    '/v1/reports/profit',
    { params: filters },
  );
  return response.data.data.report;
}

export async function downloadReport(
  type: 'sales' | 'expenses',
  format: 'pdf' | 'excel',
  filters: ReportFilters,
) {
  const response = await httpClient.get<Blob>(`/v1/reports/${type}/export/${format}`, {
    params: filters,
    responseType: 'blob',
  });
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
