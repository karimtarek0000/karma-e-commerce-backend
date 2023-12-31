import { Schema, model } from 'mongoose';
import bcrypt from 'bcrypt';
import { systemRoles } from '../../src/utils/systemRoles.js';

const userSchema = new Schema(
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
        values: Object.values(systemRoles),
        message: '{Value} is not a valid role',
      },
      default: systemRoles.USER,
      required: true,
    },
    status: {
      type: String,
      default: 'Offline',
      enum: {
        values: ['Online', 'Offline'],
        message: '{Value} is not a valid status',
      },
    },
    address: {
      type: String,
      required: false,
    },
    accessToken: {
      type: String,
      required: false,
    },
    forgetCode: {
      type: String,
      default: null,
    },
    isConfirmed: {
      type: Boolean,
      default: false,
      required: true,
    },
    provider: {
      type: String,
      default: 'System',
      enum: ['System', 'GOOGLE', 'facebook'],
    },
  },
  {
    timeseries: true,
  }
);

// Hooks
userSchema.pre('save', function (next) {
  this.password = bcrypt.hashSync(this.password, +process.env.HASH_LEVEL);
  next();
});

export const userModel = model('user', userSchema);
