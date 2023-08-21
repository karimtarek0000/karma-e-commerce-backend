import bcrypt from 'bcrypt';
import JWT from 'jsonwebtoken';
import { userModel } from '../../../DB/models/User.model.js';
import { sendError } from '../../lib/sendError.js';

export const createNewUser = async (req, res, next) => {
  const { name, email, phoneNumber, password } = req.body;

  const userExist = await userModel.findOne({ email });

  // ---- Check if email already exist or not ------
  if (userExist) {
    return sendError(next, 'Email already exist please add another email', 400);
  }

  // ---- Encrypt password ------
  const hashPassword = bcrypt.hashSync(password, +process.env.HASH_LEVEL);

  if (!hashPassword) return sendError(next, 'Error hashing password', 400);

  // ---- Save the user data in database ------
  const data = await userModel.create({
    name,
    email,
    phoneNumber,
    password: hashPassword,
  });

  if (!data) return sendError(next, 'Error saving data', 400);

  res.status(201).json({
    message: 'New user created successfully',
    user: {
      name: data.name,
      email: data.email,
    },
  });
};

export const signIn = async (req, res, next) => {
  const { email: getEmail, password } = req.body;

  // ---- Check if email exist or not ----
  const userData = await userModel.findOne({ email: getEmail });

  if (!userData) return sendError(next, 'Email or password not correct!', 400);

  // ---- Compare password with password in database ----
  const comparePassword = bcrypt.compareSync(password, userData.password);

  if (!comparePassword) {
    return sendError(next, 'Email or password not correct!', 400);
  }

  const { _id, name, email, isConfirm } = userData;

  // ---- Create access token and refresh token ----
  const accessToken = JWT.sign(
    { _id, email, name, isConfirm },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: '30s',
    }
  );

  const refreshToken = JWT.sign(
    { _id, email, name, isConfirm },
    process.env.REFRESH_TOKE_SECRET,
    {
      expiresIn: '7d',
    }
  );

  // ---- Adding refresh token in cookies ----
  res.cookie('jwtRefreshToken', refreshToken, {
    httpOnly: true,
    // secure: true, // For HTTPS
    // sameSite: "None", // For CORS
    maxAge: 120 * 60 * 60 * 1000,
  });

  res.status(200).json({ message: 'Login successfully', accessToken });
};

export const refreshToken = async (req, res, next) => {
  const refreshToken = req.cookies?.jwtRefreshToken;

  if (!refreshToken) return sendError(next, 'Refresh token not exist!', 400);

  JWT.verify(
    refreshToken,
    process.env.REFRESH_TOKE_SECRET,
    async (err, data) => {
      if (err || !data._id || !data.email) {
        return sendError(next, 'Unauthorized!', 401);
      }

      const userData = await userModel.findOne({ email: data.email });

      if (!userData) return sendError(next, 'User not found!', 400);

      const { _id, email, name } = userData;
      const accessToken = JWT.sign(
        { _id, email, name },
        process.env.ACCESS_TOKEN_SECRET,
        {
          expiresIn: '30s',
        }
      );

      res
        .status(200)
        .json({ message: 'Refresh token successfully', accessToken });
    }
  );
};

export const logOut = async (req, res, next) => {
  const jwtRefreshToken = req.cookies?.jwtRefreshToken;

  if (!jwtRefreshToken) return sendError(next, 'No content', 204);

  res.clearCookie('jwtRefreshToken', {
    httpOnly: true,
    // secure: true, // For HTTPS
    // sameSite: "None", // For CORS
  });
  res.status(204).json({ message: 'Logout successfully' });
};
