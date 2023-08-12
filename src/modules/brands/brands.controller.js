import { nanoid } from 'nanoid';
import slugify from 'slugify';
import { categoryModel } from '../../../DB/models/Category.model.js';
import { subCategoryModel } from '../../../DB/models/SubCategory.model.js';
import cloudinary from '../../lib/cloudinary.cloud.js';
import { sendError } from '../../lib/sendError.js';
import { brandModel } from '../../../DB/models/Brand.model.js';

export const addNewBrand = async (req, res, next) => {
  const { file } = req.file;
  const { name, categoryId, subCategoryId } = req.body;

  const category = await categoryModel.findById(categoryId);
  const subCategory = subCategoryModel.findById(subCategoryId);

  if (!category || !subCategory) {
    return sendError(next, 'CategoryId or SubCategoryId not valid', 400);
  }

  const customId = nanoid(20);
  const { public_id, secure_url } = await cloudinary.uploader.upload(
    file.path,
    {
      folder: `${process.env.FOLDER_NAME}/categories/${category.customId}/subCategories/${subCategory.customId}/brands/${customId}`,
    }
  );

  const slug = slugify(name, '_');

  const brand = await brandModel.create({
    name,
    slug,
    categoryId,
    subCategoryId,
    image: { public_id, secure_url },
  });

  if (!brand) {
    await cloudinary.uploader.destroy(public_id);
    return sendError(next, 'Error happend please try again', 400);
  }

  res.status(201).json('Create new brand', brand);
};
