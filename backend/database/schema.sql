-- =============================================
-- DATABASE: Sistem Survey Kerjasama FTI (SUKAFTI)
-- =============================================

CREATE DATABASE IF NOT EXISTS sukafti;
USE sukafti;

-- -------------------------
-- Tabel: users
-- -------------------------
CREATE TABLE IF NOT EXISTS users (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(100)  NOT NULL,
  email       VARCHAR(150)  NOT NULL UNIQUE,
  password    VARCHAR(255)  NOT NULL,
  role        ENUM('admin', 'mitra') NOT NULL DEFAULT 'mitra',
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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
-- Tabel: survey_pins
-- -------------------------
CREATE TABLE IF NOT EXISTS survey_pins (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  kerjasama_id  INT          NOT NULL,
  pin           VARCHAR(10)  NOT NULL UNIQUE,
  status        ENUM('belum digunakan', 'sudah digunakan') NOT NULL DEFAULT 'belum digunakan',
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_pin_kerjasama
    FOREIGN KEY (kerjasama_id) REFERENCES kerjasama (id)
    ON DELETE CASCADE ON UPDATE CASCADE
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
  id          INT AUTO_INCREMENT PRIMARY KEY,
  pin_id      INT  NOT NULL,
  question_id INT  NOT NULL,
  answer      TEXT NOT NULL,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_answer_pin
    FOREIGN KEY (pin_id) REFERENCES survey_pins (id)
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

INSERT INTO kerjasama (nama_mitra, status) VALUES
  ('PT Semen Padang', 'aktif'),
  ('Bank Nagari Sumbar', 'aktif'),
  ('PT PLN (Persero) Wilayah Sumbar', 'aktif');
