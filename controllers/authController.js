const db = require('../config/database');

exports.postLoginAdmin = (req, res) => {
    const { Identifier, password } = req.body;
    const query = 'SELECT * FROM users WHERE Identifier = ? AND password = ?';

    db.query(query, [Identifier, password], (err, results) => {
        if (err) throw err;

        if (results.length > 0) {
            res.redirect('/');
        } else {
            res.render('login', { 
                activeTab: 'admin', 
                error: 'Identifier atau password salah.' 
            });
        }
    });
};

exports.postLoginMitra = (req, res) => {
    const { pin } = req.body;
    const query = 'SELECT * FROM pin_survey WHERE pin_code = ?';

    db.query(query, [pin], (err, results) => {
        if (err) throw err;

        if (results.length > 0) {
            const pinData = results[0];

            if (pinData.is_used === 1) {
                return res.render('login', { 
                    activeTab: 'mitra', 
                    error: 'Kode PIN sudah digunakan.' 
                });
            }

            res.redirect('/survey-kerjasama');
        } else {
            res.render('login', { 
                activeTab: 'mitra', 
                error: 'Kode PIN tidak valid.' 
            });
        }
    });
};
