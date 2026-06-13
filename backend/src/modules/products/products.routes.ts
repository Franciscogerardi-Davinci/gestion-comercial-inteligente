import { Router } from 'express';

import { requireAuth } from '../../middlewares/require-auth.js';
import * as productsController from './products.controller.js';

export const productsRouter = Router();

productsRouter.use(requireAuth);
productsRouter.get('/', productsController.list);
productsRouter.get('/:id', productsController.getById);
productsRouter.post('/', productsController.create);
productsRouter.put('/:id', productsController.update);
productsRouter.delete('/:id', productsController.remove);
