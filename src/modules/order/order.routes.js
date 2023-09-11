import { Router } from 'express';
import { errorHandler } from '../../lib/errorHandler.js';
import { validationCore } from '../../middlewares/validations.js';
import { isAuth } from '../../middlewares/auth.js';
import {
  cancelOrderPayment,
  cartToOrder,
  createOrder,
  successOrderPayment,
} from './order.controller.js';
import { cartToOrderSchema, createOrderSchema, successOrderSchema } from './order.validation.js';
import { systemRoles } from '../../utils/systemRoles.js';

const router = Router();

router
  .use(isAuth([systemRoles.USER]))
  .post('/', validationCore(createOrderSchema), errorHandler(createOrder))
  .post('/:cartId', validationCore(cartToOrderSchema), errorHandler(cartToOrder))
  .patch('/successOrder', validationCore(successOrderSchema), errorHandler(successOrderPayment))
  .patch('/cancelOrder', validationCore(successOrderSchema), errorHandler(cancelOrderPayment));

export default router;
