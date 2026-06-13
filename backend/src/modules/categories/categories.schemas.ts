import { z } from 'zod';

const categoryBodySchema = z.object({
  name: z.string().trim().min(2).max(100),
  description: z.string().trim().max(500).nullable().optional(),
});

export const createCategorySchema = z.object({
  body: categoryBodySchema,
});

export const updateCategorySchema = z.object({
  body: categoryBodySchema,
});

export type CategoryInput = z.infer<typeof categoryBodySchema>;
