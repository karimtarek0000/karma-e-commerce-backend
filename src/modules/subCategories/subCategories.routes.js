import { Router } from 'express';
import { errorHandler } from '../../lib/errorHandler.js';
import { isAuth } from '../../middlewares/auth.js';
import {
  createNewSubCategory,
  deleteSubCategory,
  getAllSubCategories,
  updateSubCategory,
} from './subCategories.controller.js';
import { validationCore } from '../../middlewares/validations.js';
import { subCategorySchema, updateSubCategorySchema } from './subCategories.validation.js';
import { uploadFilesWithCloud, allowExtensionsTypes } from '../../services/uploadFiles.cloud.js';

const router = Router();

router
  .get('/', errorHandler(getAllSubCategories))
  .use(isAuth)
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
  )
  .delete('/:subCategoryId', errorHandler(deleteSubCategory));

export default router;
