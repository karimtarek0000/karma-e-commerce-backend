import { nanoid } from 'nanoid';
import slugify from 'slugify';
import { categoryModel } from '../../../DB/models/Category.model.js';
import cloudinary from '../../lib/cloudinary.cloud.js';
import { sendError } from '../../lib/sendError.js';

export const createNewCategory = async (req, res, next) => {
  const { file } = req;
  const { name } = req.body;

  const categoryNameExist = await categoryModel.findOne({ name });

  if (categoryNameExist) {
    return sendError(next, 'Name category already exist!', 400);
  }

  const customId = nanoid(20);

  const { public_id, secure_url } = await cloudinary.uploader.upload(
    file.path,
    {
      folder: `${process.env.FOLDER_NAME}/categories/${customId}`,
    }
  );

  // TODO: Add createdBy later
  const slug = slugify(name, '_');
  const categoryData = await categoryModel.create({
    name,
    slug,
    customId,
    image: { public_id, secure_url },
  });

  // If data not created in database will remove image
  if (!categoryData) {
    await cloudinary.uploader.destroy(public_id);
    return sendError(
      next,
      'Error happend when create data please try again!',
      400
    );
  }

  res
    .status(201)
    .json({ message: 'Create category successfully', category: categoryData });
};

export const updateCategory = async (req, res, next) => {
  const { file } = req;
  const { id, name } = req.body;

  if (!name && !file) {
    return sendError(next, 'No any data found to update', 400);
  }

  const category = await categoryModel.findById(id);

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
    const { public_id, secure_url } = await cloudinary.uploader.upload(
      file.path,
      {
        folder: `${process.env.FOLDER_NAME}/categories/${category.customId}`,
      }
    );

    category.image = { public_id, secure_url };
  }

  const categoryData = await category.save();
  res
    .status(201)
    .json({ message: 'Update category successfully', category: categoryData });
};

export const getCategories = async (req, res, next) => {
  const categories = await categoryModel
    .find()
    .populate([{ path: 'subCategories' }]);

  res
    .status(200)
    .json({ message: 'All categories and sub categories', categories });
};
