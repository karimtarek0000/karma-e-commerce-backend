import { Router } from 'express';
import { errorHandler } from '../../lib/errorHandler.js';
import { validationCore } from '../../middlewares/validations.js';
import {
  confirmEmail,
  createNewUser,
  forgetPassword,
  logOut,
  loginWithGoogle,
  refreshToken,
  resetPassword,
  signIn,
} from './auth.controller.js';
import {
  loginWithGoogleSchema,
  newUserSchema,
  resetPasswordSchema,
  signInSchema,
} from './auth.validation.js';

const router = Router();

router
  .post('/', validationCore(newUserSchema), errorHandler(createNewUser))
  .post('/login-with-google', validationCore(loginWithGoogleSchema), errorHandler(loginWithGoogle))
  .get('/confirm/:token', errorHandler(confirmEmail))
  .post('/forget-password', errorHandler(forgetPassword))
  .patch('/reset-password/:token', validationCore(resetPasswordSchema), errorHandler(resetPassword))
  .post('/sign-in', validationCore(signInSchema), errorHandler(signIn))
  .get('/refresh-token', errorHandler(refreshToken))
  .get('/logout', errorHandler(logOut));

export default router;
