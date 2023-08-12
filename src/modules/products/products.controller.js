import { nanoid } from 'nanoid';
import slugify from 'slugify';
import { productModel } from '../../../DB/models/Product.model.js';
import { sendError } from '../../lib/sendError.js';
import { categoryModel } from '../../../DB/models/Category.model.js';
import cloudinary from '../../lib/cloudinary.cloud.js';
import { subCategoryModel } from '../../../DB/models/SubCategory.model.js';
import { brandModel } from '../../../DB/models/Brand.model.js';

export const addNewProduct = async (req, res, next) => {
  const { files } = req;

  const {
    title,
    description,
    price,
    stock,
    discount,
    categoryId,
    subCategoryId,
    brandId,
    colors,
    sizes,
  } = req.body;

  const categoryExist = await categoryModel.findById(categoryId);
  const subCategoryExist = await subCategoryModel.findById(subCategoryId);
  const brandExist = await brandModel.findById(brandId);

  if (!categoryExist || !subCategoryExist || !brandExist) {
    return sendError(next, 'Id not correct', 400);
  }

  const customId = nanoid(20);

  // Upload images
  const images = [];
  const publicIds = [];

  for (const file of files) {
    // eslint-disable-next-line no-await-in-loop
    const { public_id, secure_url } = await cloudinary.uploader.upload(
      file.path,
      {
        folder: `${process.env.FOLDER_NAME}/categories/${categoryExist.customId}/subCategories/${subCategoryExist.customId}/brands/${brandExist.customId}/products/${customId}`,
      }
    );

    images.push({ public_id, secure_url });
    publicIds.push(public_id);
  }

  // Save all data in database
  const priceAfterDiscount = discount
    ? price - (price * discount) / 100
    : price;

  const slug = slugify(title, '_');

  const product = await productModel.create({
    title,
    description,
    slug,
    price,
    discount,
    priceAfterDiscount,
    stock,
    categoryId,
    subCategoryId,
    brandId,
    customId,
    images,
    colors,
    sizes,
  });

  if (!product) {
    await cloudinary.api.delete_resources(publicIds);
    return sendError(next, 'Error happend while save data, please try again');
  }

  res.status(201).json({ message: 'Create new product', product });
};
