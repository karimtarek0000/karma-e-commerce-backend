import { categoryModel } from "../../../DB/models/Category.model.js";
import cloudinary from "../../lib/cloudinary.cloud.js";
import { sendError } from "../../lib/sendError.js";
import slugify from "slugify";
import { nanoid } from "nanoid";

export const createNewCategory = async (req, res, next) => {
  const file = req.file;
  const { name } = req.body;

  const categoryNameExist = await categoryModel.findOne({ name });

  if (categoryNameExist) return sendError(next, "Name category already exist!", 400);

  const customId = nanoid(20);

  const { public_id, secure_url } = await cloudinary.uploader.upload(file.path, {
    folder: `karma-e-commerce/categories/${customId}`,
  });

  // TODO: Add createdBy later
  const slug = slugify(name, "_");
  const categoryData = await categoryModel.create({
    name,
    slug,
    customId,
    image: { public_id, secure_url },
  });

  // If data not created in database will remove image
  if (!categoryData) {
    await cloudinary.uploader.destroy(public_id);
    return sendError(next, "Error happend when create data please try again!", 400);
  }

  res.status(201).json({ message: "Create category successfully", category: categoryData });
};
