import mongoose, { Schema } from "mongoose";

const subCategory = new Schema(
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
      required: false,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

export const subCategoryModel = mongoose.model("subcategory", subCategory);
