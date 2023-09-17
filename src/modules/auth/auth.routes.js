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

router.post('/', validationCore(newUserSchema), errorHandler(createNewUser));
router.post(
  '/login-with-google',
  validationCore(loginWithGoogleSchema),
  errorHandler(loginWithGoogle)
);
router.get('/confirm/:token', errorHandler(confirmEmail));
router.get('/forget-password', errorHandler(forgetPassword));
router.patch(
  '/reset-password/:token',
  validationCore(resetPasswordSchema),
  errorHandler(resetPassword)
);
router.post('/sign-in', validationCore(signInSchema), errorHandler(signIn));

router.get('/refresh-token', errorHandler(refreshToken));
router.get('/logout', errorHandler(logOut));

export default router;
