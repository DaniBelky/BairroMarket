const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const userRoutes = require('./src/routes/userRoutes');
const path = require('path');
const sequelize = require(path.join(__dirname, 'src', 'config', 'db'));
const open = require('open').default; 
const authRoutes = require('./src/routes/authRouter');  

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());
app.use(express.json());

app.use('/controllers', express.static(path.join(__dirname, 'src', 'controller', 'cadastrarControllet')));

app.get('/Email.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'Email.html'));
});

// Não precisa importar authRouter duas vezes
app.use('/api/auth', authRoutes);  

// Rota para a página Cadastrar.html
app.get('/Cadastrar.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'Cadastrar.html'));
});

app.use('/api', userRoutes);

sequelize.sync().then(() => {
  app.listen(PORT, () => {
    const url = `http://localhost:${PORT}`;
    console.log(`Servidor rodando em: ${url}`);
    open(url);
  });
}).catch((error) => {
  console.error('Erro ao sincronizar o banco de dados:', error);
});


app.use('/src', express.static(path.join(__dirname, 'src')));
