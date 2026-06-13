import cors from 'cors';
import express from 'express';

import { env } from './config/env.js';

export const app = express();

app.disable('x-powered-by');
app.use(cors({ origin: env.CORS_ORIGIN }));
app.use(express.json());

app.get('/api/health', (_request, response) => {
  response.status(200).json({
    status: 'ok',
    service: 'gestion-comercial-inteligente-api',
  });
});
