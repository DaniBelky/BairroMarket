const express = require('express');
const router = express.Router();
const {
  requestPasswordReset,
  verifyTokenAndResetPassword,
  verifyToken
} = require('../controller/passwordRecoveryController');

// Rota para solicitar recuperação de senha (enviar código por email)
router.post('/request-reset', requestPasswordReset);

// Rota para verificar token apenas
router.post('/verify-token', verifyToken);

// Rota para verificar token e redefinir senha
router.post('/reset-password', verifyTokenAndResetPassword);

module.exports = router;