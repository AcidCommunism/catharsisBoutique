const Sequelize = require('sequelize');

const sequelize = new Sequelize('e-comm', 'root', '$adLet180391', {
  dialect: 'mysql',
  host: '127.0.0.1',
});

module.exports = sequelize;
