const express = require('express');
const router = express.Router();
const pageController = require('../controllers/pageController');
const acl = require('../middleware/acl');

// Route: Halaman Root (Akan di-redirect ke Login)
router.get('/', (req, res) => {
    res.redirect('/login');
});

// Route: Halaman Dashboard Utama (Hanya Admin)
// Menggunakan acl.checkRole('admin') sebagai middleware keamanan
router.get('/dashboard', acl.checkRole('admin'), pageController.getDashboard);

// Route: Halaman Survey Mitra Setelah Berhasil Login PIN (Hanya Mitra)
// Menggunakan acl.checkRole('mitra') sebagai middleware keamanan
router.get('/survey-kerjasama', acl.checkRole('mitra'), pageController.getSurvey);

module.exports = router;
