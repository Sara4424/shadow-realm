<?php
require_once __DIR__ . '/../../database/connection.php';
ini_set('session.use_strict_mode', '1');
session_name('shadow_realm');
session_set_cookie_params(['httponly' => true, 'secure' => !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off', 'samesite' => 'Lax', 'path' => base_path() . '/']);
session_start();
// Expire inactive identity and attempt state after twelve hours.
if (isset($_SESSION['last_active']) && time() - $_SESSION['last_active'] > 43200) {
    $_SESSION = [];
    session_regenerate_id(true);
}
$_SESSION['last_active'] = time();
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');
set_exception_handler(function (Throwable $error) {
    if (isset($GLOBALS['connection']) && $GLOBALS['connection']->inTransaction()) {
        $GLOBALS['connection']->rollBack();
    }
    error_log('Shadow Realm request failed: ' . get_class($error));
    reply(['error' => 'Request failed. Check MySQL and local configuration.'], 500);
});
function reply(array $data, int $status = 200): never
{
    http_response_code($status);
    echo json_encode($data);
    exit;
}
function query(string $sql, array $values = []): PDOStatement
{
    $statement = database()->prepare($sql);
    $statement->execute($values);
    return $statement;
}
function input(): array
{
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        reply(['error' => 'POST required.'], 405);
    }
    // A random session token protects every state-changing browser request.
    if (!hash_equals($_SESSION['csrf'] ?? '', $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '') || empty($_SESSION['csrf'])) {
        reply(['error' => 'Refresh the page before submitting.'], 403);
    }
    if ((int)($_SERVER['CONTENT_LENGTH'] ?? 0) > 20000) {
        reply(['error' => 'Request too large.'], 413);
    }
    $body = json_decode(file_get_contents('php://input'), true);
    if (!is_array($body)) {
        reply(['error' => 'Invalid JSON.'], 400);
    }
    return $body;
}
function require_user(): int
{
    $id = (int)($_SESSION['user_id'] ?? 0);
    $user = query('SELECT email_verified FROM users WHERE id = ?', [$id])->fetch();
    if (!$user || !$user['email_verified']) {
        reply(['error' => 'Please log in with a verified account.'], 401);
    }
    return $id;
}
function limit_requests(string $action, int $maximum = 10, int $seconds = 600): void
{
    // Persist the IP bucket so clearing cookies does not reset login limits.
    $bucket = hash('sha256', $action . ($_SERVER['REMOTE_ADDR'] ?? 'local'));
    query('DELETE FROM request_limits WHERE reset_at < ?', [time()]);
    query('INSERT INTO request_limits(bucket, attempts, reset_at) VALUES (?, 1, ?) ON DUPLICATE KEY UPDATE attempts = attempts + 1', [$bucket, time() + $seconds]);
    $count = query('SELECT attempts FROM request_limits WHERE bucket = ?', [$bucket])->fetchColumn();
    if ($count > $maximum) {
        reply(['error' => 'Too many requests. Try again later.'], 429);
    }
}
function valid_level($level): int
{
    if (!is_int($level) || $level < 1 || $level > 4) {
        reply(['error' => 'Invalid level.'], 400);
    }
    return $level;
}
