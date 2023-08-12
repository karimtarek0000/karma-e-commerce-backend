const placesData = ['body', 'params', 'query', 'file', 'files'];

export const validationCore = (schema) => (req, res, next) => {
  const validationErrors = [];

  for (const key of placesData) {
    if (schema[key]) {
      const resultValidation = schema[key].validate(req[key], {
        abortEarly: false,
      });

      if (resultValidation.error) {
        const errors = resultValidation.error.details.map(
          (error) => error.message
        );
        validationErrors.push({ [key]: errors });
      }
    }
  }

  if (validationErrors.length) {
    return res
      .status(400)
      .json({ status: 'Validation Error', validationErrors });
  }

  next();
};
