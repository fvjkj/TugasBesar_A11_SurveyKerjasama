// middleware/auth.js

// Middleware untuk membatasi akses khusus Admin
exports.isAdmin = (req, res, next) => {
    // Mengecek apakah ada session admin yang aktif
    if (req.session && req.session.adminId) {
        return next();
    }
    // Jika tidak ada, tampilkan halaman 401
    res.status(401).render('errors/401');
};

// Middleware untuk membatasi akses khusus Mitra
exports.isMitra = (req, res, next) => {
    // Mengecek apakah ada session mitra yang aktif
    if (req.session && req.session.mitraId) {
        return next();
    }
    // Jika tidak ada, tampilkan halaman 401
    res.status(401).render('errors/401');
};
