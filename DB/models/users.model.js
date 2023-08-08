import mongoose, { Schema } from "mongoose";

const user = new Schema({
  userName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  age: {
    type: Number,
    required: true,
  },
  gender: {
    type: String,
    enum: {
      values: ["male", "female"],
      message: "`{VALUE}` is a valid gender",
    },
  },
  profilePic: {
    secure_url: String,
    public_id: String,
  },
  coverPictures: [
    {
      secure_url: String,
      public_id: String,
    },
  ],
  deleted: {
    type: Boolean,
    default: false,
  },
  logIn: {
    type: Boolean,
    default: false,
  },
  isConfirmed: {
    type: Boolean,
    default: false,
  },
});

const userModel = mongoose.model("user", user);

export default userModel;
