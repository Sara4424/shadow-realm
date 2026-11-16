<?php
/*
 * Shadow Realm: The Lost Kingdom
 * Project-level AI acknowledgment: OpenAI ChatGPT and Codex supported
 * implementation, refinement and learning. The developer supplied game
 * ideas, requirements and design direction; no exact authorship split is claimed.
 */
require_once __DIR__ . '/../includes/functions.php';
require_user();
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $body = input();
    $rune = $_SESSION['rune'] ?? null;
    if (!$rune || $rune['expires'] < time()) {
        reply(['error' => 'Load a fresh Rune Gate.'], 400);
    }
    if (!is_int($body['fish'] ?? null) || !is_int($body['chest'] ?? null)) {
        reply(['error' => 'Enter whole numbers.'], 400);
    }
    $correct = $rune['fish'] === $body['fish'] && $rune['chest'] === $body['chest'];
    $_SESSION['rune']['tries']++;
    if ($correct) {
        $_SESSION['completion'] = $rune['attempt'];
        unset($_SESSION['rune']);
    } elseif ($_SESSION['rune']['tries'] >= 10) {
        unset($_SESSION['rune']);
    }
    reply(['correct' => $correct]);
}
unset($_SESSION['rune'], $_SESSION['completion']);
if (isset($_SESSION['user_id']) && empty($_SESSION['attempt'])) {
    reply(['error' => 'Start a level first.'], 400);
}
// HTTP transports the request; JSON is the shared format between independent systems.
$raw = false;
$status = 0;
if (function_exists('curl_init')) {
    $curl = curl_init('https://marcconrad.com/uob/fish/api.php?out=json&base64=no');
    curl_setopt_array($curl, [CURLOPT_RETURNTRANSFER => true, CURLOPT_TIMEOUT => 9, CURLOPT_CONNECTTIMEOUT => 5]);
    $raw = curl_exec($curl);
    $status = curl_getinfo($curl, CURLINFO_RESPONSE_CODE);
    curl_close($curl);
} else {
    // Some XAMPP Apache installations cannot load cURL; HTTPS streams still verify TLS.
    $context = stream_context_create(['http' => ['timeout' => 9, 'follow_location' => 0, 'ignore_errors' => true]]);
    $raw = @file_get_contents('https://marcconrad.com/uob/fish/api.php?out=json&base64=no', false, $context, 0, 100001);
    $headers = function_exists('http_get_last_response_headers') ? http_get_last_response_headers() : ($http_response_header ?? []);
    if (preg_match('/\s(\d{3})\s/', $headers[0] ?? '', $match)) $status = (int)$match[1];
}
$puzzle = is_string($raw) && strlen($raw) < 100000 ? json_decode($raw, true) : null;
$url = is_array($puzzle) ? ($puzzle['question'] ?? '') : '';
$parts = is_string($url) ? parse_url($url) : false;
if ($status !== 200 || !$parts || ($parts['scheme'] ?? '') !== 'https' || !in_array(strtolower($parts['host'] ?? ''), ['marcconrad.com', 'www.marcconrad.com', 'sanfoh.com', 'www.sanfoh.com'], true) || !is_int($puzzle['fish'] ?? null) || !is_int($puzzle['chest'] ?? null)) {
    reply(['error' => 'Rune Gate unavailable. Retry; no life was lost.'], 502);
}
$_SESSION['rune'] = ['fish' => $puzzle['fish'], 'chest' => $puzzle['chest'], 'expires' => time() + 300, 'tries' => 0, 'attempt' => $_SESSION['attempt']['id'] ?? 'guest'];
reply(['question' => $url]);
