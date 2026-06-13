import cors from 'cors';
import express from 'express';

import { env } from './config/env.js';
import { errorHandler } from './middlewares/error-handler.js';
import { notFound } from './middlewares/not-found.js';
import { authRouter } from './modules/auth/auth.routes.js';
import { sendSuccess } from './shared/http/api-response.js';

export const app = express();

app.disable('x-powered-by');
app.use(cors({ origin: env.CORS_ORIGIN }));
app.use(express.json());

app.get('/api/health', (_request, response) => {
  sendSuccess(response, {
    status: 'ok',
    service: 'gestion-comercial-inteligente-api',
  });
});

app.use('/api/v1/auth', authRouter);

app.use(notFound);
app.use(errorHandler);
