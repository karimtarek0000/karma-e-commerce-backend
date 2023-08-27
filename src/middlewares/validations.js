import { Types } from 'mongoose';
import JOI from 'joi';
import { sendError } from '../lib/sendError.js';

const placesData = ['body', 'params', 'query', 'file', 'files'];

// ---------- Custom validation ---------------
const validationObjectId = (value, helper) =>
  Types.ObjectId.isValid(value) ? true : helper.message('Invalid id');

// ---------- General validation ---------------
export const generalValidations = {
  _id: JOI.string().custom(validationObjectId),
};

// ---------- Validation core ---------------
export const validationCore = (schema) => (req, res, next) => {
  const validationErrors = [];

  for (const key of placesData) {
    if (schema[key]) {
      const resultValidation = schema[key].validate(req[key], {
        abortEarly: false,
      });

      if (resultValidation.error) {
        const errors = resultValidation.error.details.map((error) => error.message);
        validationErrors.push({ [key]: errors });
      }
    }
  }

  if (validationErrors.length) {
    req.validationErrors = validationErrors;
    return sendError(next, validationErrors, 400);
  }

  next();
};
