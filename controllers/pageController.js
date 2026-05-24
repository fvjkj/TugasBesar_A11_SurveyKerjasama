// controllers/pageController.js
const db = require('../config/database');

// Menampilkan Halaman Dashboard (Admin)
exports.getDashboard = (req, res) => {
    // Ambil 5 data mitra terbaru dan status PIN (menggunakan RAW SQL JOIN)
    const query = `
        SELECT p.id, p.name AS nama_perusahaan, sp.pin_code, sp.status AS status_pin, p.created_at 
        FROM partners p 
        LEFT JOIN survey_pins sp ON p.id = sp.partner_id 
        ORDER BY p.created_at DESC LIMIT 5
    `;
    db.query(query, (err, perusahaan) => {
        if (err) { console.error('DB Error:', err); perusahaan = []; }
        
        // Ambil semua mitra untuk pilihan dropdown Generate PIN
        db.query('SELECT id, name FROM partners ORDER BY name ASC', (err2, allPartners) => {
            res.render('dashboard', { 
                perusahaan: perusahaan || [],
                allPartners: allPartners || []
            });
        });
    });
};

// Menampilkan Halaman Survey (Mitra)
exports.getSurvey = (req, res) => {
    res.render('survey', {
        mitraName: req.session.mitraName
    });
};
