-- Bikin tabel untuk Admin
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    Identifier VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL
);

-- Masukin 1 akun admin bohongan buat ngetes
INSERT INTO users (Identifier, password) 
VALUES ('admin@fti.unand.ac.id', 'admin123');

-- Bikin tabel untuk Mitra
CREATE TABLE pin_survey (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pin_code VARCHAR(10) NOT NULL,
    is_used INT DEFAULT 0
);

-- Masukin beberapa PIN bohongan buat ngetes
INSERT INTO pin_survey (pin_code, is_used) 
VALUES 
('123456', 0),   -- PIN valid (belum dipakai)
('ABCDEF', 0),   -- PIN valid (belum dipakai)
('SUDAH1', 1);   -- PIN error (karena is_used = 1 / sudah dipakai)