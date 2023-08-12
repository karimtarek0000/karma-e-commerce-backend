export const errorHandler = (API) => (req, res, next) => {
  API(req, res, next).catch((err) => res.status(500).json({ message: err }));
};
