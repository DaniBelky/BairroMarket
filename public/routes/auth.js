const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const db = require('../db');

// Função para cadastrar um novo usuário (com senha hash)
router.post('/register', (req, res) => {
  const { email, senha } = req.body;

  // Gerando o hash da senha com bcrypt
  const saltRounds = 10;  // Número de rounds para salt
  bcrypt.hash(senha, saltRounds, (err, hashedPassword) => {
    if (err) {
      return res.status(500).json({ mensagem: 'Erro ao gerar o hash da senha' });
    }

    // Salvando o usuário no banco de dados com a senha hash
    const query = 'INSERT INTO users (email, senha) VALUES (?, ?)';
    db.execute(query, [email, hashedPassword], (err, results) => {
      if (err) {
        return res.status(500).json({ mensagem: 'Erro ao salvar usuário no banco de dados' });
      }
      res.status(201).json({ mensagem: 'Usuário cadastrado com sucesso' });
    });
  });
});

// Rota POST para login
router.post('/login', (req, res) => {
  const { email, senha } = req.body;

  // Consultando o usuário pelo email
  const query = 'SELECT * FROM users WHERE email = ?';

  db.execute(query, [email], (err, results) => {
    if (err) {
      return res.status(500).json({ mensagem: 'Erro no banco de dados' });
    }

    if (results.length === 0) {
      return res.status(404).json({ mensagem: 'E-mail não cadastrado' });
    }

    const user = results[0];

    // Comparando a senha fornecida com o hash armazenado no banco
    bcrypt.compare(senha, user.senha, (err, result) => {
      if (err) {
        return res.status(500).json({ mensagem: 'Erro ao comparar as senhas' });
      }

      if (!result) {
        return res.status(401).json({ mensagem: 'Senha incorreta' });
      }

      // Login bem-sucedido
      res.status(200).json({ mensagem: 'Login bem-sucedido', user });
    });
  });
});

module
