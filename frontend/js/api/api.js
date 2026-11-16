const endpoints = {
    '/verify-otp': 'auth/verify.php',
    '/register': 'auth/register.php',
    '/login': 'auth/login.php',
    '/logout': 'auth/logout.php',
    '/session': 'auth/session.php',
    '/me': 'player/profile.php',
    '/profile': 'player/profile.php',
    '/history': 'game/history.php',
    '/leaderboard': 'game/leaderboard.php',
    '/resend-verification': 'auth/resend.php',
    '/progress': 'game/progress.php',
    '/rune': 'api/fish-api.php',
    '/rune/check': 'api/fish-api.php'
};
let csrf = '';
export async function api(path, options = {}) {
    const key = path.split('?')[0];
    const endpoint = endpoints[key];
    if (!endpoint) throw new Error('Unknown API endpoint');
    if (options.method === 'POST' && !csrf) await api('/session');
    const url = new URL('../../../backend/' + endpoint, import.meta.url);
    url.search = path.includes('?') ? path.slice(path.indexOf('?')) : '';
    const response = await fetch(url, {
        ...options,
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrf }
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
        const error = new Error(data.error || 'Request failed');
        error.pending = Boolean(data.pending);
        throw error;
    }
    if (data.csrf) csrf = data.csrf;
    if (key === '/logout') csrf = '';
    return data;
}
export function post(path, data = {}) {
    return api(path, { method: 'POST', body: JSON.stringify(data) });
}
