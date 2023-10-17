import { Router } from 'express';
import { errorHandler } from '../../lib/errorHandler.js';
import { isAuth } from '../../middlewares/auth.js';
import { validationCore } from '../../middlewares/validations.js';
import { allowExtensionsTypes, uploadFilesWithCloud } from '../../services/uploadFiles.cloud.js';
import { systemRoles } from '../../utils/systemRoles.js';
import { addProductInSlider, slider } from './home.controller.js';
import { addProductInSliderSchema } from './home.validation.js';

const router = Router();

router
  .get('/slider', errorHandler(slider))
  .use(isAuth([systemRoles.ADMIN, systemRoles.SUPERADMIN]))
  .post(
    '/slider',
    uploadFilesWithCloud(allowExtensionsTypes.image).single('product', 1),
    validationCore(addProductInSliderSchema),
    errorHandler(addProductInSlider)
  );

export default router;
