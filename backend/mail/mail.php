<?php
// Local Mailpit SMTP delivery; no Node or Composer dependency.
function send_verification(string $email, string $otp): void
{
    $host = setting('SMTP_HOST', '127.0.0.1');
    $port = (int)setting('SMTP_PORT', '1025');
    $from = setting('SMTP_FROM', 'no-reply@example.com');
    if (!filter_var($from, FILTER_VALIDATE_EMAIL)) {
        throw new RuntimeException('Invalid SMTP sender');
    }
    $message = "From: Shadow Realm <$from>\r\nTo: <$email>\r\nSubject: Shadow Realm - Email Verification Code\r\nMIME-Version: 1.0\r\nContent-Type: text/plain; charset=UTF-8\r\n\r\nWelcome to Shadow Realm!\r\n\r\nYour verification code is: $otp\r\n\r\nThis code expires in 5 minutes.\r\n\r\nIf you did not create this account, ignore this email.\r\n";
    // This small SMTP client deliberately supports local Mailpit only.
    // Remote production SMTP needs a maintained library with TLS and authentication.
    if (!in_array($host, ['127.0.0.1', 'localhost', '::1'], true) || setting('SMTP_USER') !== '') {
        reply(['error' => 'This setup supports local Mailpit SMTP only.'], 502);
    }
    $socket = @stream_socket_client("tcp://$host:$port", $errorNumber, $errorMessage, 5);
    if (!$socket) {
        reply(['error' => 'Start Mailpit on port 1025, then use Resend OTP.', 'pending' => true], 502);
    }
    stream_set_timeout($socket, 5);
    try {
        smtp_expect($socket, 220);
        smtp_command($socket, 'EHLO localhost', 250);
        smtp_command($socket, "MAIL FROM:<$from>", 250);
        smtp_command($socket, "RCPT TO:<$email>", 250);
        smtp_command($socket, 'DATA', 354);
        fwrite($socket, $message . "\r\n.\r\n");
        smtp_expect($socket, 250);
        fwrite($socket, "QUIT\r\n");
    } catch (RuntimeException $error) {
        reply(['error' => 'Mailpit did not accept the message. Check local SMTP and resend.', 'pending' => true], 502);
    } finally {
        fclose($socket);
    }
}
function create_verification(int $userId, string $email): void
{
    // Pending identity comes from a database lookup, never a browser-supplied ID.
    $_SESSION['pending_user_id'] = $userId;
    $connection = database();
    $connection->beginTransaction();
    query('SELECT id FROM users WHERE id = ? FOR UPDATE', [$userId]);
    $recent = query('SELECT created_at FROM email_verifications WHERE user_id = ? ORDER BY id DESC LIMIT 1', [$userId])->fetchColumn();
    if ($recent && strtotime($recent . ' UTC') > time() - 60) {
        $connection->rollBack();
        reply(['error' => 'Wait one minute before resending.', 'pending' => true], 429);
    }
    $otp = (string)random_int(100000, 999999);
    query('UPDATE email_verifications SET used_at = UTC_TIMESTAMP() WHERE user_id = ? AND used_at IS NULL', [$userId]);
    // Legacy token_hash is retained so existing data and old schema constraints are preserved.
    query('INSERT INTO email_verifications(user_id, token_hash, otp_hash, expires_at) VALUES (?, ?, ?, DATE_ADD(UTC_TIMESTAMP(), INTERVAL 5 MINUTE))', [$userId, hash('sha256', random_bytes(32)), password_hash($otp, PASSWORD_DEFAULT)]);
    $connection->commit();
    send_verification($email, $otp);
}

function smtp_expect($socket, int $expected): void
{
    do {
        $line = fgets($socket, 1024);
        if ($line === false) throw new RuntimeException('SMTP timeout');
    } while (isset($line[3]) && $line[3] === '-');
    if ((int)substr($line, 0, 3) !== $expected) throw new RuntimeException('SMTP rejected command');
}
function smtp_command($socket, string $command, int $expected): void
{
    fwrite($socket, $command . "\r\n");
    smtp_expect($socket, $expected);
}
