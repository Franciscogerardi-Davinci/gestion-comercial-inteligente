import { StockMovementType } from '@prisma/client';
import { z } from 'zod';

export const createStockMovementSchema = z.object({
  body: z
    .object({
      productId: z.string().uuid(),
      type: z.nativeEnum(StockMovementType),
      quantity: z.coerce.number().finite().max(99999999999),
      reason: z.string().trim().min(2).max(500),
    })
    .superRefine((value, context) => {
      if (value.type !== StockMovementType.ADJUSTMENT && value.quantity <= 0) {
        context.addIssue({
          code: 'custom',
          path: ['quantity'],
          message: 'La cantidad debe ser mayor que cero.',
        });
      }
      if (value.type === StockMovementType.ADJUSTMENT && value.quantity === 0) {
        context.addIssue({
          code: 'custom',
          path: ['quantity'],
          message: 'El ajuste no puede ser cero.',
        });
      }
    }),
});

export type StockMovementInput = z.infer<typeof createStockMovementSchema>['body'];
