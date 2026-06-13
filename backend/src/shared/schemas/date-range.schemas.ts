import { z } from 'zod';

export const dateRangeQuerySchema = z
  .object({
    dateFrom: z.iso.date().optional(),
    dateTo: z.iso.date().optional(),
  })
  .refine((value) => !value.dateFrom || !value.dateTo || value.dateFrom <= value.dateTo, {
    message: 'La fecha desde no puede ser posterior a la fecha hasta.',
    path: ['dateTo'],
  });

export type DateRangeInput = z.infer<typeof dateRangeQuerySchema>;
