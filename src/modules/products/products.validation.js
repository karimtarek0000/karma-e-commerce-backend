import JOI from 'joi';
import { generalValidations } from '../../middlewares/validations.js';

const shareValidation = {
  categoryId: generalValidations._id,
  subCategoryId: generalValidations._id,
  brandId: generalValidations._id,
  colors: JOI.array().items(JOI.string().trim()),
  sizes: JOI.array().items(JOI.string().trim()),
  discount: JOI.number().min(1).integer(),
};

export const productSchema = {
  body: JOI.object({
    title: JOI.string().trim().required(),
    description: JOI.string().required(),
    price: JOI.number().required(),
    stock: JOI.number().min(1).integer().required(),
    ...shareValidation,
  }),

  files: JOI.array().min(1).required(),
};

export const updateProductSchema = {
  body: JOI.object({
    title: JOI.string().trim(),
    description: JOI.string(),
    price: JOI.number(),
    stock: JOI.number().min(1).integer(),
    ...shareValidation,
  }),

  files: JOI.array(),
};
