import mongoose, { Schema } from "mongoose";

const category = new Schema(
  {
    name: {
      type: string,
      unique: true,
      lowercase: true,
    },
    slug: {
      type: String,
      required: true,
    },
    customId: {
      type: String,
      unique: true,
      required: true,
    },
    image: {
      publicId: {
        type: String,
        required: true,
      },
      secureId: {
        type: String,
        required: true,
      },
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

export const categoryModel = mongoose.model("category", category);
