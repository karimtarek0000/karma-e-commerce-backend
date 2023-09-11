import fs from 'fs';
import { nanoid } from 'nanoid';
import Stripe from 'stripe';
import { cartModel } from '../../../DB/models/Cart.model.js';
import { orderModel } from '../../../DB/models/Order.model.js';
import { productModel } from '../../../DB/models/Product.model.js';
import { sendError } from '../../lib/sendError.js';
import { sendEmailService } from '../../services/sendEmail.js';
import { isCouponValid } from '../../utils/couponValidations.js';
import createInvoice from '../../utils/pdfkit.js';
import { generateQrCode } from '../../utils/qrCode.js';
import { generateToken } from '../../utils/useToken.js';
import { paymentIntegration } from '../../services/payment.js';

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
      success_url: `${req.protocol}://${req.headers.host}/order/successOrder?token=${token}`,
      cancel_url: `${req.protocol}://${req.headers.host}/order/cancelOrder?token=${token}`,
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

  res.status(201).json({
    message: 'Created order successfully',
    order,
    orderQrCode,
    checkOutURL: orderSession.url,
  });
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
      options: { expiresIn: '10m' },
    });

    orderSession = await paymentIntegration({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: email,
      metadata: { orderId: order._id.toString() },
      discounts: couponResult?.coupon ? [{ coupon: couponResult?.coupon?.couponId }] : [],
      success_url: `${req.protocol}://${req.headers.host}/order/successOrder?token=${token}`,
      cancel_url: `${req.protocol}://${req.headers.host}/order/cancelOrder?token=${token}`,
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

  res.status(201).json({
    message: 'Created order successfully',
    order,
    orderQrCode,
    checkOutURL: orderSession?.url,
  });
};
