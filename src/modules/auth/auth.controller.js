import bcrypt from 'bcrypt';
import JWT from 'jsonwebtoken';
import { userModel } from '../../../DB/models/User.model.js';
import { sendError } from '../../lib/sendError.js';
import { generateToken } from '../../utils/useToken.js';
import { sendEmailService } from '../../services/sendEmail.js';
import { emailTemplate } from '../../utils/template.email.js';

export const createNewUser = async (req, res, next) => {
  const { name, email, phoneNumber, password, role } = req.body;

  const userExist = await userModel.findOne({ email });

  // ---- Check if email already exist or not ------
  if (userExist) {
    return sendError(next, 'Email already exist please add another email', 400);
  }

  // ---- Send confirm link to email user ------
  const token = generateToken({
    payload: {
      name,
      email,
      role,
    },
    sign: process.env.ACCESS_TOKEN_SECRET,
    options: {
      expiresIn: '1h',
    },
  });

  const confirmLink = `${req.protocol}://${req.headers.host}/auth/confirm/${token}`;

  const confirmLinkStatus = sendEmailService({
    to: email,
    subject: 'Confirm email in karma',
    message: emailTemplate({
      link: confirmLink,
      subject: 'Confirm Your Email Address',
    }),
  });

  if (!confirmLinkStatus) {
    return sendError(next, 'Error when send to you confirm link email', 400);
  }

  // ---- Save the user data in database ------
  const data = await userModel.create({
    name,
    email,
    phoneNumber,
    role,
    password,
  });

  if (!data) return sendError(next, 'Error saving data in our database', 400);

  res.status(201).json({
    message: 'User created and has been send confirm link to verify your email',
    user: {
      name: data.name,
      email: data.email,
      role: data.role,
    },
  });
};

export const confirmEmail = async (req, res, next) => {
  const { token } = req.params;

  // ------- Verify token -------
  const decoded = JWT.verify(token, process.env.ACCESS_TOKEN_SECRET);

  if (!decoded.email) return sendError(next, 'Token not valid', 400);

  // ------- Check if user exist or not -------
  const user = await userModel.findOneAndUpdate(
    { email: decoded.email, isConfirmed: false },
    { isConfirmed: true }
  );

  if (!user) return sendError(next, 'User not found', 400);

  res.status(200).json({ message: 'Confirmed email successfully' });
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

  const { _id, name, email, isConfirmed } = userData;

  // ---- Create access token and refresh token ----
  const accessToken = JWT.sign(
    { _id, email, name, isConfirmed },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: '30s',
    }
  );

  const refreshToken = JWT.sign(
    { _id, email, name, isConfirmed },
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
  const jwtRefreshToken = req.cookies?.jwtRefreshToken;

  if (!jwtRefreshToken) return sendError(next, 'Refresh token not exist!', 400);

  JWT.verify(
    jwtRefreshToken,
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
