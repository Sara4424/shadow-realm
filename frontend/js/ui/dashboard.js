/*
 * Shadow Realm: The Lost Kingdom
 * Project-level AI acknowledgment: OpenAI ChatGPT and Codex supported
 * implementation, refinement and learning. The developer supplied game
 * ideas, requirements and design direction; no exact authorship split is claimed.
 */
import { levelNames } from '../game/levels.js';
import { drawWorld } from '../game/renderer.js';
import { drawPortrait, element, statCard } from './screens.js';

export function renderDashboard(profile, startLevel) {
    const { user, progress } = profile;
    document.getElementById('greeting').textContent = `Welcome back, ${user.username}`;
    drawPortrait(document.getElementById('dashboardPortrait'), user.avatar);
    const stats = document.getElementById('dashboardStats');
    stats.replaceChildren(
        statCard('Current level', progress.current_level),
        statCard('Unlocked', `${progress.unlocked_level} / 4`),
        statCard('Best score', progress.best_score),
        statCard('Games played', progress.games_played),
        statCard('Levels completed', progress.highest_completed_level)
    );
    const level = Number(progress.current_level || 1);
    document.getElementById('adventureName').textContent = levelNames[level - 1];
    document.getElementById('adventureProgress').textContent = `${progress.highest_completed_level} of 4 realms completed. Your next adventure awaits.`;
    document.getElementById('adventureMeter').value = Number(progress.highest_completed_level);
    const levels = document.getElementById('levels');
    levels.replaceChildren();
    levelNames.forEach((name, index) => {
        const level = index + 1;
        const unlocked = level <= progress.unlocked_level;
        const card = element('article', '', 'level-card');
        const preview = element('canvas', '', 'level-preview');
        preview.width = 760;
        preview.height = 360;
        preview.setAttribute('role', 'img');
        preview.setAttribute('aria-label', name + ' environment preview');
        // Render an environment preview without creating a game or installing input listeners.
        drawWorld({ ctx: preview.getContext('2d'), player: { x: 40, y: 290, vx: 0, onGround: true }, level, lastTime: 0, elapsedMs: 0, crystals: 0, items: [], obstacles: [285, 505], effects: [], damageMs: 0 });
        const button = element('button', unlocked ? 'Enter realm' : 'Locked');
        button.disabled = !unlocked;
        button.addEventListener('click', () => startLevel(level));
        card.append(preview, element('small', `REALM 0${level} ? ${unlocked ? 'UNLOCKED' : 'LOCKED'}`), element('h3', name), button);
        levels.append(card);
    });
}

export function renderRecentActivity(history) {
    const container = document.getElementById('recentActivity');
    container.replaceChildren();
    if (!history.length) {
        container.append(element('p', 'Your story is waiting to be written. Start your first adventure.', 'empty-state'));
        return;
    }
    for (const entry of history.slice(0, 3)) {
        const row = element('div', '', 'activity-row');
        row.append(element('strong', levelNames[entry.level - 1]), element('span', `${entry.score} points ? ${entry.result}`), element('time', entry.completed_at + ' UTC'));
        container.append(row);
    }
}
