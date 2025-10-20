const { DataTypes } = require('sequelize');
const db = require('../config/db');

const Customer = db.define('Customer', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true, // Opcional
    unique: true,
    validate: {
      isEmail: true,
    },
  },
});

module.exports = Customer;