import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    businessName: z.string().trim().min(2).max(120),
    firstName: z.string().trim().min(2).max(80),
    lastName: z.string().trim().min(2).max(80),
    email: z
      .string()
      .trim()
      .email()
      .max(160)
      .transform((value) => value.toLowerCase()),
    password: z.string().min(8).max(72),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z
      .string()
      .trim()
      .email()
      .transform((value) => value.toLowerCase()),
    password: z.string().min(1),
  }),
});

export type RegisterInput = z.infer<typeof registerSchema>['body'];
export type LoginInput = z.infer<typeof loginSchema>['body'];
