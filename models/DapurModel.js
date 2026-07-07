// models/DapurModel.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Dapur = sequelize.define('Dapur', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    nama_dapur: {
        type: DataTypes.STRING,
        allowNull: false
    },
    alamat: {
        type: DataTypes.TEXT
    },
    deskripsi: {
        type: DataTypes.TEXT
    },
    foto_profil: {
        type: DataTypes.STRING // Akan berisi URL gambar
    }
}, {
    tableName: 'dapurs'
});

module.exports = Dapur;