import { Schema, model } from 'mongoose';

const orderSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'user',
      required: true,
    },
    products: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: 'product',
          required: true,
        },
        quantity: {
          type: Number,
          default: 1,
          required: true,
        },
        title: {
          type: String,
          required: true,
        },
        price: {
          type: Number,
          required: true,
        },
        finalPrice: {
          type: Number,
          default: 0,
          required: true,
        },
      },
    ],
    subTotal: {
      type: Number,
      default: 0,
      required: true,
    },
    couponId: {
      type: Schema.Types.ObjectId,
      ref: 'coupon',
    },
    paidAmount: {
      type: Number,
      default: 0,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    phoneNumbers: [
      {
        type: String,
        required: true,
      },
    ],
    orderStatus: {
      type: String,
      enum: {
        values: ['pending', 'confirmed', 'placed', 'preparation', 'delivered', 'canceled'],
        message: '{VALUE} not valid',
      },
    },
    paymentMethod: {
      type: String,
      enum: {
        values: ['cash', 'card'],
        message: '{VALUE} not valid',
      },
    },
    cancelReason: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export const orderModel = model('order', orderSchema);
