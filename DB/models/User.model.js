import { Schema, model } from 'mongoose';

const users = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      unique: true,
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
    profilePicture: {
      public_id: {
        type: String,
      },
      secure_url: {
        type: String,
      },
    },
    role: {
      type: String,
      enum: {
        values: ['Buyer', 'Trader', 'Admin', 'SuperAdmin'],
        message: '{Value} is not a valid role',
      },
      required: true,
    },
    status: {
      type: String,
      default: 'offline',
      enum: {
        values: ['Online', 'Offline'],
        message: '{Value} is not a valid status',
      },
    },
    address: {
      type: String,
      required: false,
    },
    token: {
      type: String,
      required: false,
    },
    forgetCode: {
      type: String,
    },
    isConfirmed: {
      type: Boolean,
      default: false,
      required: true,
    },
  },
  {
    timeseries: true,
  }
);

export const userModel = model('user', users);
