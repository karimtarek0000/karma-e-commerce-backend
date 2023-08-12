import mongoose, { Schema } from 'mongoose';

const brand = new Schema(
  {
    name: {
      type: String,
      lowercase: true,
    },
    slug: {
      type: String,
      lowercase: true,
      required: true,
    },
    customId: {
      type: String,
      unique: true,
      required: true,
    },
    image: {
      public_id: {
        type: String,
        required: true,
      },
      secure_url: {
        type: String,
        required: true,
      },
    },
    createdBy: {
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
  },
  {
    timestamps: true,
  }
);

export const brandModel = mongoose.model('brand', brand);
