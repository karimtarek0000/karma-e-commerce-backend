import slugify from 'slugify';
import { nanoid } from 'nanoid';
import { subCategoryModel } from '../../../DB/models/SubCategory.model.js';
import { categoryModel } from '../../../DB/models/Category.model.js';
import cloudinary from '../../lib/cloudinary.cloud.js';
import { sendError } from '../../lib/sendError.js';
import { brandModel } from '../../../DB/models/Brand.model.js';

export const getAllSubCategories = async (req, res) => {
  const subCategories = await subCategoryModel.find();

  res.status(200).json({ message: 'All sub categories', subCategories });
};

export const createNewSubCategory = async (req, res, next) => {
  const { file } = req;
  const { name, categoryId } = req.body;

  const categoryIdExist = await categoryModel.findById(categoryId);

  if (!categoryIdExist) {
    return sendError(next, 'No there any category with this id', 400);
  }

  const subCategoryNameExist = await subCategoryModel.findOne({ name });

  if (subCategoryNameExist) {
    return sendError(next, 'Name sub category already exist!', 400);
  }

  const customId = nanoid(20);

  const { public_id, secure_url } = await cloudinary.uploader.upload(
    file.path,
    {
      folder: `${process.env.FOLDER_NAME}/categories/${categoryIdExist.customId}/subCategories/${customId}`,
    }
  );

  const slug = slugify(name, '_');
  const subCategoryData = await subCategoryModel.create({
    name,
    slug,
    customId,
    image: { public_id, secure_url },
    categoryId: categoryIdExist._id,
  });

  // If data not created in database will remove image
  if (!subCategoryData) {
    await cloudinary.uploader.destroy(public_id);
    return sendError(
      next,
      'Error happend when create data please try again!',
      400
    );
  }

  res.status(201).json({
    message: 'Create sub category successfully',
    subCategory: subCategoryData,
  });
};

export const updateSubCategory = async (req, res, next) => {
  const { file } = req;
  const { id, name } = req.body;

  if (!name || !file) {
    return sendError(next, 'No any data found to update', 400);
  }

  const subCategory = await subCategoryModel
    .findById(id)
    .populate([{ path: 'categoryId' }]);

  // Check if category id exist or not
  if (!subCategory) {
    return sendError(next, 'No category found with this id', 400);
  }

  // If name exist
  if (name) {
    // Check if new name unique or not
    const categoryExistWithNewName = await subCategoryModel.findOne({ name });
    if (categoryExistWithNewName) {
      return sendError(next, 'This sub category name alerady exist', 400);
    }

    const slug = slugify(name, '_');

    subCategory.name = name;
    subCategory.slug = slug;
  }

  // If there image
  if (file) {
    // Delete old image
    await cloudinary.uploader.destroy(subCategory.image.public_id);

    // Upload new image
    const { public_id, secure_url } = await cloudinary.uploader.upload(
      file.path,
      {
        folder: `${process.env.FOLDER_NAME}/categories/${subCategory.categoryId.customId}/subCategories/${subCategory.customId}`,
      }
    );

    subCategory.image = { public_id, secure_url };
  }

  const subCategoryData = await subCategory.save();
  res.status(201).json({
    message: 'Update sub category successfully',
    subCategory: subCategoryData,
  });
};

export const deleteSubCategory = async (req, res, next) => {
  const { subCategoryId } = req.params;

  const subCategory = await subCategoryModel
    .findById(subCategoryId)
    .populate([{ path: 'categoryId' }]);

  if (!subCategory) return sendError(next, 'Subcategory id not correct', 400);

  const [subcategory, brand] = await Promise.all([
    subCategoryModel.deleteOne({ _id: subCategoryId }),
    brandModel.deleteMany({
      subCategoryId,
    }),
  ]);

  if (!subcategory || !brand.deletedCount) {
    return sendError(
      next,
      'Error happend while delete subcategory and brand',
      400
    );
  }

  // Delete images with folders
  const path = `${process.env.FOLDER_NAME}/categories/${subCategory.categoryId.customId}/subCategories/${subCategory.customId}`;
  await cloudinary.api.delete_resources_by_prefix(path);
  await cloudinary.api.delete_folder(path);

  res
    .status(200)
    .json({ message: 'Delete subcategory successfully', status: true });
};
