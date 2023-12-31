import { Router } from 'express';
import { errorHandler } from '../../lib/errorHandler.js';
import { isAuth } from '../../middlewares/auth.js';
import { validationCore } from '../../middlewares/validations.js';
import { allowExtensionsTypes, uploadFilesWithCloud } from '../../services/uploadFiles.cloud.js';
import { systemRoles } from '../../utils/systemRoles.js';
import {
  addNewProduct,
  allProducts,
  deleteProduct,
  getProduct,
  updateProduct,
} from './products.controller.js';
import { productSchema, updateProductSchema } from './products.validation.js';

const router = Router();

router
  .get('/', errorHandler(allProducts))
  .get('/:productId', errorHandler(getProduct))
  .use(isAuth([systemRoles.ADMIN, systemRoles.SUPERADMIN]))
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

export default router;
