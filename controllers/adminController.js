// controllers/adminController.js
const db = require('../config/database');
const { validationResult } = require('express-validator');

// 1. Generate PIN (Form Handling & Validasi Server-side)
exports.generatePin = (req, res) => {
    // Validasi input dari sisi server
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        // Response jika validasi gagal
        return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { partner_id } = req.body;
    
    // Generate 6 digit random PIN (alphanumeric uppercase)
    const pin_code = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    // Masa aktif default = 30 hari dari sekarang
    const expired_at = new Date();
    expired_at.setDate(expired_at.getDate() + 30);

    const query = 'INSERT INTO survey_pins (partner_id, pin_code, status, generated_by, expired_at) VALUES (?, ?, "active", ?, ?)';
    db.query(query, [partner_id, pin_code, req.session.adminId, expired_at], (err, results) => {
        if (err) {
            console.error('Database Error:', err);
            return res.status(500).json({ success: false, message: 'Gagal membuat PIN. Pastikan input valid atau coba lagi nanti.' });
        }
        res.json({ success: true, message: 'PIN berhasil dibuat!', pin_code: pin_code });
    });
};

// 2. Export Data CSV (Memenuhi kewajiban cetak dokumen)
exports.exportSurveyCsv = (req, res) => {
    const query = `
        SELECT p.name AS nama_perusahaan, sq.question_text, sa.answer_text, sqo.option_text, sr.submitted_at
        FROM survey_responses sr
        JOIN partners p ON sr.partner_id = p.id
        JOIN survey_answers sa ON sa.survey_response_id = sr.id
        JOIN survey_questions sq ON sa.survey_question_id = sq.id
        LEFT JOIN survey_answer_options sao ON sao.survey_answer_id = sa.id
        LEFT JOIN survey_question_options sqo ON sao.survey_question_option_id = sqo.id
        WHERE sr.status = 'completed'
        ORDER BY sr.submitted_at DESC, p.name ASC
    `;

    db.query(query, (err, results) => {
        if (err) return res.status(500).send('Database Error');

        let csv = 'Nama Perusahaan,Pertanyaan,Jawaban Essay,Jawaban Pilihan Ganda,Waktu Submit\n';
        results.forEach(row => {
            // Escape double quotes in CSV
            const answer = row.answer_text ? `"${row.answer_text.replace(/"/g, '""')}"` : '';
            const option = row.option_text ? `"${row.option_text.replace(/"/g, '""')}"` : '';
            const question = `"${row.question_text.replace(/"/g, '""')}"`;
            const company = `"${row.nama_perusahaan.replace(/"/g, '""')}"`;
            csv += `${company},${question},${answer},${option},${row.submitted_at}\n`;
        });

        // Set response headers for download
        res.header('Content-Type', 'text/csv');
        res.attachment('hasil_survey_mitra.csv');
        return res.send(csv);
    });
};

// 3. RESTful API Dashboard Stats (Memenuhi requirement output RestAPI)
exports.getDashboardStatsApi = (req, res) => {
    const stats = {};
    
    // Multi-query bersarang untuk agregasi data (Raw SQL via mysql2)
    db.query('SELECT COUNT(*) AS total_mitra FROM partners', (err, results) => {
        if (err) return res.status(500).json({ success: false, message: 'Database error' });
        stats.total_mitra = results[0].total_mitra;
        
        db.query('SELECT status, COUNT(*) as count FROM survey_pins GROUP BY status', (err2, results2) => {
            if (err2) return res.status(500).json({ success: false, message: 'Database error' });
            
            stats.pin_stats = {
                active: 0,
                used: 0,
                expired: 0
            };
            
            results2.forEach(row => {
                if(stats.pin_stats[row.status] !== undefined) {
                    stats.pin_stats[row.status] = row.count;
                }
            });
            stats.total_pin_aktif = stats.pin_stats.active;
            
            db.query('SELECT COUNT(*) AS total_respons FROM survey_responses WHERE status = "completed"', (err3, results3) => {
                if (err3) return res.status(500).json({ success: false, message: 'Database error' });
                stats.total_respons = results3[0].total_respons;
                
                return res.json({
                    success: true,
                    data: stats
                });
            });
        });
    });
};
