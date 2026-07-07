const { User, Dapur } = require('../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Fungsi untuk membuat token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

exports.register = async (req, res) => {
    const { nama_lengkap, email, password, role } = req.body;

    try {
        const userExists = await User.findOne({ where: { email } });
        if (userExists) {
            return res.status(400).json({ message: 'Email sudah terdaftar' });
        }

        const user = await User.create({ nama_lengkap, email, password, role });

        if (user && role === 'dapur') {
            await Dapur.create({
                user_id: user.id,
                nama_dapur: `${nama_lengkap}'s Kitchen`
            });
        }

        res.status(201).json({
            id: user.id,
            nama_lengkap: user.nama_lengkap,
            email: user.email,
            role: user.role,
            token: generateToken(user.id),
        });
    } catch (error) {
        // TAMBAHKAN INI: Cetak error ke konsol backend
        console.error('REGISTER ERROR:', error); 
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ where: { email } });

        if (user && (await bcrypt.compare(password, user.password))) {
            // Setelah login berhasil, sertakan juga data profil Dapur jika ada
            const userWithDapur = await User.findByPk(user.id, {
                include: { model: Dapur },
                attributes: { exclude: ['password'] }
            });

            res.json({
                ...userWithDapur.toJSON(), // Kirim semua data user (kecuali password)
                token: generateToken(user.id),
            });
        } else {
            res.status(401).json({ message: 'Email atau password salah' });
        }
    } catch (error) {
        // TAMBAHKAN INI: Cetak error ke konsol backend
        console.error('LOGIN ERROR:', error); 
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};
