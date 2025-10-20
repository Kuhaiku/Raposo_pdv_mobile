const db = require('../config/db');

// Importe todos os seus modelos
const User = require('./User');
const Product = require('./Product');
const Image = require('./Image');
const Customer = require('./Customer');
const Sale = require('./Sale');
const SaleItem = require('./SaleItem');
const Period = require('./Period');

// Relações do Produto
Product.hasMany(Image, { onDelete: 'CASCADE' }); // Se um produto for deletado, suas imagens também serão
Image.belongsTo(Product);

// Relações da Venda
User.hasMany(Sale); // Um usuário (vendedor) pode ter muitas vendas
Sale.belongsTo(User);

Customer.hasMany(Sale); // Um cliente pode ter muitas vendas
Sale.belongsTo(Customer);

// Relação Muitos-para-Muitos entre Venda e Produto
Sale.belongsToMany(Product, { through: SaleItem });
Product.belongsToMany(Sale, { through: SaleItem });

// Relações do Período
User.hasMany(Period); // Um usuário pode fechar vários períodos
Period.belongsTo(User);

// Sincroniza o banco de dados
// O ideal é usar migrations para produção, mas sync é ótimo para desenvolvimento
db.sync({ alter: true }) // 'alter: true' tenta alterar as tabelas existentes para corresponder ao modelo
  .then(() => console.log('Tabelas sincronizadas com o banco de dados.'))
  .catch(err => console.log('Erro ao sincronizar tabelas: ', err));

// Exporta os modelos para serem usados em outras partes do app
module.exports = {
  User,
  Product,
  Image,
  Customer,
  Sale,
  SaleItem,
  Period,
};