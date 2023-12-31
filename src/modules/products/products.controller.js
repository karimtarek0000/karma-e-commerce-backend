import { nanoid } from 'nanoid';
import slugify from 'slugify';
import { brandModel } from '../../../DB/models/Brand.model.js';
import { categoryModel } from '../../../DB/models/Category.model.js';
import { productModel } from '../../../DB/models/Product.model.js';
import { subCategoryModel } from '../../../DB/models/SubCategory.model.js';
import { ApiFeatures } from '../../lib/apiFeatures.js';
import cloudinary from '../../lib/cloudinary.cloud.js';
import { sendError } from '../../lib/sendError.js';

// -------------- Get all products --------------
export const allProducts = async (req, res) => {
  const { mongooseQueryCount, mongooseQuery, page, limit } = new ApiFeatures(
    productModel.count(),
    productModel.find(),
    req.query
  )
    .pagination()
    .sort()
    .select()
    .filter()
    .search()
    .totalCount();

  const products = await mongooseQuery;
  const totalCountProducts = await mongooseQueryCount;

  res.status(200).json({
    message: 'All products',
    metaData: {
      page,
      limit,
      totalCountProducts,
      countOfProducts: products.length,
      totalOfPages: Math.ceil(totalCountProducts / limit),
    },
    products,
  });
};

// -------------- Get product --------------
export const getProduct = async (req, res, next) => {
  const { productId } = req.params;

  const product = await productModel.findById(productId).populate([
    {
      path: 'reviews',
    },
  ]);

  if (!product) return sendError(next, 'Product id not correct!', 400);

  res.status(200).json({ message: 'Product', product });
};

// -------------- Add new product --------------
export const addNewProduct = async (req, res, next) => {
  const { files } = req;
  const userId = req.userData._id;

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

  // -------------------------- Checks --------------------------
  const categoryExist = await categoryModel.findById(categoryId);

  if (!categoryExist) {
    return sendError(next, 'No there any category with this id', 400);
  }

  const subCategoryExist = await subCategoryModel.findById(subCategoryId);

  if (!subCategoryExist) {
    return sendError(next, 'No there any sub category with this id', 400);
  }

  const brandExist = await brandModel.findById(brandId);

  if (!brandExist) {
    return sendError(next, 'No there any brand with this id', 400);
  }

  // -------------------------- Upload all images --------------------------
  const customId = nanoid(20);

  const images = [];
  const path = `${process.env.FOLDER_NAME}/categories/${categoryExist.customId}/subCategories/${subCategoryExist.customId}/brands/${brandExist.customId}/products/${customId}`;

  for (const file of files) {
    // eslint-disable-next-line no-await-in-loop
    const { public_id, secure_url } = await cloudinary.uploader.upload(file.path, {
      folder: path,
    });

    images.push({ public_id, secure_url });
  }

  // Save all data in database
  const priceAfterDiscount = discount ? price - discount : price;

  const slug = slugify(title, '_');

  // -------------------------- Send fn to catch if happend any error --------------------------
  async function deleteResources() {
    await cloudinary.api.delete_resources_by_prefix(path);
    await cloudinary.api.delete_folder(path);
  }

  req.catchErrorFn = deleteResources;

  // -------------------------- Save data on database --------------------------
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
    createdBy: userId,
  });

  if (!product) {
    await deleteResources();
    return sendError(next, 'Error happend while save data, please try again');
  }

  res.status(201).json({ message: 'Create new product', product });
};

// -------------- Update product --------------
export const updateProduct = async (req, res, next) => {
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
  const { productId } = req.params;

  // ------------------------- Checks -------------------------
  const product = await productModel.findById(productId).populate([
    {
      path: 'categoryId',
    },
    {
      path: 'subCategoryId',
    },
    {
      path: 'brandId',
    },
  ]);

  if (!product) {
    return sendError(next, 'No there any product with this id', 400);
  }

  if (categoryId) {
    const categoryExist = await categoryModel.findById(categoryId);

    if (!categoryExist) {
      return sendError(next, 'No there any category with this id', 400);
    }

    product.categoryId = categoryId;
  }

  if (subCategoryId) {
    const subCategoryExist = await subCategoryModel.findById(subCategoryId);

    if (!subCategoryExist) {
      return sendError(next, 'No there any sub category with this id', 400);
    }

    product.subCategoryId = subCategoryId;
  }

  if (brandId) {
    const brandExist = await brandModel.findById(brandId);

    if (!brandExist) {
      return sendError(next, 'No there any brand with this id', 400);
    }

    product.brandId = brandId;
  }

  // ------------------------- Title -------------------------
  if (title) {
    const slug = slugify(title, '_');
    product.slug = slug;
  }

  // ------------------------- Price and discount -------------------------
  if (price || discount) {
    let priceAfterDiscount = null;

    if (price && discount) {
      priceAfterDiscount = price - (price * discount) / 100;
      product.price = price;
      product.discount = discount;
    } else if (price) {
      priceAfterDiscount = price - (price * product.discount) / 100;
      product.price = price;
    } else if (discount) {
      priceAfterDiscount = product.price - (product.price * discount) / 100;
      product.discount = discount;
    }

    product.priceAfterDiscount = priceAfterDiscount;
  }

  // ------------------------- Images -------------------------
  const images = [];
  const publicIds = [];

  if (files) {
    // Delete images
    const path = `${process.env.FOLDER_NAME}/categories/${product.categoryId.customId}/subCategories/${product.subCategoryId.customId}/brands/${product.brandId.customId}/products/${product.customId}`;

    await cloudinary.api.delete_resources_by_prefix(path);

    // Upload new images
    for (const file of files) {
      // eslint-disable-next-line no-await-in-loop
      const { public_id, secure_url } = await cloudinary.uploader.upload(file.path, {
        folder: path,
      });

      images.push({ public_id, secure_url });
      publicIds.push(public_id);
    }

    product.images = images;
  }

  // Other data if existing
  if (title) product.title = title;
  if (description) product.description = description;
  if (stock) product.stock = stock;
  if (colors) product.colors = colors;
  if (sizes) product.sizes = sizes;

  // ------------------------- Save data on database -------------------------
  const newProduct = await product.save();

  if (!newProduct) {
    await cloudinary.api.delete_resources(publicIds);
    return sendError(next, 'Error happend while save product, please try again');
  }

  res.status(200).json({ message: 'Update product successfully', newProduct });
};

// -------------- Delete product --------------
export const deleteProduct = async (req, res, next) => {
  const { productId } = req.params;

  const product = await productModel.findByIdAndDelete(productId).populate([
    {
      path: 'categoryId',
    },
    {
      path: 'subCategoryId',
    },
    {
      path: 'brandId',
    },
  ]);

  if (!product) {
    return sendError(next, 'No there any product with this id', 400);
  }

  // -------------------------- Delete all images for product --------------------------
  const path = `${process.env.FOLDER_NAME}/categories/${product.categoryId.customId}/subCategories/${product.subCategoryId.customId}/brands/${product.brandId.customId}/products/${product.customId}`;

  await cloudinary.api.delete_resources_by_prefix(path);
  await cloudinary.api.delete_folder(path);

  res.status(200).json({ message: 'Delete products successfully', status: true });
};
