const express = require('express');
// Controller
const {
  addProduct,
  updateCart,
  removeProductCart,
  purchase,
} = require('../controllers/carts.controller');
const { checkToken } = require('../controllers/users.controller');
const { protectToken } = require('../middlewares/users.middlewares');

const router = express.Router();
// Apply protectToken middleware
router.use(protectToken);

router.get('/check-token', checkToken);

//Agregar un producto al carrito del usuario (enviar productId y quantity por req.body)
router.post('/add-product', addProduct);

//Actualizar algún producto del carrito (incrementar o decrementar cantidad { productId, newQty })
router.patch('/update-product/:id', updateCart);

//Eliminar producto del carrito
router.delete('/:id', removeProductCart);

//Realizar compra de todos los productos en el carrito con status active
router.post('/purchase', purchase);

module.exports = { cartsRouter: router };
