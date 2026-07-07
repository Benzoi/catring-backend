// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const { User } = require('../models');

const protect = async (req, res, next) => {
    let token;
    // Cek jika header authorization ada dan dimulai dengan 'Bearer'
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Ambil token dari header (setelah 'Bearer ')
            token = req.headers.authorization.split(' ')[1];

            // Verifikasi token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Cari user berdasarkan id dari token dan tambahkan ke object request
            req.user = await User.findByPk(decoded.id, {
                attributes: { exclude: ['password'] }
            });

            next(); // Lanjutkan ke controller
        } catch (error) {
            console.error(error);
            res.status(401).json({ message: 'Tidak terotorisasi, token gagal' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'Tidak terotorisasi, tidak ada token' });
    }
};

const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: 'Akses ditolak, butuh peran Admin' });
    }
};

const isDapur = (req, res, next) => {
    if (req.user && req.user.role === 'dapur') {
        next();
    } else {
        res.status(403).json({ message: 'Akses ditolak, butuh peran Dapur' });
    }
};

module.exports = { protect, isAdmin, isDapur };