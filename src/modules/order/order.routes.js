import { Router } from 'express';
import { errorHandler } from '../../lib/errorHandler.js';
import { isAuth } from '../../middlewares/auth.js';
import { validationCore } from '../../middlewares/validations.js';
import { systemRoles } from '../../utils/systemRoles.js';
import {
  cancelOrderPayment,
  cartToOrder,
  createOrder,
  getAllOrders,
  orderToDelivered,
  successOrderPayment,
} from './order.controller.js';
import {
  cartToOrderSchema,
  createOrderSchema,
  deliverSchema,
  successOrderSchema,
} from './order.validation.js';

const router = Router();

router
  .patch(
    '/deliver/:orderId',
    isAuth([systemRoles.ADMIN, systemRoles.SUPERADMIN]),
    validationCore(deliverSchema),
    errorHandler(orderToDelivered)
  )
  .use(isAuth([systemRoles.USER, systemRoles.ADMIN, systemRoles.SUPERADMIN]))
  .post('/', validationCore(createOrderSchema), errorHandler(createOrder))
  .post('/:cartId', validationCore(cartToOrderSchema), errorHandler(cartToOrder))
  .patch('/successOrder', validationCore(successOrderSchema), errorHandler(successOrderPayment))
  .patch('/cancelOrder', validationCore(successOrderSchema), errorHandler(cancelOrderPayment))
  .get('/', errorHandler(getAllOrders));

export default router;
