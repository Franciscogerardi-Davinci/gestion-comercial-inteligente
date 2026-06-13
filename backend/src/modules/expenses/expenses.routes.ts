import { Router } from 'express';

import { requireAuth } from '../../middlewares/require-auth.js';
import * as expensesController from './expenses.controller.js';

export const expensesRouter = Router();

expensesRouter.use(requireAuth);
expensesRouter.get('/', expensesController.list);
expensesRouter.get('/:id', expensesController.getById);
expensesRouter.post('/', expensesController.create);
expensesRouter.put('/:id', expensesController.update);
expensesRouter.delete('/:id', expensesController.remove);
