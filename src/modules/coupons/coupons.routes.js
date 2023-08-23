import { Router } from 'express';
import { errorHandler } from '../../lib/errorHandler.js';
import { validationCore } from '../../middlewares/validations.js';
import { createCoupon } from './coupons.controller.js';
import { createCouponSchema } from './coupons.validation.js';
import { isAuth } from '../../middlewares/auth.js';

const router = Router();

router.use(isAuth).post('/', validationCore(createCouponSchema), errorHandler(createCoupon));

export default router;
