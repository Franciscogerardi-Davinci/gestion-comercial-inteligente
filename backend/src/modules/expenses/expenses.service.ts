import { prisma } from '../../infrastructure/database/prisma.js';
import { AppError } from '../../shared/errors/app-error.js';
import type { ExpenseInput, ListExpensesInput } from './expenses.schemas.js';

const expenseSelect = {
  id: true,
  category: true,
  description: true,
  amount: true,
  expenseDate: true,
  createdAt: true,
  updatedAt: true,
  user: { select: { id: true, firstName: true, lastName: true } },
} as const;

function parseExpenseDate(date: string) {
  return new Date(`${date}T00:00:00.000Z`);
}

export function listExpenses(businessId: string, filters: ListExpensesInput) {
  return prisma.expense.findMany({
    where: {
      businessId,
      isActive: true,
      ...(filters.category
        ? { category: { contains: filters.category, mode: 'insensitive' } }
        : {}),
      ...(filters.dateFrom || filters.dateTo
        ? {
            expenseDate: {
              ...(filters.dateFrom ? { gte: parseExpenseDate(filters.dateFrom) } : {}),
              ...(filters.dateTo ? { lte: parseExpenseDate(filters.dateTo) } : {}),
            },
          }
        : {}),
    },
    orderBy: [{ expenseDate: 'desc' }, { createdAt: 'desc' }],
    take: 500,
    select: expenseSelect,
  });
}

export async function getExpense(businessId: string, id: string) {
  const expense = await prisma.expense.findFirst({
    where: { id, businessId, isActive: true },
    select: expenseSelect,
  });

  if (!expense) {
    throw new AppError(404, 'EXPENSE_NOT_FOUND', 'El gasto no existe.');
  }

  return expense;
}

export function createExpense(businessId: string, userId: string, input: ExpenseInput) {
  return prisma.expense.create({
    data: {
      businessId,
      userId,
      category: input.category,
      description: input.description,
      amount: input.amount,
      expenseDate: parseExpenseDate(input.expenseDate),
    },
    select: expenseSelect,
  });
}

export async function updateExpense(businessId: string, id: string, input: ExpenseInput) {
  const result = await prisma.expense.updateMany({
    where: { id, businessId, isActive: true },
    data: {
      category: input.category,
      description: input.description,
      amount: input.amount,
      expenseDate: parseExpenseDate(input.expenseDate),
    },
  });

  if (result.count === 0) {
    throw new AppError(404, 'EXPENSE_NOT_FOUND', 'El gasto no existe.');
  }

  return getExpense(businessId, id);
}

export async function deleteExpense(businessId: string, id: string) {
  const result = await prisma.expense.updateMany({
    where: { id, businessId, isActive: true },
    data: { isActive: false },
  });

  if (result.count === 0) {
    throw new AppError(404, 'EXPENSE_NOT_FOUND', 'El gasto no existe.');
  }
}
