export const sendError = (next, message, status) =>
  next(new Error(message, { cause: status }));
