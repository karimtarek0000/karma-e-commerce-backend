import { Router } from 'express';
import { errorHandler } from '../../lib/errorHandler.js';
import { validationCore } from '../../middlewares/validations.js';
import {
  allowExtensionsTypes,
  uploadFilesWithCloud,
} from '../../services/uploadFiles.cloud.js';
import { addNewBrand, deleteBrand } from './brands.controller.js';
import { brandSchema } from './brands.validation.js';

const router = Router();

router
  .post(
    '/',
    uploadFilesWithCloud(allowExtensionsTypes.image).single('brand', 1),
    validationCore(brandSchema),
    errorHandler(addNewBrand)
  )
  .delete('/', errorHandler(deleteBrand));

export default router;
