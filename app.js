const express = require('express');
const app = express();
const path = require('path');
const authController = require('./controllers/authController');

// 1. SETUP VIEW ENGINE & FOLDER PUBLIC
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

// 2. SETUP BACA DATA FORM (Sangat penting agar req.body tidak error)
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// ==========================================
// ROUTING TAMPILAN HALAMAN (GET)
// ==========================================

// Halaman Dashboard Utama (Admin)
app.get('/', (req, res) => {
    res.render('dashboard'); 
});

// Rute Halaman Login
app.get('/login', (req, res) => {
    res.render('login', { activeTab: 'admin', error: null }); 
});

// Rute untuk Input PIN Mitra (Tab Mitra di halaman Login)
app.get('/input-pin', (req, res) => {
    res.render('login', { activeTab: 'mitra', error: null }); 
});

// Rute Halaman Permintaan PIN Mitra (Fitur Baru Ferdi)
app.get('/request-pin', (req, res) => {
    res.render('request-pin', { error: null, success: null });
});

// Halaman Setelah Login Mitra (Punya Madani)
app.get('/survey-kerjasama', (req, res) => {
    res.send('<h1>Selamat Datang di Halaman Survey Kerjasama</h1><p>Halaman ini nantinya akan dikerjakan oleh anggota tim yang lain.</p>');
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