const User = require('../Models/User');
const bcrypt = require('bcrypt');

// Apenas verificação de login
const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Verifica se o e-mail existe
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ mensagem: 'E-mail não encontrado' });
    }

    // Compara senha informada com a do banco (hash)
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ mensagem: 'Senha incorreta' });
    }

    // Login válido
    res.status(200).json({ mensagem: 'Login bem-sucedido', usuario: user });

  } catch (error) {
    console.error('Erro ao fazer login:', error);
    res.status(500).json({ mensagem: 'Erro ao realizar login' });
  }
};

module.exports = { login };
