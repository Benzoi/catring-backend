const { Dapur, Menu, User, Order, OrderItem } = require('../models');

// @desc    Membuat menu baru
// @route   POST /api/dapur/menus
// @access  Private (Hanya Dapur)
exports.createMenu = async (req, res) => {
    const { nama_menu, deskripsi_menu, harga_5_porsi } = req.body;
    try {
        const dapur = await Dapur.findOne({ where: { user_id: req.user.id } });
        if (!dapur) {
            return res.status(404).json({ message: 'Profil dapur tidak ditemukan' });
        }
        const foto_url = req.file ? req.file.path : null;
        const menu = await Menu.create({
            dapur_id: dapur.id,
            nama_menu,
            deskripsi_menu,
            harga_5_porsi,
            foto_menu: foto_url,
        });
        res.status(201).json(menu);
    } catch (error) {
        console.error("CREATE MENU ERROR:", error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Melihat semua menu milik dapur yang login
// @route   GET /api/dapur/menus
// @access  Private (Hanya Dapur)
exports.getMyMenus = async (req, res) => {
    try {
        const dapur = await Dapur.findOne({ where: { user_id: req.user.id } });
        if (!dapur) {
            return res.status(404).json({ message: 'Profil dapur tidak ditemukan' });
        }
        const menus = await Menu.findAll({ where: { dapur_id: dapur.id } });
        res.json(menus);
    } catch (error) {
        console.error("GET MY MENUS ERROR:", error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Dapur menghapus menunya sendiri
// @route   DELETE /api/dapur/menus/:id
// @access  Private (Hanya Dapur pemilik)
exports.deleteMyMenu = async (req, res) => {
    try {
        const dapur = await Dapur.findOne({ where: { user_id: req.user.id } });
        if (!dapur) {
            return res.status(404).json({ message: 'Profil dapur tidak ditemukan' });
        }
        const menu = await Menu.findByPk(req.params.id);
        if (!menu) {
            return res.status(404).json({ message: 'Menu tidak ditemukan' });
        }
        if (menu.dapur_id !== dapur.id) {
            return res.status(403).json({ message: 'Tidak diizinkan menghapus menu ini' });
        }
        await menu.destroy();
        res.json({ message: 'Menu berhasil dihapus' });
    } catch (error) {
        console.error("DAPUR DELETE MENU ERROR:", error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Dapur melihat semua pesanan yang masuk
// @route   GET /api/dapur/orders
// @access  Private (Hanya Dapur)
exports.getMyOrders = async (req, res) => {
    try {
        const dapur = await Dapur.findOne({ where: { user_id: req.user.id } });
        if (!dapur) {
            return res.status(404).json({ message: 'Profil dapur tidak ditemukan' });
        }
        const orders = await Order.findAll({
            where: { dapur_id: dapur.id },
            include: [
                {
                    model: User,
                    as: 'pembeli',
                    attributes: ['nama_lengkap', 'no_hp']
                },
                {
                    model: OrderItem,
                    as: 'OrderItems',
                    attributes: ['quantity', 'nama_menu_saat_order']
                }
            ],
            order: [['createdAt', 'DESC']]
        });
        res.json(orders);
    } catch (error) {
        console.error("GET MY ORDERS ERROR:", error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Dapur mengubah status pesanan
// @route   PUT /api/dapur/orders/:id/status
// @access  Private (Hanya Dapur)
exports.updateOrderStatus = async (req, res) => {
    const { id } = req.params; // ID pesanan dari URL
    const { status } = req.body; // Status baru dari body request

    try {
        const dapur = await Dapur.findOne({ where: { user_id: req.user.id } });
        if (!dapur) {
            return res.status(404).json({ message: 'Profil dapur tidak ditemukan' });
        }

        const order = await Order.findByPk(id);

        if (!order) {
            return res.status(404).json({ message: 'Pesanan tidak ditemukan' });
        }

        // Pastikan pesanan ini milik dapur yang sedang login
        if (order.dapur_id !== dapur.id) {
            return res.status(403).json({ message: 'Tidak diizinkan mengubah status pesanan ini.' });
        }

        // Validasi status yang diizinkan
        const allowedStatuses = ['Menunggu Konfirmasi', 'Diproses', 'Diantarkan', 'Selesai', 'Dibatalkan'];
        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({ message: 'Status tidak valid.' });
        }

        order.status = status;
        await order.save(); // Simpan perubahan status ke database

        res.json({ message: 'Status pesanan berhasil diperbarui', order });
    } catch (error) {
        console.error("UPDATE ORDER STATUS ERROR:", error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};
