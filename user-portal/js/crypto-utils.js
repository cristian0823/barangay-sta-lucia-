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

// ── A.10.1.4 AES-GCM Deterministic Encryption for Database ──
// Note: Client-side encryption with a static key is for obfuscation/compliance
const DB_STATIC_KEY_B64 = "xV/fWkG3aYlM+tZz5O9jQ7uKqC1mE4rI0wA2bL8pXn0="; // 32-byte key in base64
// We use a fixed IV so the same plaintext always produces the same ciphertext.
// This allows querying the database via Supabase using the encrypted strings.
const FIXED_IV = new Uint8Array([12, 34, 56, 78, 90, 12, 34, 56, 78, 90, 12, 34]);

async function getStaticDbKey() {
    const rawKey = Uint8Array.from(atob(DB_STATIC_KEY_B64), c => c.charCodeAt(0));
    return crypto.subtle.importKey('raw', rawKey, 'AES-GCM', false, ['encrypt', 'decrypt']);
}

async function encryptData(plaintext) {
    if (!plaintext || typeof plaintext !== 'string') return plaintext;
    if (plaintext.startsWith('ENC:')) return plaintext;
    try {
        const key = await getStaticDbKey();
        const encoded = new TextEncoder().encode(plaintext);
        const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv: FIXED_IV }, key, encoded);
        const b64 = btoa(String.fromCharCode(...new Uint8Array(ciphertext)));
        return `ENC:${b64}`;
    } catch(e) {
        console.error("[ISO A.10] DB Encryption failed:", e);
        return plaintext;
    }
}

async function decryptData(ciphertext) {
    if (!ciphertext || typeof ciphertext !== 'string' || !ciphertext.startsWith('ENC:')) return ciphertext;
    try {
        const b64 = ciphertext.substring(4);
        const data = Uint8Array.from(atob(b64), c => c.charCodeAt(0));
        const key = await getStaticDbKey();
        const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: FIXED_IV }, key, data);
        return new TextDecoder().decode(decrypted);
    } catch(e) {
        console.error("[ISO A.10] DB Decryption failed:", e);
        return ciphertext;
    }
}

// ── A.9.4.2 Admin Email OTP (MFA via Supabase Auth) ─────────
const MFA_EMAIL_KEY = 'admin_mfa_email';

async function sendAdminMFACode(email) {
    email = email.trim().toLowerCase();
    sessionStorage.setItem(MFA_EMAIL_KEY, email);
    try {
        const { error } = await supabase.auth.signInWithOtp({
            email: email,
            options: { shouldCreateUser: false }
        });
        if (error) {
            console.error('[MFA] Supabase OTP error:', error);
            return { success: false, message: error.message };
        }
        if (typeof logActivity === 'function') {
            await logActivity('Admin MFA Sent', `MFA code sent to ${email}`, 'info');
        }
        return { success: true, message: `A 6-digit code was sent to ${email}` };
    } catch (err) {
        console.error('[MFA] Error:', err);
        return { success: false, message: 'Could not send OTP: ' + (err.message || err) };
    }
}

async function verifyAdminMFACode(enteredCode) {
    const email = sessionStorage.getItem(MFA_EMAIL_KEY);
    if (!email) return { success: false, message: 'No active MFA session. Please log in again.' };
    try {
        const { error } = await supabase.auth.verifyOtp({
            email: email,
            token: enteredCode.trim(),
            type: 'email'
        });
        if (error) {
            console.error('[MFA] Verify error:', error);
            return { success: false, message: 'Incorrect or expired code. Please try again.' };
        }
        await supabase.auth.signOut();
        sessionStorage.removeItem(MFA_EMAIL_KEY);
        sessionStorage.setItem('mfa_verified', 'true');
        sessionStorage.setItem('mfa_verified_at', Date.now().toString());
        return { success: true };
    } catch (err) {
        console.error('[MFA] Error:', err);
        return { success: false, message: 'Verification error: ' + (err.message || err) };
    }
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
    sessionStorage.removeItem(MFA_EMAIL_KEY);
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
