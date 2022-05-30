// Models
const { Cart } = require('../models/cart.model');

// Utils
const { catchAsync } = require('../utils/catchAsync');
const { AppError } = require('../utils/appError');
const { ProductInCart } = require('../models/productInCart');
const { Product } = require('../models/product.model');
const { user } = require('pg/lib/defaults');
const { Order } = require('../models/order.model');
const { Sequelize } = require('sequelize');

//Agregar un producto al carrito del usuario (enviar productId y quantity por req.body)

const addProduct = catchAsync(async (req, res, next) => {
  let cart = await Cart.findOne({
    where: { status: 'active', userId: req.user.id },
  });
  if (!cart) {
    cart = await Cart.create({ userId: req.user.id });
  }

  const { productId, quantity } = req.body;

  const newProduct = await ProductInCart.create({
    cartId: cart.id,
    productId,
    quantity,
  });

  res.status(201).json({ newProduct });
});

//Actualizar algún producto del carrito (incrementar o decrementar cantidad { productId, newQty })


const updateCart = catchAsync(async (req, res, next) => {});

//Remover producto del carrito
/*Para el endpoint DELETE, se debe realizar lo siguiente:
Buscar el producto a remover dentro del carrito (buscar el producto en el modelo ProductInCart)
Actualizar la cantidad de ese producto a 0 y marcar su status a removed*/

const removeProductCart = catchAsync(async (req, res, next) => {
  const { id } = req.user;
  const removedproduct = await ProductInCart.findOne({ where: { status: 'active', productId: id } });
  if (removedproduct) {
    removedproduct.quantity=0
    const remove= await ProductInCart.update({status:"removed"}, {where:{id:removedproduct.id}})
  }
  res.status(200).json({ status: 'success' });
});

//Realizar compra de todos los productos en el carrito con status active
/*Para el endpoint /purchase, se debe realizar lo siguiente:

Buscar el carrito del usuario con status active, e incluir todos
 los productos del carrito con status active

Recorrer la lista de productos en el carrito

Restar la cantidad seleccionada al producto seleccionado
 (si el producto tiene 6 items y tenemos 3 en el carrito,
   hacemos la resta y el resultado la actualizamos en el producto dado su id)

Calcular el precio total de todo el carrito, recuerda multiplicar
 la cantidad por el precio del producto en donde sea necesario.
  (este sera usado para el modelo orders)

Marcar los productos del carrito con status purchased
Marcar el carrito con status purchased
Crear registro en el modelo orders
*/

const purchase = catchAsync(async (req, res, next) => {
  const { id } = req.user;
  const cart = await Cart.findOne({ where: { status: 'active', userId: id } });
  //Obtengo todos los productos seleccionado del carrito

  const productsInCart = await ProductInCart.findAll({
    where: { status: 'active', cartId: cart.id },
  });
  for (let i = 0; i < productsInCart.length; i++) {
    const updatedProduct = await Product.update({
     quantity: Sequelize.literal(`quantity - ${productsInCart[i].quantity}`),
    },{ where:{id:productsInCart[i].productId}});
  }
  for (let i = 0; i < productsInCart.length; i++) {
    await productsInCart.update({status:"purchased"}, {where:{id:productsInCart[i].id}})
  }
  let totalPriceCart= 0
  for (let i = 0; i < productsInCart.length; i++) {
    
    const products= await Product.findOne({where:{id:productsInCart[i].productId}})
    totalPriceCart= totalPriceCart + (products.price*productsInCart[i].quantity)
  }
  const purchased= await Cart.update({status:"purchased"}, {where:{id:cart.id}})
  const newOrder= await Order.create({ userId:id,
    cartId:cart.id,
    totalPrice:totalPriceCart})
    res.status(201).json({ newOrder });
});

module.exports = {
  addProduct,
  updateCart,
  removeProductCart,
  purchase,
};
