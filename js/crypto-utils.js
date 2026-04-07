// ============================================================
// ISO/IEC 27001 A.10 — Cryptography Utilities
// Barangay Sta. Lucia Management System
// ============================================================

// ── A.10.1.1 HTTPS Enforcement ──────────────────────────────
function enforceHTTPS() {
    if (location.protocol === 'http:' &&
        location.hostname !== 'localhost' &&
        location.hostname !== '127.0.0.1' &&
        !location.hostname.startsWith('192.168.')) {
        console.warn('[ISO A.10] Insecure HTTP connection detected. Redirecting to HTTPS.');
        location.replace('https://' + location.hostname + location.pathname + location.search);
    }
}

// ── A.10.1.2 Password Hashing (SHA-256) ─────────────────────
async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// ── A.10.1.3 AES-GCM Encryption for sensitive localStorage ──
const CRYPTO_KEY_NAME = 'brgy_enc_key_v1';

async function getOrCreateEncKey() {
    const stored = sessionStorage.getItem(CRYPTO_KEY_NAME);
    if (stored) {
        const rawKey = Uint8Array.from(atob(stored), c => c.charCodeAt(0));
        return crypto.subtle.importKey('raw', rawKey, 'AES-GCM', false, ['encrypt', 'decrypt']);
    }
    const key = await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt']);
    const exported = await crypto.subtle.exportKey('raw', key);
    const b64 = btoa(String.fromCharCode(...new Uint8Array(exported)));
    sessionStorage.setItem(CRYPTO_KEY_NAME, b64);
    return key;
}

async function encryptLocal(plaintext) {
    try {
        const key = await getOrCreateEncKey();
        const iv = crypto.getRandomValues(new Uint8Array(12));
        const encoded = new TextEncoder().encode(JSON.stringify(plaintext));
        const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, encoded);
        return JSON.stringify({
            iv: btoa(String.fromCharCode(...iv)),
            data: btoa(String.fromCharCode(...new Uint8Array(ciphertext)))
        });
    } catch (e) {
        console.error('[ISO A.10] Encryption failed:', e);
        return null;
    }
}

async function decryptLocal(encrypted) {
    try {
        const key = await getOrCreateEncKey();
        const { iv: ivB64, data: dataB64 } = JSON.parse(encrypted);
        const iv = Uint8Array.from(atob(ivB64), c => c.charCodeAt(0));
        const data = Uint8Array.from(atob(dataB64), c => c.charCodeAt(0));
        const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, data);
        return JSON.parse(new TextDecoder().decode(decrypted));
    } catch (e) {
        console.error('[ISO A.10] Decryption failed:', e);
        return null;
    }
}

// ── A.9.4.2 Admin Email OTP (MFA via Supabase Edge Function) ──
const SUPABASE_OTP_FUNCTION_URL = 'https://cojgsyrnexbwgsfttojq.supabase.co/functions/v1/send-otp';
const MFA_OTP_KEY = 'admin_mfa_otp';
const MFA_EXPIRY_MINUTES = 10;

async function sendAdminMFACode(email) {
    email = email.trim().toLowerCase();
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = Date.now() + MFA_EXPIRY_MINUTES * 60 * 1000;
    sessionStorage.setItem(MFA_OTP_KEY, JSON.stringify({ email, otp, expiry }));

    try {
        const res = await fetch(SUPABASE_OTP_FUNCTION_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ to_email: email, otp_code: otp })
        });
        const result = await res.json();
        if (!res.ok || result.error) {
            console.error('[MFA] Edge function error:', result);
            return { success: false, message: result.error || 'Failed to send verification code.' };
        }
        if (typeof logActivity === 'function') {
            await logActivity('Admin MFA Sent', `MFA code sent to ${email}`, 'info');
        }
        return { success: true, message: `A 6-digit code was sent to ${email}` };
    } catch (err) {
        console.error('[MFA] Network error:', err);
        return { success: false, message: 'Network error: ' + (err.message || err) };
    }
}

function verifyAdminMFACode(enteredCode) {
    const stored = sessionStorage.getItem(MFA_OTP_KEY);
    if (!stored) return { success: false, message: 'No active MFA session. Please log in again.' };
    const { otp, expiry } = JSON.parse(stored);
    if (Date.now() > expiry) {
        sessionStorage.removeItem(MFA_OTP_KEY);
        return { success: false, message: 'Code has expired. Please log in again to receive a new code.' };
    }
    if (enteredCode.trim() !== otp) {
        return { success: false, message: 'Incorrect code. Please check your email and try again.' };
    }
    sessionStorage.removeItem(MFA_OTP_KEY);
    sessionStorage.setItem('mfa_verified', 'true');
    sessionStorage.setItem('mfa_verified_at', Date.now().toString());
    return { success: true };
}

function isMFAVerified() {
    const verified = sessionStorage.getItem('mfa_verified');
    const verifiedAt = parseInt(sessionStorage.getItem('mfa_verified_at') || '0', 10);
    const SESSION_DURATION = 30 * 60 * 1000;
    if (!verified || Date.now() - verifiedAt > SESSION_DURATION) {
        sessionStorage.removeItem('mfa_verified');
        sessionStorage.removeItem('mfa_verified_at');
        return false;
    }
    return true;
}

function clearMFASession() {
    sessionStorage.removeItem('mfa_verified');
    sessionStorage.removeItem('mfa_verified_at');
    sessionStorage.removeItem(MFA_OTP_KEY);
}

// ── A.12.1 Inactivity Session Timeout ───────────────────────
let _inactivityTimer = null;
let _warningTimer = null;
const INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes
const INACTIVITY_WARNING_MS = 28 * 60 * 1000; // warn at 28 minutes

function resetInactivityTimer() {
    clearTimeout(_inactivityTimer);
    clearTimeout(_warningTimer);

    _warningTimer = setTimeout(() => {
        if (typeof showInactivityWarning === 'function') {
            showInactivityWarning();
        }
    }, INACTIVITY_WARNING_MS);

    _inactivityTimer = setTimeout(async () => {
        if (typeof logActivity === 'function') {
            await logActivity('Auto Logout', 'Admin session expired due to inactivity', 'warning');
        }
        clearMFASession();
        if (typeof logoutUser === 'function') {
            logoutUser();
        } else {
            localStorage.removeItem('currentUser');
            sessionStorage.removeItem('currentUser');
            window.location.href = 'login.html';
        }
    }, INACTIVITY_TIMEOUT_MS);
}

function initInactivityTimer() {
    const events = ['mousemove', 'keydown', 'click', 'touchstart', 'scroll'];
    events.forEach(evt => document.addEventListener(evt, resetInactivityTimer, { passive: true }));
    resetInactivityTimer();
}

// ── Run HTTPS check immediately ──────────────────────────────
enforceHTTPS();
