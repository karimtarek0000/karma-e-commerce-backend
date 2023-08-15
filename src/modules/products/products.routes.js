import { Router } from 'express';
import { errorHandler } from '../../lib/errorHandler.js';
import { validationCore } from '../../middlewares/validations.js';
import {
  allowExtensionsTypes,
  uploadFilesWithCloud,
} from '../../services/uploadFiles.cloud.js';
import { productSchema, updateProductSchema } from './products.validation.js';
import {
  addNewProduct,
  deleteProduct,
  updateProduct,
} from './products.controller.js';

const router = Router();

router
  .post(
    '/',
    uploadFilesWithCloud(allowExtensionsTypes.image).array('product', 4),
    validationCore(productSchema),
    errorHandler(addNewProduct)
  )
  .patch(
    '/:productId',
    uploadFilesWithCloud(allowExtensionsTypes.image).array('product', 4),
    validationCore(updateProductSchema),
    errorHandler(updateProduct)
  )
  .delete('/:productId', errorHandler(deleteProduct));
//   .delete('/:categoryId', errorHandler(deleteCategory))
//   .get('/', errorHandler(getCategories));

export default router;
