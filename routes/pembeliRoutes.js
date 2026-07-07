const express = require('express');
const { getAllDapurs, getDapurById, createOrder } = require('../controllers/pembeliController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

// Rute ini bisa diakses publik tanpa perlu login
router.get('/dapurs', getAllDapurs);
router.get('/dapurs/:id', getDapurById);

// Rute baru untuk membuat pesanan (checkout)
router.post('/orders', protect, createOrder);

module.exports = router;
