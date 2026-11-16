<?php
require_once __DIR__ . '/../includes/functions.php';
require_once __DIR__ . '/../mail/mail.php';
$body = input();
limit_requests('resend', 5);
if (isset($_SESSION['pending_user_id']) && empty($body['email'])) {
    $pending = query('SELECT email FROM users WHERE id = ? AND email_verified = 0', [$_SESSION['pending_user_id']])->fetchColumn();
    $body['email'] = $pending ?: '';
}
$email = is_string($body['email'] ?? null) ? strtolower(trim($body['email'])) : '';
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    reply(['error' => 'Enter a valid email address.'], 400);
}
$user = query('SELECT id FROM users WHERE email = ? AND email_verified = 0', [$email])->fetch();
if ($user) {
    create_verification((int)$user['id'], $email);
}
reply(['message' => 'If this account needs verification, a link has been sent.']);
