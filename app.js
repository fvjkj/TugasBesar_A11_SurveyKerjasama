const express = require('express');
const app = express();
const path = require('path');

// 1. IMPORT CONTROLLER BACKEND (Buatan Madani)
const authController = require('./controllers/authController');

// 2. SETUP VIEW ENGINE & FOLDER PUBLIC
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

// 3. SETUP BACA DATA FORM (Sangat penting agar req.body tidak error)
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); // Tambahan jaga-jaga kalau ada kiriman data format JSON

// ==========================================
// ROUTING TAMPILAN HALAMAN (GET)
// ==========================================

// Halaman Dashboard Utama (Akan dirender setelah Admin sukses login)
app.get('/', (req, res) => {
    res.render('dashboard'); 
});

// Rute Halaman Login (Tampilan awal selalu buka tab Admin)
app.get('/login', (req, res) => {
    res.render('login', { activeTab: 'admin', error: null }); 
});

// Rute Halaman Input PIN Mitra (Kalau halaman terpisah masih dipakai)
app.get('/input-pin', (req, res) => {
    res.render('input-pin');
});

// Rute Halaman Permintaan PIN Mitra
app.get('/request-pin', (req, res) => {
    res.render('request-pin', { error: null, success: null });
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