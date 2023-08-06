import JOI from "joi";

export const newUserSchema = {
  body: JOI.object({
    userName: JOI.string().trim().required(),
    email: JOI.string()
      .email({ tlds: { allow: true } })
      .required()
      .messages({
        "string.email": "Please enter a valid email address",
        "any.required": "Email is required",
      }),
    contactNumber: JOI.string().trim().required(),
    password: JOI.string()
      .regex(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/)
      .required(),
  }).required(),
};

export const signInSchema = {
  body: JOI.object({
    email: JOI.string()
      .email({ tlds: { allow: true } })
      .required()
      .messages({
        "string.email": "Please enter a valid email address",
        "any.required": "Email is required",
      }),
    password: JOI.string().required(),
  }).required(),
};
