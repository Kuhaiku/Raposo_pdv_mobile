const { DataTypes } = require('sequelize');
const db = require('../config/db');

const SaleItem = db.define('SaleItem', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  unitPrice: {
    type: DataTypes.DECIMAL(10, 2), // Preço do produto no momento da venda
    allowNull: false,
  },
});

module.exports = SaleItem;