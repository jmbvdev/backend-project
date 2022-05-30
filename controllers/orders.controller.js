const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

// require('crypto').randomBytes(64).toString('hex')

// Models
const { Order } = require('../models/order.model');

// Utils
const { catchAsync } = require('../utils/catchAsync');
const { AppError } = require('../utils/appError');
const { Cart } = require('../models/cart.model');

dotenv.config({ path: './config.env' });

//Obtener todas las ordenes

const getAllOrders = catchAsync(async (req, res, next) => {
  const orders = await Order.findAll();

  res.status(200).json({
    orders,
  });
});

//crear orden
const createOrder = catchAsync(async (req, res, next) => {
  const { cartId } = req.body;
  const cart = await Cart.findOne({
    where:{userId:req.user.id}
  })

  const newOrder = await Order.create({
    userId,
    cartId,
    totalPrice
  });

  res.status(201).json({ newOrder });
});

//Actualizar orden
const updateOrder = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const order = await Order.findOne({ where: { id } });

  await order.update({ status: 'purchased' });
  res.status(200).json({ status: 'success' });
});


//Eliminar orden
const deleteOrder = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const order = await Order.findOne({ where: { id } });
  await order.update({ status: 'cancelled' });
  res.status(200).json({
    status: 'success',
  });
});

module.exports = {
  getAllOrders,
  createOrder,
  updateOrder,
  deleteOrder,
};
