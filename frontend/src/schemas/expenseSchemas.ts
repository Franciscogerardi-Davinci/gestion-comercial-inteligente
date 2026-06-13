import { z } from 'zod';

export const expenseFormSchema = z.object({
  category: z.string().trim().min(2, 'Ingrese una categoria.').max(100),
  description: z.string().trim().min(2, 'Ingrese una descripcion.').max(500),
  amount: z
    .string()
    .trim()
    .min(1, 'Ingrese el importe.')
    .refine((value) => Number.isFinite(Number(value)) && Number(value) > 0, 'Importe invalido.'),
  expenseDate: z.string().date('Ingrese una fecha valida.'),
});

export type ExpenseFormValues = z.infer<typeof expenseFormSchema>;
