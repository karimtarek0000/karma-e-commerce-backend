import { Router } from 'express';
import { errorHandler } from '../../lib/errorHandler.js';
import { validationCore } from '../../middlewares/validations.js';
import { allowExtensionsTypes, uploadFilesWithCloud } from '../../services/uploadFiles.cloud.js';
import { createNewCategory, deleteCategory, getCategories, updateCategory } from './categories.controller.js';
import { categorySchema, updateCategorySchema } from './categories.validation.js';
import { isAuth } from '../../middlewares/auth.js';

const router = Router();

router
  .get('/', errorHandler(getCategories))
  .use(isAuth)
  .post('/', uploadFilesWithCloud(allowExtensionsTypes.image).single('category', 1), validationCore(categorySchema), errorHandler(createNewCategory))
  .patch(
    '/',
    uploadFilesWithCloud(allowExtensionsTypes.image).single('category', 1),
    validationCore(updateCategorySchema),
    errorHandler(updateCategory)
  )
  .delete('/:categoryId', errorHandler(deleteCategory));

export default router;
