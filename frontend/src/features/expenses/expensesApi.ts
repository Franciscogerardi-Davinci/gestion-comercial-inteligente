import { httpClient } from '../../api/httpClient';
import type { ApiSuccess } from '../../types/auth';
import type { Expense } from '../../types/commerce';

export interface ExpenseFilters {
  dateFrom?: string;
  dateTo?: string;
  category?: string;
}

export interface ExpenseInput {
  category: string;
  description: string;
  amount: number;
  expenseDate: string;
}

export async function getExpenses(filters: ExpenseFilters = {}) {
  const response = await httpClient.get<ApiSuccess<{ expenses: Expense[] }>>('/v1/expenses', {
    params: filters,
  });
  return response.data.data.expenses;
}

export async function createExpense(input: ExpenseInput) {
  const response = await httpClient.post<ApiSuccess<{ expense: Expense }>>('/v1/expenses', input);
  return response.data.data.expense;
}

export async function updateExpense(id: string, input: ExpenseInput) {
  const response = await httpClient.put<ApiSuccess<{ expense: Expense }>>(
    `/v1/expenses/${id}`,
    input,
  );
  return response.data.data.expense;
}

export async function deleteExpense(id: string) {
  await httpClient.delete(`/v1/expenses/${id}`);
}
