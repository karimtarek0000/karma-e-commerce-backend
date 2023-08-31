import { nanoid } from 'nanoid';
import slugify from 'slugify';
import { categoryModel } from '../../../DB/models/Category.model.js';
import { subCategoryModel } from '../../../DB/models/SubCategory.model.js';
import cloudinary from '../../lib/cloudinary.cloud.js';
import { sendError } from '../../lib/sendError.js';
import { brandModel } from '../../../DB/models/Brand.model.js';

// -------------- Get all brands --------------
export const getAllBrands = async (req, res) => {
  const brands = await brandModel.find();

  res.status(200).json({ message: 'All brands', brands });
};

// -------------- Add new brand --------------
export const addNewBrand = async (req, res, next) => {
  const { file } = req;
  const { name, categoryId, subCategoryId } = req.body;
  const userId = req.userData._id;

  const category = await categoryModel.findById(categoryId);
  const subCategory = await subCategoryModel.findById(subCategoryId);

  if (!category || !subCategory) {
    return sendError(next, 'CategoryId or SubCategoryId not valid', 400);
  }

  const customId = nanoid(20);
  const { public_id, secure_url } = await cloudinary.uploader.upload(file.path, {
    folder: `${process.env.FOLDER_NAME}/categories/${category.customId}/subCategories/${subCategory.customId}/brands/${customId}`,
  });

  const slug = slugify(name, '_');

  const brand = await brandModel.create({
    name,
    slug,
    categoryId,
    subCategoryId,
    customId,
    createdBy: userId,
    image: { public_id, secure_url },
  });

  if (!brand) {
    await cloudinary.uploader.destroy(public_id);
    return sendError(next, 'Error happend please try again', 400);
  }

  res.status(201).json({ message: 'Create new brand', brand });
};

// -------------- Update brand --------------
export const updateBrand = async (req, res, next) => {
  const { file } = req;
  const { id, name } = req.body;

  if (!name || !file) {
    return sendError(next, 'No any data found to update', 400);
  }

  const brand = await brandModel
    .findById(id)
    .populate([{ path: 'categoryId' }, { path: 'subCategoryId' }]);

  // Check if brand id exist or not
  if (!brand) {
    return sendError(next, 'No brand found with this id', 400);
  }

  // If name exist
  if (name) {
    const slug = slugify(name, '_');

    brand.name = name;
    brand.slug = slug;
  }

  // If there image
  if (file) {
    // Delete old image
    await cloudinary.uploader.destroy(brand.image.public_id);

    // Upload new image
    const { public_id, secure_url } = await cloudinary.uploader.upload(file.path, {
      folder: `${process.env.FOLDER_NAME}/categories/${brand.categoryId.customId}/subCategories/${brand.subCategoryId.customId}/brands/${brand.customId}`,
    });

    brand.image = { public_id, secure_url };
  }

  const brandData = await brand.save();

  res.status(201).json({
    message: 'Update brand successfully',
    brand: brandData,
  });
};

// -------------- Delete brand --------------
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

  // Delete brand from database
  const brandDeleted = await brandModel.deleteOne({ _id: brandId });

  if (!brandDeleted.deletedCount) {
    return sendError(next, 'Error happend while delete brand please try again', 400);
  }

  // Delete brand image
  const path = `${process.env.FOLDER_NAME}/categories/${brand.categoryId.customId}/subCategories/${brand.subCategoryId.customId}/brands/${brand.customId}`;

  await cloudinary.api.delete_resources_by_prefix(path);
  await cloudinary.api.delete_folder(path);

  res.status(200).json({ message: 'Delete brand successfully', status: true });
};
