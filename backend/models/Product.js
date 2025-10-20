const { DataTypes } = require('sequelize');
const db = require('../config/db');

const Product = db.define('Product', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  code: {
    type: DataTypes.STRING,
    unique: true,
  },
  description: {
    type: DataTypes.TEXT,
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'deleted'),
    defaultValue: 'active',
  },
  // Campo para controlar a exclusão temporária de 30 dias
  deletedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
});

module.exports = Product;