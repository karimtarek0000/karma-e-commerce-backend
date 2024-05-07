import fs from 'fs';
import JWT from 'jsonwebtoken';
import { nanoid } from 'nanoid';
import Stripe from 'stripe';
import { cartModel } from '../../../DB/models/Cart.model.js';
import { couponModel } from '../../../DB/models/Coupon.model.js';
import { orderModel } from '../../../DB/models/Order.model.js';
import { productModel } from '../../../DB/models/Product.model.js';
import { sendError } from '../../lib/sendError.js';
import { paymentIntegration } from '../../services/payment.js';
import { sendEmailService } from '../../services/sendEmail.js';
import { isCouponValid } from '../../utils/couponValidations.js';
import createInvoice from '../../utils/pdfkit.js';
import { generateQrCode } from '../../utils/qrCode.js';
import { generateToken } from '../../utils/useToken.js';

// --------------- Create order ---------------
export const createOrder = async (req, res, next) => {
  const { _id: userId, email } = req.userData;
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

  // ---------- Calculate paid amount if coupon exist => `fixed` or `percentage` -----------
  const subTotal = productData.finalPrice;
  let paidAmount = subTotal;
  const couponAmountType = couponResult?.coupon.couponAmountType;

  // ---- Make sure product.priceAfterDiscount greather than coupon.couponAmount -----
  if (
    couponAmountType === 'fixed' &&
    couponResult?.coupon.couponAmount > productExist.priceAfterDiscount
  ) {
    return sendError(next, 'Coupon amount greather than product price', 400);
  }

  // ---- Set paidAmount depend on `fixed` or `percentage` -----
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

  // ---- Payment ------
  let orderSession = null;
  if (order.paymentMethod === 'card') {
    // ---------------- If coupon exist will create a coupon for stripe ----------------
    if (couponResult?.coupon) {
      const { couponAmount } = couponResult.coupon;
      let coupon = null;

      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

      // ------------- If coupon `percentage` -----------------
      if (couponAmountType === 'percentage') {
        coupon = await stripe.coupons.create({
          percent_off: couponAmount,
        });
      }
      // ------------- If coupon `fixed` -----------------
      if (couponAmountType === 'fixed') {
        coupon = await stripe.coupons.create({
          amount_off: couponAmount * 100,
          currency: 'EGP',
        });
      }

      couponResult.coupon.couponId = coupon.id;
    }

    const token = generateToken({
      payload: {
        orderId: order._id,
        userId: order.userId,
      },
      sign: process.env.ORDER_TOKEN_SECRET,
      options: { expiresIn: '10m' },
    });

    orderSession = await paymentIntegration({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: email,
      metadata: { orderId: order._id.toString() },
      discounts: couponResult?.coupon ? [{ coupon: couponResult?.coupon?.couponId }] : [],
      success_url: `${process.env.CLIENT_URL}/payment/success?token=${token}`,
      cancel_url: `${process.env.CLIENT_URL}/payment/cancel?token=${token}`,
      line_items: order?.products.map((product) => ({
        price_data: {
          currency: 'EGP',
          product_data: { name: product.title },
          unit_amount: product.price * 100,
        },
        quantity: product.quantity,
      })),
    });
  }

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

  // ---- Generate qrCode ------
  const orderQrCode = await generateQrCode({
    id: order._id,
    products: order.products,
  });

  const resData = {
    message: 'Created order successfully',
    order,
    orderQrCode,
  };

  if (orderSession?.url) {
    resData.checkOutURL = orderSession.url;
  }

  res.status(201).json(resData);
};

// --------------- Convert cart to order ---------------
export const cartToOrder = async (req, res, next) => {
  const { _id: userId, name: userName, email } = req.userData;
  const { cartId } = req.params;
  const { address, phoneNumber, paymentMethod, couponCode } = req.body;

  // ------ Check cart exist and cart products included product not empty array ------
  const cart = await cartModel.findById(cartId);

  if (!cart) return sendError(next, 'Cart id not correct', 400);
  if (!cart.products.length) return sendError(next, 'This cart not included any product', 400);

  // ---------- Check for coupon ---------------
  let couponResult = null;

  if (couponCode) {
    couponResult = await isCouponValid({ couponCode, userId, next });

    if (!couponResult?.status) return couponResult;
  }

  // ---------- Calculate paid amount ---------------
  const { subTotal } = cart;
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

  // ---------- Collecting the product data ---------------
  const productsPromsis = cart.products.map(async ({ productId, quantity }) => {
    const { title, priceAfterDiscount } = await productModel.findById(productId);

    return {
      productId,
      quantity,
      title,
      price: priceAfterDiscount,
      finalPrice: priceAfterDiscount * quantity,
    };
  });

  const products = await Promise.all(productsPromsis);

  // ---------- Save data ---------------
  const order = await orderModel.create({
    userId,
    address,
    phoneNumbers: phoneNumber,
    paymentMethod,
    paidAmount,
    products,
    orderStatus: paymentMethod === 'cash' ? 'placed' : 'pending',
    couponId: couponResult?.coupon._id ?? null,
    subTotal,
  });

  if (!order) return sendError(next, 'Order faild', 400);

  // ---- Payment ------
  let orderSession = null;
  if (order.paymentMethod === 'card') {
    // ---------------- If coupon exist will create a coupon for stripe ----------------
    if (couponResult?.coupon) {
      const { couponAmount } = couponResult.coupon;
      let coupon = null;

      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

      // ------------- If coupon `percentage` -----------------
      if (couponAmountType === 'percentage') {
        coupon = await stripe.coupons.create({
          percent_off: couponAmount,
        });
      }
      // ------------- If coupon `fixed` -----------------
      if (couponAmountType === 'fixed') {
        coupon = await stripe.coupons.create({
          amount_off: couponAmount * 100,
          currency: 'EGP',
        });
      }

      couponResult.coupon.couponId = coupon.id;
    }

    const token = generateToken({
      payload: {
        orderId: order._id,
        userId: order.userId,
      },
      sign: process.env.ORDER_TOKEN_SECRET,
      options: {},
    });

    orderSession = await paymentIntegration({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: email,
      metadata: { orderId: order._id.toString() },
      discounts: couponResult?.coupon ? [{ coupon: couponResult?.coupon?.couponId }] : [],
      success_url: `${process.env.CLIENT_URL}/payment/success?token=${token}`,
      cancel_url: `${process.env.CLIENT_URL}/payment/cancel?token=${token}`,
      line_items: order?.products.map((product) => ({
        price_data: {
          currency: 'EGP',
          product_data: { name: product.title },
          unit_amount: product.price * 100,
        },
        quantity: product.quantity,
      })),
    });
  }

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
  const updateProductsPromsis = products.map(async ({ productId, quantity }) => {
    await productModel.findOneAndUpdate(
      { _id: productId },
      { $inc: { stock: -parseInt(quantity, 10) } }
    );
  });
  await Promise.all(updateProductsPromsis);

  // ---- Remove all products from cart ------
  cart.products = [];
  cart.subTotal = 0;
  await cart.save();

  // ---- Generate qrCode ------
  const orderQrCode = await generateQrCode({
    id: order._id,
    products: order.products,
  });

  // ---- Generate invoice PDF ------
  const orderCode = `${userName}_${nanoid(5)}.pdf`;
  const invoice = {
    orderCode,
    items: order.products,
    subTotal: order.subTotal,
    paidAmount: order.paidAmount,
    date: order.createdAt,
    shipping: { name: userName, address, city: 'cairo', country: 'Egypt' },
  };
  createInvoice(invoice, orderCode);

  // ---- Send invoice PDF to user via his email ------
  await sendEmailService({
    to: email,
    subject: 'Order confirmation',
    message: 'Please find your invoice order pdf below',
    attachments: [{ path: `./Files/${orderCode}` }],
  });

  // ---------- Delete invoice after sended to email ----------
  fs.unlinkSync(`./Files/${orderCode}`);

  const resData = {
    message: 'Created order successfully',
    order,
    orderQrCode,
  };

  if (orderSession?.url) {
    resData.checkOutURL = orderSession.url;
  }

  res.status(201).json(resData);
};

// --------------- Success order Payment ---------------
export const successOrderPayment = async (req, res, next) => {
  const { token } = req.query;

  // --------------- Verfiy token if valid or not ---------------
  const orderData = JWT.verify(token, process.env.ORDER_TOKEN_SECRET);

  // --------------- Check if order id match order in database or not ---------------
  const orderExist = await orderModel.findOne({ _id: orderData.orderId, orderStatus: 'pending' });
  if (!orderExist) return sendError(next, 'Order id not exist!', 400);

  // --------------- Change orderStatus to `confirmed` and save the data ---------------
  orderExist.orderStatus = 'confirmed';
  const order = await orderExist.save();

  res.status(200).json({ message: 'Order is confirmed successfully', order });
};

// ---------------  Cancel order Payment ---------------
export const cancelOrderPayment = async (req, res, next) => {
  const { token } = req.query;

  // --------------- Verfiy token if valid or not ---------------
  const orderData = JWT.verify(token, process.env.ORDER_TOKEN_SECRET);

  // --------------- Check if order id match order in database or not ---------------
  const order = await orderModel.findOne({ _id: orderData.orderId, orderStatus: 'pending' });
  if (!order) return sendError(next, 'Order id not exist!', 400);

  // --------------- Change orderStatus to `canceled` and save the data ---------------
  order.orderStatus = 'canceled';

  // --------------- Return all quantity to products ---------------
  const productsPromises = order?.products.map(async (product) => {
    await productModel.findByIdAndUpdate(product.productId, {
      $inc: { stock: parseInt(product.quantity, 10) },
    });
  });

  await Promise.all(productsPromises);

  // --------------- Undo usage count in coupon if user use coupon ---------------
  if (order.couponId) {
    const coupon = await couponModel.findById(order.couponId);

    if (!coupon) return sendError(next, 'Coupon id not valid!', 400);

    coupon.couponAssignToUsers.forEach((user) => {
      if (user.userId.toString() === order.userId.toString()) {
        user.usageCount -= 1;
      }
    });

    await coupon.save();
  }

  await order.save();

  res.status(200).json({ message: 'Order is canceled' });
};

export const getAllOrders = async (req, res, next) => {
  const { _id: userId } = req.userData;

  const orders = await orderModel.find({ userId });

  if (!orders.length) return sendError(next, 'No order exist!', 400);

  res.status(200).json({ message: 'Orders', orders });
};

// ---------------  Convert order to `delivered` ---------------
export const orderToDelivered = async (req, res, next) => {
  const { orderId } = req.params;

  const order = await orderModel.findOneAndUpdate(
    {
      _id: orderId,
      orderStatus: { $nin: ['delivered', 'canceled', 'pending'] },
    },
    {
      orderStatus: 'delivered',
    },
    {
      new: true,
    }
  );

  if (!order) {
    return sendError(next, 'Order not exist!', 400);
  }

  res.status(200).json({ message: 'Has been converted order status to delivered', order });
};
