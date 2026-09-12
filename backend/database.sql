CREATE DATABASE IF NOT EXISTS app_mobile CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE app_mobile;

CREATE TABLE IF NOT EXISTS users (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(190) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('admin', 'user') NOT NULL DEFAULT 'user',
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO users (name, email, password_hash, role) VALUES
('Administrator', 'admin@example.com', '$2y$12$Ikv49zjiJMTyWekK6uWGk.EEOlJU2FRauQR0me0U/3ijMzHW/uYqu', 'admin');
-- Initial credentials: admin@example.com / ChangeMe123!
-- Change this password immediately after the first login.
