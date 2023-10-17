import { Schema, model } from 'mongoose';

const sliderSchema = new Schema(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'product',
      required: true,
    },
    sliderImage: {
      public_id: {
        type: String,
        required: true,
      },
      secure_url: {
        type: String,
        required: true,
      },
    },
    tag: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export const sliderModel = model('slider', sliderSchema);
