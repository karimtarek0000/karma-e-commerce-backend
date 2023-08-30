import { orderModel } from '../../../DB/models/Order.model.js';
import { productModel } from '../../../DB/models/Product.model.js';
import { sendError } from '../../lib/sendError.js';
import { isCouponValid } from '../../utils/couponValidations.js';

// --------------- Add product in cart ---------------
export const createOrder = async (req, res, next) => {
  const userId = req.userData._id;
  const { productId, quantity, address, phoneNumber, paymentMethod, couponCode } = req.body;

  // ---------- Check for coupon ---------------
  let couponResult = null;

  if (couponCode) {
    couponResult = await isCouponValid({ couponCode, userId, next });

    if (!couponResult?.status) return couponResult;
  }

  // ---------- Check if product id exist and quantity less than or equal stock ---------------
  const productExist = await productModel.findOne({ _id: productId, stock: { $gte: quantity } });

  if (!productExist) return sendError(next, 'Product id not valid or quantity out of stock', 400);

  // ---------- Collecting the product data ---------------
  const productData = {
    productId,
    quantity,
    title: productExist.title,
    price: productExist.priceAfterDiscount,
    finalPrice: productExist.priceAfterDiscount * quantity,
  };

  // ---------- Calculate paid amount ---------------
  const subTotal = productData.finalPrice;
  let paidAmount = subTotal;
  const couponAmountType = couponResult?.coupon.couponAmountType;

  if (couponAmountType) {
    if (couponAmountType === 'fixed') {
      paidAmount = subTotal - (couponResult?.coupon.couponAmount || 0);
    }
    if (couponAmountType === 'percentage') {
      paidAmount = subTotal * (1 - (couponResult?.coupon.couponAmount || 0) / 100);
    }
  }

  // ---------- Save data ---------------
  const order = await orderModel.create({
    userId,
    address,
    phoneNumbers: phoneNumber,
    paymentMethod,
    paidAmount,
    products: productData,
    orderStatus: paymentMethod === 'cash' ? 'placed' : 'pending',
    couponId: couponResult?.coupon._id ?? null,
    subTotal: productData.finalPrice,
  });

  if (!order) return sendError(next, 'Order faild', 400);

  // ---- Increase usage count for coupon user ------
  if (couponResult?.coupon) {
    for (const user of couponResult.coupon.couponAssignToUsers || []) {
      if (user.userId.toString() === userId.toString()) {
        user.usageCount += 1;
      }
    }
    await couponResult.coupon.save();
  }

  // ---- Decrease product stock by order quantity ------
  await productModel.findOneAndUpdate(
    { _id: productId },
    { $inc: { stock: -parseInt(quantity, 10) } }
  );

  res.status(201).json({ message: 'Created order successfully', order });
};
