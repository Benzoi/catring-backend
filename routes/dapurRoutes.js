const express = require('express');
const multer = require('multer');
const { createMenu, getMyMenus, deleteMyMenu, getMyOrders, updateOrderStatus } = require('../controllers/dapurController'); // Import updateOrderStatus
const { protect, isDapur } = require('../middleware/authMiddleware');
const storage = require('../utils/cloudinary');
const router = express.Router();

const upload = multer({ storage });

// Rute untuk menambah dan melihat semua menu
router.route('/menus')
  .post(protect, isDapur, upload.single('foto_menu'), createMenu)
  .get(protect, isDapur, getMyMenus);

// Rute untuk menghapus menu spesifik
router.route('/menus/:id')
  .delete(protect, isDapur, deleteMyMenu);

// Rute untuk dapur melihat semua pesanan yang masuk
router.route('/orders')
  .get(protect, isDapur, getMyOrders);

// Rute baru untuk dapur mengubah status pesanan
router.route('/orders/:id/status')
  .put(protect, isDapur, updateOrderStatus); // Endpoint untuk update status

module.exports = router;
