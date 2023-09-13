import { Schema, model } from 'mongoose';

const reviewSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'user',
      required: true,
    },
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'product',
      required: true,
    },
    reviewRate: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },
    reviewComment: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export const reviewModel = model('review', reviewSchema);
