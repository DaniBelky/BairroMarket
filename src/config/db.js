const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('marketplace', 'root', '12345', {
    host: 'localhost',
    dialect: 'mysql',
    port: 3306
  });
  
  const testConnection = async () => {
    try {
      await sequelize.authenticate();
      console.log('Conexão com o banco de dados bem-sucedida!');
    } catch (error) {
      console.error('Erro ao conectar ao banco de dados:', error);
    }
  };
  
  testConnection();
  
  module.exports = sequelize;