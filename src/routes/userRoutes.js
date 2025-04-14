const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../Models/User');
const router = express.Router();

// Criar um novo usuário
router.post('/users', async (req, res) => {
    const { name, email, password, sexo, dt_nascimento } = req.body;

    try {
      
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({ name, email, password: hashedPassword, sexo, dt_nascimento });
        res.status(201).json(newUser);
    } catch (error) {
        console.error('Erro ao criar usuário:', error);
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ error: 'O email já está em uso.' });
        }
        res.status(500).json({ error: 'Erro interno no servidor. Tente novamente mais tarde.' });
    }
});

// Obter todos os usuários
router.get('/users', async (req, res) => {
    try {
        const users = await User.findAll();
        res.status(200).json(users);
    } catch (error) {
        res.status(400).json({ error: 'Erro ao obter usuários.' });
    }
});

// Obter um usuário específico
router.get('/users/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const user = await User.findByPk(id);
        if (user) {
            res.status(200).json(user);
        } else {
            res.status(404).json({ error: 'Usuário não encontrado.' });
        }
    } catch (error) {
        res.status(400).json({ error: 'Erro ao obter usuário.' });
    }
});

// Atualizar um usuário
router.put('/users/:id', async (req, res) => {
    const { id } = req.params;
    const { name, email, password } = req.body;

    try {
        const user = await User.findByPk(id);
        if (user) {
            const updatedData = {};
            if (name) updatedData.name = name;
            if (email) updatedData.email = email;
            if (password) updatedData.password = await bcrypt.hash(password, 10);

            await user.update(updatedData);
            res.status(200).json(user);
        } else {
            res.status(404).json({ error: 'Usuário não encontrado.' });
        }
    } catch (error) {
        res.status(400).json({ error: 'Erro ao atualizar usuário.' });
    }
});

// Deletar um usuário
router.delete('/users/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const user = await User.findByPk(id);
        if (user) {
            await user.destroy();
            res.status(200).json({ message: 'Usuário deletado com sucesso.' });
        } else {
            res.status(404).json({ error: 'Usuário não encontrado.' });
        }
    } catch (error) {
        res.status(400).json({ error: 'Erro ao deletar usuário.' });
    }
});

module.exports = router;
