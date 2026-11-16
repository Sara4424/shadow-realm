<?php
require_once __DIR__ . '/../includes/functions.php';
$body = input();
$id = require_user();
$action = $body['action'] ?? 'complete';
$connection = database();
if ($action === 'start') {
    $level = valid_level($body['level'] ?? null);
    $unlocked = query('SELECT highest_unlocked_level FROM game_progress WHERE user_id = ?', [$id])->fetchColumn();
    if ($level > $unlocked) {
        reply(['error' => 'Complete the previous level first.'], 403);
    }
    $_SESSION['attempt'] = ['id' => bin2hex(random_bytes(16)), 'level' => $level, 'started' => time()];
    unset($_SESSION['rune'], $_SESSION['completion']);
    query('UPDATE game_progress SET current_level = ? WHERE user_id = ?', [$level, $id]);
    reply(['message' => 'Level started.']);
}
$attempt = $_SESSION['attempt'] ?? null;
if (!$attempt || time() - $attempt['started'] > 7200) {
    reply(['error' => 'Start a fresh level first.'], 400);
}
if (!in_array($action, ['complete', 'failed'], true)) {
    reply(['error' => 'Invalid action.'], 400);
}
if ($action === 'complete' && (($_SESSION['completion'] ?? '') !== $attempt['id'])) {
    reply(['error' => 'Solve this attempt?s Rune Gate first.'], 403);
}
$level = $attempt['level'];
// Score is awarded by the server, never accepted from the browser.
$score = $action === 'complete' ? 300 : 0;
$connection->beginTransaction();
query('INSERT INTO game_history(user_id, attempt_id, level, score, result, time_played) VALUES (?, ?, ?, ?, ?, ?)', [$id, $attempt['id'], $level, $score, $action === 'complete' ? 'completed' : 'failed', time() - $attempt['started']]);
if ($action === 'complete') {
    query("UPDATE game_progress SET highest_unlocked_level = GREATEST(highest_unlocked_level, ?), highest_completed_level = GREATEST(highest_completed_level, ?), status = ? WHERE user_id = ?", [min(4, $level + 1), $level, $level === 4 ? 'completed' : 'playing', $id]);
}
$connection->commit();
unset($_SESSION['attempt'], $_SESSION['rune'], $_SESSION['completion']);
reply(['message' => 'Result saved.']);
