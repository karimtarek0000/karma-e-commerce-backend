import JOI from 'joi';
import { generalValidations } from '../../middlewares/validations.js';

export const createOrderSchema = {
  body: JOI.object({
    productId: generalValidations._id,
    quantity: JOI.number().positive().min(1),
    address: JOI.string(),
    phoneNumber: JOI.string().length(11),
    paymentMethod: JOI.string().valid('card', 'cash'),
    couponCode: JOI.string().optional(),
  })
    .required()
    .options({ presence: 'required' }),
};

export const cartToOrderSchema = {
  body: JOI.object({
    address: JOI.string(),
    phoneNumber: JOI.string().length(11),
    paymentMethod: JOI.string().valid('card', 'cash'),
    couponCode: JOI.string().optional(),
  })
    .required()
    .options({ presence: 'required' }),

  params: JOI.object({
    cartId: generalValidations._id,
  }).required(),
};

export const successOrderSchema = {
  query: JOI.object({
    token: JOI.string(),
  })
    .required()
    .options({ presence: 'required' }),
};

export const deliverSchema = {
  params: JOI.object({
    orderId: generalValidations._id,
  })
    .required()
    .options({ presence: 'required' }),
};
