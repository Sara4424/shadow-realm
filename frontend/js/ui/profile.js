/*
 * Shadow Realm: The Lost Kingdom
 * Project-level AI acknowledgment: OpenAI ChatGPT and Codex supported
 * implementation, refinement and learning. The developer supplied game
 * ideas, requirements and design direction; no exact authorship split is claimed.
 */
import { api, post } from '../api/api.js';
import { levelNames } from '../game/levels.js';
import { element, portrait, statCard, isCurrentScreen } from './screens.js';

export async function showProfile(notify, onSaved) {
    const section = document.getElementById('profileContent');
    section.replaceChildren(element('p', 'Loading your character?'));
    try {
        const { user, progress } = await api('/me');
        if (!isCurrentScreen('profileScreen')) return;
        section.replaceChildren();
        const identity = element('div', '', 'character-card');
        const image = portrait(user.avatar, 'portrait portrait-large');
        identity.append(image, element('h3', user.username), element('span', user.verified ? 'Email verified' : 'Not verified', 'badge'));
        const details = element('dl', '', 'profile-fields');
        for (const [label, value] of [['Player ID', user.id], ['Email', user.email], ['Joined', user.created_at + ' UTC'], ['Selected character', user.avatar]]) {
            details.append(element('dt', label), element('dd', String(value)));
        }
        const stats = element('div', '', 'stats-grid');
        stats.append(statCard('Current level', progress.current_level), statCard('Highest unlocked', progress.unlocked_level), statCard('Best score', progress.best_score), statCard('Games played', progress.games_played));
        const label = element('label', 'Choose your character');
        const select = element('select');
        for (const avatar of ['guardian', 'ranger', 'mage']) {
            const option = element('option', avatar[0].toUpperCase() + avatar.slice(1));
            option.value = avatar;
            select.append(option);
        }
        select.value = user.avatar;
        label.append(select);
        select.addEventListener('change', () => {
            const replacement = portrait(select.value, 'portrait portrait-large');
            identity.replaceChild(replacement, identity.querySelector('canvas'));
        });
        const save = element('button', 'Save Character');
        save.addEventListener('click', async () => {
            save.disabled = true;
            try {
                const updated = await post('/profile', { avatar: select.value });
                if (!isCurrentScreen('profileScreen')) return;
                onSaved(updated);
                notify('Character saved. Your next adventure will use this character.');
            } catch (error) { notify(error.message); }
            finally { save.disabled = false; }
        });
        const information = element('div', '', 'profile-information');
        information.append(details, stats, label, save);
        section.append(identity, information);
    } catch (error) { notify(error.message); }
}

export function historyTable(history) {
    const table = element('table');
    const head = element('thead');
    const headings = element('tr');
    for (const text of ['Date (UTC)', 'Realm', 'Score', 'Result', 'Duration']) {
        const heading = element('th', text);
        heading.scope = 'col';
        headings.append(heading);
    }
    head.append(headings);
    const body = element('tbody');
    for (const row of history) {
        const entry = element('tr');
        for (const value of [row.completed_at, levelNames[row.level - 1], row.score, row.result, `${row.time_played}s`]) entry.append(element('td', String(value)));
        body.append(entry);
    }
    table.append(head, body);
    return table;
}

export async function showHistory(notify) {
    const section = document.getElementById('historyContent');
    section.replaceChildren(element('p', 'Loading your adventures?'));
    try {
        const { history } = await api('/history');
        if (!isCurrentScreen('historyScreen')) return;
        section.replaceChildren(history.length ? historyTable(history) : element('p', 'No adventures completed yet. Start your first journey!', 'empty-state'));
    } catch (error) { notify(error.message); }
}
