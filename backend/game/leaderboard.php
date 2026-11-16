<?php
/*
 * Shadow Realm: The Lost Kingdom
 * Project-level AI acknowledgment: OpenAI ChatGPT and Codex supported
 * implementation, refinement and learning. The developer supplied game
 * ideas, requirements and design direction; no exact authorship split is claimed.
 */
require_once __DIR__ . '/../includes/functions.php';
require_user();
$rows = query("SELECT u.username, COALESCE(p.avatar, 'guardian') AS avatar, MAX(h.score) AS score, MAX(h.level) AS level FROM game_history h JOIN users u ON u.id = h.user_id LEFT JOIN player_profiles p ON p.user_id = u.id WHERE u.email_verified = 1 AND h.result = 'completed' GROUP BY u.id, u.username, p.avatar ORDER BY score DESC, level DESC, username ASC LIMIT 20")->fetchAll();
reply(['leaderboard' => $rows]);
