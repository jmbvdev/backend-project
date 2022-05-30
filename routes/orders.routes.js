const express = require('express');
// Controller
const {
  getAllOrders,
  createOrder,
  updateOrder,
  deleteOrder,
} = require('../controllers/orders.controller');
const { checkToken } = require('../controllers/users.controller');
const { protectToken } = require('../middlewares/users.middlewares');

const router = express.Router();
// Apply protectToken middleware
router.use(protectToken);

router.get('/check-token', checkToken);
//Crear orden
router.post('/', createOrder);

//Obtener las ordenes del usuario
router.get('/', getAllOrders);

//Actualizar orden
router.patch('/:id', updateOrder);

//Eliminar orden
router.delete('/:id', deleteOrder);

module.exports = { ordersRouter: router };
