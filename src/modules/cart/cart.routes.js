import { Router } from 'express';
import { errorHandler } from '../../lib/errorHandler.js';
import { validationCore } from '../../middlewares/validations.js';
import { isAuth } from '../../middlewares/auth.js';
import { addProductInCart } from './cart.controller.js';
import { addCartSchema } from './cart.validation.js';

const router = Router();

router.use(isAuth).post('/', validationCore(addCartSchema), errorHandler(addProductInCart));

export default router;
