const { DataTypes } = require('sequelize');
const db = require('../config/db');

const Image = db.define('Image', {
  url: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  public_id: {
    type: DataTypes.STRING, // ID do Cloudinary para fácil gerenciamento
    allowNull: false,
  },
  folder: {
    type: DataTypes.STRING, // Pasta no Cloudinary (ex: 'nome-do-produto' ou 'inativas')
  },
  order: {
    type: DataTypes.INTEGER, // Para definir a ordem de exibição das fotos
    defaultValue: 0,
  },
});

module.exports = Image;