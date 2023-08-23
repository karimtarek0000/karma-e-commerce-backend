import JOI from 'joi';
import { generalValidations } from '../../middlewares/validations.js';

const share = {
  name: JOI.string().trim(),
};

export const categorySchema = {
  body: JOI.object({
    ...share,
  }).options({ presence: 'required' }),
  file: JOI.object().required(),
};

export const updateCategorySchema = {
  body: JOI.object({
    categoryId: generalValidations._id,
    ...share,
  }),
  file: JOI.object(),
};
