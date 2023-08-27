import JOI from 'joi';
import { generalValidations } from '../../middlewares/validations.js';

export const addCartSchema = {
  body: JOI.object({
    productId: generalValidations._id,
    quantity: JOI.number().positive().min(1),
  })
    .required()
    .options({ presence: 'required' }),
};

export const deleteCartSchema = {
  params: JOI.object({
    productId: generalValidations._id,
  })
    .required()
    .options({ presence: 'required' }),
};
