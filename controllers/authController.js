// controllers/authController.js
const db = require('../config/database');
const bcrypt = require('bcrypt');

// Menampilkan Halaman Login (Admin)
exports.getLogin = (req, res) => {
    if (req.session && req.session.adminId) return res.redirect('/dashboard');
    db.query('SELECT id, nama_perusahaan FROM perusahaan_mitra ORDER BY nama_perusahaan ASC', (err, perusahaan) => {
        if (err) { console.error('DB Error:', err); perusahaan = []; }
        res.render('login', { activeTab: 'admin', error: null, perusahaan: perusahaan || [] });
    });
};

// Menampilkan Halaman Login (Mitra)
exports.getLoginMitra = (req, res) => {
    if (req.session && req.session.mitraId) return res.redirect('/survey-kerjasama');
    db.query('SELECT id, nama_perusahaan FROM perusahaan_mitra ORDER BY nama_perusahaan ASC', (err, perusahaan) => {
        if (err) { console.error('DB Error:', err); perusahaan = []; }
        res.render('login', { activeTab: 'mitra', error: null, perusahaan: perusahaan || [] });
    });
};

// Proses Logout
exports.getLogout = (req, res) => {
    const isMitra = req.session && req.session.mitraId;
    req.session.destroy(() => {
        if (isMitra) res.redirect('/login-mitra');
        else res.redirect('/login');
    });
};

// 1. Logika Login Admin
exports.postLoginAdmin = (req, res) => {
    // Mengambil data dari properti 'email' yang dikirimkan oleh form
    const { email, password } = req.body;

    // Cek identifier, sekaligus join dengan RBAC tables
    const query = `
        SELECT u.*, r.name as role_name 
        FROM users u 
        JOIN model_has_roles mhr ON u.id = mhr.model_id AND mhr.model_type = 'User'
        JOIN roles r ON mhr.role_id = r.id
        WHERE u.Identifier = ? AND r.name = 'admin'
    `;

    db.query(query, [email], async (err, results) => {
        if (err) {
            console.error('Database Error:', err);
            return res.status(500).render('login', {
                activeTab: 'admin',
                error: 'Terjadi kesalahan pada server.'
            });
        }

        if (results.length > 0) {
            const user = results[0];
            
            // Cek apakah password sudah di-hash (dimulai dengan $2a$ atau $2b$)
            const isHashed = user.password.startsWith('$2a$') || user.password.startsWith('$2b$');
            let isMatch = false;
            
            if (isHashed) {
                // Gunakan komparasi hash
                isMatch = await bcrypt.compare(password, user.password);
            } else {
                // Komparasi teks biasa (Lazy Migration)
                if (password === user.password) {
                    isMatch = true;
                    // Hash password ini untuk ke depannya
                    try {
                        const hashedNewPassword = await bcrypt.hash(password, 10);
                        db.query('UPDATE users SET password = ? WHERE id = ?', [hashedNewPassword, user.id]);
                        console.log(`Password untuk user ${user.id} berhasil di-hash otomatis.`);
                    } catch (hashErr) {
                        console.error('Gagal melakukan hash otomatis:', hashErr);
                    }
                }
            }

            if (isMatch) {
                // Set session admin
                req.session.adminId = user.id;
                req.session.adminName = user.nama;
                return res.redirect('/dashboard');
            }
        }
        
        res.render('login', {
            activeTab: 'admin',
            error: 'Identifier atau password salah.'
        });
    });
};

// 2. Logika Validasi Login Mitra (PIN Perusahaan)
exports.postLoginMitra = (req, res) => {
    const { pin } = req.body;

    // Validasi input dasar
    if (!pin) {
        return res.render('login', {
            activeTab: 'mitra',
            error: 'PIN wajib diisi.'
        });
    }

    // Cek PIN perusahaan
    const query = 'SELECT * FROM perusahaan_mitra WHERE pin_perusahaan = ?';
    db.query(query, [pin], (err, results) => {
        if (err) {
            console.error('Database Error:', err);
            return res.status(500).render('login', {
                activeTab: 'mitra',
                error: 'Terjadi kesalahan pada server.'
            });
        }

        if (results.length === 0) {
            return res.render('login', {
                activeTab: 'mitra',
                error: 'PIN perusahaan tidak valid. Hubungi administrator.'
            });
        }

        const perusahaanData = results[0];

        if (perusahaanData.status === 'nonaktif') {
            return res.render('login', {
                activeTab: 'mitra',
                error: 'PIN sudah digunakan. Satu perusahaan hanya dapat mengisi survey satu kali.'
            });
        }

        // Tandai PIN sebagai digunakan (ubah status jadi nonaktif)
        db.query('UPDATE perusahaan_mitra SET status = "nonaktif" WHERE id = ?', [perusahaanData.id], (errUpdate) => {
            if (errUpdate) {
                console.warn('Gagal mengupdate status is_used:', errUpdate.message);
            }

            // PIN valid — simpan log kunjungan karyawan dengan nilai default
            const nama = 'Perwakilan Mitra';
            const jabatan = 'Perwakilan';
            const logQuery = `
                INSERT INTO log_kunjungan_mitra (nama_karyawan, jabatan, perusahaan_id, waktu_login)
                VALUES (?, ?, ?, NOW())
            `;
            db.query(logQuery, [nama, jabatan, perusahaanData.id], (errLog) => {
                if (errLog) {
                    console.warn('Gagal menyimpan log kunjungan:', errLog.message);
                }

                // Set session mitra
                req.session.mitraId = perusahaanData.id;
                req.session.mitraName = perusahaanData.nama_perusahaan;
                req.session.employeeName = nama;

                // Redirect ke halaman survey
                res.redirect('/survey-kerjasama');
            });
        });
    });
};
