import { Router } from 'express';

import { requireAuth } from '../../middlewares/require-auth.js';
import * as stockMovementsController from './stock-movements.controller.js';

export const stockMovementsRouter = Router();

stockMovementsRouter.use(requireAuth);
stockMovementsRouter.get('/', stockMovementsController.list);
stockMovementsRouter.post('/', stockMovementsController.create);
