const express = require('express');
const { body } = require('express-validator');

// Middlewares
const {
  userExists,
  protectToken,
  protectAccountOwner,
} = require('../middlewares/users.middlewares');

// Controller
const {
  createUser,
  login,
  getUserProducts,
  updateUser,
  deleteUser,
  getUserOrders,
  getUserOrdersById,
  checkToken,
} = require('../controllers/users.controller');
const { checkValidations } = require('../middlewares/validations.middlewares');

const router = express.Router();

router.post(
  '/',
  body('userName').notEmpty().withMessage('User Name cannot be empty'),
  body('email')
    .notEmpty()
    .withMessage('Email cannot be empty')
    .isEmail()
    .withMessage('Invalid Email'),
  body('password')
    .notEmpty()
    .withMessage('Password cannot be empty')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long'),
  checkValidations,
  createUser
);

router.post('/login', login);


// Apply protectToken middleware
router.use(protectToken);

router.get('/check-token', checkToken);

//Obtener todos los productos creados por el usuario
router.get('/me', getUserProducts);
//Obtener todas las compras hechas por el usuario
router.get('/orders', getUserOrders);

//Obtener todas las compras hechas por el usuario dado un id
router.get('/orders/:id', getUserOrdersById);

router
  .route('/:id')
  .patch(userExists, protectAccountOwner, updateUser)
  .delete(userExists, protectAccountOwner, deleteUser);

module.exports = { usersRouter: router };
