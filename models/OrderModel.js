const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
// Import model lain di sini hanya jika diperlukan untuk definisi kolom (misal references)
// BUKAN untuk definisi relasi.
const User = require('./UserModel'); 
const Dapur = require('./DapurModel'); 
const Menu = require('./MenuModel'); 

const Order = sequelize.define('Order', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
    },
    pembeli_user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: User,
            key: 'id'
        }
    },
    dapur_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Dapur,
            key: 'id'
        }
    },
    total_harga: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'Menunggu Konfirmasi',
    },
    alamat_pengiriman: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    catatan: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    delivery_date: {
        type: DataTypes.DATEONLY,
        allowNull: true, // Biarkan true untuk sinkronisasi awal, bisa diubah ke false setelahnya
        defaultValue: null,
    },
    delivery_time: {
        type: DataTypes.STRING, 
        allowNull: false, 
    },
    createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
    updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
}, {
    tableName: 'orders', 
    timestamps: true,
});

// >>> PENTING: Semua definisi relasi HARUS DIHAPUS DARI SINI
// >>> dan hanya ada di backend/models/index.js
// Order.belongsTo(User, { foreignKey: 'pembeli_user_id', as: 'pembeli' });
// Order.belongsTo(Dapur, { foreignKey: 'dapur_id', as: 'dapur' });

module.exports = Order;
