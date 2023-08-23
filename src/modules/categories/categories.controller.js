import { nanoid } from 'nanoid';
import slugify from 'slugify';
import { categoryModel } from '../../../DB/models/Category.model.js';
import cloudinary from '../../lib/cloudinary.cloud.js';
import { sendError } from '../../lib/sendError.js';
import { subCategoryModel } from '../../../DB/models/SubCategory.model.js';
import { brandModel } from '../../../DB/models/Brand.model.js';
import { productModel } from '../../../DB/models/Product.model.js';

// ------ Get all categories --------
export const getCategories = async (req, res) => {
  const categories = await categoryModel.find().populate([
    {
      path: 'subCategories',
      populate: [{ path: 'brands' }],
    },
  ]);

  res.status(200).json({ message: 'All categories and sub categories', categories });
};

// ------ Add new category --------
export const createNewCategory = async (req, res, next) => {
  const { file } = req;
  const { name } = req.body;
  const { _id } = req.userData;

  const categoryNameExist = await categoryModel.findOne({ name });

  if (categoryNameExist) {
    return sendError(next, 'Name category already exist!', 400);
  }

  const customId = nanoid(20);
  const path = `${process.env.FOLDER_NAME}/categories/${customId}`;

  const { public_id, secure_url } = await cloudinary.uploader.upload(file.path, {
    folder: path,
  });

  // -------------------------- Send fn to catch if happend any error --------------------------
  async function deleteResources() {
    await cloudinary.api.delete_resources_by_prefix(path);
    await cloudinary.api.delete_folder(path);
  }

  req.catchErrorFn = deleteResources;

  const slug = slugify(name, '_');
  const categoryData = await categoryModel.create({
    name,
    slug,
    customId,
    createdBy: _id,
    image: { public_id, secure_url },
  });

  // If data not created in database will remove image
  if (!categoryData) {
    await deleteResources();

    return sendError(next, 'Error happend when create category please try again!', 400);
  }

  res.status(201).json({ message: 'Create category successfully', category: categoryData });
};

// ------ Update category --------
export const updateCategory = async (req, res, next) => {
  const { file } = req;
  const { categoryId, name } = req.body;
  const { _id } = req.userData;

  if (!name && !file) {
    return sendError(next, 'No any data found to update', 400);
  }

  const category = await categoryModel.findOne({ _id: categoryId, createdBy: _id });

  // Check if category id exist or not
  if (!category) return sendError(next, 'No category found with this id', 400);

  // If name exist
  if (name) {
    // Check if new name unique or not
    const categoryExistWithNewName = await categoryModel.findOne({ name });
    if (categoryExistWithNewName) {
      return sendError(next, 'This category name alerady exist', 400);
    }

    const slug = slugify(name, '_');

    category.name = name;
    category.slug = slug;
  }

  // If there image
  if (file) {
    // Delete old image
    await cloudinary.uploader.destroy(category.image.public_id);

    // Upload new image
    const { public_id, secure_url } = await cloudinary.uploader.upload(file.path, {
      folder: `${process.env.FOLDER_NAME}/categories/${category.customId}`,
    });

    category.image = { public_id, secure_url };
  }

  const categoryData = await category.save();
  res.status(201).json({ message: 'Update category successfully', category: categoryData });
};

// ------ Delete category --------
export const deleteCategory = async (req, res, next) => {
  const { categoryId } = req.params;
  const { _id } = req.userData;

  const category = await categoryModel.findOneAndDelete({ _id: categoryId, createdBy: _id });

  if (!category) return sendError(next, 'Category id not correct!', 400);

  // Delete subcategory and brand
  const [subCategory, brand, product] = await Promise.all([
    subCategoryModel.deleteMany({ categoryId }),
    brandModel.deleteMany({ categoryId }),
    productModel.deleteMany({ categoryId }),
  ]);

  if (!subCategory.deletedCount) {
    return sendError(next, 'Error happend while delete subcategories please try again', 400);
  }

  if (!brand.deletedCount) {
    return sendError(next, 'Error happend while delete brands please try again', 400);
  }

  if (!product.deletedCount) {
    return sendError(next, 'Error happend while delete products please try again', 400);
  }

  // Delete all in folder customId into categories folder and after that delete folder
  const path = `${process.env.FOLDER_NAME}/categories/${category.customId}`;

  await cloudinary.api.delete_resources_by_prefix(path);
  await cloudinary.api.delete_folder(path);

  res.status(200).json({ message: 'Delete category successfully', status: true });
};
