import { Router } from 'express';
import { errorHandler } from '../../lib/errorHandler.js';
import { validationCore } from '../../middlewares/validations.js';
import { isAuth } from '../../middlewares/auth.js';
import { addProductInCart, deleteProductFromCart } from './cart.controller.js';
import { addCartSchema, deleteCartSchema } from './cart.validation.js';

const router = Router();

router
  .use(isAuth)
  .post('/', validationCore(addCartSchema), errorHandler(addProductInCart))
  .delete('/:productId', validationCore(deleteCartSchema), errorHandler(deleteProductFromCart));

export default router;
