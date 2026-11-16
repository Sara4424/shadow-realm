<?php
require_once __DIR__ . '/../includes/functions.php';
$id = require_user();
reply(['history' => query('SELECT level, score, result, time_played, completed_at FROM game_history WHERE user_id = ? ORDER BY id DESC LIMIT 50', [$id])->fetchAll()]);
