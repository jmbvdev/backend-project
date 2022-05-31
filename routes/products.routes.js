const express = require('express');
const { body } = require('express-validator');
// Controller
const {
  getAllProducts,
  createProduct,
  getProductById,
  updateProduct,
  deleteProduct,
} = require('../controllers/products.controllers');
const { checkToken } = require('../controllers/users.controller');
const {
  protectToken,
  protectAccountOwner,
} = require('../middlewares/users.middlewares');
const { checkValidations } = require('../middlewares/validations.middlewares');

const router = express.Router();

//Obtener todos los Productos
router.get('/', getAllProducts);

//Obtener todos los Productos dado un id
router.get('/:id', getProductById);

// Apply protectToken middleware
router.use(protectToken);

router.get('/check-token', checkToken);
//Crear Producto
router.post(
  '/',
  body('title').notEmpty().withMessage('title  cannot be empty'),
  body('description').notEmpty().withMessage('Description  cannot be empty'),
  body('price').notEmpty().withMessage('Price  cannot be empty'),
  checkValidations,
  createProduct
);
//Actualizar producto
router.patch('/:id', protectAccountOwner, updateProduct);

//Eliminar producto
router.delete('/:id', protectAccountOwner, deleteProduct);

module.exports = { productsRouter: router };
