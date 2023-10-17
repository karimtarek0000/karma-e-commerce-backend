import JOI from 'joi';
import { generalValidations } from '../../middlewares/validations.js';

export const addProductInSliderSchema = {
  body: JOI.object({
    productId: generalValidations._id,
    tag: JOI.string().optional(),
  })
    .required()
    .options({ presence: 'required' }),

  file: JOI.object().required(),
};
