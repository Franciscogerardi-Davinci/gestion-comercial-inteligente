import { z } from 'zod';

export const createSaleSchema = z.object({
  body: z
    .object({
      items: z
        .array(
          z.object({
            productId: z.string().uuid(),
            quantity: z.coerce.number().positive().max(99999999999),
          }),
        )
        .min(1)
        .max(100),
      discount: z.coerce.number().nonnegative().max(999999999999).default(0),
      notes: z.string().trim().max(1000).nullable().optional(),
    })
    .superRefine((value, context) => {
      const productIds = value.items.map((item) => item.productId);
      if (new Set(productIds).size !== productIds.length) {
        context.addIssue({
          code: 'custom',
          path: ['items'],
          message: 'Cada producto debe aparecer una sola vez.',
        });
      }
    }),
});

export const listSalesSchema = z.object({
  query: z.object({
    dateFrom: z.iso.date().optional(),
    dateTo: z.iso.date().optional(),
    status: z.enum(['CONFIRMED', 'CANCELLED']).optional(),
  }),
});

export type CreateSaleInput = z.infer<typeof createSaleSchema>['body'];
export type ListSalesInput = z.infer<typeof listSalesSchema>['query'];
