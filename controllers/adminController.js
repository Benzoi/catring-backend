const { User, Dapur, Order, OrderItem } = require('../models'); // Pastikan Order dan OrderItem diimpor

// @desc    Melihat semua pengguna (admin, dapur, pembeli)
// @route   GET /api/admin/users
// @access  Private (Hanya Admin)
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: ['id', 'nama_lengkap', 'email', 'role', 'no_hp'] // Pilih atribut yang ingin ditampilkan
        });
        res.json(users);
    } catch (error) {
        console.error("GET ALL USERS ERROR:", error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Menghapus pengguna
// @route   DELETE /api/admin/users/:id
// @access  Private (Hanya Admin)
exports.deleteUser = async (req, res) => {
    try {
        const userToDelete = await User.findByPk(req.params.id);

        if (!userToDelete) {
            return res.status(404).json({ message: 'Pengguna tidak ditemukan' });
        }

        // Pastikan admin tidak menghapus dirinya sendiri
        if (userToDelete.id === req.user.id) {
            return res.status(403).json({ message: 'Anda tidak dapat menghapus akun Anda sendiri.' });
        }

        await userToDelete.destroy();
        res.json({ message: 'Pengguna berhasil dihapus' });
    } catch (error) {
        console.error("DELETE USER ERROR:", error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Melihat semua pesanan dalam sistem
// @route   GET /api/admin/orders
// @access  Private (Hanya Admin)
exports.getAdminOrders = async (req, res) => {
    try {
        const orders = await Order.findAll({
            include: [
                {
                    model: User,
                    as: 'pembeli', // Alias 'pembeli' dari Order.belongsTo(User, {as: 'pembeli'})
                    attributes: ['nama_lengkap', 'no_hp']
                },
                {
                    model: Dapur,
                    as: 'dapur', // Alias 'dapur' dari Order.belongsTo(Dapur, {as: 'dapur'})
                    attributes: ['nama_dapur']
                },
                {
                    model: OrderItem,
                    as: 'OrderItems', // Alias 'OrderItems' dari Order.hasMany(OrderItem, {as: 'OrderItems'})
                    attributes: ['quantity', 'nama_menu_saat_order']
                }
            ],
            order: [['createdAt', 'DESC']] // Urutkan dari yang terbaru
        });
        res.json(orders);
    } catch (error) {
        console.error("GET ADMIN ORDERS ERROR:", error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};
