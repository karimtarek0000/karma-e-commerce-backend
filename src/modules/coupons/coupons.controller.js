import { couponModel } from '../../../DB/models/Coupon.model.js';
import { sendError } from '../../lib/sendError.js';

export const createCoupon = async (req, res, next) => {
  const {
    couponCode,
    couponAmount,
    couponAmountType,
    couponStartDate,
    couponEndData,
  } = req.body;

  const coupon = await couponModel.findOne({ couponCode });

  if (coupon) return sendError(next, 'Coupon already exist', 400);

  const newCoupon = await couponModel.create({
    couponCode,
    couponAmount,
    couponAmountType,
    couponStartDate,
    couponEndData,
  });

  res.status(201).json({ message: 'Create new coupon', newCoupon });
};
