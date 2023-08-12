import { Router } from 'express';
import { errorHandler } from '../../lib/errorHandler.js';
import { validationCore } from '../../middlewares/validations.js';
import {
  allowExtensionsTypes,
  uploadFilesWithCloud,
} from '../../services/uploadFiles.cloud.js';
import { productSchema } from './products.validation.js';
import { addNewProduct } from './products.controller.js';

const router = Router();

router.post(
  '/',
  uploadFilesWithCloud(allowExtensionsTypes.image).array('product', 4),
  validationCore(productSchema),
  errorHandler(addNewProduct)
);
//   .patch(
//     '/',
//     uploadFilesWithCloud(allowExtensionsTypes.image).single('category', 1),
//     validationCore(updateCategorySchema),
//     errorHandler(updateCategory)
//   )
//   .delete('/:categoryId', errorHandler(deleteCategory))
//   .get('/', errorHandler(getCategories));

export default router;
