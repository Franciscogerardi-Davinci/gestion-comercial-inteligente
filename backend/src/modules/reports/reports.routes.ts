import { Router } from 'express';

import { requireAuth } from '../../middlewares/require-auth.js';
import * as reportsController from './reports.controller.js';

export const reportsRouter = Router();

reportsRouter.use(requireAuth);
reportsRouter.get('/sales', reportsController.sales);
reportsRouter.get('/expenses', reportsController.expenses);
reportsRouter.get('/profit', reportsController.profit);
reportsRouter.get('/sales/export/pdf', reportsController.salesPdf);
reportsRouter.get('/sales/export/excel', reportsController.salesExcel);
reportsRouter.get('/expenses/export/pdf', reportsController.expensesPdf);
reportsRouter.get('/expenses/export/excel', reportsController.expensesExcel);
