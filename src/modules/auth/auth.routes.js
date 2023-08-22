import { Router } from 'express';
import { errorHandler } from '../../lib/errorHandler.js';
import { validationCore } from '../../middlewares/validations.js';
import {
  createNewUser,
  logOut,
  refreshToken,
  signIn,
} from './auth.controller.js';
import { newUserSchema, signInSchema } from './auth.validation.js';

const router = Router();

router.post('/', validationCore(newUserSchema), errorHandler(createNewUser));
router.post('/sign-in', validationCore(signInSchema), errorHandler(signIn));

router.get('/refresh-token', errorHandler(refreshToken));
router.get('/logout', errorHandler(logOut));

export default router;
