const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');

// Carrega as variáveis de ambiente (o .env está na raiz)
dotenv.config({ path: path.join(__dirname, '../.env') });

// Conexão com o banco de dados
const db = require('./config/db');

// Carrega todos os modelos e suas associações para sincronização
require('./models');

// Testa a conexão com o banco de dados
db.authenticate()
  .then(() => console.log('Banco de dados conectado...'))
  .catch(err => console.log('Erro ao conectar com o banco de dados: ' + err));

const app = express();

// Body parser para aceitar dados JSON e de formulário
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Habilita o CORS para permitir requisições de diferentes origens
app.use(cors());

// Define a pasta 'frontend' como o local dos arquivos estáticos (HTML, CSS, etc.)
app.use(express.static(path.join(__dirname, '../frontend')));

// Rotas da API
app.use('/api/public', require('./routes/publicRoutes'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/customers', require('./routes/customerRoutes'));
app.use('/api/sales', require('./routes/saleRoutes'));
app.use('/api/periods', require('./routes/periodRoutes'));

// Define a porta do servidor
const PORT = process.env.PORT || 5000;

// Inicia o servidor
app.listen(PORT, console.log(`Servidor iniciado na porta ${PORT}`));