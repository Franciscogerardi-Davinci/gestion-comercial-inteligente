import { z } from 'zod';

const optionalText = z
  .string()
  .trim()
  .max(255)
  .optional()
  .transform((value) => value || null);

const productBodySchema = z.object({
  categoryId: z.string().uuid().nullable().optional(),
  name: z.string().trim().min(2).max(160),
  description: z.string().trim().max(1000).nullable().optional(),
  sku: optionalText,
  barcode: optionalText,
  salePrice: z.coerce.number().nonnegative().max(999999999999),
  costPrice: z.coerce.number().nonnegative().max(999999999999).nullable().optional(),
  minimumStock: z.coerce.number().nonnegative().max(99999999999).default(0),
});

export const createProductSchema = z.object({ body: productBodySchema });
export const updateProductSchema = z.object({ body: productBodySchema });

export type ProductInput = z.infer<typeof productBodySchema>;
