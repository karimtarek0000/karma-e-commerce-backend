import { Router } from 'express';
import { errorHandler } from '../../lib/errorHandler.js';
import {
  createNewCategory,
  getCategories,
  updateCategory,
} from './categories.controller.js';
import { validationCore } from '../../middlewares/validations.js';
import {
  categorySchema,
  updateCategorySchema,
} from './categories.validation.js';
import {
  uploadFilesWithCloud,
  allowExtensionsTypes,
} from '../../services/uploadFiles.cloud.js';

const router = Router();

router.post('/');

export default router;
