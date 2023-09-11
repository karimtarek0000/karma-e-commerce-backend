import moment from 'moment';
import { couponModel } from '../../DB/models/Coupon.model.js';
import { sendError } from '../lib/sendError.js';

export const isCouponValid = async ({ couponCode, userId, next }) => {
  const coupon = await couponModel.findOne({ couponCode });

  // --------- Check if coupon code exist or not --------------------
  if (!coupon) return sendError(next, 'Coupon code not valid', 400);

  // --------- Check status coupon expired --------------------
  if (
    coupon.couponStatus === 'expired' ||
    moment(new Date(coupon.couponEndData)).isBefore(moment())
  ) {
    return sendError(next, 'Coupon expired', 400);
  }
  // --------- Check status coupon valid and date not started yet --------------------
  if (coupon.couponStatus === 'valid' && moment().isBefore(new Date(coupon.couponStartDate))) {
    return sendError(next, 'Coupon not started yet', 400);
  }

  // --------- Check assign users --------------------
  const userExist = coupon.couponAssignToUsers.find(
    (user) => user.userId.toString() === userId.toString()
  );

  // ------------ If user not assigned --------------
  if (!userExist) {
    return sendError(next, 'This user not assigned to this coupon', 400);
  }

  // ------------ If user exceeded max usage --------------
  if (userExist.usageCount === userExist.maxUsage) {
    return sendError(next, 'Exceeded max usage for this coupon', 400);
  }

  return { status: true, coupon };
};
