# Shadow Realm: The Lost Kingdom

A four-level fantasy platformer for CIS045-3 Distributed Service Architectures. The original Canvas gameplay and procedural artwork use HTML5, CSS and vanilla JavaScript. PHP handles identity, email, game results and the University Fish Game API; MySQL stores player data.

## Run with XAMPP on Windows

1. Keep this folder at `C:\xampp\htdocs\shadow-realm`.
2. Start **Apache** and **MySQL** in the XAMPP Control Panel. PHP 8.1+ needs PDO MySQL, sessions and OpenSSL. cURL is preferred for HTTPS; PHP HTTPS streams are supported when Apache cannot load it. TLS certificate verification stays enabled.
3. Open `http://localhost/phpmyadmin` and import `database/schema.sql`. It creates `shadow_realm_db` and adds missing progress columns without dropping records. Re-import is supported. Existing unrelated legacy tables are preserved. The schema requires permission to create a temporary migration procedure.
4. Copy `.env.example` to `.env` only if `.env` does not already exist. Set DB_HOST, DB_PORT, DB_NAME, DB_USER and DB_PASSWORD. XAMPP commonly uses local root with a blank password; use a dedicated database user for deployment. Keep APP_PATH=/shadow-realm and APP_BASE_URL=http://localhost/shadow-realm unless your location changes.
5. Open **http://localhost/shadow-realm/**. No npm command or Node server is needed.

## Mailpit and identity

Download the Windows Mailpit binary from https://github.com/axllent/mailpit/releases and extract it outside the project. Run `.\mailpit.exe` in PowerShell. Configure SMTP_HOST=127.0.0.1, SMTP_PORT=1025, SMTP_FROM=no-reply@example.com and blank SMTP_USER/SMTP_PASS.

Register with matching passwords, open **http://localhost:8025**, enter the six-digit OTP in the game, then log in using your email or username. Mailpit captures development messages locally; it does not deliver to real inboxes. Codes expire after five minutes, allow five attempts and can be used once. Resend is available after one minute. If SMTP fails, the unverified account remains available for resend. This small SMTP implementation supports local Mailpit only; production SMTP requires a maintained TLS/authentication mail library.

Only verified accounts can save results, select a character preference, view personal history and enter the leaderboard. Visitors now see Login first. Only a verified PHP session opens Dashboard; Start / Continue opens the game. The original guardian artwork remains in game for all character preferences.

## Play

Move with **A/D or left/right arrows**. Jump with **W, Up or Space**. Collect three crystals, avoid traps and reach the purple portal. Solve the Fish API Rune Gate to complete a registered attempt. Use Retry if a puzzle is unavailable. Pause, Resume and Restart buttons control the current attempt. Defeat ends the attempt; Restart begins another. Four scenery themes, three health points and 100 points per crystal are preserved.

The server binds a puzzle to the session attempt and unlocked level, checks answers privately, and awards a fixed 300 points for a solved completion. History uses a unique attempt ID to prevent repeat scoring. It records failed attempts with zero points. Time in saved history is server wall-clock duration (including pauses); the HUD timer measures active gameplay. Movement remains browser-controlled, so this is not a fully authoritative anti-cheat system.

## Four coursework themes

- **Low coupling/high cohesion:** `game/controls.js` installs input listeners, `game/player.js` creates player state, `game/renderer.js` draws, `api/api.js` handles HTTP, and PHP files separate auth, persistence and external requests.
- **Event-driven programming:** `bindAuthentication`, keyboard handlers, animation frames, pause/resume/restart buttons, `gameupdate`, `playerdamage`, `gameover` and `levelcomplete` events.
- **Interoperability:** `backend/api/fish-api.php` requests the real HTTPS API, validates JSON and relays only the puzzle URL. `fish` and `chest` answers remain private. Network errors return a retryable error without damaging the player. API documentation: https://marcconrad.com/uob/fish/doc.php .
- **Virtual identity:** `password_hash`/`password_verify`, regenerated PHP sessions, CSRF tokens, IP request limits, hashed expiring OTP codes and prepared PDO queries keep identity on the server.

## Checks and troubleshooting

PHP syntax and JavaScript syntax/import checks passed. Apache served the frontend and PHP session/leaderboard routes; protected requests and missing CSRF tokens were rejected. The real PHP Fish route returned a puzzle without answers. The additive SQL import succeeded on local XAMPP MariaDB. No sample users or game scores were inserted. Successful registration/login, actual Mailpit delivery, profile updates and completed history need a real-account manual check. No browser gameplay/layout check was available. The assignment PDF was unavailable; only the supplied four themes were used.

If MySQL fails, check XAMPP services and .env credentials. If images fail, use Load Rune / Retry and check internet access. If cURL cannot load in Apache, check PHP extension dependencies in XAMPP; the app uses a verified HTTPS stream fallback. If TLS validation fails, configure a trusted CA bundle, never disable verification. If a session expires or a CSRF message appears, reload the page. Match APP_BASE_URL to the actual Apache URL so email links work. Do not open HTML with file:// or VS Code Live Server.

## Acknowledgments and limits

This session used OpenAI Codex to migrate and reorganize existing code and draft this README. Earlier authorship is unknown. Acknowledge Marc Conrad's Fish Game API and review its educational/non-commercial terms. Explain the work in your own voice and provide your own authentic coursework video and tutor evidence. No assignment evidence was fabricated.

Do not commit .env, runtime data or dependencies. No Git repository was present during inspection. Apache access rules deny local secrets and database files; other servers require equivalent rules. This remains local coursework software: deploy with HTTPS, stronger operational controls and maintained production mail delivery.
