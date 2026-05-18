// middleware/acl.js

/**
 * Access Control List (ACL) Middleware
 * Digunakan untuk mengecek apakah user memiliki hak akses (role) tertentu
 * untuk dapat mengakses sebuah rute.
 * 
 * @param {string} role - Role yang diizinkan (contoh: 'admin', 'mitra')
 */
exports.checkRole = (role) => {
    return (req, res, next) => {
        // Cek jika role yang diizinkan adalah 'admin'
        if (role === 'admin') {
            if (req.session && req.session.adminId) {
                return next(); // Lanjut ke proses berikutnya
            }
        }
        
        // Cek jika role yang diizinkan adalah 'mitra'
        if (role === 'mitra') {
            if (req.session && req.session.mitraId) {
                return next(); // Lanjut ke proses berikutnya
            }
        }

        // Jika tidak memiliki izin (tidak ada session yang cocok)
        // Maka tampilkan halaman Error 401 (Unauthorized)
        res.status(401).render('errors/401');
    };
};
