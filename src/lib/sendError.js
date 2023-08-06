export const sendError = (next, message, status) => {
  return next(new Error(message, { cause: status }));
};
