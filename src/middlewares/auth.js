import JWT from "jsonwebtoken";
import { sendError } from "../lib/sendError.js";
import { usersModel } from "../../DB/models/Users.model.js";

export const auth = async (req, res, next) => {
  const accessToken = req.header("Authorization");

  if (accessToken && accessToken.startsWith("Bearer")) {
    const token = accessToken.split(" ")[1];

    let userDataFromToken = null;
    JWT.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, data) => {
      if (err) return sendError(next, "Unauthorized!", 401);
      userDataFromToken = data;
    });

    if (userDataFromToken) {
      const userData = await usersModel.findOne({ email: userDataFromToken.email });

      if (!userData) return sendError(next, "This user not exist!", 400);

      const { _id, userName, email } = userData;
      req.userData = {
        _id,
        email,
        userName,
      };
      next();
    }
  } else {
    return sendError(next, "Token not correct!", 400);
  }
};
