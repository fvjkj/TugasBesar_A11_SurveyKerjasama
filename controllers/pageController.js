// controllers/pageController.js
const db = require('../config/database');

// Menampilkan Halaman Dashboard (Admin)
exports.getDashboard = (req, res) => {
    // Ambil 5 data mitra terbaru
    db.query('SELECT id, nama_perusahaan, pin_perusahaan, status, created_at FROM perusahaan_mitra ORDER BY created_at DESC LIMIT 5', (err, perusahaan) => {
        if (err) { console.error('DB Error:', err); perusahaan = []; }
        res.render('dashboard', { perusahaan: perusahaan || [] });
    });
};

// Menampilkan Halaman Survey (Mitra)
exports.getSurvey = (req, res) => {
    res.render('survey', {
        mitraName: req.session.mitraName
    });
};
