const { DataTypes } = require('sequelize');
const sequelize = require('../config/database'); // Asumsi koneksi ada di sini

const User = sequelize.define('User', {
    nama_lengkap: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    password: { type: DataTypes.STRING, allowNull: false },
    role: { type: DataTypes.ENUM('admin', 'dapur', 'pembeli'), allowNull: false }
});

module.exports = User;