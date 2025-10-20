const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');

// Carrega as variáveis de ambiente (o .env está na raiz)
dotenv.config({ path: path.join(__dirname, '../.env') });

// Conexão com o banco de dados
const db = require('./config/db');

// Testa a conexão com o banco de dados
db.authenticate()
  .then(() => console.log('Banco de dados conectado...'))
  .catch(err => console.log('Erro: ' + err));

const app = express();

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Habilita o CORS
app.use(cors());

// Define a pasta de arquivos estáticos (agora precisamos voltar um nível)
app.use(express.static(path.join(__dirname, '../frontend')));

// Rotas
app.use('/api/auth', require('./routes/auth'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, console.log(`Servidor iniciado na porta ${PORT}`));