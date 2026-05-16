const express = require('express');
const app = express();
const path = require('path');
const session = require('express-session');
const authController = require('./controllers/authController');
const { isAdmin, isMitra } = require('./middleware/auth');
const db = require('./config/database');

// 1. SETUP VIEW ENGINE & FOLDER PUBLIC
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

// 2. SETUP BACA DATA FORM (Sangat penting agar req.body tidak error)
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// 3. SETUP SESSION
app.use(session({
    secret: 'sukafti_rahasia_negara_123',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 } // 1 hari
}));

// ==========================================
// ROUTING TAMPILAN HALAMAN (GET)
// ==========================================

// Halaman Dashboard Utama (Admin)
app.get('/', isAdmin, (req, res) => {
    // Ambil 5 data mitra terbaru
    db.query('SELECT id, nama_perusahaan, pin_perusahaan, status, created_at FROM perusahaan_mitra ORDER BY created_at DESC LIMIT 5', (err, perusahaan) => {
        if (err) { console.error('DB Error:', err); perusahaan = []; }
        res.render('dashboard', { perusahaan: perusahaan || [] });
    });
});

// Rute Halaman Login
app.get('/login', (req, res) => {
    // Jika sudah login admin, langsung ke dashboard
    if (req.session && req.session.adminId) return res.redirect('/');
    db.query('SELECT id, nama_perusahaan FROM perusahaan_mitra ORDER BY nama_perusahaan ASC', (err, perusahaan) => {
        if (err) { console.error('DB Error:', err); perusahaan = []; }
        res.render('login', { activeTab: 'admin', error: null, perusahaan: perusahaan || [] });
    });
});

// Rute untuk Login Mitra (Halaman terpisah)
app.get('/login-mitra', (req, res) => {
    // Jika sudah login mitra, langsung ke survey
    if (req.session && req.session.mitraId) return res.redirect('/survey-kerjasama');
    db.query('SELECT id, nama_perusahaan FROM perusahaan_mitra ORDER BY nama_perusahaan ASC', (err, perusahaan) => {
        if (err) { console.error('DB Error:', err); perusahaan = []; }
        res.render('login', { activeTab: 'mitra', error: null, perusahaan: perusahaan || [] });
    });
});

// Halaman Setelah Login Mitra (Punya Madani)
app.get('/survey-kerjasama', isMitra, (req, res) => {
    res.send(`<h1>Selamat Datang, Karyawan ${req.session.employeeName} dari ${req.session.mitraName}</h1><p>Halaman ini nantinya akan dikerjakan oleh anggota tim yang lain.</p><a href="/logout">Logout</a>`);
});

// Route Logout
app.get('/logout', (req, res) => {
    const isMitra = req.session.mitraId;
    req.session.destroy(() => {
        if (isMitra) res.redirect('/login-mitra');
        else res.redirect('/login');
    });
});

// ==========================================
// ROUTING PROSES DATA FORM (POST)
// ==========================================

// Memproses form saat Admin klik "Masuk"
app.post('/login', authController.postLoginAdmin);

// Memproses form saat Mitra klik "Masuk" dengan PIN
app.post('/api/auth/mitra-login', authController.postLoginMitra);

// ==========================================
// JALANKAN SERVER
// ==========================================
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server SUKAFTI A11 jalan ngebut di http://localhost:${PORT}`);
});