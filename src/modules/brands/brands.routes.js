import { Router } from 'express';
import { errorHandler } from '../../lib/errorHandler.js';
import { isAuth } from '../../middlewares/auth.js';
import { validationCore } from '../../middlewares/validations.js';
import { allowExtensionsTypes, uploadFilesWithCloud } from '../../services/uploadFiles.cloud.js';
import { addNewBrand, deleteBrand, getAllBrands, updateBrand } from './brands.controller.js';
import { brandSchema, updateBrandSchema } from './brands.validation.js';
import { systemRoles } from '../../utils/systemRoles.js';

const router = Router();

router
  .get('/', errorHandler(getAllBrands))
  .use(isAuth([systemRoles.ADMIN, systemRoles.SUPERADMIN]))
  .post(
    '/',
    uploadFilesWithCloud(allowExtensionsTypes.image).single('brand', 1),
    validationCore(brandSchema),
    errorHandler(addNewBrand)
  )
  .patch(
    '/',
    uploadFilesWithCloud(allowExtensionsTypes.image).single('brand', 1),
    validationCore(updateBrandSchema),
    errorHandler(updateBrand)
  )
  .delete('/', errorHandler(deleteBrand));

export default router;
