import JOI from 'joi';
import { generalValidations } from '../../middlewares/validations.js';

export const createCouponSchema = {
  body: JOI.object({
    couponCode: JOI.string().trim().min(5).max(55),
    couponAmount: JOI.number().positive().min(1).max(100),
    couponAmountType: JOI.string().valid('percentage', 'fixed').optional(),
    couponStatus: JOI.string().valid('expired', 'valid').optional(),
    couponStartDate: JOI.date().greater(Date.now() - 24 * 60 * 60 * 1000),
    couponEndData: JOI.date().greater(JOI.ref('couponStartDate')),
    couponAssignToUsers: JOI.array()
      .items({
        userId: generalValidations._id,
        maxUsage: JOI.number().default(1).optional(),
      })
      .optional(),
  }).options({ presence: 'required' }),
};

export const deleteCouponSchema = {
  params: JOI.object({ couponId: generalValidations._id })
    .required()
    .options({ presence: 'required' }),
};
