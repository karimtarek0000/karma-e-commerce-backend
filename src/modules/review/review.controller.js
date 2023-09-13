import { orderModel } from '../../../DB/models/Order.model.js';
import { reviewModel } from '../../../DB/models/Review.model.js';
import { sendError } from '../../lib/sendError.js';

export const addNewReview = async (req, res, next) => {
  const { _id: userId } = req.userData;
  const { productId } = req.params;
  const { reviewRate, reviewComment } = req.body;

  // -------- Check if user bught this product or not ------------
  const productValidForReview = await orderModel.findOne({
    userId,
    'products.productId': productId,
    orderStatus: 'delivered',
  });

  if (!productValidForReview) {
    return sendError(next, 'Not allowed to add review, buy product first', 400);
  }

  // -------- Save data in database ------------
  const review = await reviewModel.create({
    userId,
    productId,
    reviewRate,
    reviewComment,
  });

  if (!review) {
    return sendError(next, 'Review faild', 400);
  }

  res.status(201).json({ message: 'Review added successfully', review });
};
