import { Router } from 'express';
import { errorHandler } from '../../lib/errorHandler.js';
import { isAuth } from '../../middlewares/auth.js';
import { validationCore } from '../../middlewares/validations.js';
import { allowExtensionsTypes, uploadFilesWithCloud } from '../../services/uploadFiles.cloud.js';
import { systemRoles } from '../../utils/systemRoles.js';
import {
  createNewCategory,
  deleteCategory,
  getAllCategories,
  updateCategory,
} from './categories.controller.js';
import { categorySchema, updateCategorySchema } from './categories.validation.js';

const router = Router();

router
  .get('/', errorHandler(getAllCategories))
  .use(isAuth([systemRoles.ADMIN, systemRoles.SUPERADMIN]))
  .post(
    '/',
    uploadFilesWithCloud(allowExtensionsTypes.image).single('category', 1),
    validationCore(categorySchema),
    errorHandler(createNewCategory)
  )
  .patch(
    '/',
    uploadFilesWithCloud(allowExtensionsTypes.image).single('category', 1),
    validationCore(updateCategorySchema),
    errorHandler(updateCategory)
  )
  .delete('/:categoryId', errorHandler(deleteCategory));

export default router;
