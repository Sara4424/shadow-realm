<?php
/*
 * Shadow Realm: The Lost Kingdom
 * Project-level AI acknowledgment: OpenAI ChatGPT and Codex supported
 * implementation, refinement and learning. The developer supplied game
 * ideas, requirements and design direction; no exact authorship split is claimed.
 */
require_once __DIR__ . '/../includes/functions.php';
input();
$_SESSION = [];
setcookie(session_name(), '', ['expires' => time() - 3600, 'path' => base_path() . '/', 'httponly' => true, 'samesite' => 'Lax']);
session_destroy();
reply(['message' => 'Logged out.']);
