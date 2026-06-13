import { httpClient } from '../../api/httpClient';
import type { ApiSuccess } from '../../types/auth';
import type { Product } from '../../types/inventory';

export interface ProductInput {
  categoryId?: string | null;
  name: string;
  description?: string | null;
  sku?: string | null;
  barcode?: string | null;
  salePrice: number;
  costPrice?: number | null;
  minimumStock: number;
}

export async function getProducts() {
  const response = await httpClient.get<ApiSuccess<{ products: Product[] }>>('/v1/products');
  return response.data.data.products;
}

export async function createProduct(input: ProductInput) {
  const response = await httpClient.post<ApiSuccess<{ product: Product }>>('/v1/products', input);
  return response.data.data.product;
}

export async function updateProduct(id: string, input: ProductInput) {
  const response = await httpClient.put<ApiSuccess<{ product: Product }>>(
    `/v1/products/${id}`,
    input,
  );
  return response.data.data.product;
}

export async function deleteProduct(id: string) {
  await httpClient.delete(`/v1/products/${id}`);
}
