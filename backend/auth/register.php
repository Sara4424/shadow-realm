<?php
require_once __DIR__ . '/../includes/functions.php';
require_once __DIR__ . '/../mail/mail.php';
$body = input();
limit_requests('register', 5);
$username = is_string($body['username'] ?? null) ? trim($body['username']) : '';
$email = is_string($body['email'] ?? null) ? strtolower(trim($body['email'])) : '';
$password = $body['password'] ?? '';
if (!preg_match('/^[A-Za-z0-9_]{3,20}$/', $username) || !filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($email) > 255 || !is_string($password) || strlen($password) < 8 || strlen($password) > 72 || !preg_match('/[a-z]/i', $password) || !preg_match('/[0-9]/', $password) || $password !== ($body['confirmPassword'] ?? '')) {
    reply(['error' => 'Use a valid username/email and matching passwords of 8-72 bytes including a letter and a number.'], 400);
}
if (query('SELECT id FROM users WHERE username = ? OR email = ?', [$username, $email])->fetch()) {
    reply(['error' => 'Username or email is unavailable.'], 409);
}
$connection = database();
$connection->beginTransaction();
query('INSERT INTO users(username, email, password_hash) VALUES (?, ?, ?)', [$username, $email, password_hash($password, PASSWORD_DEFAULT)]);
$id = (int)$connection->lastInsertId();
query('INSERT INTO player_profiles(user_id) VALUES (?)', [$id]);
query('INSERT INTO game_progress(user_id) VALUES (?)', [$id]);
$connection->commit();
session_regenerate_id(true);
create_verification($id, $email);
reply(['message' => 'Registered. Enter the six-digit code from Mailpit.'], 201);
