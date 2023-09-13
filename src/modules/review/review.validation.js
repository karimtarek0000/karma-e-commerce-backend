import JOI from 'joi';
import { generalValidations } from '../../middlewares/validations.js';

export const addReviewSchema = {
  body: JOI.object({
    reviewRate: JOI.number().min(1).max(5).required(),
    reviewComment: JOI.string().min(5).max(2000),
  }).required(),

  params: JOI.object({
    productId: generalValidations._id.required(),
  }).required(),
};
