// models/MenuModel.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Menu = sequelize.define('Menu', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    dapur_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    nama_menu: {
        type: DataTypes.STRING,
        allowNull: false
    },
    deskripsi_menu: {
        type: DataTypes.TEXT
    },
    foto_menu: {
        type: DataTypes.STRING // Akan berisi URL gambar
    },
    // UBAHAN 1: Mengganti harga_5_porsi menjadi harga satuan
    harga: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    // UBAHAN 2: Menambahkan penanda untuk jenis menu
    is_menu_besar: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false 
        // false = Menu reguler (Nasi Kotak, min order 40)
        // true  = Menu besar (Tumpeng/Kambing Guling, min order 1)
    }
}, {
    tableName: 'menus'
});

module.exports = Menu;