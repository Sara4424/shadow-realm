<?php
require_once __DIR__ . '/../includes/functions.php';
$body = input();
limit_requests('verify-otp', 30);
$userId = (int)($_SESSION['pending_user_id'] ?? 0);
$otp = $body['otp'] ?? '';
if (!$userId) {
    reply(['error' => 'Request a verification code first.'], 400);
}
if (!is_string($otp) || !preg_match('/^[0-9]{6}$/', $otp)) {
    reply(['error' => 'Enter exactly six digits.'], 400);
}
$connection = database();
$connection->beginTransaction();
$verification = query('SELECT * FROM email_verifications WHERE user_id = ? ORDER BY id DESC LIMIT 1 FOR UPDATE', [$userId])->fetch();
if (!$verification || $verification['used_at'] !== null || !$verification['otp_hash']) {
    $connection->rollBack();
    reply(['error' => 'Request a new verification code.'], 400);
}
if (strtotime($verification['expires_at'] . ' UTC') <= time()) {
    $connection->rollBack();
    reply(['error' => 'Your verification code has expired. Please request a new code.'], 400);
}
if ($verification['attempts'] >= 5) {
    $connection->rollBack();
    reply(['error' => 'Too many incorrect codes. Please request a new code.'], 429);
}
if (!password_verify($otp, $verification['otp_hash'])) {
    query('UPDATE email_verifications SET attempts = attempts + 1 WHERE id = ?', [$verification['id']]);
    $connection->commit();
    reply(['error' => 'Invalid verification code. Please try again.'], 400);
}
query('UPDATE users SET email_verified = 1 WHERE id = ?', [$userId]);
query('UPDATE email_verifications SET used_at = UTC_TIMESTAMP() WHERE user_id = ? AND used_at IS NULL', [$userId]);
$connection->commit();
unset($_SESSION['pending_user_id']);
reply(['message' => 'Email verified successfully. Please log in.']);
