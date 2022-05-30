const express = require('express');
// Controller
const {
  getAllProductsInCart,
  createProductInCart,
  deleteProductInCart,
} = require('../controllers/productsInCart.controllers');

const router = express.Router();

//Crear Producto in cart
router.post('/', createProductInCart);

//Obtener todos los Productos In Cart
router.get('/', getAllProductsInCart);

//Eliminar producto in Cart
router.delete('/:id', deleteProductInCart);

module.exports = { productsInCartRouter: router };
