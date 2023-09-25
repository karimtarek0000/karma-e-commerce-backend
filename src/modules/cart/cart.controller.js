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
      if (product.productId == productId) {
        isProductExist = true;
        product.quantity = quantity;
      }
    }

    if (!isProductExist) {
      userCart.products.push({ productId, quantity });
    }

    // ---------- Subtotal ----------
    const productPromises = userCart.products.map(async (product) => {
      const { priceAfterDiscount } = await productModel.findById(product.productId);
      return priceAfterDiscount * product.quantity || 0;
    });

    const subTotalArray = await Promise.all(productPromises);

    const subTotal = subTotalArray.reduce((prev, cur) => prev + cur, 0);

    const updateCart = await cartModel.findOneAndUpdate(
      { userId },
      {
        products: userCart.products,
        subTotal,
      },
      { new: true }
    );

    if (!updateCart) return sendError(next, 'Update cart faild', 400);

    return res.status(200).json({ message: 'Product updated in cart successfully', updateCart });
  }

  // ----------------- Create new cart ----------------
  const newCart = await cartModel.create({
    userId,
    products: { productId, quantity },
    subTotal: productExist.priceAfterDiscount * quantity,
  });

  if (!newCart) return sendError(next, 'Add cart faild', 400);

  res.status(201).json({ message: 'New cart created successfully', newCart });
};

// --------------- Get cart for user ---------------
export const getCart = async (req, res, next) => {
  const userId = req.userData._id;

  const cart = await cartModel.findOne({ userId }).populate([{ path: 'products.productId' }]);

  if (!cart) return sendError(next, 'No cart exist!', 400);

  res.status(200).json({ message: 'Cart', cart });
};

// --------------- Delete product from cart ---------------
export const deleteProductFromCart = async (req, res, next) => {
  const userId = req.userData._id;
  const { productId } = req.params;

  // ----------- Check if product exist ----------------
  const cart = await cartModel.findOne({
    userId,
    'products.productId': productId,
  });

  if (!cart) return sendError(next, 'Porduct not exist in cart', 400);

  // ----------- Delete product from cart and update subtotal ----------------
  const productData = await productModel.findById(productId);

  if (!productData) return sendError(next, 'Delete product faild', 400);

  cart.products.forEach((product, i, products) => {
    if (product.productId == productId) {
      products.splice(i, 1);
      cart.subTotal -= productData.priceAfterDiscount * product.quantity;
    }
  });

  // ----------- Save all updates in database ----------------
  const updateCart = await cart
    .save()
    .then((data) => data.populate([{ path: 'products.productId' }]));

  if (!updateCart) return sendError(next, 'Delete product faild', 400);

  res.status(200).json({ message: 'Product deleted successfully', cart: updateCart });
};
