const express = require('express');
const router = express.Router();
const { 
  addProduct, 
  getProducts, 
  getProductById,
  updateProduct,
  deleteProduct
} = require('../controllers/productController');
const { protect } = require('../middleware/authMiddleware');
const { upload } = require('../config/cloudinary');

// Rota para CRIAR um novo produto e LISTAR todos os produtos
router.route('/')
  .post(protect, upload.array('images', 10), addProduct)
  .get(protect, getProducts);

// Rota para OBTER, ATUALIZAR e DELETAR um produto específico pelo ID
router.route('/:id')
  .get(protect, getProductById)
  .put(protect, upload.array('newImages', 10), updateProduct) // 'newImages' para diferenciar das existentes
  .delete(protect, deleteProduct);

module.exports = router;