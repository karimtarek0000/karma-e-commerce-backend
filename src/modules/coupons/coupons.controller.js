import { couponModel } from '../../../DB/models/Coupon.model.js';
import { userModel } from '../../../DB/models/User.model.js';
import { sendError } from '../../lib/sendError.js';

// --------- Create new coupon ----------
export const createCoupon = async (req, res, next) => {
  const {
    couponCode,
    couponAmount,
    couponAmountType,
    couponStartDate,
    couponEndData,
    couponAssignToUsers,
  } = req.body;
  const { _id } = req.userData;

  // --------- Check if this coupon aleardy exist or not ---------
  const coupon = await couponModel.findOne({ couponCode });
  if (coupon) return sendError(next, 'Coupon already exist', 400);

  // --------- Check if users valid or not ---------
  const allUsersIds = couponAssignToUsers.map((user) => user?.userId);

  const allUsersExist = await userModel.find({
    _id: {
      $in: allUsersIds,
    },
  });

  if (allUsersExist.length !== allUsersIds.length) {
    return sendError(next, 'Some users in array not exist!', 400);
  }

  // --------- Finally create new coupon ---------
  const newCoupon = await couponModel.create({
    couponCode,
    couponAmount,
    couponAmountType,
    couponStartDate,
    couponEndData,
    couponAssignToUsers,
    createdBy: _id,
  });

  if (!newCoupon) return sendError(next, 'Create coupon faild', 400);

  res.status(201).json({ message: 'Create new coupon', newCoupon });
};

// --------- Delete coupon ----------
export const deleteCoupon = async (req, res, next) => {
  const { couponId } = req.params;
  const { _id } = req.userData;

  const coupon = await couponModel.findOneAndDelete({ _id: couponId, createdBy: _id });

  if (!coupon) return sendError(next, 'Coupon not exist!', 400);

  res.status(201).json({ message: 'Coupon deleted successfully' });
};
