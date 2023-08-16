import { Router } from 'express';
import { errorHandler } from '../../lib/errorHandler.js';
import { validationCore } from '../../middlewares/validations.js';
import { createCoupon } from './coupons.controller.js';
import { createCouponSchema } from './coupons.validation.js';

const router = Router();

router.post(
  '/',
  validationCore(createCouponSchema),
  errorHandler(createCoupon)
);

export default router;
