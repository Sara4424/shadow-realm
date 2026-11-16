<?php
require_once __DIR__ . '/../includes/functions.php';
input();
$_SESSION = [];
setcookie(session_name(), '', ['expires' => time() - 3600, 'path' => base_path() . '/', 'httponly' => true, 'samesite' => 'Lax']);
session_destroy();
reply(['message' => 'Logged out.']);
