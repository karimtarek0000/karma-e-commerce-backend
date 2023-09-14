import { orderModel } from '../../../DB/models/Order.model.js';
import { productModel } from '../../../DB/models/Product.model.js';
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

  // -------- Update rating in product ------------
  const product = await productModel.findById(productId);
  const reviews = await reviewModel.find({ productId });

  const sumReviewsRates = reviews.reduce((prev, cur) => prev + cur.reviewRate, 0);

  product.reviewRatings = (sumReviewsRates / reviews.length).toFixed(1);

  const updateProduct = await product.save();

  if (!updateProduct) {
    return sendError(next, 'Review faild', 400);
  }

  res.status(201).json({ message: 'Review added successfully', review });
};
