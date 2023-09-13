import { Router } from 'express';
import { isAuth } from '../../middlewares/auth.js';
import { validationCore } from '../../middlewares/validations.js';
import { errorHandler } from '../../lib/errorHandler.js';
import { systemRoles } from '../../utils/systemRoles.js';
import { addNewReview } from './review.controller.js';
import { addReviewSchema } from './review.validation.js';

const router = Router();

router
  .use(isAuth([systemRoles.USER]))
  .post('/:productId', validationCore(addReviewSchema), errorHandler(addNewReview));

export default router;
