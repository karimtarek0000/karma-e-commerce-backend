import { Router } from "express";
import { errorHandler } from "../../lib/errorHandler.js";
import { createNewCategory, updateCategory } from "./categories.controller.js";
import { validationCore } from "../../middlewares/validations.js";
import { categorySchema, updateCategorySchema } from "./categories.validation.js";
import { uploadFilesWithCloud, allowExtensionsTypes } from "../../services/uploadFiles.cloud.js";

const router = Router();

router.post(
  "/",
  uploadFilesWithCloud(allowExtensionsTypes.image).single("category", 1),
  validationCore(categorySchema),
  errorHandler(createNewCategory)
);
router.patch(
  "/",
  uploadFilesWithCloud(allowExtensionsTypes.image).single("category", 1),
  validationCore(updateCategorySchema),
  errorHandler(updateCategory)
);

export default router;
