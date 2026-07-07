const { Dapur, Menu, User, Order, OrderItem } = require('../models');
const { Op } = require('sequelize'); // Import Op dari Sequelize untuk operator seperti OR, LIKE

// @desc    Melihat semua dapur yang terdaftar
// @route   GET /api/pembeli/dapurs
// @access  Public
exports.getAllDapurs = async (req, res) => {
    try {
        const { search } = req.query; // Ambil parameter 'search' dari query string
        let findOptions = {
            include: [
                {
                    model: User,
                    attributes: ['nama_lengkap', 'email']
                },
                {
                    model: Menu, // Sertakan model Menu untuk memungkinkan pencarian berdasarkan nama_menu
                    attributes: ['nama_menu'], // Hanya ambil nama_menu jika diperlukan
                    required: false, // Gunakan false (LEFT JOIN) agar tetap menampilkan dapur meskipun tidak ada menu yang cocok
                }
            ],
            // Gunakan distinct dan col untuk menghindari duplikasi dapur jika ada banyak menu yang cocok
            distinct: true,
            col: 'Dapur.id', 
        };

        if (search) {
            // Jika ada istilah pencarian, buat klausa OR untuk nama_dapur atau nama_menu
            findOptions.where = {
                [Op.or]: [
                    {
                        nama_dapur: {
                            [Op.like]: `%${search}%` // Cari nama_dapur yang mengandung istilah pencarian
                        }
                    },
                    {
                        '$Menus.nama_menu$': { // Referensi ke alias default model Menu (pluralized)
                            [Op.like]: `%${search}%` // Cari nama_menu yang mengandung istilah pencarian
                        }
                    }
                ]
            };
            // Hapus group dan having jika menggunakan Op.or di where utama dengan distinct
            // delete findOptions.group;
            // delete findOptions.having;
        }

        const dapurs = await Dapur.findAll(findOptions);

        res.json(dapurs);
    } catch (error) {
        console.error("GET ALL DAPURS ERROR:", error); // Tambahkan log error
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Melihat detail satu dapur beserta semua menunya
// @route   GET /api/pembeli/dapurs/:id
// @access  Public
exports.getDapurById = async (req, res) => {
    try {
        const dapur = await Dapur.findByPk(req.params.id, {
            include: [
                {
                    model: User,
                    attributes: ['nama_lengkap', 'email']
                },
                {
                    model: Menu
                }
            ]
        });

        if (dapur) {
            res.json(dapur);
        } else {
            res.status(404).json({ message: 'Dapur tidak ditemukan' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Membuat pesanan baru (proses checkout)
// @route   POST /api/pembeli/orders
// @access  Private (Hanya Pembeli)
exports.createOrder = async (req, res) => {
    const { cartItems, totalHarga, alamatPengiriman, catatan, deliveryDate, deliveryTime } = req.body;
    
    try {
        if (!req.user || req.user.role !== 'pembeli') {
            return res.status(403).json({ message: 'Akses ditolak. Hanya pembeli yang bisa membuat pesanan.' });
        }

        const pembeliUserId = req.user.id;

        if (!cartItems || cartItems.length === 0) {
            return res.status(400).json({ message: 'Keranjang belanja kosong.' });
        }

        const firstCartItem = cartItems[0];
        const menu = await Menu.findByPk(firstCartItem.menuId);

        if (!menu) {
            return res.status(404).json({ message: 'Menu tidak ditemukan untuk item pertama di keranjang.' });
        }

        const dapurId = menu.dapur_id;

        const newOrder = await Order.create({
            pembeli_user_id: pembeliUserId,
            dapur_id: dapurId,
            total_harga: totalHarga,
            status: 'Menunggu Konfirmasi',
            alamat_pengiriman: alamatPengiriman,
            catatan: catatan,
            delivery_date: deliveryDate,
            delivery_time: deliveryTime,
        });

        for (const item of cartItems) {
            const orderedMenu = await Menu.findByPk(item.menuId); 
            if (!orderedMenu) {
                console.warn(`Menu dengan ID ${item.menuId} tidak ditemukan saat checkout.`);
                continue; 
            }

            await OrderItem.create({
                order_id: newOrder.id,
                menu_id: orderedMenu.id,
                quantity: item.quantity,
                harga_saat_order: orderedMenu.harga_5_porsi,
                nama_menu_saat_order: orderedMenu.nama_menu
            });
        }

        res.status(201).json({ message: 'Pesanan berhasil dibuat!', orderId: newOrder.id });

    } catch (error) {
        console.error("ERROR SAAT MEMBUAT PESANAN:", error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};
