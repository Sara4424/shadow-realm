# Shadow Realm: The Lost Kingdom

Shadow Realm: The Lost Kingdom is a browser-based progressive fantasy adventure game developed using HTML, CSS, JavaScript, PHP and MySQL. Players explore four environments, collect crystals, avoid hazards and solve challenges to unlock levels. The application includes player accounts, email OTP verification, saved progress, game history and a leaderboard.

## Project Overview

Shadow Realm is an individual University of Bedfordshire CIS045-3 Distributed Service Architectures coursework project. It combines a Canvas platformer with a PHP application to demonstrate software design, events, communication between services and virtual identity.

Each realm requires three crystals and a completed Rune Gate puzzle from the University Fish Game API. PHP checks puzzle answers, records results in MySQL and unlocks the next realm. Player profiles, account verification and personal history are kept on the server. The interface separates authentication, dashboard, profile, history, champions and gameplay screens.

## Main Features

- Registration with username, email, password and password confirmation.
- Login with email or username; logout and PHP session restoration.
- Six-digit email OTP verification: five-minute expiry, five attempts per code and a one-minute resend cooldown.
- Dashboard with real player statistics, recent activity and four level previews.
- Player profile with Guardian, Ranger and Mage character preferences, Canvas portraits and matching cloak colors.
- Four progressive realms with movement, jumping, hazards and three health points.
- Crystal collection, visual effects and a short cooldown after taking damage.
- Pause, resume, restart, Game Over and Level Complete overlays.
- Personal history of saved completed/failed attempts and a verified-score leaderboard.
- A real Fish Game API challenge, with answers checked privately by PHP.

These features are implemented in the source. Full real-account acceptance testing remains a manual check; implementation is not a claim that every flow has passed end to end.

## How to Play

1. Start Apache, MySQL and Mailpit, then open **http://localhost/shadow-realm/frontend/**.
2. New players choose **Register** and enter a username, email and matching passwords. Passwords require 8?72 bytes, including a letter and a number.
3. Open **http://localhost:8025**, find the verification email and copy its six-digit OTP.
4. Enter the code in the game's OTP screen. Successful verification returns you to Login; it does not log you in automatically.
5. Log in with your email or username and password. A valid existing session may open Dashboard directly.
6. Choose **Continue Adventure** or an unlocked realm card.
7. Collect all three crystals, avoid hazards and reach the magical portal.
8. Solve both Fish and Chest values in the Rune Gate. Use **Load Rune / Retry** if the service or image fails; network failures do not cost health.
9. A successful saved completion unlocks the next realm. Use **Next Level** or return to Dashboard.
10. View your profile, history and champions from Dashboard. Log out when finished.

| Action | Control |
| --- | --- |
| Move left | A or Left arrow |
| Move right | D or Right arrow |
| Jump | W, Up arrow or Space |
| Pause / resume | On-screen Pause / Resume buttons |
| Restart | Restart or Retry Adventure button |
| Leave gameplay | Dashboard / Back to Dashboard button |

The HUD shows **active elapsed time**, not a countdown. Pausing stops movement, gameplay updates and this timer. Saved history duration uses server wall-clock time, including pauses. Exiting or restarting an unfinished attempt does not create an abandonment record.

## Game Levels

Every realm uses the same core objective: collect three crystals, survive the hazards, reach the portal and solve its Rune Gate.

| Realm | Environment | Hazard count |
| --- | --- | --- |
| 1. Enchanted Forest | Layered trees, moonlight, glowing plants and textured ground | 1 |
| 2. Forgotten Castle | Castle silhouettes, stonework and torchlight | 2 |
| 3. Crystal Caverns | Cave formations, rock details and luminous crystals | 3 |
| 4. Shadow Fortress | Dark towers, banners, shadow colors and a final portal | 3 |

Each crystal gives 100 client-side points and can be collected once per attempt. PHP awards a fixed **300 verified points** for a completed puzzle-backed attempt and zero points for a saved defeat. The leaderboard ranks each player's best completion score and highest completed realm; scores are not cumulative. There are no implemented bosses or moving enemies.

## Technologies Used

| Technology | Responsibility |
| --- | --- |
| HTML5 | Structures the screens, forms and Canvas viewport. |
| CSS3 | Styles the fantasy interface and responsive layouts. |
| Vanilla JavaScript | Runs movement, rendering, events, navigation and frontend HTTP requests. |
| PHP | Handles authentication, sessions, OTPs, game results and external API requests. |
| MySQL / XAMPP MariaDB | Stores accounts, profiles, progress, verification records and game history through PDO. |
| XAMPP | Runs Apache, PHP and the local database service. |
| Mailpit | Captures development verification messages in a local inbox. |
| University Fish Game API | Supplies the external Rune Gate puzzles. |
| Git and GitHub | Track source changes and branch history. |

No frontend framework, game engine, npm server or Composer dependency is required by the current implementation.

## Project Folder Structure

```text
shadow-realm/
??? frontend/
?   ??? .htaccess
?   ??? index.html
?   ??? css/style.css
?   ??? js/
?       ??? main.js
?       ??? api/api.js
?       ??? auth/auth.js
?       ??? game/
?       ?   ??? controls.js
?       ?   ??? game.js
?       ?   ??? levels.js
?       ?   ??? player.js
?       ?   ??? renderer.js
?       ??? ui/
?           ??? dashboard.js
?           ??? leaderboard.js
?           ??? profile.js
?           ??? screens.js
??? backend/
?   ??? api/fish-api.php
?   ??? auth/              # register, login, logout, session, verify and resend
?   ??? config/config.php
?   ??? game/              # progress, history and leaderboard endpoints
?   ??? includes/functions.php
?   ??? mail/mail.php
?   ??? player/profile.php
??? database/
?   ??? .htaccess
?   ??? connection.php
?   ??? schema.sql
??? .env.example
??? .gitignore
??? .htaccess
??? index.php
??? README.md
```

`frontend/` owns presentation and gameplay. `backend/` owns server requests and identity. `database/` owns the PDO connection and importable schema. Additional access-control `.htaccess` files protect backend helper folders. Local `.env` and `.git/` exist after configuration and Git setup; secrets are excluded from version control.

## Four Assignment Themes

### A. Low Coupling and High Cohesion

Low coupling means separate parts avoid unnecessary dependencies. High cohesion means each module focuses on one responsibility.

`frontend/js/game/controls.js` installs keyboard events, `player.js` creates player state and `renderer.js` draws the world. `game.js` manages physics without knowing PHP endpoint names. `frontend/js/api/api.js` owns HTTP communication, while `ui/screens.js` owns screen visibility. PHP authentication routes and `database/connection.php` separate identity from database connection setup. The `onGate` callback connects gameplay to the UI without putting HTTP requests inside the physics module.

### B. Event-Driven Programming

Event-driven programming runs code in response to actions or state changes. `bindAuthentication()` in `frontend/js/auth/auth.js` handles form submissions and password visibility. `installControls()` reacts to keyboard input. Button handlers in `frontend/js/main.js` call pause, resume, restart and navigation functions. `AdventureGame` emits `gameupdate`, `crystalcollected`, `playerdamage` and `gameover`; `completeLevel()` dispatches `levelcomplete`. `requestAnimationFrame` schedules drawing and gameplay updates.

### C. Interoperability

Interoperability means separate systems exchange information in a format they both understand:

**JavaScript frontend ? PHP backend ? Fish Game API ? PHP backend ? JavaScript frontend**

`api()` in `frontend/js/api/api.js` makes HTTP requests to PHP and reads JSON, a structured text format. `backend/api/fish-api.php` requests `https://marcconrad.com/uob/fish/api.php?out=json&base64=no`, validates its `question`, `fish` and `chest` fields, and returns only the image URL. Answers remain in the PHP session and are checked when the player submits. Timeouts and invalid responses produce a retryable error. Requests use cURL when available, with a TLS-verified HTTPS stream fallback.

### D. Virtual Identity

Virtual identity connects a real player account to its saved data. `backend/auth/register.php` stores a password hash using `password_hash()`. `login.php` checks it with `password_verify()`, rejects unverified accounts and regenerates the session ID. `verify.php` validates a hashed, expiring OTP for the pending account. `require_user()` in `backend/includes/functions.php` checks server-side identity before protected requests. Profile and progress queries use the session user ID, not an ID supplied by the browser. CSRF tokens protect state-changing requests, and request limits reduce repeated attempts.

The server verifies puzzle completion and fixed score awards, but player movement remains browser-controlled. This is not a fully server-authoritative anti-cheat system.

## Installation and Setup

1. Install XAMPP with **PHP 8.1 or newer**. Enable PDO MySQL, sessions and OpenSSL. cURL is preferred for external HTTPS requests; HTTPS streams must be available for the fallback. Keep TLS certificate verification enabled.
2. Place or clone the project at **`C:\xampp\htdocs\shadow-realm`**.
3. Open the XAMPP Control Panel and start **Apache** and **MySQL**.
4. Open **http://localhost/phpmyadmin**, choose **Import**, select `database/schema.sql` and run it. The database name is **`shadow_realm_db`**. The script creates missing tables and adds missing columns; it does not drop player records. Its additive migration requires permission to create, execute and drop a stored procedure. Existing incompatible schemas still need review before import.
5. If `.env` does not exist, copy `.env.example` to `.env`. Configure `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER` and `DB_PASSWORD` for your local database account. Never commit `.env` or real credentials. PHP reads it through `backend/config/config.php`.
6. Keep `APP_PATH=/shadow-realm` and `APP_BASE_URL=http://localhost/shadow-realm` for this XAMPP folder. No PHP package installation is needed: `backend/mail/mail.php` implements SMTP for local Mailpit using PHP streams.
7. Download the Windows Mailpit executable from the [official releases](https://github.com/axllent/mailpit/releases) and extract it **outside the project**, for example into `C:\Tools\Mailpit`.
8. Use `SMTP_HOST=127.0.0.1`, `SMTP_PORT=1025`, a valid `SMTP_FROM` address, and blank `SMTP_USER`/`SMTP_PASS`. Start Mailpit in PowerShell:

   ```powershell
   & 'C:\Tools\Mailpit\mailpit.exe' --smtp '127.0.0.1:1025' --listen '127.0.0.1:8025' --database 'C:\Tools\Mailpit\mailpit.db'
   ```

9. Keep Mailpit running. Open the game at **http://localhost/shadow-realm/frontend/** and its inbox at **http://localhost:8025/**. The root URL **http://localhost/shadow-realm/** also redirects to the frontend.

Mailpit captures local messages; it does not deliver them to real inboxes. The current SMTP helper supports local Mailpit only. If delivery fails, the account remains unverified; start Mailpit and use **Resend OTP**, observing the cooldown.

### Troubleshooting and Verification Limits

- **Game or PHP fails to load:** start Apache, use the localhost URL and check port conflicts. Do not use `file://` or VS Code Live Server for this PHP application.
- **Database error:** start MySQL, check `.env`, and confirm the schema was imported into `shadow_realm_db`.
- **OTP not received:** check Mailpit ports 1025/8025 and SMTP settings. Codes expire after five minutes; resending replaces the previous code. The resend response currently uses older link wording, but the email and verification screen use OTPs.
- **Rune Gate unavailable:** use Retry and check internet/TLS configuration. Do not disable certificate checks to fix a connection error.
- **Session or CSRF error:** reload the page and log in again if required.
- **Old interface:** press Ctrl+F5 to refresh cached assets.

Previous development checks covered PHP syntax, asset loading, protected endpoints, local SMTP delivery, and Chrome checks for navigation and core gameplay. Dashboard/profile rendering was also checked using a read-only database snapshot; this was not an authenticated end-to-end flow. Successful registration ? OTP ? login, real profile updates and authenticated result saving still need a complete manual walkthrough. This documentation update verifies comment-only source changes and PHP syntax; it does not establish production readiness. Public deployment needs HTTPS, production mail delivery and operational security review.

## AI Usage and Attribution

This project follows the developer's Shadow Realm game concept, gameplay ideas, requirements and planned application structure. OpenAI ChatGPT and Codex were used as AI-assisted development tools to support planning, implementation, debugging, improvement and learning programming concepts.

AI assistance contributed to implementing and refining parts of the HTML, CSS, JavaScript, PHP and SQL source. The developer supplied design direction, gameplay requirements and development choices. AI-assisted code has been reviewed and adapted during development; the student remains responsible for independently reviewing, understanding and explaining the submitted work.

Relevant project-owned source files include a general AI-assistance acknowledgment. These comments do not claim that every line was written manually, that all code was AI-generated, or that a precise authorship split is known. Earlier file-level authorship has not been independently established.

The external [University Fish Game API by Marc Conrad](https://marcconrad.com/uob/fish/doc.php) provides the puzzles and puzzle images. Review its usage terms before reuse. Environment scenery and character portraits are drawn procedurally in the project; no downloaded sprite library is required. PHP, Apache, MySQL/MariaDB and Mailpit are third-party runtime tools and retain their respective licenses. Git and GitHub manage project versions and history; active development uses `develop`, with releases reviewed before merging to `main`.

## Academic Purpose

Shadow Realm was developed for the **University of Bedfordshire CIS045-3 Distributed Service Architectures** assignment. It supports discussion of **low coupling and high cohesion, event-driven programming, interoperability and virtual identity** using the actual source files described above.

The project can support a student-produced video explaining the code and architecture in the student's own words. This README does not claim that a video or tutor presentation has been completed or submitted. The assignment PDF was not available in the workspace; the four themes and academic context above come from the supplied project requirements.
