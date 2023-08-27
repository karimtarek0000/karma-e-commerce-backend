import { cartModel } from '../../../DB/models/Cart.model.js';
import { productModel } from '../../../DB/models/Product.model.js';
import { sendError } from '../../lib/sendError.js';

// --------------- Add product in cart ---------------
export const addProductInCart = async (req, res, next) => {
  const { productId, quantity } = req.body;
  const userId = req.userData._id;

  // ------------ Check product id valid or not --------------------------------
  const productExist = await productModel.findOne({ _id: productId, stock: { $gte: quantity } });

  if (!productExist) return sendError(next, 'Id product or quantity not correct', 400);

  const userCart = await cartModel.findOne({ userId }).lean();

  // ----------------- Update cart ----------------
  if (userCart) {
    let isProductExist = false;

    for (const product of userCart.products) {
      if (product.product == productId) {
        isProductExist = true;
        product.quantity = quantity;
      }
    }

    if (!isProductExist) {
      userCart.products.push({ product: productId, quantity });
    }

    const updateCart = await cartModel.findOneAndUpdate(
      { userId },
      {
        products: userCart.products,
      },
      { new: true }
    );

    if (!updateCart) return sendError(next, 'Update cart faild', 400);

    return res.status(200).json({ message: 'Product updated in cart successfully', updateCart });
  }

  // ----------------- Create new cart ----------------
  const newCart = await cartModel.create({
    userId,
    products: { product: productId, quantity },
    subTotal: productExist.priceAfterDiscount,
  });

  if (!newCart) return sendError(next, 'Add cart faild', 400);

  res.status(201).json({ message: 'Product added in cart successfully', newCart });
};
