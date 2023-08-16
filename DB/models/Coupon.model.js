import mongoose, { Schema } from 'mongoose';

const coupon = new Schema(
  {
    couponCode: {
      type: String,
      unique: true,
      required: true,
    },
    couponAmount: {
      type: Number,
      min: 1,
      max: 100,
      required: true,
    },
    couponAmountType: {
      type: String,
      enum: {
        values: ['percentage', 'fixed'],
        message: '{VALUE} is not a valid coupon amount type',
      },
      default: 'fixed',
      required: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'user',
      required: false,
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'user',
      required: false,
    },
    deletedBy: {
      type: Schema.Types.ObjectId,
      ref: 'user',
      required: false,
    },
    couponAssignToUsers: [
      {
        userId: {
          type: Schema.Types.ObjectId,
          ref: 'user',
        },
        maxUsage: {
          type: Number,
          default: 1,
          required: true,
        },
      },
    ],
    couponStartDate: {
      type: String,
      required: true,
    },
    couponEndData: {
      type: String,
      required: true,
    },
    couponStatus: {
      type: String,
      enum: {
        values: ['expired', 'valid'],
        message: '{VALUE} is not a valid coupon status',
      },
      default: 'valid',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const couponModel = mongoose.model('coupon', coupon);
