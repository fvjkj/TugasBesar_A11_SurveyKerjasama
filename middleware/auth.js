// middleware/auth.js

// Middleware untuk membatasi akses khusus Admin
exports.isAdmin = (req, res, next) => {
    // Mengecek apakah ada session admin yang aktif
    if (req.session && req.session.adminId) {
        return next();
    }
    // Jika tidak ada, redirect ke form login admin
    res.redirect('/login');
};

// Middleware untuk membatasi akses khusus Mitra
exports.isMitra = (req, res, next) => {
    // Mengecek apakah ada session mitra yang aktif
    if (req.session && req.session.mitraId) {
        return next();
    }
    // Jika tidak ada, redirect ke form login mitra
    res.redirect('/login-mitra');
};
