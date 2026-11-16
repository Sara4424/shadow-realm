// Procedural artwork: no image downloads or per-frame asset loading.
const palettes = [
  ['#081d2b', '#24645e', '#123c40', '#1f6153', '#71dcb0'],
  ['#141b38', '#585275', '#272e50', '#3c4566', '#b8abdf'],
  ['#140f30', '#462d70', '#291e4e', '#503978', '#69e5ef'],
  ['#190e26', '#632c4b', '#301a35', '#542843', '#ffb07b'],
];
function polygon(c, points, color) {
  c.fillStyle = color; c.beginPath();
  points.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y));
  c.closePath(); c.fill();
}
function glow(c, x, y, radius, color) {
  const light = c.createRadialGradient(x, y, 0, x, y, radius);
  light.addColorStop(0, color); light.addColorStop(1, 'transparent');
  c.fillStyle = light; c.fillRect(x-radius, y-radius, radius*2, radius*2);
}
export function drawWorld(game) {
  const c = game.ctx, p = game.player, t = (game.victory ? game.lastTime : (game.elapsedMs || 0)) / 1000;
  const [sky, horizon, far, near, accent] = palettes[game.level - 1];
  const background = c.createLinearGradient(0, 0, 0, 360);
  background.addColorStop(0, sky); background.addColorStop(1, horizon);
  c.fillStyle = background; c.fillRect(0, 0, 760, 360);
  // Stable star positions prevent flicker and avoid random work each frame.
  for (let i = 0; i < 42; i++) {
    c.globalAlpha = .35 + .3 * Math.sin(t + i);
    c.fillStyle = '#def5ff'; c.fillRect((i*137)%760, (i*47)%180, i%4===0 ? 2 : 1, 2);
  }
  c.globalAlpha = 1;
  glow(c, 605, 64, 85, '#c5b7ff22');
  c.fillStyle = '#d9d7e9'; c.beginPath(); c.arc(605, 64, 24, 0, Math.PI*2); c.fill();
  c.fillStyle = sky; c.beginPath(); c.arc(615, 57, 22, 0, Math.PI*2); c.fill();
  for (let i = 0; i < 9; i++) {
    const x = i*112 - 40 - p.x*.025;
    polygon(c, [[x,300],[x+65,110+(i%3)*22],[x+145,300]], far);
  }
  for (let i = 0; i < 8; i++) {
    const x = i*115 - p.x*.045;
    if (game.level === 1) {
      c.fillStyle = '#102e32'; c.fillRect(x+28, 160, 12, 158);
      for (let j = 0; j < 3; j++) polygon(c, [[x-12,240-j*35],[x+34,121-j*12],[x+80,240-j*35]], j%2 ? near : far);
    } else if (game.level === 3) {
      polygon(c, [[x,318],[x+15,185+i%3*25],[x+38,157+i%3*25],[x+59,318]], near);
      polygon(c, [[x+15,240],[x+38,157+i%3*25],[x+38,318]], '#8b6fb133');
      polygon(c, [[x+18,0],[x+45,82+i%3*22],[x+70,0]], far);
    } else {
      c.fillStyle = near; c.fillRect(x+12, 167+i%2*25, 63, 151);
      for (let j = 0; j < 3; j++) c.fillRect(x+9+j*25, 151+i%2*25, 18, 25);
      c.fillStyle = '#dfb56c'; c.fillRect(x+36, 203+i%2*25, 8, 19);
      glow(c, x+40, 214+i%2*25, 25, '#ffc36b22');
    }
  }
  for (let i = 0; i < 18; i++) {
    const x = (i*83 + t*(5+i%3))%760, y = 130+(i*37)%160+Math.sin(t+i)*9;
    glow(c, x, y, 7, '#c0f5ce33'); c.fillStyle = accent; c.fillRect(x, y, 2, 2);
  }
  c.fillStyle = '#141b2a'; c.fillRect(0, 318, 760, 42);
  c.fillStyle = near; c.fillRect(0, 318, 760, 7);
  c.fillStyle = accent; c.globalAlpha = .6; c.fillRect(0, 318, 760, 2); c.globalAlpha = 1;
  for (let i = 0; i < 24; i++) {
    c.fillStyle = '#ffffff0b'; c.fillRect(i*37, 330+i%3*8, 21, 3);
    c.fillStyle = near; c.fillRect(i*33, 313, 2, 5);
  }
  drawEnvironmentDetails(c, game.level, t, accent);
  for (const x of game.obstacles) {
    glow(c, x, 307, 29, '#ff4e7540');
    polygon(c, [[x-17,318],[x-9,301],[x-3,318],[x+3,289],[x+11,318],[x+16,304],[x+22,318]], '#d75677');
    polygon(c, [[x+3,289],[x+6,313],[x+11,318]], '#ffd0cc');
  }
  for (const item of game.items) {
    if (item.collected) continue;
    const y = item.y + Math.sin(t*3+item.x)*3;
    glow(c, item.x, y, 30, '#60ead644');
    polygon(c, [[item.x,y-14],[item.x+10,y],[item.x,y+14],[item.x-10,y]], '#4acabc');
    polygon(c, [[item.x,y-14],[item.x,y+14],[item.x-10,y]], '#c8fff2');
    c.fillStyle = '#eaffff'; c.fillRect(item.x-2, y-7, 3, 5);
  }
  const unlocked = game.crystals === 3;
  glow(c, 732, 275, 57, unlocked ? '#ba70ff66' : '#5a477733');
  c.fillStyle = '#302544'; c.fillRect(713, 239, 7, 79); c.fillRect(745, 239, 7, 79);
  c.fillStyle = unlocked ? '#b58ae9' : '#655478'; c.fillRect(711, 235, 43, 8);
  c.fillStyle = '#231a38'; c.fillRect(720, 243, 25, 75);
  if (unlocked) {
    for (let i = 0; i < 5; i++) {
      c.strokeStyle = i%2 ? '#e2caff' : '#9a69ec'; c.lineWidth = 2;
      c.beginPath(); c.ellipse(732, 279, 5+Math.sin(t*2+i)*4, 20+i*3, 0, 0, Math.PI*2); c.stroke();
    }
  }
  drawCharacter(c, game, t);
  for (const effect of game.effects || []) {
    c.globalAlpha = Math.max(0, effect.life);
    glow(c, effect.x, effect.y, 35, '#a2fff377');
    c.fillStyle = '#cefff2';
    c.font = 'bold 14px sans-serif';
    c.fillText('+100', effect.x - 15, effect.y - 15);
    for (let ray = 0; ray < 8; ray++) {
      const angle = ray * Math.PI / 4;
      c.beginPath();
      c.arc(effect.x + Math.cos(angle) * (1 - effect.life) * 40, effect.y + Math.sin(angle) * (1 - effect.life) * 40, 2, 0, Math.PI * 2);
      c.fill();
    }
    c.globalAlpha = 1;
  }
  if (game.paused && !game.victory) {
    c.fillStyle='#08091b99'; c.fillRect(0,0,760,360);
    c.fillStyle='#eee4ff'; c.font='bold 23px sans-serif'; c.textAlign='center';
    c.fillText(game.atGate ? 'THE RUNE GATE AWAITS' : 'ADVENTURE PAUSED',380,165);
    c.font='14px sans-serif'; c.fillText(game.atGate ? 'Solve both values below to open the portal' : 'Select Resume to continue your journey',380,192); c.textAlign='start';
  }
}

// Details are decorative; the original collision surfaces remain unchanged.
function drawEnvironmentDetails(c, level, time, accent) {
  if (level === 1) {
    for (let tree = 0; tree < 6; tree++) {
      const x = tree * 150 + 25;
      c.strokeStyle = '#254f4b';
      c.lineWidth = 5;
      c.beginPath();
      c.moveTo(x + 8, 314);
      c.bezierCurveTo(x - 5, 230, x + 15, 160, x - 8, 68);
      c.moveTo(x, 170);
      c.lineTo(x - 30, 128);
      c.moveTo(x + 2, 220);
      c.lineTo(x + 36, 166);
      c.stroke();
      for (let leaf = 0; leaf < 6; leaf++) {
        c.fillStyle = leaf % 2 ? '#205548' : '#1a453f';
        c.beginPath();
        c.ellipse(x + Math.sin(leaf * 2) * 31, 55 + leaf * 20, 28, 15, -.4, 0, Math.PI * 2);
        c.fill();
      }
    }
  } else if (level === 2 || level === 4) {
    c.strokeStyle = level === 4 ? '#be718b20' : '#c9c4df20';
    c.lineWidth = 1;
    for (let row = 0; row < 4; row++) {
      for (let brick = 0; brick < 17; brick++) c.strokeRect(brick * 48 + row % 2 * 24, 238 + row * 19, 47, 18);
    }
    for (const x of [105, 350, 590]) {
      c.fillStyle = '#352b3d';
      c.fillRect(x - 4, 220, 8, 30);
      glow(c, x, 216, 55, level === 4 ? '#e080b044' : '#ffca6b44');
      polygon(c, [[x - 9, 223], [x - 5, 205], [x, 193 + Math.sin(time * 7 + x) * 4], [x + 7, 211], [x + 8, 224]], level === 4 ? '#c38aff' : '#e99b53');
      polygon(c, [[x - 4, 224], [x, 207], [x + 4, 223]], '#ffe9b4');
    }
    if (level === 4) {
      for (const x of [185, 470]) {
        polygon(c, [[x, 130], [x + 30, 130], [x + 29, 215], [x + 15, 200], [x, 216]], '#5d294f');
        c.strokeStyle = '#e0a4c2';
        c.beginPath();
        c.moveTo(x + 15, 151);
        c.lineTo(x + 22, 168);
        c.lineTo(x + 15, 185);
        c.lineTo(x + 8, 168);
        c.closePath();
        c.stroke();
      }
    }
  } else {
    for (let rock = 0; rock < 11; rock++) {
      const x = rock * 77;
      polygon(c, [[x, 318], [x + 10, 290], [x + 37, 284 + rock % 3 * 5], [x + 57, 307], [x + 67, 318]], '#382c55');
      c.strokeStyle = '#a08fc044';
      c.beginPath();
      c.moveTo(x + 10, 290);
      c.lineTo(x + 32, 307);
      c.lineTo(x + 57, 307);
      c.stroke();
      glow(c, x + 28, 290, 25, '#7de9f022');
    }
  }
  // Small blades, luminous flowers and stone flecks give the ground a readable edge.
  for (let plant = 0; plant < 44; plant++) {
    const x = plant * 19;
    c.strokeStyle = level === 1 ? '#418375' : '#796786';
    c.lineWidth = 1;
    c.beginPath();
    c.moveTo(x, 318);
    c.lineTo(x - 3, 309 - plant % 4);
    c.moveTo(x, 318);
    c.lineTo(x + 4, 312);
    c.stroke();
    if (plant % 4 === 0) {
      glow(c, x, 309, 10, accent + '22');
      c.fillStyle = accent;
      c.beginPath();
      c.arc(x, 308, 2, 0, Math.PI * 2);
      c.fill();
    }
  }
}

function drawCharacter(c, game, time) {
  const p = game.player;
  const colors = { guardian: '#a784de', ranger: '#64bea1', mage: '#6caae2' };
  const cloak = colors[game.character] || colors.guardian;
  const jumping = !p.onGround;
  const step = Math.sin(time * 15) * (p.vx && !game.paused ? 3 : 0);
  const breathe = Math.sin(time * 2.5) * .7;
  const raise = game.victory ? 9 + Math.sin(time * 4) * 2 : jumping ? 3 : 0;
  c.save();
  if (game.damageMs > 0 && Math.floor(game.damageMs / 90) % 2 === 0) c.globalAlpha = .4;
  c.fillStyle = '#06081766';
  c.beginPath();
  c.ellipse(p.x + 12, 317, jumping ? 11 : 17, 4, 0, 0, Math.PI * 2);
  c.fill();
  c.translate(p.x, p.y + breathe);
  polygon(c, [[4, 8], [22, 8], [27 + step, 25], [-5 - step, 26]], cloak);
  c.fillStyle = '#27203e';
  c.fillRect(3, 23, 7, jumping ? 3 : 5 + step / 2);
  c.fillRect(15, 23, 7, jumping ? 4 : 5 - step / 2);
  c.strokeStyle = '#debb7f';
  c.lineWidth = 1;
  c.beginPath();
  c.moveTo(4, 10);
  c.lineTo(1, 23);
  c.moveTo(22, 10);
  c.lineTo(25, 23);
  c.stroke();
  c.fillStyle = cloak;
  c.beginPath();
  c.moveTo(1, 9);
  c.quadraticCurveTo(0, -9, 13, -10);
  c.quadraticCurveTo(28, -6, 26, 10);
  c.closePath();
  c.fill();
  c.fillStyle = '#211d35';
  c.beginPath();
  c.ellipse(14, 2, 9, 8, 0, 0, Math.PI * 2);
  c.fill();
  c.fillStyle = '#bdfff0';
  c.fillRect(10, 1, 3, 2);
  c.fillRect(17, 1, 3, 2);
  c.fillStyle = '#dfbc77';
  c.beginPath();
  c.arc(13, 12, 2, 0, Math.PI * 2);
  c.fill();
  c.strokeStyle = '#cfad70';
  c.lineWidth = 2;
  c.beginPath();
  c.moveTo(28, 25 - raise);
  c.lineTo(29, 2 - raise);
  c.stroke();
  glow(c, 29, -1 - raise, game.victory ? 25 : 12, '#80f5db55');
  polygon(c, [[29, -7 - raise], [33, -1 - raise], [29, 5 - raise], [25, -1 - raise]], '#aeffec');
  c.restore();
}
