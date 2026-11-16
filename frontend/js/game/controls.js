// Install keyboard events once for this game instance.
export function installControls(game) {
    const keydown = event => {
        if (event.target.closest('input, textarea, select, button, [contenteditable]') || !game.active || game.paused) return;
        if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'Space'].includes(event.code)) event.preventDefault();
        game.keys.add(event.code);
    };
    const keyup = event => game.keys.delete(event.code);
    const blur = () => game.keys.clear();
    window.addEventListener('keydown', keydown);
    window.addEventListener('keyup', keyup);
    window.addEventListener('blur', blur);
    return () => {
        window.removeEventListener('keydown', keydown);
        window.removeEventListener('keyup', keyup);
        window.removeEventListener('blur', blur);
    };
}
