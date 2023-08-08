import { Router } from 'express';
import { errorHandler } from '../../lib/errorHandler.js';
import {
  createNewSubCategory,
  updateSubCategory,
  // eslint-disable-next-line import/extensions
} from './subCategories.controller.js';
import { validationCore } from '../../middlewares/validations.js';
import {
  subCategorySchema,
  updateSubCategorySchema,
} from './subCategories.validation.js';
import {
  uploadFilesWithCloud,
  allowExtensionsTypes,
} from '../../services/uploadFiles.cloud.js';

const router = Router();

router
  .post(
    '/',
    uploadFilesWithCloud(allowExtensionsTypes.image).single('subCategory', 1),
    validationCore(subCategorySchema),
    errorHandler(createNewSubCategory)
  )
  .patch(
    '/',
    uploadFilesWithCloud(allowExtensionsTypes.image).single('subCategory', 1),
    validationCore(updateSubCategorySchema),
    errorHandler(updateSubCategory)
  );

export default router;
