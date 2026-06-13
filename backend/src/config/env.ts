import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default('15m'),
  CORS_ORIGIN: z.string().url().default('http://localhost:5173'),
  APP_TIME_ZONE: z
    .string()
    .default('America/Argentina/Buenos_Aires')
    .refine(
      (value) => {
        try {
          new Intl.DateTimeFormat('en-US', { timeZone: value }).format();
          return true;
        } catch {
          return false;
        }
      },
      { message: 'APP_TIME_ZONE must be a valid IANA time zone.' },
    ),
});

export const env = envSchema.parse(process.env);
