const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

// require('crypto').randomBytes(64).toString('hex')

// Models
const { ProductInCart } = require('../models/productInCart');

// Utils
const { catchAsync } = require('../utils/catchAsync');
const { AppError } = require('../utils/appError');
const { Cart } = require('../models/cart.model');

dotenv.config({ path: './config.env' });

//Crear ProductoInCart

const createProductInCart = catchAsync(async (req, res, next) => {
  const cart = await Cart.findOne({ where: { userId: req.user.id } });
  const { productId, quantity } = req.body;
  const newProductInCart = await ProductInCart.create({
    cartId: cart.id,
    productId,
    quantity,
  });

  res.status(201).json({
    newProductInCart,
  });
});

//Obtener todos los productos In cart

const getAllProductsInCart = catchAsync(async (req, res, next) => {
  const products = await ProductInCart.findAll();

  res.status(200).json({
    products,
  });
});

//Eliminar producto In Cart
const deleteProductInCart = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const product = await ProductInCart.findOne({ where: { id } });
  await product.update({ status: 'deleted' });
  res.status(200).json({ status: 'success' });
});

module.exports = {
  createProductInCart,
  getAllProductsInCart,
  deleteProductInCart,
};
