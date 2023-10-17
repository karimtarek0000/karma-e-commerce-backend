import { sliderModel } from '../../../DB/models/Home.model.js';
import { productModel } from '../../../DB/models/Product.model.js';
import cloudinary from '../../lib/cloudinary.cloud.js';
import { sendError } from '../../lib/sendError.js';

// ------ Get all products slider --------
export const slider = async (req, res, next) => {
  const sliderProducts = await sliderModel.find().populate([
    {
      path: 'productId',
    },
  ]);
  if (!sliderProducts) return sendError(next, 'Occured error while get slider', 400);
  res.status(200).json({ message: 'All products slider', sliderProducts });
};

// ------ Add new product in slider --------
export const addProductInSlider = async (req, res, next) => {
  const { file } = req;
  const { productId, tag } = req.body;

  // -------- Check first if this id for product exist or not ------------
  const productExist = await productModel.findById(productId);

  if (!productExist) return sendError(next, 'This id product not exist', 400);

  // ------------- Upload image -------------
  const { public_id, secure_url } = await cloudinary.uploader.upload(file.path, {
    folder: `${process.env.FOLDER_NAME}/home/slider`,
  });

  // -------------------------- If data not saved in database --------------------------
  async function deleteResources() {
    await cloudinary.uploader.destroy(public_id);
  }
  req.catchErrorFn = deleteResources;

  // ------------- Save data in database -------------
  const product = {
    productId,
    tag,
    sliderImage: { public_id, secure_url },
  };

  const sliderProduct = await sliderModel.create(product);

  if (!sliderProduct) {
    return sendError(next, 'Error happend while save data', 500);
  }

  res.status(200).json({ message: 'Product added in slider successfully' });
};
