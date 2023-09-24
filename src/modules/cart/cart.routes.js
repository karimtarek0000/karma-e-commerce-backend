import { Router } from 'express';
import { errorHandler } from '../../lib/errorHandler.js';
import { validationCore } from '../../middlewares/validations.js';
import { isAuth } from '../../middlewares/auth.js';
import { addProductInCart, deleteProductFromCart, getCart } from './cart.controller.js';
import { addCartSchema, deleteCartSchema } from './cart.validation.js';
import { systemRoles } from '../../utils/systemRoles.js';

const router = Router();

router
  .use(isAuth([systemRoles.USER]))
  .post('/', validationCore(addCartSchema), errorHandler(addProductInCart))
  .get('/', errorHandler(getCart))
  .delete('/:productId', validationCore(deleteCartSchema), errorHandler(deleteProductFromCart));

export default router;
