const screenIds = ['auth', 'dashboard', 'profileScreen', 'historyScreen', 'leaderboardPanel', 'gamePanel'];
let activeScreen = 'auth';

export function showScreen(id) {
    activeScreen = id;
    for (const screen of screenIds) document.getElementById(screen).hidden = screen !== id;
    const heading = document.getElementById(id).querySelector('h2');
    if (heading) {
        heading.setAttribute('tabindex', '-1');
        heading.focus({ preventScroll: true });
    }
}

export function isCurrentScreen(id) {
    return activeScreen === id;
}

// Build text safely: player names and server values are never interpreted as HTML.
export function element(tag, text = '', className = '') {
    const node = document.createElement(tag);
    node.textContent = text;
    node.className = className;
    return node;
}

export function statCard(label, value) {
    const card = element('div', '', 'stat-card');
    card.append(element('span', label), element('strong', String(value ?? 0)));
    return card;
}

// Original Canvas portraits share the cloak, hood and staff used in the game.
export function drawPortrait(canvas, character = 'guardian') {
    const colors = { guardian: '#ad88f2', ranger: '#68c8ad', mage: '#70b9ed' };
    const color = colors[character] || colors.guardian;
    canvas.width = 160;
    canvas.height = 180;
    canvas.setAttribute('role', 'img');
    canvas.setAttribute('aria-label', character + ' character portrait');
    const context = canvas.getContext('2d');
    const glow = context.createRadialGradient(80, 80, 4, 80, 80, 100);
    glow.addColorStop(0, '#564275');
    glow.addColorStop(1, '#11162c');
    context.fillStyle = glow;
    context.fillRect(0, 0, 160, 180);
    context.strokeStyle = '#d9ba72';
    context.lineWidth = 2;
    context.beginPath();
    context.arc(80, 82, 60, 0, Math.PI * 2);
    context.stroke();
    context.fillStyle = color;
    context.beginPath();
    context.moveTo(80, 40);
    context.quadraticCurveTo(37, 65, 34, 160);
    context.lineTo(122, 160);
    context.quadraticCurveTo(120, 70, 80, 40);
    context.fill();
    context.fillStyle = '#17172f';
    context.beginPath();
    context.ellipse(80, 85, 24, 30, 0, 0, Math.PI * 2);
    context.fill();
    context.fillStyle = '#b4fff1';
    context.fillRect(66, 83, 8, 4);
    context.fillRect(85, 83, 8, 4);
    context.strokeStyle = '#d4b377';
    context.lineWidth = 5;
    context.beginPath();
    context.moveTo(124, 91);
    context.lineTo(117, 166);
    context.stroke();
    context.fillStyle = '#b4fff1';
    context.beginPath();
    context.moveTo(126, 68);
    context.lineTo(134, 83);
    context.lineTo(124, 98);
    context.lineTo(116, 82);
    context.closePath();
    context.fill();
    context.fillStyle = '#d9ba72';
    context.beginPath();
    context.arc(80, 121, 5, 0, Math.PI * 2);
    context.fill();
}

export function portrait(character, className = 'portrait') {
    const canvas = element('canvas', '', className);
    drawPortrait(canvas, character);
    return canvas;
}
