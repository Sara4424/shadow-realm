/*
 * Shadow Realm: The Lost Kingdom
 * Project-level AI acknowledgment: OpenAI ChatGPT and Codex supported
 * implementation, refinement and learning. The developer supplied game
 * ideas, requirements and design direction; no exact authorship split is claimed.
 */
import { api, post } from './api/api.js';
import { bindAuthentication, showLoginScreen } from './auth/auth.js';
import { levelNames } from './game/levels.js';
import { AdventureGame } from './game/game.js';
import { renderDashboard, renderRecentActivity } from './ui/dashboard.js';
import { showProfile, showHistory } from './ui/profile.js';
import { refreshLeaderboard } from './ui/leaderboard.js';
import { showScreen, isCurrentScreen, drawPortrait } from './ui/screens.js';

const $ = id => document.getElementById(id);
let profile = null;
let currentLevel = 1;
let levelRun = 0;
let loadingRune = false;
let savingResult = false;
let gateUnlocked = false;
let runeSolved = false;
let startingLevel = false;

function notify(message) {
    $('message').textContent = message;
}
function formatTime(milliseconds) {
    const seconds = Math.floor(milliseconds / 1000);
    return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
}

const game = new AdventureGame($('game'), {
    onGate: () => {
        $('gate').hidden = false;
        $('pauseButton').disabled = true;
        $('resumeButton').disabled = true;
        notify('The Rune Gate is ready. Solve the challenge to complete this realm.');
        loadRune();
    },
    onDefeat: async () => {
        game.stop();
        showResult(false);
        const run = levelRun;
        savingResult = true;
        updateResultButtons();
        try {
            await post('/progress', { action: 'failed' });
            if (run === levelRun) notify('Game over. Your journey was saved. Try again when you are ready.');
        } catch (error) { if (run === levelRun) notify(error.message); }
        finally { savingResult = false; updateResultButtons(); }
    }
});

function updateResultButtons() {
    $('retryLevel').disabled = savingResult;
    $('nextLevel').disabled = savingResult;
    $('restartButton').disabled = savingResult || startingLevel;
}

async function loadPlayerDashboard() {
    const run = ++levelRun;
    game.stop();
    $('gate').hidden = true;
    $('resultOverlay').hidden = true;
    showScreen('dashboard');
    try {
        const loaded = await api('/me');
        if (run !== levelRun || !isCurrentScreen('dashboard')) return;
        profile = loaded;
        renderDashboard(profile, startGame);
        try {
            const { history } = await api('/history');
            if (run === levelRun && isCurrentScreen('dashboard')) renderRecentActivity(history);
        } catch (error) {
            if (run === levelRun && isCurrentScreen('dashboard')) $('recentActivity').textContent = 'Recent activity could not load. Open Game History to retry.';
        }
    } catch (error) {
        if (run !== levelRun) return;
        profile = null;
        showLoginScreen();
        notify(error.message);
    }
}

function openSecondaryScreen(screen) {
    if (!profile) return;
    levelRun++;
    game.stop();
    showScreen(screen);
}

async function startGame(level) {
    if (!profile || startingLevel || savingResult || !Number.isInteger(level) || level < 1 || level > Number(profile.progress.unlocked_level)) return;
    startingLevel = true;
    const run = ++levelRun;
    game.stop();
    updateResultButtons();
    try {
        await post('/progress', { action: 'start', level });
        if (run !== levelRun) return;
        currentLevel = level;
        gateUnlocked = false;
        runeSolved = false;
        $('resultOverlay').hidden = true;
        $('gate').hidden = true;
        $('runeArea').hidden = true;
        $('runeForm').reset();
        $('runeForm').querySelector('button').disabled = false;
        $('gameTitle').textContent = levelNames[level - 1];
        $('gameUsername').textContent = profile.user.username;
        drawPortrait($('gamePortrait'), profile.user.avatar);
        $('instructions').textContent = 'Collect three crystals, then enter the magical portal.';
        $('pauseButton').disabled = false;
        $('resumeButton').disabled = true;
        showScreen('gamePanel');
        game.character = profile.user.avatar;
        game.start(level);
        $('game').focus({ preventScroll: true });
        notify(`${levelNames[level - 1]} started. Your adventure begins.`);
    } catch (error) { if (run === levelRun) notify(error.message); }
    finally { startingLevel = false; updateResultButtons(); }
}

async function loadRune() {
    if (loadingRune || runeSolved || !isCurrentScreen('gamePanel') || !game.atGate) return;
    const run = levelRun;
    loadingRune = true;
    $('loadRune').disabled = true;
    $('runeArea').hidden = true;
    notify('Calling the Rune Gate service?');
    try {
        const data = await api('/rune');
        if (run !== levelRun) return;
        $('runeForm').reset();
        $('runeImage').src = data.question;
        $('runeArea').hidden = false;
        notify('Solve both values to open the gate.');
    } catch (error) { if (run === levelRun) notify(error.message); }
    finally { loadingRune = false; $('loadRune').disabled = false; }
}

function showResult(victory) {
    $('resultOverlay').hidden = false;
    $('gate').hidden = true;
    $('resultEyebrow').textContent = victory ? 'A NEW CHAPTER' : 'THE JOURNEY IS NOT OVER';
    $('resultTitle').textContent = victory ? (currentLevel === 4 ? 'The Kingdom Is Restored' : 'Level Complete') : 'Game Over';
    $('resultSummary').textContent = `${levelNames[currentLevel - 1]} ? Score ${game.score} ? Crystals ${game.crystals}/3 ? Active time ${formatTime(game.elapsedMs)}`;
    $('retryLevel').textContent = victory ? 'Replay Realm' : 'Retry Adventure';
    $('nextLevel').hidden = !victory || currentLevel === 4 || Number(profile.progress.unlocked_level) <= currentLevel;
    $('pauseButton').disabled = true;
    $('resumeButton').disabled = true;
    $('retryLevel').focus();
}

async function completeLevel() {
    if (savingResult || gateUnlocked) return;
    const run = levelRun;
    savingResult = true;
    updateResultButtons();
    try {
        await post('/progress', { action: 'complete' });
        if (run !== levelRun) return;
        // A committed result must not be submitted again if a later UI refresh fails.
        gateUnlocked = true;
        game.victory = true;
        game.paused = true;
        game.keys.clear();
        game.draw();
        profile.progress.unlocked_level = Math.max(Number(profile.progress.unlocked_level), Math.min(4, currentLevel + 1));
        profile.progress.highest_completed_level = Math.max(Number(profile.progress.highest_completed_level), currentLevel);
        $('game').dispatchEvent(new CustomEvent('levelcomplete', { detail: { level: currentLevel } }));
        showResult(true);
        notify('Rune Gate unlocked. Your verified result was saved.');
    } catch (error) { if (run === levelRun) notify(error.message + ' Submit Unlock Gate again to retry saving.'); }
    finally { savingResult = false; updateResultButtons(); }
}

$('runeForm').addEventListener('submit', async event => {
    event.preventDefault();
    const button = event.target.querySelector('button');
    if (button.disabled || gateUnlocked) return;
    button.disabled = true;
    const run = levelRun;
    try {
        if (!runeSolved) {
            const form = new FormData(event.target);
            const result = await post('/rune/check', { fish: Number(form.get('fish')), chest: Number(form.get('chest')) });
            if (run !== levelRun) return;
            if (!result.correct) return notify('Not quite right. Check both values and try again.');
            runeSolved = true;
        }
        await completeLevel();
    } catch (error) { if (run === levelRun) notify(error.message); }
    finally { button.disabled = false; }
});

$('loadRune').addEventListener('click', loadRune);
$('runeImage').addEventListener('error', () => notify('The puzzle image could not load. Use Load Rune / Retry.'));
$('pauseButton').addEventListener('click', () => {
    if (!game.active || game.atGate) return;
    game.pause();
    $('pauseButton').disabled = true;
    $('resumeButton').disabled = false;
    notify('Game paused. Your active timer has stopped.');
});
$('resumeButton').addEventListener('click', () => {
    if (!game.active || game.atGate) return;
    game.resume();
    $('pauseButton').disabled = false;
    $('resumeButton').disabled = true;
    $('game').focus();
    notify('Adventure resumed.');
});
$('restartButton').addEventListener('click', () => startGame(currentLevel));
$('retryLevel').addEventListener('click', () => startGame(currentLevel));
$('nextLevel').addEventListener('click', () => { if (gateUnlocked) startGame(currentLevel + 1); });
$('continueButton').addEventListener('click', () => startGame(Number(profile?.progress.current_level || 1)));
$('historyStart').addEventListener('click', () => startGame(Number(profile?.progress.current_level || 1)));
$('exitGame').addEventListener('click', loadPlayerDashboard);
for (const button of document.querySelectorAll('[data-dashboard]')) button.addEventListener('click', loadPlayerDashboard);
$('profileButton').addEventListener('click', () => {
    openSecondaryScreen('profileScreen');
    showProfile(notify, updated => { profile = updated; });
});
$('historyButton').addEventListener('click', () => {
    openSecondaryScreen('historyScreen');
    showHistory(notify);
});
$('leaderboardButton').addEventListener('click', () => {
    openSecondaryScreen('leaderboardPanel');
    refreshLeaderboard(profile.user.username, notify);
});
$('game').addEventListener('gameupdate', event => {
    $('score').textContent = `Score: ${event.detail.score}`;
    $('health').textContent = `Health: ${event.detail.health} / 3`;
    $('healthMeter').value = event.detail.health;
    $('crystals').textContent = `Crystals: ${event.detail.crystals} / 3`;
    $('timer').textContent = `Elapsed: ${formatTime(event.detail.elapsedMs)}`;
});
$('game').addEventListener('crystalcollected', () => notify('Crystal collected! +100 points.'));
$('game').addEventListener('playerdamage', () => notify('A shadow trap struck you. Keep moving!'));

bindAuthentication({ post, notify, loadProfile: loadPlayerDashboard, setAccountMode: () => { game.stop(); levelRun++; } });
$('logout').addEventListener('click', async () => {
    try {
        await post('/logout');
        levelRun++;
        game.stop();
        profile = null;
        for (const id of ['profileContent', 'historyContent', 'podium', 'leaderboard', 'recentActivity']) $(id).replaceChildren();
        showLoginScreen();
        notify('Logged out. Your saved adventures are safe.');
    } catch (error) { notify(error.message); }
});
showLoginScreen();
try {
    const session = await api('/session');
    if (session.authenticated) await loadPlayerDashboard();
} catch (error) { notify(error.message); }
