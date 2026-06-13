import { Router } from 'express';

import { requireAuth } from '../../middlewares/require-auth.js';
import * as salesController from './sales.controller.js';

export const salesRouter = Router();

salesRouter.use(requireAuth);
salesRouter.get('/', salesController.list);
salesRouter.get('/:id', salesController.getById);
salesRouter.post('/', salesController.create);
salesRouter.post('/:id/cancel', salesController.cancel);
