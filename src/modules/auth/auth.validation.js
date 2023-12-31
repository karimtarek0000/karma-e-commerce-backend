import JOI from 'joi';
import { systemRoles } from '../../utils/systemRoles.js';

export const newUserSchema = {
  body: JOI.object({
    name: JOI.string().trim(),
    email: JOI.string()
      .email({ tlds: { allow: true } })
      .messages({
        'string.email': 'Please enter a valid email address',
        'any.required': 'Email is required',
      }),
    phoneNumber: JOI.string().trim().min(11).max(11),
    password: JOI.string().regex(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/),
    role: JOI.string().valid(...Object.values(systemRoles)),
  }).options({ presence: 'required' }),
};

export const signInSchema = {
  body: JOI.object({
    email: JOI.string()
      .email({ tlds: { allow: true } })
      .required()
      .messages({
        'string.email': 'Please enter a valid email address',
        'any.required': 'Email is required',
      }),
    password: JOI.string().required(),
  }).required(),
};

export const resetPasswordSchema = {
  body: JOI.object({
    password: JOI.string().regex(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/),
  })
    .required()
    .options({ presence: 'required' }),
};

export const loginWithGoogleSchema = {
  body: JOI.object({
    idToken: JOI.string().required(),
  }).required(),
};
