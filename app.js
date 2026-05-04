const express = require('express');
const app = express();
const path = require('path');
const authController = require('./controllers/authController');

// Set View Engine ke EJS (untuk tampilan)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Set Folder Public (untuk file CSS/Gambar)
app.use(express.static(path.join(__dirname, 'public')));

// Agar aplikasi bisa membaca data dari form input
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Redirect root ke halaman login
app.get('/', (req, res) => {
    res.redirect('/login');
});

// Rute Halaman Login (Admin & Mitra tab)
app.get('/login', (req, res) => {
    res.render('login', { activeTab: 'admin' });
});

// Rute Halaman Input PIN Mitra
app.get('/input-pin', (req, res) => {
    res.render('input-pin');
});

// Rute Halaman Login 
app.get('/login', (req, res) => {
    res.render('login', { 
        activeTab: 'admin', 
        error: null 
    });
});

// Rute untuk Input PIN Mitra
app.get('/input-pin', (req, res) => {
    res.render('login', { 
        activeTab: 'mitra', 
        error: null 
    });
});

// === TAMBAHAN RUTE UNTUK HALAMAN SETELAH LOGIN MITRA ===
app.get('/survey-kerjasama', (req, res) => {
    res.send('<h1>Selamat Datang di Halaman Survey Kerjasama</h1><p>Halaman ini nantinya akan dikerjakan oleh anggota tim yang lain.</p>');
});

// Rute untuk memproses form login Admin
app.post('/login', authController.postLoginAdmin);

// Rute untuk memproses form PIN Mitra
app.post('/api/auth/mitra-login', authController.postLoginMitra);

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server A11 jalan di http://localhost:${PORT}`);
});
