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

// 2. Logika Validasi Login Mitra (PIN Perusahaan)
exports.postLoginMitra = (req, res) => {
    const { nama, jabatan, perusahaan_id, pin } = req.body;

    // Validasi input dasar
    if (!nama || !jabatan || !perusahaan_id || !pin) {
        return db.query('SELECT id, nama_perusahaan FROM perusahaan_mitra ORDER BY nama_perusahaan ASC', (err2, perusahaan) => {
            perusahaan = perusahaan || [];
            return res.render('login', {
                activeTab: 'mitra',
                error: 'Semua field wajib diisi.',
                perusahaan
            });
        });
    }

    // Cek PIN perusahaan
    const query = 'SELECT * FROM perusahaan_mitra WHERE id = ? AND pin_perusahaan = ?';
    db.query(query, [perusahaan_id, pin], (err, results) => {
        if (err) {
            console.error('Database Error:', err);
            return db.query('SELECT id, nama_perusahaan FROM perusahaan_mitra ORDER BY nama_perusahaan ASC', (err2, perusahaan) => {
                perusahaan = perusahaan || [];
                return res.status(500).render('login', {
                    activeTab: 'mitra',
                    error: 'Terjadi kesalahan pada server.',
                    perusahaan
                });
            });
        }

        if (results.length === 0) {
            return db.query('SELECT id, nama_perusahaan FROM perusahaan_mitra ORDER BY nama_perusahaan ASC', (err2, perusahaan) => {
                perusahaan = perusahaan || [];
                return res.render('login', {
                    activeTab: 'mitra',
                    error: 'PIN perusahaan tidak valid. Hubungi administrator.',
                    perusahaan
                });
            });
        }

        // PIN valid — simpan log kunjungan karyawan
        const perusahaanData = results[0];
        const logQuery = `
            INSERT INTO log_kunjungan_mitra (nama_karyawan, jabatan, perusahaan_id, waktu_login)
            VALUES (?, ?, ?, NOW())
        `;
        db.query(logQuery, [nama, jabatan, perusahaan_id], (errLog) => {
            if (errLog) {
                // Log gagal tidak menghentikan login — hanya catat ke console
                console.warn('Gagal menyimpan log kunjungan:', errLog.message);
            }
            // Redirect ke halaman survey
            res.redirect('/survey-kerjasama');
        });
    });
};
