const express = require('express');
const router = express.Router();
const { createSale, getSales } = require('../controllers/saleController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

// Rota para CRIAR uma nova venda e LISTAR o histórico de vendas
router.route('/')
  .post(createSale)
  .get(getSales);

module.exports = router;