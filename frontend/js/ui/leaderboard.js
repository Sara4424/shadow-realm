import { api } from '../api/api.js';
import { element, portrait, isCurrentScreen } from './screens.js';

export async function refreshLeaderboard(currentUsername, notify) {
    const podium = document.getElementById('podium');
    const list = document.getElementById('leaderboard');
    podium.replaceChildren(element('p', 'Summoning the champions?'));
    list.replaceChildren();
    try {
        const { leaderboard } = await api('/leaderboard');
        if (!isCurrentScreen('leaderboardPanel')) return;
        podium.replaceChildren();
        for (let rank = 1; rank <= 3; rank++) {
            const player = leaderboard[rank - 1];
            const card = element('article', '', `podium-card rank-${rank}`);
            card.append(element('span', `RANK ${rank}`, 'eyebrow'));
            if (player) {
                card.append(portrait(player.avatar || 'guardian'), element('h3', player.username), element('strong', `${player.score} points`), element('p', `Highest completed realm: ${player.level}`));
                if (player.username === currentUsername) card.classList.add('current-player');
            } else {
                card.append(element('h3', 'A legend awaits'), element('p', 'Complete an adventure to claim a place.'));
            }
            podium.append(card);
        }
        for (const [index, player] of leaderboard.entries()) {
            const row = element('li', '', player.username === currentUsername ? 'current-player' : '');
            row.append(element('strong', `${index + 1}. ${player.username}`), element('span', `${player.score} points ? Realm ${player.level}`));
            list.append(row);
        }
        if (!leaderboard.length) list.append(element('li', 'No champions yet. Your first victory could begin the story.', 'empty-state'));
    } catch (error) { podium.replaceChildren(element('p', error.message)); notify(error.message); }
}
