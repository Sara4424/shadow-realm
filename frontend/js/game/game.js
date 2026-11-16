/*
 * Shadow Realm: The Lost Kingdom
 * Project-level AI acknowledgment: OpenAI ChatGPT and Codex supported
 * implementation, refinement and learning. The developer supplied game
 * ideas, requirements and design direction; no exact authorship split is claimed.
 */
import { installControls } from './controls.js';
import { createPlayer } from './player.js';
import { drawWorld } from './renderer.js';

// Physics knows about game events, but not PHP routes or dashboard elements.
export class AdventureGame {
    constructor(canvas, handlers) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.handlers = handlers;
        this.keys = new Set();
        this.active = false;
        this.paused = false;
        this.frame = null;
        this.removeControls = installControls(this);
        this.drawSplash();
    }

    drawSplash() {
        this.ctx.fillStyle = '#171533';
        this.ctx.fillRect(0, 0, 760, 360);
        this.ctx.fillStyle = '#d8b8ff';
        this.ctx.font = 'bold 28px Georgia';
        this.ctx.fillText('SHADOW REALM', 250, 160);
    }

    start(level) {
        // Cancel the old frame before scheduling another attempt.
        this.stop();
        this.level = level;
        this.active = true;
        this.paused = false;
        this.player = createPlayer();
        this.health = 3;
        this.crystals = 0;
        this.score = 0;
        this.elapsedMs = 0;
        this.damageMs = 0;
        this.effects = [];
        this.atGate = false;
        this.victory = false;
        this.items = [180, 390, 620].map((x, index) => ({
            x, y: index === 1 ? 190 : 265, collected: false
        }));
        this.obstacles = [285, 505, 680].slice(0, Math.min(level, 3));
        this.lastTime = performance.now();
        this.emit();
        this.frame = requestAnimationFrame(time => this.loop(time));
    }

    stop() {
        this.active = false;
        this.keys.clear();
        if (this.frame !== null) cancelAnimationFrame(this.frame);
        this.frame = null;
    }

    pause() {
        this.paused = true;
        this.keys.clear();
    }

    resume() {
        if (!this.active || this.atGate) return;
        this.lastTime = performance.now();
        this.paused = false;
    }

    emit() {
        this.canvas.dispatchEvent(new CustomEvent('gameupdate', {
            detail: { score: this.score, health: this.health, crystals: this.crystals, elapsedMs: this.elapsedMs }
        }));
    }

    loop(time) {
        if (!this.active) return;
        const player = this.player;
        const elapsed = Math.max(0, time - this.lastTime);
        const delta = Math.min(elapsed / 16.67, 2);
        this.lastTime = time;
        if (!this.paused) {
            const previousSecond = Math.floor(this.elapsedMs / 1000);
            this.elapsedMs += elapsed;
            if (Math.floor(this.elapsedMs / 1000) !== previousSecond) this.emit();
            this.update(delta);
        }
        // A game-over callback can stop or replace the attempt during update.
        if (player !== this.player || !this.active) return;
        this.draw();
        this.frame = requestAnimationFrame(nextTime => this.loop(nextTime));
    }

    update(delta) {
        this.damageMs = Math.max(0, this.damageMs - delta * 16.67);
        for (const effect of this.effects) {
            effect.life -= delta * .025;
            effect.y -= delta * .6;
        }
        this.effects = this.effects.filter(effect => effect.life > 0);
        const player = this.player;
        const right = this.keys.has('ArrowRight') || this.keys.has('KeyD');
        const left = this.keys.has('ArrowLeft') || this.keys.has('KeyA');
        const jump = this.keys.has('Space') || this.keys.has('ArrowUp') || this.keys.has('KeyW');
        player.vx = (right ? 3.3 : 0) - (left ? 3.3 : 0);
        if (player.onGround && jump) {
            player.vy = -10.5;
            player.onGround = false;
        }
        player.vy += .55 * delta;
        player.x = Math.max(0, Math.min(730, player.x + player.vx * delta));
        player.y += player.vy * delta;
        if (player.y >= 290) {
            player.y = 290;
            player.vy = 0;
            player.onGround = true;
        }
        this.collectCrystals();
        this.checkHazards();
        if (!this.active) return;
        if (player.x > 705 && this.crystals === 3 && !this.atGate) {
            this.atGate = true;
            this.pause();
            this.handlers.onGate();
        }
    }

    collectCrystals() {
        for (const item of this.items) {
            if (item.collected || Math.abs(this.player.x - item.x) >= 24 || Math.abs(this.player.y - item.y) >= 33) continue;
            item.collected = true;
            this.crystals++;
            this.score += 100;
            this.effects.push({ x: item.x, y: item.y, life: 1 });
            this.canvas.dispatchEvent(new CustomEvent('crystalcollected', { detail: { score: this.score } }));
            this.emit();
        }
    }

    checkHazards() {
        if (this.paused || this.damageMs > 0) return;
        for (const x of this.obstacles) {
            if (Math.abs(this.player.x - x) >= 18 || this.player.y <= 267) continue;
            // Brief invulnerability prevents several damage events from a single contact.
            this.damageMs = 1200;
            this.health--;
            this.player.x = 35;
            this.player.y = 290;
            this.player.vy = 0;
            this.canvas.dispatchEvent(new CustomEvent('playerdamage', { detail: { health: this.health } }));
            this.emit();
            if (this.health <= 0) {
                this.pause();
                this.canvas.dispatchEvent(new CustomEvent('gameover'));
                this.handlers.onDefeat();
            }
            break;
        }
    }

    draw() {
        drawWorld(this);
    }
}
