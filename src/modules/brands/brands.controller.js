import { nanoid } from 'nanoid';
import slugify from 'slugify';
import { categoryModel } from '../../../DB/models/Category.model.js';
import { subCategoryModel } from '../../../DB/models/SubCategory.model.js';
import cloudinary from '../../lib/cloudinary.cloud.js';
import { sendError } from '../../lib/sendError.js';
import { brandModel } from '../../../DB/models/Brand.model.js';

export const addNewBrand = async (req, res, next) => {
  const { file } = req;
  const { name, categoryId, subCategoryId } = req.body;

  const category = await categoryModel.findById(categoryId);
  const subCategory = await subCategoryModel.findById(subCategoryId);

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
    customId,
    image: { public_id, secure_url },
  });

  if (!brand) {
    await cloudinary.uploader.destroy(public_id);
    return sendError(next, 'Error happend please try again', 400);
  }

  res.status(201).json({ message: 'Create new brand', brand });
};

export const deleteBrand = async (req, res, next) => {
  const { brandId } = req.body;

  const brand = await brandModel.findById(brandId).populate([
    {
      path: 'categoryId',
    },
    {
      path: 'subCategoryId',
    },
  ]);

  if (!brand) {
    return sendError(next, 'Brand id not valid', 400);
  }

  // Delete brand image
  const path = `${process.env.FOLDER_NAME}/categories/${brand.categoryId.customId}/subCategories/${brand.subCategoryId.customId}/brands/${brand.customId}`;

  await cloudinary.api.delete_resources_by_prefix(path);
  await cloudinary.api.delete_folder(path);

  // Delete brand from database
  await brandModel.deleteOne({ _id: brandId });

  res.status(200).json({ message: 'Delete brand successfully', status: true });
};
