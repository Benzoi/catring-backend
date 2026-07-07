const express = require('express');
const { getProfile, updateProfile } = require('../controllers/ProfileController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

// Semua rute di sini membutuhkan login
router.route('/')
  .get(protect, getProfile)
  .put(protect, updateProfile);

module.exports = router;