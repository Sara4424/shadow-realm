<?php
/*
 * Shadow Realm: The Lost Kingdom
 * Project-level AI acknowledgment: OpenAI ChatGPT and Codex supported
 * implementation, refinement and learning. The developer supplied game
 * ideas, requirements and design direction; no exact authorship split is claimed.
 */
require_once __DIR__ . '/../includes/functions.php';
$body = input();
limit_requests('login', 15);
$identity = is_string($body['email'] ?? null) ? trim($body['email']) : '';
$user = query('SELECT * FROM users WHERE email = ? OR username = ?', [$identity, $identity])->fetch();
$password = $body['password'] ?? '';
if (!$user || !is_string($password) || strlen($password) > 72 || !password_verify($password, $user['password_hash'])) {
    reply(['error' => 'Incorrect email/username or password.'], 401);
}
if (!$user['email_verified']) {
    $_SESSION['pending_user_id'] = (int)$user['id'];
    reply(['error' => 'Verify your email before logging in. Request an OTP to continue.', 'pending' => true], 403);
}
session_regenerate_id(true);
unset($_SESSION['pending_user_id'], $_SESSION['attempt'], $_SESSION['rune'], $_SESSION['completion']);
$_SESSION['user_id'] = (int)$user['id'];
// Existing local accounts receive missing profile/progress rows without changing their data.
query('INSERT IGNORE INTO player_profiles(user_id) VALUES (?)', [$user['id']]);
query('INSERT IGNORE INTO game_progress(user_id) VALUES (?)', [$user['id']]);
reply(['message' => 'Logged in.']);
