/*
 * Shadow Realm: The Lost Kingdom
 * Project-level AI acknowledgment: OpenAI ChatGPT and Codex supported
 * implementation, refinement and learning. The developer supplied game
 * ideas, requirements and design direction; no exact authorship split is claimed.
 */
import { showScreen } from '../ui/screens.js';
const $ = id => document.getElementById(id);

export function showLoginScreen() {
    $('loginForm').reset();
    $('registerForm').reset();
    $('otpForm').reset();
    $('loginForm').elements.password.type = 'password';
    showScreen('auth');
    $('loginForm').hidden = false;
    $('registerForm').hidden = true;
    $('otpForm').hidden = true;

}

export function showRegisterScreen() {
    showLoginScreen();
    $('loginForm').hidden = true;
    $('registerForm').hidden = false;
}

export function showOtpScreen() {
    showLoginScreen();
    $('loginForm').hidden = true;
    $('otpForm').hidden = false;
    $('otpForm').reset();
}

export function bindAuthentication({ post, notify, loadProfile, setAccountMode }) {
    $('loginTab').addEventListener('click', showLoginScreen);
    $('registerTab').addEventListener('click', showRegisterScreen);
    $('backToLogin').addEventListener('click', showLoginScreen);
    $('otpBackToLogin').addEventListener('click', showLoginScreen);
    $('registerLink').addEventListener('click', showRegisterScreen);
    $('showPassword').addEventListener('change', event => {
        $('loginForm').elements.password.type = event.target.checked ? 'text' : 'password';
    });

    async function submitForm(form, action) {
        const button = form.querySelector('button[type="submit"]');
        if (button.disabled) return;
        button.disabled = true;
        try { await action(); }
        catch (error) {
            if (error.pending) showOtpScreen();
            notify(error.message);
        } finally { button.disabled = false; }
    }

    $('registerForm').addEventListener('submit', event => {
        event.preventDefault();
        const form = event.target;
        if (form.elements.password.value !== form.elements.confirmPassword.value) {
            notify('Passwords must match.');
            return;
        }
        submitForm(form, async () => {
            const result = await post('/register', Object.fromEntries(new FormData(form)));
            form.reset();
            showOtpScreen();
            notify(result.message);
        });
    });

    $('loginForm').addEventListener('submit', event => {
        event.preventDefault();
        submitForm(event.target, async () => {
            await post('/login', Object.fromEntries(new FormData(event.target)));
            setAccountMode();
            event.target.reset();
            await loadProfile();
        });
    });

    $('otpForm').addEventListener('submit', event => {
        event.preventDefault();
        submitForm(event.target, async () => {
            const result = await post('/verify-otp', { otp: event.target.elements.otp.value });
            event.target.reset();
            showLoginScreen();
            notify(result.message);
        });
    });

    $('resendOtp').addEventListener('click', async () => {
        $('resendOtp').disabled = true;
        try { notify((await post('/resend-verification')).message); }
        catch (error) { notify(error.message); }
        finally { $('resendOtp').disabled = false; }
    });
}
