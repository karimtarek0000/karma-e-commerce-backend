import JOI from 'joi';
// import { generalValidations } from '../../middlewares/validations.js';

const share = {
  name: JOI.string().trim(),
  // createdBy: generalValidations._id,
};

export const categorySchema = {
  body: JOI.object({
    ...share,
  }).options({ presence: 'required' }),
  file: JOI.object().required(),
};

export const updateCategorySchema = {
  body: JOI.object({
    categoryId: JOI.string().trim().required(),
    ...share,
  }),
  file: JOI.object(),
};
