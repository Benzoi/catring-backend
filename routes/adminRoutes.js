const express = require('express');
const { getAllUsers, deleteUser, getAdminOrders } = require('../controllers/adminController'); // Import getAdminOrders
const { protect, isAdmin } = require('../middleware/authMiddleware');
const router = express.Router();

// Rute untuk manajemen pengguna oleh admin
router.route('/users')
  .get(protect, isAdmin, getAllUsers); // Hanya admin yang bisa melihat semua user

router.route('/users/:id')
  .delete(protect, isAdmin, deleteUser); // Hanya admin yang bisa menghapus user

// Rute baru untuk admin melihat semua pesanan
router.route('/orders')
  .get(protect, isAdmin, getAdminOrders); // Hanya admin yang bisa melihat semua pesanan

module.exports = router;
