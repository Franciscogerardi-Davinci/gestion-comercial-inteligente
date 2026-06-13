import { z } from 'zod';

const decimalString = (label: string, allowNegative = false) =>
  z
    .string()
    .trim()
    .min(1, `Ingrese ${label}.`)
    .refine((value) => Number.isFinite(Number(value)), `${label} debe ser numerico.`)
    .refine((value) => allowNegative || Number(value) >= 0, `${label} no puede ser negativo.`);

export const categoryFormSchema = z.object({
  name: z.string().trim().min(2, 'Ingrese al menos 2 caracteres.').max(100),
  description: z.string().trim().max(500),
});

export const productFormSchema = z.object({
  categoryId: z.string(),
  name: z.string().trim().min(2, 'Ingrese al menos 2 caracteres.').max(160),
  description: z.string().trim().max(1000),
  sku: z.string().trim().max(255),
  barcode: z.string().trim().max(255),
  salePrice: decimalString('el precio de venta'),
  costPrice: z
    .string()
    .trim()
    .refine(
      (value) => value === '' || (Number.isFinite(Number(value)) && Number(value) >= 0),
      'El costo debe ser un numero no negativo.',
    ),
  minimumStock: decimalString('el stock minimo'),
});

export const stockMovementFormSchema = z
  .object({
    productId: z.string().uuid('Seleccione un producto.'),
    type: z.enum(['IN', 'OUT', 'ADJUSTMENT']),
    quantity: decimalString('la cantidad', true),
    reason: z.string().trim().min(2, 'Ingrese un motivo.').max(500),
  })
  .superRefine((values, context) => {
    const quantity = Number(values.quantity);
    if (values.type !== 'ADJUSTMENT' && quantity <= 0) {
      context.addIssue({
        code: 'custom',
        path: ['quantity'],
        message: 'La cantidad debe ser mayor que cero.',
      });
    }
    if (values.type === 'ADJUSTMENT' && quantity === 0) {
      context.addIssue({
        code: 'custom',
        path: ['quantity'],
        message: 'El ajuste no puede ser cero.',
      });
    }
  });

export type CategoryFormValues = z.infer<typeof categoryFormSchema>;
export type ProductFormValues = z.infer<typeof productFormSchema>;
export type StockMovementFormValues = z.infer<typeof stockMovementFormSchema>;
