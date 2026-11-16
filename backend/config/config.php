<?php
// Read local settings without exposing credentials through API responses.
$settings = parse_ini_file(dirname(__DIR__, 2) . '/.env', false, INI_SCANNER_RAW) ?: [];
function setting(string $name, string $default = ''): string
{
    global $settings;
    return getenv($name) !== false ? getenv($name) : ($settings[$name] ?? $default);
}
function base_path(): string
{
    return rtrim(setting('APP_PATH', '/shadow-realm'), '/');
}
