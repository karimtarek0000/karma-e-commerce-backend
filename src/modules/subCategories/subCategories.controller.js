import { subCategoryModel } from "../../../DB/models/SubCategory.model.js";
import cloudinary from "../../lib/cloudinary.cloud.js";
import { sendError } from "../../lib/sendError.js";
import slugify from "slugify";
import { nanoid } from "nanoid";

export const createNewSubCategory = async (req, res, next) => {
  const file = req.file;
  const { name } = req.body;

  const subCategoryNameExist = await subCategoryModel.findOne({ name });

  if (subCategoryNameExist) return sendError(next, "Name sub category already exist!", 400);

  const customId = nanoid(20);

  const { public_id, secure_url } = await cloudinary.uploader.upload(file.path, {
    folder: `karma-e-commerce/sub-categories/${customId}`,
  });

  const slug = slugify(name, "_");
  const subCategoryData = await subCategoryModel.create({
    name,
    slug,
    customId,
    image: { public_id, secure_url },
  });

  // If data not created in database will remove image
  if (!subCategoryData) {
    await cloudinary.uploader.destroy(public_id);
    return sendError(next, "Error happend when create data please try again!", 400);
  }

  res
    .status(201)
    .json({ message: "Create sub category successfully", subCategory: subCategoryData });
};

export const updateSubCategory = async (req, res, next) => {
  const file = req.file;
  const { id, name } = req.body;

  if (!name && !file) return sendError(next, "No any data found to update", 400);

  const subCategory = await subCategoryModel.findById(id);

  // Check if category id exist or not
  if (!subCategory) return sendError(next, "No category found with this id", 400);

  // If name exist
  if (name) {
    // Check if new name unique or not
    const categoryExistWithNewName = await subCategoryModel.findOne({ name });
    if (categoryExistWithNewName)
      return sendError(next, "This sub category name alerady exist", 400);

    const slug = slugify(name, "_");

    subCategory.name = name;
    subCategory.slug = slug;
  }

  // If there image
  if (file) {
    // Delete old image
    await cloudinary.uploader.destroy(subCategory.image.public_id);

    // Upload new image
    const { public_id, secure_url } = await cloudinary.uploader.upload(file.path, {
      folder: `karma-e-commerce/sub-categories/${subCategory.customId}`,
    });

    subCategory.image = { public_id, secure_url };
  }

  const subCategoryData = await subCategory.save();
  res
    .status(201)
    .json({ message: "Update sub category successfully", subCategory: subCategoryData });
};
