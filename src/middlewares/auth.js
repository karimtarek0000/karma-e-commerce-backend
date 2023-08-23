import JWT from 'jsonwebtoken';
import { sendError } from '../lib/sendError.js';
import { userModel } from '../../DB/models/User.model.js';

export const isAuth = async (req, res, next) => {
  try {
    const accessToken = req.header('Authorization');

    if (accessToken && accessToken.startsWith('Bearer')) {
      const token = accessToken.split(' ')[1];

      // -------- Verify token ----------
      const userDataFromToken = JWT.verify(token, process.env.ACCESS_TOKEN_SECRET);

      // ------ If token valid ----------
      if (userDataFromToken.email) {
        const { _id, email } = userDataFromToken;
        const userData = await userModel.findOne({ _id, email }).select('_id name email role');

        if (!userData) return sendError(next, 'This user not exist!', 401);

        req.userData = userData;

        next();
      }
    } else {
      sendError(next, 'Token not correct!', 401);
    }
  } catch (error) {
    return sendError(next, error, 401);
  }
};
