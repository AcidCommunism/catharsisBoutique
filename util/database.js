const Sequelize = require("sequelize");

const sequelize = new Sequelize("e-comm", "root", "$adLet180391", {
  dialect: "mysql",
  host: "localhost",
});

module.exports = sequelize;
