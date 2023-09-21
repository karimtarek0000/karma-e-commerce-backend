import bcrypt from 'bcrypt';
import JWT from 'jsonwebtoken';
import { nanoid } from 'nanoid';
import { OAuth2Client } from 'google-auth-library';
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
    options: {},
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

  const { _id, name, email, isConfirmed, role } = userData;

  // ---- Create access token and refresh token ----
  const payload = {
    _id,
    email,
    name,
    isConfirmed,
    role,
  };

  const accessToken = generateToken({
    payload,
    sign: process.env.ACCESS_TOKEN_SECRET,
    options: { expiresIn: '15m' },
  });

  const refreshToken = generateToken({
    payload,
    sign: process.env.REFRESH_TOKE_SECRET,
    options: { expiresIn: '10d' },
  });

  // ---- Adding refresh token in cookies ----
  res.cookie('jwtRefreshToken', refreshToken, {
    httpOnly: true,
    // secure: true, // For HTTPS
    // sameSite: "None", // For CORS
    maxAge: 10 * 24 * 60 * 60 * 1000,
  });

  // ---- Finally adding access token and update status ----
  const user = await userModel
    .findOneAndUpdate(
      { email },
      {
        accessToken,
        status: 'Online',
      },
      {
        new: true,
      }
    )
    .select('-password');

  res.status(200).json({ message: 'Login successfully', user });
};

export const forgetPassword = async (req, res, next) => {
  const { email } = req.body;

  if (!email) return sendError(next, 'Email not exist!', 400);

  // ---- Check if email exist or not ----
  const user = await userModel.findOne({ email });
  if (!user) return sendError(next, 'Email not found!', 400);

  // ---- Generate code to send to user on email ----
  const code = nanoid(12);
  const hashedCode = bcrypt.hashSync(code, +process.env.HASH_LEVEL);

  const token = generateToken({
    payload: { email, hashedCode },
    sign: process.env.ACCESS_TOKEN_SECRET,
    options: { expiresIn: '1h' },
  });

  // ---- Send email to user ----
  // const confirmLink = `${req.protocol}://${req.headers.host}/auth/reset-password?token=${token}`;
  const confirmLink = `${req.headers.origin}/auth/reset-password?token=${token}`;

  const forgetPasswordLink = sendEmailService({
    to: email,
    subject: 'Reset password in karma',
    message: emailTemplate({
      link: confirmLink,
      subject: 'Email reset password',
      btnTitle: 'Reset password',
    }),
  });

  if (!forgetPasswordLink) {
    return sendError(next, 'Faild send email to reset password', 400);
  }

  // ---- Update user on database ----
  const updateUser = await userModel.findOneAndUpdate(
    { email },
    {
      forgetCode: code,
    },
    {
      new: true,
    }
  );

  if (!updateUser) {
    return sendError(next, 'Update user faild', 400);
  }

  res.status(200).json({ message: 'Has been send email for reset password' });
};

export const resetPassword = async (req, res, next) => {
  const { token } = req.params;
  const { password } = req.body;

  // ------ Decoded token -------
  const decoded = JWT.verify(token, process.env.ACCESS_TOKEN_SECRET);
  if (!decoded.email) return sendError(next, 'Token not valid', 400);

  // ------ Check email exist ot not -------
  const user = await userModel.findOne({ email: decoded.email });
  if (!user) return sendError(next, 'User not found', 400);

  // ------ Check if exist forgetCode or not -------
  if (!user.forgetCode) return sendError(next, 'Link is not valid', 404);

  // ------ Compare hashed code -------
  const compareHashStatus = bcrypt.compareSync(user.forgetCode, decoded.hashedCode);
  if (!compareHashStatus) {
    return sendError(next, 'Code is not valid', 400);
  }

  // ------ Update user in database -------
  user.forgetCode = null;
  user.password = password;

  const updateUser = await user.save();

  if (!updateUser) {
    return sendError(next, 'Update user faild!', 400);
  }

  res.status(201).json({ message: 'Password updated successfully' });
};

export const refreshToken = async (req, res, next) => {
  const jwtRefreshToken = req.cookies?.jwtRefreshToken;

  // ---- Check if refresh token exist ------
  if (!jwtRefreshToken) return sendError(next, 'Refresh token not exist!', 400);

  // ---- Check refresh token valid or not ------
  const decoded = JWT.verify(jwtRefreshToken, process.env.REFRESH_TOKE_SECRET);
  if (!decoded.email) {
    return sendError(next, 'Refresh token is not valid!', 400);
  }

  // ---- Check email exist ------
  const userData = await userModel.findOne({ email: decoded.email });

  if (!userData) return sendError(next, 'User not exist!', 400);

  // ---- Generate new access token ------
  const { _id, name, email, role } = userData;

  const accessToken = generateToken({
    payload: { _id, name, email, role },
    sign: process.env.ACCESS_TOKEN_SECRET,
    options: { expiresIn: '15m' },
  });

  // ---- Adding new access token in user database ------
  const updateUser = await userModel.findOneAndUpdate({ email }, { accessToken }, { new: true });

  if (!updateUser) return sendError(next, 'Update user faild', 400);

  res.status(200).json({ message: 'Generate new access token', accessToken });
};

export const logOut = async (req, res, next) => {
  const jwtRefreshToken = req.cookies?.jwtRefreshToken;

  if (!jwtRefreshToken) return sendError(next, 'No content', 204);

  // --------- Clear cookie ----------
  res.clearCookie('jwtRefreshToken', {
    httpOnly: true,
    // secure: true, // For HTTPS
    // sameSite: "None", // For CORS
  });
  res.status(200).json({ message: 'Logout successfully' });
};

export const loginWithGoogle = async (req, res, next) => {
  const { idToken } = req.body;

  // ------------------- Google to verfiy `idToken` -------------------
  const client = new OAuth2Client();
  async function verify() {
    const ticket = await client.verifyIdToken({
      idToken,
      // Projects you can use like that ['proj-1', 'proj-2']
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();

    return payload;
  }

  const { name, email, email_verified } = await verify();
  if (!email_verified) return sendError(next, 'Email not verified', 400);

  // ------------------- Check if email exist or not -------------------
  const userExist = await userModel.findOne({
    email,
    provider: 'GOOGLE',
  });

  // ------------------- If user exist, login with google email -------------------
  if (userExist) {
    const { _id, isConfirmed, role } = userExist;

    // ---- Create access token and refresh token ----
    const payload = {
      _id,
      email,
      name,
      isConfirmed,
      role,
    };

    const accessToken = generateToken({
      payload,
      sign: process.env.ACCESS_TOKEN_SECRET,
      options: { expiresIn: '15m' },
    });

    const _refreshToken = generateToken({
      payload,
      sign: process.env.REFRESH_TOKE_SECRET,
      options: { expiresIn: '10d' },
    });

    // ---- Adding refresh token in cookies ----
    res.cookie('jwtRefreshToken', _refreshToken, {
      httpOnly: true,
      // secure: true, // For HTTPS
      // sameSite: "None", // For CORS
      maxAge: 10 * 24 * 60 * 60 * 1000,
    });

    // ---- Adding access token and update status ----
    const user = await userModel
      .findOneAndUpdate(
        { email },
        {
          accessToken,
          status: 'Online',
        },
        {
          new: true,
        }
      )
      .select('-password');

    return res.status(200).json({ message: 'Login successfully', user });
  }

  // ----------------------- If user not exist, signup with new user data -----------------------
  const newUser = await userModel.create({
    name,
    email,
    password: nanoid(15),
    isConfirmed: true,
    phoneNumber: '00000000',
    provider: 'GOOGLE',
  });

  if (!newUser) return sendError(next, 'User signup faild, please try again', 400);

  // ------ Generate `accessToken` and `refreshToken` after user signup -------
  const { _id, isConfirmed, role } = newUser;
  const payload = {
    _id,
    email,
    name,
    isConfirmed,
    role,
  };

  const accessToken = generateToken({
    payload,
    sign: process.env.ACCESS_TOKEN_SECRET,
    options: { expiresIn: '15m' },
  });

  const _refreshToken = generateToken({
    payload,
    sign: process.env.REFRESH_TOKE_SECRET,
    options: { expiresIn: '10d' },
  });

  // ---- Adding refresh token in cookies ----
  res.cookie('jwtRefreshToken', _refreshToken, {
    httpOnly: true,
    // secure: true, // For HTTPS
    // sameSite: "None", // For CORS
    maxAge: 10 * 24 * 60 * 60 * 1000,
  });

  newUser.accessToken = accessToken;
  newUser.status = 'Online';

  await newUser.save();

  res.status(200).json({ message: 'Login successfully', user: { ...newUser, accessToken } });
};
