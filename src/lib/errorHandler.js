export const errorHandler = (API) => {
  return (req, res, next) => {
    API(req, res, next).catch((err) => res.status(500).json({ message: err }));
  };
};
