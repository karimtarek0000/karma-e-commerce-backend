import { Schema, model } from 'mongoose';

const productSchema = new Schema(
  {
    title: {
      type: String,
      lowercase: true,
      required: true,
    },
    description: {
      type: String,
      lowercase: true,
      required: true,
    },
    slug: {
      type: String,
      lowercase: true,
      required: true,
    },
    price: {
      type: Number,
      default: 1,
      required: true,
    },
    discount: {
      type: Number,
      default: 0,
    },
    priceAfterDiscount: {
      type: Number,
      default: 0,
    },
    stock: {
      type: Number,
      default: 1,
      required: true,
    },
    colors: {
      type: [String],
    },
    sizes: {
      type: [String],
    },
    images: [
      {
        public_id: {
          type: String,
          required: true,
        },
        secure_url: {
          type: String,
          required: true,
        },
      },
    ],
    customId: {
      type: String,
      unique: true,
      required: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'user',
      required: true,
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
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: 'category',
      required: true,
    },
    subCategoryId: {
      type: Schema.Types.ObjectId,
      ref: 'subcategory',
      required: true,
    },
    brandId: {
      type: Schema.Types.ObjectId,
      ref: 'brand',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const productModel = model('product', productSchema);
