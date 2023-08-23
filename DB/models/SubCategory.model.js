import { Schema, model } from 'mongoose';

const subCategorySchema = new Schema(
  {
    name: {
      type: String,
      unique: true,
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
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: 'category',
      required: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'user',
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

subCategory.virtual('brands', {
  ref: 'brand',
  foreignField: 'subCategoryId',
  localField: '_id',
});

export const subCategoryModel = model('subcategory', subCategorySchema);
