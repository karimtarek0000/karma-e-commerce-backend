import moment from 'moment';
import { couponModel } from '../../DB/models/Coupon.model.js';
import { sendError } from '../lib/sendError.js';

export const isCouponValid = async ({ couponCode, userId, next }) => {
  const coupon = await couponModel.findOne({ couponCode });

  // --------- Check if coupon code exist or not --------------------
  if (!coupon) return sendError(next, 'Coupon code not valid', 400);

  // --------- Check status coupon --------------------
  if (coupon.couponStatus === 'expired' || moment(coupon.couponEndData).isBefore(moment())) {
    return sendError(next, 'Coupon expired', 400);
  }

  // --------- Check assign users --------------------
  for (const user of coupon.couponAssignToUsers) {
    if (userId.toString() !== user.userId.toString()) {
      return sendError(next, 'This user not assigned to this coupon', 400);
    }
    if (user.usageCount === user.maxUsage) {
      return sendError(next, 'Exceeded limit for usage this coupon', 400);
    }
  }

  return { status: true, coupon };
};