const express = require('express');
const app = express();
const path = require('path');

// Set View Engine ke EJS (untuk tampilan)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Set Folder Public (untuk file CSS/Gambar)
app.use(express.static(path.join(__dirname, 'public')));

// Agar aplikasi bisa membaca data dari form input
app.use(express.urlencoded({ extended: true }));

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

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server A11 jalan di http://localhost:${PORT}`);
});
