import { z } from 'zod';

const expenseBodySchema = z.object({
  category: z.string().trim().min(2).max(100),
  description: z.string().trim().min(2).max(500),
  amount: z.coerce.number().positive().max(999999999999),
  expenseDate: z.iso.date(),
});

export const createExpenseSchema = z.object({ body: expenseBodySchema });
export const updateExpenseSchema = z.object({ body: expenseBodySchema });

export const listExpensesSchema = z.object({
  query: z
    .object({
      dateFrom: z.iso.date().optional(),
      dateTo: z.iso.date().optional(),
      category: z.string().trim().max(100).optional(),
    })
    .refine((value) => !value.dateFrom || !value.dateTo || value.dateFrom <= value.dateTo, {
      message: 'La fecha desde no puede ser posterior a la fecha hasta.',
      path: ['dateTo'],
    }),
});

export type ExpenseInput = z.infer<typeof expenseBodySchema>;
export type ListExpensesInput = z.infer<typeof listExpensesSchema>['query'];
