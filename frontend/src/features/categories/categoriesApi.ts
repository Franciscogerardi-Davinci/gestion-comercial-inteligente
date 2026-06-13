import { httpClient } from '../../api/httpClient';
import type { ApiSuccess } from '../../types/auth';
import type { Category } from '../../types/inventory';

export interface CategoryInput {
  name: string;
  description?: string | null;
}

export async function getCategories() {
  const response = await httpClient.get<ApiSuccess<{ categories: Category[] }>>('/v1/categories');
  return response.data.data.categories;
}

export async function createCategory(input: CategoryInput) {
  const response = await httpClient.post<ApiSuccess<{ category: Category }>>(
    '/v1/categories',
    input,
  );
  return response.data.data.category;
}

export async function updateCategory(id: string, input: CategoryInput) {
  const response = await httpClient.put<ApiSuccess<{ category: Category }>>(
    `/v1/categories/${id}`,
    input,
  );
  return response.data.data.category;
}

export async function deleteCategory(id: string) {
  await httpClient.delete(`/v1/categories/${id}`);
}
