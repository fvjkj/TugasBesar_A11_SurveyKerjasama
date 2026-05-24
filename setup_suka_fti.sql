CREATE DATABASE IF NOT EXISTS suka_fti;
USE suka_fti;

-- ==========================================
-- 1. AUTHENTICATION & ACL (Ferdian Rahman)
-- ==========================================
CREATE TABLE IF NOT EXISTS users (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    role VARCHAR(50) DEFAULT 'mitra',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS roles (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS permissions (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS role_has_permissions (
    permission_id BIGINT UNSIGNED NOT NULL,
    role_id BIGINT UNSIGNED NOT NULL,
    PRIMARY KEY (permission_id, role_id),
    FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS model_has_roles (
    role_id BIGINT UNSIGNED NOT NULL,
    model_type VARCHAR(255) NOT NULL,
    model_id BIGINT UNSIGNED NOT NULL,
    PRIMARY KEY (role_id, model_id, model_type),
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    FOREIGN KEY (model_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Insert Default Admin Data
INSERT IGNORE INTO roles (name) VALUES ('admin'), ('mitra');
-- Ganti password dengan hash di sisi backend nanti (contoh ini pakai teks biasa dulu)
INSERT IGNORE INTO users (username, password, email, role) VALUES ('admin', 'admin123', 'admin@sukafti.com', 'admin');
INSERT IGNORE INTO model_has_roles (role_id, model_type, model_id) VALUES (1, 'User', 1);


-- ==========================================
-- 2. PARTNERS / MITRA (Madani Fitri)
-- ==========================================
CREATE TABLE IF NOT EXISTS partners (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type ENUM('university', 'company', 'government', 'ngo', 'other') NOT NULL,
    address TEXT,
    email VARCHAR(255),
    phone VARCHAR(255),
    description TEXT,
    user_id BIGINT UNSIGNED NULL, -- Menghubungkan mitra dengan akun user untuk login
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS partner_contacts (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    partner_id BIGINT UNSIGNED NOT NULL,
    name VARCHAR(255) NOT NULL,
    position VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(255),
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (partner_id) REFERENCES partners(id) ON DELETE CASCADE
);


-- ==========================================
-- 3. SURVEY PINS (Ferdian Rahman)
-- ==========================================
CREATE TABLE IF NOT EXISTS survey_pins (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    partner_id BIGINT UNSIGNED NOT NULL,
    pin_code VARCHAR(50) NOT NULL UNIQUE,
    status ENUM('active', 'used', 'expired') DEFAULT 'active',
    generated_by BIGINT UNSIGNED,
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expired_at TIMESTAMP NULL,
    FOREIGN KEY (partner_id) REFERENCES partners(id) ON DELETE CASCADE,
    FOREIGN KEY (generated_by) REFERENCES users(id) ON DELETE SET NULL
);


-- ==========================================
-- 4. SURVEYS & QUESTIONS (Febiola Ramli)
-- ==========================================
CREATE TABLE IF NOT EXISTS surveys (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status ENUM('draft', 'published', 'closed') DEFAULT 'draft',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS survey_questions (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    survey_id BIGINT UNSIGNED NOT NULL,
    question_text TEXT NOT NULL,
    type ENUM('essay', 'multiple_choice', 'rating') NOT NULL,
    order_number INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (survey_id) REFERENCES surveys(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS survey_question_options (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    survey_question_id BIGINT UNSIGNED NOT NULL,
    option_text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (survey_question_id) REFERENCES survey_questions(id) ON DELETE CASCADE
);


-- ==========================================
-- 5. SURVEY RESPONSES (Adinda Queen)
-- ==========================================
CREATE TABLE IF NOT EXISTS survey_responses (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    survey_id BIGINT UNSIGNED NOT NULL,
    partner_id BIGINT UNSIGNED NOT NULL,
    survey_pin_id BIGINT UNSIGNED NULL,
    status ENUM('in_progress', 'completed') DEFAULT 'in_progress',
    submitted_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (survey_id) REFERENCES surveys(id) ON DELETE CASCADE,
    FOREIGN KEY (partner_id) REFERENCES partners(id) ON DELETE CASCADE,
    FOREIGN KEY (survey_pin_id) REFERENCES survey_pins(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS survey_answers (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    survey_response_id BIGINT UNSIGNED NOT NULL,
    survey_question_id BIGINT UNSIGNED NOT NULL,
    answer_text TEXT NULL, -- Menyimpan jawaban essay
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (survey_response_id) REFERENCES survey_responses(id) ON DELETE CASCADE,
    FOREIGN KEY (survey_question_id) REFERENCES survey_questions(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS survey_answer_options (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    survey_answer_id BIGINT UNSIGNED NOT NULL,
    survey_question_option_id BIGINT UNSIGNED NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (survey_answer_id) REFERENCES survey_answers(id) ON DELETE CASCADE,
    FOREIGN KEY (survey_question_option_id) REFERENCES survey_question_options(id) ON DELETE CASCADE
);
