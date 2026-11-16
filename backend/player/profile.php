<?php
require_once __DIR__ . '/../includes/functions.php';
$id = require_user();
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $body = input();
    $avatar = $body['avatar'] ?? '';
    if (!in_array($avatar, ['guardian', 'ranger', 'mage'], true)) {
        reply(['error' => 'Choose a listed character.'], 400);
    }
    query('UPDATE player_profiles SET avatar = ? WHERE user_id = ?', [$avatar, $id]);
}
$user = query('SELECT u.id, u.username, u.email, u.email_verified AS verified, u.created_at, p.avatar FROM users u JOIN player_profiles p ON p.user_id = u.id WHERE u.id = ?', [$id])->fetch();
$progress = query('SELECT current_level, highest_unlocked_level AS unlocked_level, highest_completed_level, status FROM game_progress WHERE user_id = ?', [$id])->fetch();
$stats = query("SELECT COALESCE(MAX(score), 0) AS best_score, COUNT(*) AS games_played, COALESCE(SUM(result = 'completed'), 0) * 100 AS total_xp FROM game_history WHERE user_id = ?", [$id])->fetch();
reply(['user' => $user, 'progress' => array_merge($progress, $stats)]);
