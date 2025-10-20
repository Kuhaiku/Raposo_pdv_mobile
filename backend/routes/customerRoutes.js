const express = require('express');
const router = express.Router();
const {
  addCustomer,
  getCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
} = require('../controllers/customerController');
const { protect } = require('../middleware/authMiddleware');

// Todas as rotas abaixo estão protegidas e só podem ser acessadas por usuários logados
router.use(protect);

// Rota para CRIAR um novo cliente e LISTAR todos os clientes
router.route('/')
  .post(addCustomer)
  .get(getCustomers);

// Rota para OBTER, ATUALIZAR e DELETAR um cliente específico
router.route('/:id')
  .get(getCustomerById)
  .put(updateCustomer)
  .delete(deleteCustomer);

module.exports = router;