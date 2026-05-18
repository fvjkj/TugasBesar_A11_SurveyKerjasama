const express = require('express');
const app = express();
const path = require('path');
const session = require('express-session');

// Import rute-rute aplikasi
const authRoutes = require('./routes/auth.routes');
const pageRoutes = require('./routes/page.routes');

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
// REGISTRASI ROUTING
// ==========================================
// Menggunakan rute dari folder routes/
app.use('/', authRoutes);
app.use('/', pageRoutes);


// ==========================================
// ERROR HANDLING (404 & 500)
// ==========================================

// 404 Not Found
app.use((req, res, next) => {
    res.status(404).render('errors/404');
});

// 500 Internal Server Error
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render('errors/500');
});

// ==========================================
// JALANKAN SERVER
// ==========================================
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server SUKAFTI A11 jalan ngebut di http://localhost:${PORT}`);
});
