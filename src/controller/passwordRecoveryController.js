const User = require('../Models/User');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');

// Armazenamento temporário dos tokens (em produção, use Redis ou banco de dados)
const tokenStorage = new Map();

// Configuração do nodemailer (você precisa configurar com suas credenciais)
const transporter = nodemailer.createTransport({
  service: 'gmail', // ou outro provedor
  auth: {
    user: process.env.EMAIL_USER, // seu email
    pass: process.env.EMAIL_PASS  // sua senha de app ou senha normal
  }
});

// Função para gerar token aleatório de 6 caracteres
const generateToken = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

// Solicitar recuperação de senha (enviar código por email)
const requestPasswordReset = async (req, res) => {
  const { email } = req.body;

  try {
    // Verificar se o usuário existe
    const user = await User.findOne({ where: { email } });
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'E-mail não encontrado em nossa base de dados.' 
      });
    }

    console.log('usuario existente');
    // Gerar token de 6 caracteres
    const token = generateToken();
    
    // Armazenar token temporariamente (expira em 10 minutos)
    tokenStorage.set(email, {
      token: token,
      expires: Date.now() + 10 * 60 * 1000, // 10 minutos
      attempts: 0
    });

    // Configurar email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Código de Recuperação de Senha - Bairro Market',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #23423d;">Recuperação de Senha</h2>
          <p>Olá,</p>
          <p>Você solicitou a recuperação de senha para sua conta no Bairro Market.</p>
          <p>Seu código de verificação é:</p>
          <div style="background-color: #f4f4f4; padding: 20px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #23423d; border-radius: 8px; margin: 20px 0;">
            ${token}
          </div>
          <p>Este código expira em 10 minutos.</p>
          <p>Se você não solicitou esta recuperação, ignore este email.</p>
          <hr>
          <p style="font-size: 12px; color: #666;">Bairro Market - Sistema de Recuperação de Senha</p>
        </div>
      `
    };

    // Enviar email
    await transporter.sendMail(mailOptions);

    res.status(200).json({
      success: true,
      message: 'Código de verificação enviado para seu e-mail.',
      expires: '10 minutos'
    });

  } catch (error) {
    console.error('Erro ao solicitar recuperação de senha:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor. Tente novamente mais tarde.'
    });
  }
};

// Verificar código e permitir redefinição de senha
const verifyTokenAndResetPassword = async (req, res) => {
  const { email, token, newPassword } = req.body;

  try {
    // Verificar se existe token para este email
    const storedData = tokenStorage.get(email);
    
    if (!storedData) {
      return res.status(400).json({
        success: false,
        message: 'Token não encontrado. Solicite um novo código.'
      });
    }

    // Verificar se o token expirou
    if (Date.now() > storedData.expires) {
      tokenStorage.delete(email);
      return res.status(400).json({
        success: false,
        message: 'Token expirado. Solicite um novo código.'
      });
    }

    // Verificar tentativas (máximo 3)
    if (storedData.attempts >= 3) {
      tokenStorage.delete(email);
      return res.status(400).json({
        success: false,
        message: 'Muitas tentativas inválidas. Solicite um novo código.'
      });
    }

    // Verificar se o token está correto
    if (storedData.token !== token.toUpperCase()) {
      storedData.attempts++;
      return res.status(400).json({
        success: false,
        message: `Código inválido. Tentativas restantes: ${3 - storedData.attempts}`
      });
    }

    // Token válido - atualizar senha
    const user = await User.findOne({ where: { email } });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado.'
      });
    }

    // Criptografar nova senha
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Atualizar senha no banco
    await user.update({ password: hashedPassword });
    
    // Remover token do armazenamento
    tokenStorage.delete(email);

    res.status(200).json({
      success: true,
      message: 'Senha redefinida com sucesso!'
    });

  } catch (error) {
    console.error('Erro ao verificar token e redefinir senha:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor. Tente novamente mais tarde.'
    });
  }
};

// Verificar apenas o token (sem redefinir senha)
const verifyToken = async (req, res) => {
  const { email, token } = req.body;

  try {
    const storedData = tokenStorage.get(email);
    
    if (!storedData) {
      return res.status(400).json({
        success: false,
        message: 'Token não encontrado. Solicite um novo código.'
      });
    }

    if (Date.now() > storedData.expires) {
      tokenStorage.delete(email);
      return res.status(400).json({
        success: false,
        message: 'Token expirado. Solicite um novo código.'
      });
    }

    if (storedData.attempts >= 3) {
      tokenStorage.delete(email);
      return res.status(400).json({
        success: false,
        message: 'Muitas tentativas inválidas. Solicite um novo código.'
      });
    }

    if (storedData.token !== token.toUpperCase()) {
      storedData.attempts++;
      return res.status(400).json({
        success: false,
        message: `Código inválido. Tentativas restantes: ${3 - storedData.attempts}`
      });
    }

    res.status(200).json({
      success: true,
      message: 'Token válido!'
    });

  } catch (error) {
    console.error('Erro ao verificar token:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor.'
    });
  }
};

module.exports = {
  requestPasswordReset,
  verifyTokenAndResetPassword,
  verifyToken
};