import mongoose, { Schema } from 'mongoose';

const users = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    isConfirm: {
      type: Boolean,
      default: false,
      required: true,
    },
  },
  {
    timeseries: true,
  }
);

export const userModel = mongoose.model('user', users);
