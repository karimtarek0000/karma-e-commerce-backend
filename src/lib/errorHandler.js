import { sendError } from './sendError.js';

export const errorHandler = (API) => (req, res, next) => {
  API(req, res, next).catch((err) => {
    req.catchErrorFn();
    sendError(next, err, 500);
  });
};
