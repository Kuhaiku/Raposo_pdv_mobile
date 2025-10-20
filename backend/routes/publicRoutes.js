const express = require('express');
const router = express.Router();
const { getPublicCatalog } = require('../controllers/productController');

// Rota pública para buscar o catálogo de um usuário pelo ID
router.get('/catalogo/:userId', getPublicCatalog);

module.exports = router;