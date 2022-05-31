const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

// require('crypto').randomBytes(64).toString('hex')

// Models
const { User } = require('../models/user.model');
const { Order } = require('../models/order.model');
const { Cart } = require('../models/cart.model');

// Utils
const { catchAsync } = require('../utils/catchAsync');
const { AppError } = require('../utils/appError');
const { Product } = require('../models/product.model');
const { ProductInCart } = require('../models/productInCart');

dotenv.config({ path: './config.env' });

//------------Crear usuario

const createUser = catchAsync(async (req, res, next) => {
  const { userName, email, password } = req.body;

  const salt = await bcrypt.genSalt(12);
  const hashPassword = await bcrypt.hash(password, salt);

  const newUser = await User.create({
    userName,
    email,
    password: hashPassword,
  });

  // Remove password from response
  newUser.password = undefined;

  res.status(201).json({ newUser });
});

//-----------Iniciar sesion

const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // Validate that user exists with given email
  const user = await User.findOne({
    where: { email, status: 'active' },
  });

  // Compare password with db
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return next(new AppError('Invalid credentials', 400));
  }

  // Generate JWT
  const token = await jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  user.password = undefined;

  res.status(200).json({ token, user });
});

//-----------Obtener todos los productos que el usuario a creado

const getUserProducts = catchAsync(async (req, res, next) => {
  const products = await Product.findAll({
    where: { userId: req.user.id },
    include: [{ model: User }],
  });
  res.status(200).json({
    products,
  });
});

//-----------Actualizar usuario

const updateUser = catchAsync(async (req, res, next) => {
  // const { userName, email } = req.body;
  //   const user = await User.findOne({ where: { id: req.user.id } });

  //   await user.update({ userName, email });
  //   res.status(200).json({ status: 'success' });

  const { id } = req.params;
  const { userName, email } = req.body;

  await User.update({ userName, email }, { where: { id } });

  res.status(200).json({ status: 'success' });
});

//-----------Eliminar usuario

const deleteUser = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  await User.update({ status: 'deleted' }, { where: { id } });

  res.status(200).json({
    status: 'success',
  });
});

//-----------Obtener todas las Ordenes que el usuario a creado

const getUserOrders = catchAsync(async (req, res, next) => {
  const orders = await Order.findAll({
    where: { userId: req.user.id },
    include: [
      {
        model: Cart,
        where: { status: 'purchased' },
        include: [{ model: ProductInCart }],
      },
    ],
  });
  res.status(200).json({
    orders,
  });
});

//-----------Obtener todas las Ordenes que el usuario a creado dado un Id

const getUserOrdersById = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const order = await Order.findOne({ where: { id } });
  res.status(200).json({ order });
});

const checkToken = catchAsync(async (req, res, next) => {
  res.status(200).json({ user: req.sessionUser });
});

module.exports = {
  createUser,
  login,
  getUserProducts,
  updateUser,
  deleteUser,
  getUserOrders,
  getUserOrdersById,
  checkToken,
};
