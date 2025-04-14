const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const userRoutes = require('./public/routes/userRoutes');
const path = require('path');
const sequelize = require(path.join(__dirname, 'public' , 'config', 'db'));
const open = require('open').default; 


dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());
app.use(express.json());

app.use('/controllers', express.static(path.join(__dirname,'public','Controller', 'cadastrarControllet')));

app.get('/Email.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'Email.html'));
});

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
