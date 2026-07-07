const { User, Dapur } = require('../models');

// @desc    Mengambil data profil user yang sedang login
// @route   GET /api/profile
// @access  Private
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] },
      include: { model: Dapur } // Sertakan data Dapur jika ada
    });

    if (!user) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }
    res.json(user);
  } catch (error) {
    console.error('GET PROFILE ERROR:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Memperbarui data profil user yang sedang login
// @route   PUT /api/profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }

    // Perbarui data umum (untuk semua role)
    // Cek apakah data dikirim dari frontend sebelum mengubahnya
    if (req.body.hasOwnProperty('nama_lengkap')) {
      user.nama_lengkap = req.body.nama_lengkap;
    }
    if (req.body.hasOwnProperty('no_hp')) {
      user.no_hp = req.body.no_hp;
    }
    await user.save();

    // Jika user adalah 'dapur', update juga data dapurnya
    if (user.role === 'dapur') {
      const dapur = await Dapur.findOne({ where: { user_id: user.id } });
      if (dapur) {
        if (req.body.hasOwnProperty('nama_dapur')) {
          dapur.nama_dapur = req.body.nama_dapur;
        }
        if (req.body.hasOwnProperty('alamat')) {
          dapur.alamat = req.body.alamat;
        }
        if (req.body.hasOwnProperty('deskripsi')) {
          dapur.deskripsi = req.body.deskripsi;
        }
        await dapur.save();
      }
    }
    
    // Kirim kembali data yang sudah diperbarui secara lengkap
    const updatedUser = await User.findByPk(req.user.id, {
      include: { model: Dapur },
      attributes: { exclude: ['password'] }
    });

    res.json(updatedUser);

  } catch (error) {
    // Log error di konsol backend untuk debugging
    console.error('PROFILE UPDATE ERROR:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};
