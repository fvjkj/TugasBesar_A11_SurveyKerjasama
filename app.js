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

// Rute Halaman Utama (Testing)
app.get('/', (req, res) => {
    res.render('index'); 
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server Bunny jalan di http://localhost:${PORT}`);
});