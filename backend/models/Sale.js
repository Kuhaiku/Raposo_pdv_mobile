const { DataTypes } = require('sequelize');
const db = require('../config/db');

const Sale = db.define('Sale', {
  totalAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  paymentMethod: {
    type: DataTypes.ENUM('dinheiro', 'pix', 'prazo', 'credito', 'debito'),
    allowNull: false,
  },
  dueDate: {
    type: DataTypes.DATEONLY, // Apenas a data, sem hora
    allowNull: true, // Apenas para vendas 'a prazo'
  },
});

module.exports = Sale;