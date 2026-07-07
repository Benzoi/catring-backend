const express = require('express');
const cors = require('cors');
require('dotenv').config();
const sequelize = require('./config/database');
const { User, Dapur, Menu } = require('./models'); // Pastikan semua model diimpor jika diperlukan untuk sinkronisasi

// Impor Routes
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const dapurRoutes = require('./routes/dapurRoutes');
const pembeliRoutes = require('./routes/pembeliRoutes');
const profileRoutes = require('./routes/profileRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Gunakan Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/dapur', dapurRoutes);
app.use('/api/pembeli', pembeliRoutes);
app.use('/api/profile', profileRoutes);


app.get('/', (req, res) => {
    res.send('API Katering Berjalan!');
});

const PORT = process.env.PORT || 5001;

const startServer = async () => {
    try {
        // PERUBAHAN DI SINI: Tambahkan { alter: true }
        await sequelize.sync({ alter: true });
        console.log('Database berhasil tersinkronisasi.');
        app.listen(PORT, () => console.log(`Server berjalan di port ${PORT}`));
    } catch (error) {
        console.error('Tidak dapat terhubung ke database:', error);
    }
};

startServer();
