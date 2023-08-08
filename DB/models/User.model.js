import mongoose, { Schema } from "mongoose";

const users = new Schema(
  {
    email: {
      type: String,
      required: true,
    },
    userName: {
      type: String,
      required: true,
    },
    contactNumber: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  {
    timeseries: true,
  }
);

export const userModel = mongoose.model("user", users);
