//Models
const { Cart } = require('./cart.model');
const { Order } = require('./order.model');
const { Product } = require('./product.model');
const { ProductInCart } = require('./productInCart');
const { User } = require('./user.model');

const initModels = () => {
  // Establish your models relations inside this function
  //1 USER <----------> M Products
  User.hasMany(Product);
  Product.belongsTo(User);

  //1 USER <----------> M Orders
  User.hasMany(Order);
  Order.belongsTo(User);

  //1 USER <----------> 1 Cart
  User.hasOne(Cart);
  Cart.belongsTo(User);

  //1 ORDER <----------> 1 Cart
  Cart.hasOne(Order);
  Order.belongsTo(Cart);

  //1 PRODUCT <----------> 1 ProductsInCart
  Product.hasOne(ProductInCart);
  ProductInCart.belongsTo(Product);

  //1 CART <----------> M ProductsIncart
  Cart.hasMany(ProductInCart);
  ProductInCart.belongsTo(Cart);
};

module.exports = { initModels };
