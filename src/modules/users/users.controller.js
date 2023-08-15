import bcrypt from 'bcrypt';
import JWT from 'jsonwebtoken';
import { userModel } from '../../../DB/models/User.model.js';
import { sendError } from '../../lib/sendError.js';

export const createNewUser = async (req, res, next) => {
  const { userName, email, contactNumber, password } = req.body;

  const userExist = await userModel.findOne({ email });

  if (userExist) {
    return sendError(next, 'Email alerady exist please add another email', 400);
  }

  const hashPassword = bcrypt.hashSync(password, +process.env.HASH_LEVEL);

  if (!hashPassword) return sendError(next, 'Error hashing password', 400);

  const data = await userModel.create({
    userName,
    email,
    contactNumber,
    password: hashPassword,
  });

  res.status(201).json({
    message: 'New user created successfully',
    user: {
      userName: data.userName,
      email: data.email,
    },
  });
};

export const signIn = async (req, res, next) => {
  const { email, password } = req.body;

  const userData = await userModel.findOne({ email });

  if (!userData) return sendError(next, 'Email or password not correct!', 400);

  const comparePassword = bcrypt.compareSync(password, userData.password);

  if (!comparePassword) return sendError(next, 'Password not correct!', 400);

  const { _id, userName } = userData;
  const accessToken = JWT.sign(
    { _id, email, userName },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: '30s',
    }
  );

  const refreshToken = JWT.sign(
    { _id, email, userName },
    process.env.REFRESH_TOKE_SECRET,
    {
      expiresIn: '5d',
    }
  );

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

      const { _id, email, userName } = userData;
      const accessToken = JWT.sign(
        { _id, email, userName },
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
  const refreshToken = req.cookies?.jwtRefreshToken;

  if (!refreshToken) return sendError(next, 'No content', 204);

  res.clearCookie('jwtRefreshToken', {
    httpOnly: true,
    // secure: true, // For HTTPS
    // sameSite: "None", // For CORS
  });
  res.status(204).json({ message: 'Logout successfully' });
};

export const testData = async (req, res, next) => {
  const user = req.userData;
  res.json({ message: 'Done', user });
};
