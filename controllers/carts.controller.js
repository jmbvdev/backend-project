// Models
const { Cart } = require('../models/cart.model');

// Utils
const { catchAsync } = require('../utils/catchAsync');
const { AppError } = require('../utils/appError');
const { ProductInCart } = require('../models/productInCart');
const { Product } = require('../models/product.model');
const { Order } = require('../models/order.model');
const { Sequelize } = require('sequelize');

//Agregar un producto al carrito del usuario (enviar productId y quantity por req.body)

const addProduct = catchAsync(async (req, res, next) => {
  const { productId, quantity } = req.body;
  let cart = await Cart.findOne({
    where: { status: 'active', userId: req.user.id },
  });
  if (!cart) {
    cart = await Cart.create({ userId: req.user.id });
  }
  const product = await ProductInCart.findOne({
    where: { productId, cartId: cart.id },
  });
  if (product) {
    return res
      .status(403)
      .json({ status: 'error', message: 'Product already exist' });
  }

  const newProduct = await ProductInCart.create({
    cartId: cart.id,
    productId,
    quantity,
  });

  res.status(201).json({ newProduct });
});

//Actualizar algún producto del carrito (incrementar o decrementar cantidad)

const updateCart = catchAsync(async (req, res, next) => {
  const { user } = req;
  const { id } = req.params;
  const { quantity } = req.body;
  const cart = await Cart.findOne({
    where: { userId: user.id, status: 'active' },
  });

  const newQuantity = await ProductInCart.findOne({
    where: { productId: id, cartId: cart.id },
  });
  const product = await Product.findOne({ where: { id } });

  // Validar que el producto a agregar no exceda la cantidad disponible de dicho producto
  // (si el producto tiene 5 items, el usuario no puede poner 6 items en el carrito)
  if (product.quantity >= quantity) {
    // si dicho producto lo vuelve a agregar, modificar status a active.
    if (newQuantity.status === 'removed' && quantity > 0) {
      await ProductInCart.update(
        { status: 'active', quantity },
        { where: { cartId: cart.id, productId: id } }
      );
    }
    await ProductInCart.update(
      { quantity },
      { where: { cartId: cart.id, productId: id } }
    );
  }

  // Si el usuario envía como newQty 0, marcar el producto con status removed,
  if (quantity === 0) {
    await ProductInCart.update(
      { status: 'removed' },
      { where: { cartId: cart.id, productId: id } }
    );
  }

  res.status(200).json({ status: 'success' });
});

//Remover producto del carrito

const removeProductCart = catchAsync(async (req, res, next) => {
  //Buscar el producto a remover dentro del carrito (buscar en el modelo ProductInCart)
  //Actualizar la cantidad de ese producto a 0 y marcar su status a removed

  const { id } = req.params;
  const removedproduct = await ProductInCart.findOne({
    where: { status: 'active', productId: id },
  });
  if (removedproduct) {
    removedproduct.quantity = 0;
    const remove = await ProductInCart.update(
      { status: 'removed', quantity: 0 },
      { where: { id: removedproduct.id } }
    );
  }
  res.status(200).json({ status: 'success' });
});

//Realizar compra de todos los productos en el carrito con status active

const purchase = catchAsync(async (req, res, next) => {
  // Buscar el carrito del usuario con status active, e incluir todos
  // los productos del carrito con status active
  const { id } = req.user;
  const cart = await Cart.findOne({ where: { status: 'active', userId: id } });
  //Obtengo todos los productos seleccionado del carrito

  const productsInCart = await ProductInCart.findAll({
    where: { status: 'active', cartId: cart.id },
  });

  //Recorrer la lista de productos en el carrito

  //   Restar la cantidad seleccionada al producto seleccionado
  //  (si el producto tiene 6 items y tenemos 3 en el carrito,
  //    hacemos la resta y el resultado la actualizamos en el producto dado su id)

  for (let i = 0; i < productsInCart.length; i++) {
    const updatedProduct = await Product.update(
      {
        quantity: Sequelize.literal(`quantity - ${productsInCart[i].quantity}`),
      },
      { where: { id: productsInCart[i].productId } }
    );
  }
  for (let i = 0; i < productsInCart.length; i++) {
    await ProductInCart.update(
      { status: 'purchased' },
      { where: { id: productsInCart[i].id } }
    );
  }

  //   Calcular el precio total de todo el carrito, recuerda multiplicar
  //  la cantidad por el precio del producto en donde sea necesario.
  //   (este sera usado para el modelo orders)
  let totalPriceCart = 0;
  for (let i = 0; i < productsInCart.length; i++) {
    const products = await Product.findOne({
      where: { id: productsInCart[i].productId },
    });
    totalPriceCart =
      totalPriceCart + products.price * productsInCart[i].quantity;
  }

  //   Marcar los productos del carrito con status purchased
  // Marcar el carrito con status purchased
  // Crear registro en el modelo orders
  const purchased = await Cart.update(
    { status: 'purchased' },
    { where: { id: cart.id } }
  );
  const newOrder = await Order.create({
    userId: id,
    cartId: cart.id,
    totalPrice: totalPriceCart,
  });
  res.status(201).json({ newOrder });
});

module.exports = {
  addProduct,
  updateCart,
  removeProductCart,
  purchase,
};
