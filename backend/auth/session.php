<?php
require_once __DIR__ . '/../includes/functions.php';
$_SESSION['csrf'] ??= bin2hex(random_bytes(32));
$verified = false;
if (isset($_SESSION['user_id'])) {
    $verified = (bool)query('SELECT email_verified FROM users WHERE id = ?', [$_SESSION['user_id']])->fetchColumn();
    if (!$verified) unset($_SESSION['user_id']);
}
reply(['csrf' => $_SESSION['csrf'], 'authenticated' => $verified, 'pending' => isset($_SESSION['pending_user_id'])]);
