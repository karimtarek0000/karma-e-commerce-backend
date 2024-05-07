import { Router } from 'express';
import { errorHandler } from '../../lib/errorHandler.js';
import { isAuth } from '../../middlewares/auth.js';
import { validationCore } from '../../middlewares/validations.js';
import { systemRoles } from '../../utils/systemRoles.js';
import { checkCoupon, createCoupon, deleteCoupon } from './coupons.controller.js';
import { createCouponSchema, deleteCouponSchema } from './coupons.validation.js';

const router = Router();

router
  .post(
    '/check',
    isAuth([systemRoles.USER, systemRoles.ADMIN, systemRoles.SUPERADMIN]),
    errorHandler(checkCoupon)
  )
  .use(isAuth([systemRoles.ADMIN, systemRoles.SUPERADMIN]))
  .post('/', validationCore(createCouponSchema), errorHandler(createCoupon))
  .delete('/:couponId', validationCore(deleteCouponSchema), errorHandler(deleteCoupon));

export default router;
