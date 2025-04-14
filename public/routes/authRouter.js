const express = require('express');
const router = express.Router();
const { login } = require('../Controller/authController');

// Rota de login
router.post('/login', login);

module.exports = router;
