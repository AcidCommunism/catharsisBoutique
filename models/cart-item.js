const Sequelize = require('sequelize');

const sequelize = require('../util/database');

const CartItem = sequelize.define('cart_item', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false,
  },
  quantity: Sequelize.INTEGER,
});

module.exports = CartItem;
