// ============================================================
// totp-handler.js — Google Authenticator (TOTP) Utility
// Uses the otpauth CDN library (RFC 6238 compliant)
// ============================================================

// Dynamically load the otpauth library
async function loadOTPAuthLib() {
    if (window.OTPAuth) return window.OTPAuth;
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/otpauth@9/dist/otpauth.umd.min.js';
        script.onload = () => resolve(window.OTPAuth);
        script.onerror = () => reject(new Error('Failed to load otpauth library'));
        document.head.appendChild(script);
    });
}

// Generate a cryptographically secure random Base32 secret (160-bit / 32 chars)
function generateTOTPSecret() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    // Generate 32 characters (160 bits of entropy) perfectly aligning to 20 Bytes.
    const randomBytes = crypto.getRandomValues(new Uint8Array(32));
    return Array.from(randomBytes)
        .map(b => chars[b % 32])
        .join('');
}

// Build the otpauth:// URI for QR code scanning
function buildOTPAuthURI(username, secret, issuer = 'Barangay Sta. Lucia') {
    // We remove any colons in the issuer to prevent parsing bugs in Authenticator
    const safeIssuer = issuer.replace(/:/g, '');
    return `otpauth://totp/${encodeURIComponent(safeIssuer)}:${encodeURIComponent(username)}?secret=${secret}&issuer=${encodeURIComponent(safeIssuer)}&algorithm=SHA1&digits=6&period=30`;
}

// Verify a 6-digit TOTP code against a secret
// Allows ±1 time step (30s window) for clock drift
async function verifyTOTPCode(secret, token) {
    try {
        const OTPAuth = await loadOTPAuthLib();
        const totp = new OTPAuth.TOTP({
            issuer: 'Barangay Sta. Lucia',
            algorithm: 'SHA1',
            digits: 6,
            period: 30,
            secret: OTPAuth.Secret.fromBase32(secret)
        });
        const delta = totp.validate({ token: String(token).replace(/\s/g, ''), window: 1 });
        return delta !== null;
    } catch (err) {
        console.error('[TOTP] Verification error:', err);
        return false;
    }
}

// Generate current TOTP code (for testing only)
async function generateCurrentTOTPCode(secret) {
    try {
        const OTPAuth = await loadOTPAuthLib();
        const totp = new OTPAuth.TOTP({
            issuer: 'Barangay Sta. Lucia',
            algorithm: 'SHA1',
            digits: 6,
            period: 30,
            secret: OTPAuth.Secret.fromBase32(secret)
        });
        return totp.generate();
    } catch (err) {
        console.error('[TOTP] Generate error:', err);
        return null;
    }
}

// Save TOTP secret to Supabase for a given user ID
async function saveTOTPSecretToDB(userId, secret) {
    try {
        const supabaseAvailable = await isSupabaseAvailable();
        if (supabaseAvailable) {
            const { error } = await supabase
                .from('users')
                .update({ totp_secret: secret, totp_enabled: true })
                .eq('id', userId);
            if (error) throw error;
        } else {
            // Local fallback
            const users = JSON.parse(localStorage.getItem('barangay_local_users') || '[]');
            const idx = users.findIndex(u => u.id === userId);
            if (idx !== -1) {
                users[idx].totp_secret = secret;
                users[idx].totp_enabled = true;
                localStorage.setItem('barangay_local_users', JSON.stringify(users));
            }
        }
        // Update session cache
        const sessionKey = sessionStorage.getItem('currentUser') ? 'sessionStorage' : 'localStorage';
        const raw = (sessionKey === 'sessionStorage' ? sessionStorage : localStorage).getItem('currentUser');
        if (raw) {
            const parsed = JSON.parse(raw);
            parsed.totp_enabled = true;
            parsed.totp_secret = secret;
            (sessionKey === 'sessionStorage' ? sessionStorage : localStorage).setItem('currentUser', JSON.stringify(parsed));
        }
        return { success: true };
    } catch (err) {
        console.error('[TOTP] Save error:', err);
        return { success: false, message: err.message };
    }
}

// Disable TOTP for a given user ID
async function disableTOTPInDB(userId) {
    try {
        const supabaseAvailable = await isSupabaseAvailable();
        if (supabaseAvailable) {
            const { error } = await supabase
                .from('users')
                .update({ totp_secret: null, totp_enabled: false })
                .eq('id', userId);
            if (error) throw error;
        } else {
            const users = JSON.parse(localStorage.getItem('barangay_local_users') || '[]');
            const idx = users.findIndex(u => u.id === userId);
            if (idx !== -1) {
                users[idx].totp_secret = null;
                users[idx].totp_enabled = false;
                localStorage.setItem('barangay_local_users', JSON.stringify(users));
            }
        }
        // Update session cache
        const sessionKey = sessionStorage.getItem('currentUser') ? 'sessionStorage' : 'localStorage';
        const raw = (sessionKey === 'sessionStorage' ? sessionStorage : localStorage).getItem('currentUser');
        if (raw) {
            const parsed = JSON.parse(raw);
            parsed.totp_enabled = false;
            parsed.totp_secret = null;
            (sessionKey === 'sessionStorage' ? sessionStorage : localStorage).setItem('currentUser', JSON.stringify(parsed));
        }
        return { success: true };
    } catch (err) {
        console.error('[TOTP] Disable error:', err);
        return { success: false, message: err.message };
    }
}

// Fetch TOTP info for a user from Supabase
async function fetchUserTOTPInfo(userId) {
    try {
        const supabaseAvailable = await isSupabaseAvailable();
        if (supabaseAvailable) {
            const { data, error } = await supabase
                .from('users')
                .select('totp_secret, totp_enabled')
                .eq('id', userId)
                .maybeSingle();
            if (error) throw error;
            return data || { totp_secret: null, totp_enabled: false };
        } else {
            const users = JSON.parse(localStorage.getItem('barangay_local_users') || '[]');
            const user = users.find(u => u.id === userId);
            return user ? { totp_secret: user.totp_secret || null, totp_enabled: !!user.totp_enabled } : { totp_secret: null, totp_enabled: false };
        }
    } catch (err) {
        console.error('[TOTP] Fetch error:', err);
        return { totp_secret: null, totp_enabled: false };
    }
}
