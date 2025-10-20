const express = require('express');
const router = express.Router();
const { closePeriod, getPeriods } = require('../controllers/periodController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

// Rota para listar todos os períodos fechados
router.route('/').get(getPeriods);

// Rota para fechar o período atual
router.route('/close').post(closePeriod);

module.exports = router;