const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const OrderItem = sequelize.define('OrderItem', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  order_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  menu_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  harga_saat_order: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  nama_menu_saat_order: {
      type: DataTypes.STRING,
      allowNull: false,
  }
}, {
  tableName: 'order_items',
  timestamps: false,
});

module.exports = OrderItem;
