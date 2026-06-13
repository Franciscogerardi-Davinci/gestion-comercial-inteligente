import { Router } from 'express';

import { requireAuth } from '../../middlewares/require-auth.js';
import * as categoriesController from './categories.controller.js';

export const categoriesRouter = Router();

categoriesRouter.use(requireAuth);
categoriesRouter.get('/', categoriesController.list);
categoriesRouter.post('/', categoriesController.create);
categoriesRouter.put('/:id', categoriesController.update);
categoriesRouter.delete('/:id', categoriesController.remove);
