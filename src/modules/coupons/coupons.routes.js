import { Router } from 'express';
import { errorHandler } from '../../lib/errorHandler.js';
import { validationCore } from '../../middlewares/validations.js';
import { createCoupon, deleteCoupon } from './coupons.controller.js';
import { createCouponSchema, deleteCouponSchema } from './coupons.validation.js';
import { isAuth } from '../../middlewares/auth.js';
import { systemRoles } from '../../utils/systemRoles.js';

const router = Router();

router
  .use(isAuth([systemRoles.ADMIN, systemRoles.SUPERADMIN]))
  .post('/', validationCore(createCouponSchema), errorHandler(createCoupon))
  .delete('/:couponId', validationCore(deleteCouponSchema), errorHandler(deleteCoupon));

export default router;
