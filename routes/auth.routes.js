const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Route: Halaman Login Admin
router.get('/login', authController.getLogin);

// Route: Proses Login Admin (POST)
router.post('/login', authController.postLoginAdmin);

// Route: Halaman Login Mitra
router.get('/login-mitra', authController.getLoginMitra);

// Route: Proses Login Mitra (POST)
router.post('/api/auth/mitra-login', authController.postLoginMitra);

// Route: Logout
router.get('/logout', authController.getLogout);

module.exports = router;
