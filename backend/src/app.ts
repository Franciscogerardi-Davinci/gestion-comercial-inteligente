import cors from 'cors';
import express from 'express';

import { env } from './config/env.js';
import { errorHandler } from './middlewares/error-handler.js';
import { notFound } from './middlewares/not-found.js';
import { authRouter } from './modules/auth/auth.routes.js';
import { categoriesRouter } from './modules/categories/categories.routes.js';
import { dashboardRouter } from './modules/dashboard/dashboard.routes.js';
import { expensesRouter } from './modules/expenses/expenses.routes.js';
import { stockMovementsRouter } from './modules/inventory/stock-movements.routes.js';
import { productsRouter } from './modules/products/products.routes.js';
import { reportsRouter } from './modules/reports/reports.routes.js';
import { salesRouter } from './modules/sales/sales.routes.js';
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
app.use('/api/v1/categories', categoriesRouter);
app.use('/api/v1/products', productsRouter);
app.use('/api/v1/stock-movements', stockMovementsRouter);
app.use('/api/v1/sales', salesRouter);
app.use('/api/v1/expenses', expensesRouter);
app.use('/api/v1/dashboard', dashboardRouter);
app.use('/api/v1/reports', reportsRouter);

app.use(notFound);
app.use(errorHandler);
