const express = require('express');
const router = express.Router();
const pageController = require('../controllers/pageController');
const adminController = require('../controllers/adminController');
const acl = require('../middleware/acl');
const { body } = require('express-validator');

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

// ==============================================
// ROUTES: FITUR MINGGU KE 12 (Ferdian Rahman)
// ==============================================

// 1. Validasi Data & Form Handling (Server Side via express-validator)
router.post('/admin/generate-pin', acl.checkRole('admin'), [
    body('partner_id').notEmpty().withMessage('Partner ID wajib diisi.').isInt().withMessage('Partner ID tidak valid.')
], adminController.generatePin);

// 2. Eksport Dokumen (CSV Data Raw)
router.get('/admin/export-csv', acl.checkRole('admin'), adminController.exportSurveyCsv);

// 3. Output RestAPI (Statistik Dashboard)
router.get('/api/dashboard-stats', acl.checkRole('admin'), adminController.getDashboardStatsApi);

module.exports = router;
