import mongoose, { Schema } from 'mongoose';

const category = new Schema(
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
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'user',
      required: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

category.virtual('subCategories', {
  ref: 'subcategory',
  foreignField: 'categoryId',
  localField: '_id',
});

export const categoryModel = mongoose.model('category', category);
