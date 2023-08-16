import JOI from 'joi';

export const createCouponSchema = {
  body: JOI.object({
    couponCode: JOI.string().trim().min(5).max(55).required(),
    couponAmount: JOI.number().positive().min(1).max(100).required(),
    couponAmountType: JOI.string().valid('percentage', 'fixed').required(),
    couponStatus: JOI.string().valid('expired', 'valid'),
    couponStartDate: JOI.date()
      .greater(Date.now() - 24 * 60 * 60 * 1000)
      .required(),
    couponEndData: JOI.date().greater(JOI.ref('couponStartDate')).required(),
  }),
};
