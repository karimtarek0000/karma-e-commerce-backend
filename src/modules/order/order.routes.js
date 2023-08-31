import { Router } from 'express';
import { errorHandler } from '../../lib/errorHandler.js';
import { validationCore } from '../../middlewares/validations.js';
import { isAuth } from '../../middlewares/auth.js';
import { cartToOrder, createOrder } from './order.controller.js';
import { cartToOrderSchema, createOrderSchema } from './order.validation.js';
import { systemRoles } from '../../utils/systemRoles.js';

const router = Router();

router
  .use(isAuth([systemRoles.USER]))
  .post('/', validationCore(createOrderSchema), errorHandler(createOrder))
  .post('/:cartId', validationCore(cartToOrderSchema), errorHandler(cartToOrder));

export default router;
