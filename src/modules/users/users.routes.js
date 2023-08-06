import { Router } from "express";
import { createNewUser, logOut, refreshToken, signIn, testData } from "./users.controller.js";
import { errorHandler } from "../../lib/errorHandler.js";
import { validationCore } from "../../middlewares/validations.js";
import { newUserSchema, signInSchema } from "./users.validation.js";
import { auth } from "../../middlewares/auth.js";

const router = Router();

router.post("/", validationCore(newUserSchema), errorHandler(createNewUser));
router.post("/sign-in", validationCore(signInSchema), errorHandler(signIn));

router.get("/refresh-token", errorHandler(refreshToken));
router.get("/logout", errorHandler(logOut));

router.use(errorHandler(auth));
router.get("/data", errorHandler(testData));

export default router;
