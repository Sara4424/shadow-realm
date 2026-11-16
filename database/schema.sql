CREATE DATABASE IF NOT EXISTS shadow_realm_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE shadow_realm_db;
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    email_verified TINYINT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE IF NOT EXISTS email_verifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    token_hash CHAR(64) NOT NULL UNIQUE,
    otp_hash VARCHAR(255) NULL,
    attempts INT NOT NULL DEFAULT 0,
    expires_at DATETIME NOT NULL,
    used_at DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    INDEX (user_id, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE IF NOT EXISTS player_profiles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    avatar VARCHAR(30) NOT NULL DEFAULT 'guardian',
    preferences TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE IF NOT EXISTS game_progress (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    current_level INT NOT NULL DEFAULT 1,
    highest_unlocked_level INT NOT NULL DEFAULT 1,
    highest_completed_level INT NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'playing',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
-- Add missing columns to the existing schema without replacing tables or records.
DELIMITER //
CREATE PROCEDURE shadow_realm_add_columns()
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'email_verifications' AND column_name = 'otp_hash') THEN
        ALTER TABLE email_verifications ADD COLUMN otp_hash VARCHAR(255) NULL;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'email_verifications' AND column_name = 'attempts') THEN
        ALTER TABLE email_verifications ADD COLUMN attempts INT NOT NULL DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'game_progress' AND column_name = 'highest_completed_level') THEN
        ALTER TABLE game_progress ADD COLUMN highest_completed_level INT NOT NULL DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'game_progress' AND column_name = 'status') THEN
        ALTER TABLE game_progress ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT 'playing';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'game_progress' AND column_name = 'updated_at') THEN
        ALTER TABLE game_progress ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;
    END IF;
END//
DELIMITER ;
CALL shadow_realm_add_columns();
DROP PROCEDURE shadow_realm_add_columns;
CREATE TABLE IF NOT EXISTS game_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    attempt_id CHAR(32) NOT NULL UNIQUE,
    level INT NOT NULL,
    score INT NOT NULL DEFAULT 0,
    result VARCHAR(20) NOT NULL,
    time_played INT NOT NULL DEFAULT 0,
    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    INDEX (user_id, completed_at),
    INDEX (result, score)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE IF NOT EXISTS request_limits (
    bucket CHAR(64) PRIMARY KEY,
    attempts INT NOT NULL DEFAULT 1,
    reset_at INT NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
-- Leaderboard is queried from verified users and completed history; no duplicate score table.
