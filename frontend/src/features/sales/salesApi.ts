import { httpClient } from '../../api/httpClient';
import type { ApiSuccess } from '../../types/auth';
import type { Sale, SaleListItem, SaleStatus } from '../../types/commerce';

export interface SaleFilters {
  dateFrom?: string;
  dateTo?: string;
  status?: SaleStatus | '';
}

export interface CreateSaleInput {
  items: Array<{ productId: string; quantity: number }>;
  discount: number;
  notes?: string | null;
}

export async function getSales(filters: SaleFilters = {}) {
  const response = await httpClient.get<ApiSuccess<{ sales: SaleListItem[] }>>('/v1/sales', {
    params: filters,
  });
  return response.data.data.sales;
}

export async function getSale(id: string) {
  const response = await httpClient.get<ApiSuccess<{ sale: Sale }>>(`/v1/sales/${id}`);
  return response.data.data.sale;
}

export async function createSale(input: CreateSaleInput) {
  const response = await httpClient.post<ApiSuccess<{ sale: Sale }>>('/v1/sales', input);
  return response.data.data.sale;
}

export async function cancelSale(id: string) {
  const response = await httpClient.post<ApiSuccess<{ sale: Sale }>>(`/v1/sales/${id}/cancel`);
  return response.data.data.sale;
}
