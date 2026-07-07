const { Order, OrderItem, Dapur, User, Menu, sequelize } = require('../models');
const nodemailer = require('nodemailer');

// Fungsi untuk mengirim email notifikasi
const sendOrderNotificationEmail = async (dapurUser, pembeli, orderDetails) => {
    // Konfigurasi transporter email
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    // Membuat daftar item pesanan dalam format HTML
    let itemsListHtml = '';
    orderDetails.cartItems.forEach(item => {
        itemsListHtml += `<li>${item.nama_menu} (x${item.quantity}) - Rp ${Number(item.harga_5_porsi * item.quantity).toLocaleString('id-ID')}</li>`;
    });

    // Opsi email
    const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: dapurUser.email, // Kirim ke email pemilik dapur
        subject: `Pesanan Baru #${orderDetails.orderId} dari ${pembeli.nama_lengkap}`,
        html: `
            <h2>Hai ${dapurUser.nama_lengkap},</h2>
            <p>Anda baru saja menerima pesanan baru!</p>
            <hr>
            <h3>Detail Pesanan:</h3>
            <ul>
                ${itemsListHtml}
            </ul>
            <h3>Total Pesanan: Rp ${Number(orderDetails.total_harga).toLocaleString('id-ID')}</h3>
            <hr>
            <h3>Info Pemesan:</h3>
            <p><strong>Nama:</strong> ${pembeli.nama_lengkap}</p>
            <p><strong>Kontak:</strong> ${pembeli.no_hp || 'Tidak dicantumkan'}</p>
            <p>Silakan hubungi pemesan untuk konfirmasi lebih lanjut.</p>
        `,
    };

    // Kirim email
    await transporter.sendMail(mailOptions);
    console.log(`Email notifikasi pesanan dikirim ke ${dapurUser.email}`);
};


// @desc    Membuat pesanan baru
// @route   POST /api/orders
// @access  Private (Pembeli)
exports.createOrder = async (req, res) => {
    const { cartItems } = req.body;
    const pembeliId = req.user.id;

    if (!cartItems || cartItems.length === 0) {
        return res.status(400).json({ message: 'Keranjang belanja kosong' });
    }

    const t = await sequelize.transaction();

    try {
        const firstItem = cartItems[0];
        const dapurId = firstItem.dapur_id;
        let totalHarga = 0;

        for (const item of cartItems) {
            const menuItem = await Menu.findByPk(item.id);
            if (!menuItem) throw new Error(`Menu dengan ID ${item.id} tidak ditemukan.`);
            totalHarga += parseFloat(menuItem.harga_5_porsi) * item.quantity;
        }

        const order = await Order.create({
            pembeli_user_id: pembeliId,
            dapur_id: dapurId,
            total_harga: totalHarga,
        }, { transaction: t });

        const orderItemsData = cartItems.map(item => ({
            order_id: order.id,
            menu_id: item.id,
            quantity: item.quantity,
            harga_saat_order: item.harga_5_porsi,
            nama_menu_saat_order: item.nama_menu,
        }));
        
        await OrderItem.bulkCreate(orderItemsData, { transaction: t });
        
        // --- LOGIKA PENGIRIMAN EMAIL DIMULAI DI SINI ---
        const dapur = await Dapur.findByPk(dapurId, { include: User });
        const pembeli = await User.findByPk(pembeliId);

        if (!dapur || !dapur.User || !pembeli) {
            throw new Error('Data dapur atau pembeli tidak ditemukan.');
        }

        await sendOrderNotificationEmail(dapur.User, pembeli, {
            cartItems,
            total_harga: totalHarga,
            orderId: order.id
        });
        // --- LOGIKA PENGIRIMAN EMAIL SELESAI ---

        await t.commit();
        res.status(201).json({ message: 'Pesanan berhasil dibuat!' });

    } catch (error) {
        await t.rollback();
        console.error("CREATE ORDER ERROR:", error); 
        res.status(500).json({ message: 'Gagal membuat pesanan', error: error.message });
    }
};

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
                    attributes: ['nama_lengkap', 'no_hp'] // Ambil nama & no hp pembeli
                },
                {
                    model: OrderItem,
                    attributes: ['quantity', 'nama_menu_saat_order'] // Ambil detail item
                }
            ],
            order: [['createdAt', 'DESC']] // Tampilkan pesanan terbaru di atas
        });

        res.json(orders);

    } catch (error) {
        console.error("GET MY ORDERS ERROR:", error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};