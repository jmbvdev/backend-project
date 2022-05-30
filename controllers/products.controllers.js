

// Models
const { Product } = require('../models/product.model');

// Utils
const { catchAsync } = require('../utils/catchAsync');
const { AppError } = require('../utils/appError');
const { Cartegory } = require('../models/category.model');


//Crear Producto

const createProduct = catchAsync(async (req, res, next) => {
    const { title, description, price, quantity  } = req.body;
	const{user}=req
   
	const newProduct = await Product.create({
		title, description, price,userId: user.id, quantity
	});
	
	res.status(201).json({
		newProduct,
	});
});

//Obtener todos los productos

const getAllProducts = catchAsync(async (req, res, next) => {
    const products = await Product.findAll();

    res.status(200).json({
      products,
    });
});

//Obtener producto dado un id

const getProductById = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const products = await Product.findOne({ where: { id } });
    res.status(200).json({ products });
});

//Actualizar producto // SOLO EL USUARIO QUE CREO EL PRODUCTO
const updateProduct = catchAsync(async (req, res, next) => {
    const {  title, description, price, quantity} = req.body;
    const { id } = req.params;
    const product = await Product.findOne({ where: { id} });

    await product.update({title, description, price, quantity });
    res.status(200).json({ status: 'success' });
});

//Eliminar producto // SOLO EL USUARIO QUE CREO EL PRODUCTO
const deleteProduct = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const product = await Product.findOne({ where: { id} });
    await product.update({ status: 'deleted' });
    res.status(200).json({ status: 'success' });
});


//Obtener todas las categorías activas
const getCategories=catchAsync(async (req, res, next) => {
    // const categories = await Cartegory.findAll({
    //     where: { categoryId: req.user.id, status:"active" }
    //   });
    //   res.status(200).json({
    //     categories})
   
    // res.status(200).json({ status: 'success' });
});

//Agregar una nueva categoria
const createCategory=catchAsync(async (req, res, next) => {
   
    res.status(200).json({ status: 'success' });
});

//Actualizar el nombre de la categoría

const updateCategory=catchAsync(async (req, res, next) => {
   
    res.status(200).json({ status: 'success' });
});
module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getCategories, createCategory,updateCategory
};
