import JWT from 'jsonwebtoken';

export const generateToken = ({ payload, sign, options }) =>
  JWT.sign(payload, sign, options);
