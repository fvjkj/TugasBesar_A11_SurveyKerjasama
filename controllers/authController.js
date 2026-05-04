// controllers/authController.js
const db = require('../config/database');

// 1. Logika Login Admin
exports.postLoginAdmin = (req, res) => {
    // Mengambil data dari properti 'email' yang dikirimkan oleh form
    const { email, password } = req.body;
    
    // Tetap cocokkan dengan kolom 'Identifier' di database
    const query = 'SELECT * FROM users WHERE Identifier = ? AND password = ?';
    
    db.query(query, [email, password], (err, results) => {
        if (err) {
            console.error('Database Error:', err);
            return res.status(500).render('login', { 
                activeTab: 'admin', 
                error: 'Terjadi kesalahan pada server.' 
            });
        }
        
        if (results.length > 0) {
            res.redirect('/');
        } else {
            res.render('login', { 
                activeTab: 'admin', 
                error: 'Identifier atau password salah.' 
            });
        }
    });
};

// 2. Logika Validasi PIN Mitra
exports.postLoginMitra = (req, res) => {
    const { pin } = req.body;
    const query = 'SELECT * FROM pin_survey WHERE pin_code = ?';
    
    db.query(query, [pin], (err, results) => {
        if (err) {
            console.error('Database Error:', err);
            return res.status(500).render('login', { 
                activeTab: 'mitra', 
                error: 'Terjadi kesalahan pada server.' 
            });
        }
        
        if (results.length > 0) {
            const pinData = results[0];
            
            if (pinData.is_used === 1) {
                return res.render('login', { 
                    activeTab: 'mitra', 
                    error: 'Kode PIN sudah digunakan.' 
                });
            }
            
            res.redirect('/survey-kerjasama');
        } else {
            res.render('login', { 
                activeTab: 'mitra', 
                error: 'Kode PIN tidak valid.' 
            });
        }
    });
};
