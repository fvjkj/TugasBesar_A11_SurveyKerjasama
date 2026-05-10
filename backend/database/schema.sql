-- =============================================
-- DATABASE: Sistem Survey Kerjasama FTI (SUKAFTI)
-- =============================================

CREATE DATABASE IF NOT EXISTS suka_fti;
USE suka_fti;

-- -------------------------
-- Tabel: users (Admin)
-- -------------------------
CREATE TABLE IF NOT EXISTS users (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  nama        VARCHAR(100)  NOT NULL,
  Identifier  VARCHAR(150)  NOT NULL UNIQUE,
  password    VARCHAR(255)  NOT NULL,
  role        ENUM('admin') NOT NULL DEFAULT 'admin',
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -------------------------
-- Tabel: perusahaan_mitra
-- (Perusahaan yang didaftarkan admin; 1 perusahaan = 1 PIN bersama)
-- -------------------------
CREATE TABLE IF NOT EXISTS perusahaan_mitra (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  nama_perusahaan  VARCHAR(200) NOT NULL,
  pin_perusahaan   VARCHAR(50)  NOT NULL,
  status           ENUM('aktif', 'nonaktif') NOT NULL DEFAULT 'aktif',
  created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -------------------------
-- Tabel: log_kunjungan_mitra
-- (Mencatat setiap karyawan yang login ke sistem)
-- -------------------------
CREATE TABLE IF NOT EXISTS log_kunjungan_mitra (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  nama_karyawan   VARCHAR(150) NOT NULL,
  jabatan         VARCHAR(150) NOT NULL,
  perusahaan_id   INT NOT NULL,
  waktu_login     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_log_perusahaan
    FOREIGN KEY (perusahaan_id) REFERENCES perusahaan_mitra (id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -------------------------
-- Tabel: kerjasama
-- -------------------------
CREATE TABLE IF NOT EXISTS kerjasama (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  nama_mitra  VARCHAR(200)  NOT NULL,
  status      ENUM('aktif', 'tidak aktif') NOT NULL DEFAULT 'aktif',
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -------------------------
-- Tabel: survey_questions
-- -------------------------
CREATE TABLE IF NOT EXISTS survey_questions (
  id        INT AUTO_INCREMENT PRIMARY KEY,
  question  TEXT NOT NULL,
  type      ENUM('text', 'rating', 'multiple_choice') NOT NULL DEFAULT 'text',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -------------------------
-- Tabel: survey_answers
-- -------------------------
CREATE TABLE IF NOT EXISTS survey_answers (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  perusahaan_id   INT  NOT NULL,
  question_id     INT  NOT NULL,
  answer          TEXT NOT NULL,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_answer_perusahaan
    FOREIGN KEY (perusahaan_id) REFERENCES perusahaan_mitra (id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_answer_question
    FOREIGN KEY (question_id) REFERENCES survey_questions (id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =============================================
-- SEED DATA: Contoh data awal
-- =============================================

INSERT INTO survey_questions (question, type) VALUES
  ('Bagaimana penilaian Anda terhadap kualitas lulusan FTI?', 'rating'),
  ('Apa bidang kerja yang paling banyak diisi lulusan FTI di perusahaan Anda?', 'text'),
  ('Seberapa puas Anda dengan kerjasama yang terjalin dengan FTI?', 'rating'),
  ('Saran dan masukan untuk peningkatan kualitas kerjasama?', 'text');

-- Contoh perusahaan mitra yang terdaftar (PIN: format bebas, sebaiknya diganti)
INSERT IGNORE INTO perusahaan_mitra (nama_perusahaan, pin_perusahaan, status) VALUES
  ('PT Semen Padang',               'SMPDG2025', 'aktif'),
  ('Bank Nagari Sumbar',            'BNGRI2025', 'aktif'),
  ('PT PLN (Persero) Wilayah Sumbar', 'PLN2025X', 'aktif');

-- Contoh admin
INSERT IGNORE INTO users (nama, Identifier, password, role) VALUES
  ('Admin SUKAFTI', 'admin@fti.unand.ac.id', 'admin123', 'admin');
