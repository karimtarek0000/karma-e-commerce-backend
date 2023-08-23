import { Schema, model } from 'mongoose';

const categorySchema = new Schema(
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
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual
categorySchema.virtual('subCategories', {
  ref: 'subcategory',
  foreignField: 'categoryId',
  localField: '_id',
});

export const categoryModel = model('category', categorySchema);
