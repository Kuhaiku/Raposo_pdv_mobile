const { DataTypes } = require('sequelize');
const db = require('../config/db');

const Period = db.define('Period', {
  startDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  endDate: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  totalSalesValue: {
    type: DataTypes.DECIMAL(10, 2),
  },
  totalOrders: {
    type: DataTypes.INTEGER,
  },
  averageTicket: {
    type: DataTypes.DECIMAL(10, 2),
  },
  status: {
    type: DataTypes.ENUM('open', 'closed'),
    defaultValue: 'open',
  },
});

module.exports = Period;