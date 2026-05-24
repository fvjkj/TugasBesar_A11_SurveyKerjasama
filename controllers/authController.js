// controllers/authController.js
const db = require('../config/database');
const bcrypt = require('bcrypt');

// Menampilkan Halaman Login (Admin)
exports.getLogin = (req, res) => {
    if (req.session && req.session.adminId) return res.redirect('/dashboard');
    res.render('login', { activeTab: 'admin', error: null });
};

// Menampilkan Halaman Login (Mitra)
exports.getLoginMitra = (req, res) => {
    if (req.session && req.session.mitraId) return res.redirect('/survey-kerjasama');
    res.render('login', { activeTab: 'mitra', error: null });
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
    // Mengambil data dari form, bisa berupa email atau username
    const { email, password } = req.body;

    // Cek identifier, sekaligus join dengan RBAC tables (schema baru)
    const query = `
        SELECT u.*, r.name as role_name 
        FROM users u 
        JOIN model_has_roles mhr ON u.id = mhr.model_id AND mhr.model_type = 'User'
        JOIN roles r ON mhr.role_id = r.id
        WHERE (u.email = ? OR u.username = ?) AND r.name = 'admin'
    `;

    db.query(query, [email, email], async (err, results) => {
        if (err) {
            console.error('Database Error:', err);
            return res.status(500).render('login', {
                activeTab: 'admin',
                error: 'Terjadi kesalahan pada database.'
            });
        }

        if (results.length > 0) {
            const user = results[0];
            
            // Cek apakah password sudah di-hash
            const isHashed = user.password.startsWith('$2a$') || user.password.startsWith('$2b$');
            let isMatch = false;
            
            if (isHashed) {
                isMatch = await bcrypt.compare(password, user.password);
            } else {
                if (password === user.password) {
                    isMatch = true;
                    try {
                        const hashedNewPassword = await bcrypt.hash(password, 10);
                        db.query('UPDATE users SET password = ? WHERE id = ?', [hashedNewPassword, user.id]);
                    } catch (hashErr) {
                        console.error('Gagal melakukan hash otomatis:', hashErr);
                    }
                }
            }

            if (isMatch) {
                req.session.adminId = user.id;
                req.session.adminName = user.username; // Menggunakan kolom username
                return res.redirect('/dashboard');
            }
        }
        
        res.render('login', {
            activeTab: 'admin',
            error: 'Email/Username atau password salah.'
        });
    });
};

// 2. Logika Validasi Login Mitra (PIN Perusahaan)
exports.postLoginMitra = (req, res) => {
    const { pin } = req.body;

    if (!pin) {
        return res.render('login', {
            activeTab: 'mitra',
            error: 'PIN wajib diisi.'
        });
    }

    // Cek PIN perusahaan di tabel survey_pins (schema baru)
    const query = `
        SELECT sp.id AS pin_id, sp.pin_code, sp.status, sp.expired_at,
               p.id AS partner_id, p.name AS nama_perusahaan 
        FROM survey_pins sp
        JOIN partners p ON sp.partner_id = p.id
        WHERE sp.pin_code = ?
    `;

    db.query(query, [pin], (err, results) => {
        if (err) {
            console.error('Database Error:', err);
            return res.status(500).render('login', {
                activeTab: 'mitra',
                error: 'Terjadi kesalahan pada database.'
            });
        }

        if (results.length === 0) {
            return res.render('login', {
                activeTab: 'mitra',
                error: 'PIN tidak valid. Hubungi administrator.'
            });
        }

        const pinData = results[0];

        if (pinData.status === 'used') {
            return res.render('login', {
                activeTab: 'mitra',
                error: 'PIN sudah digunakan. Satu PIN hanya berlaku untuk satu kali pengisian.'
            });
        }

        if (pinData.status === 'expired' || (pinData.expired_at && new Date() > new Date(pinData.expired_at))) {
            return res.render('login', {
                activeTab: 'mitra',
                error: 'PIN sudah kedaluwarsa.'
            });
        }

        // Tandai PIN sebagai "used"
        db.query('UPDATE survey_pins SET status = "used" WHERE id = ?', [pinData.pin_id], (errUpdate) => {
            if (errUpdate) console.warn('Gagal mengupdate status PIN:', errUpdate.message);

            // Set session mitra
            req.session.mitraId = pinData.partner_id;
            req.session.mitraName = pinData.nama_perusahaan;
            req.session.pinId = pinData.pin_id;

            res.redirect('/survey-kerjasama');
        });
    });
};
