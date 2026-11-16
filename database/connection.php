<?php
/*
 * Shadow Realm: The Lost Kingdom
 * Project-level AI acknowledgment: OpenAI ChatGPT and Codex supported
 * implementation, refinement and learning. The developer supplied game
 * ideas, requirements and design direction; no exact authorship split is claimed.
 */
require_once __DIR__ . '/../backend/config/config.php';
function database(): PDO
{
    static $connection;
    if (!$connection) {
        $connection = new PDO(
            'mysql:host=' . setting('DB_HOST', '127.0.0.1') . ';port=' . setting('DB_PORT', '3306') . ';dbname=' . setting('DB_NAME', 'shadow_realm_db') . ';charset=utf8mb4',
            setting('DB_USER', 'root'), setting('DB_PASSWORD'),
            [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, PDO::ATTR_EMULATE_PREPARES => false, PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC]
        );
        $connection->exec("SET time_zone = '+00:00'");
    }
    return $connection;
}
