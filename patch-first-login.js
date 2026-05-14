const fs = require('fs');
let c = fs.readFileSync('user-portal/setup-totp.html', 'utf8').replace(/\r\n/g, '\n');

// ─── 1. Add step0 password panel before step1 ─────────────────────────────
const OLD_STEP1_START = `        <!-- Step 1: Scan QR Code -->
        <div id="step1">`;

const NEW_STEP0_AND_STEP1 = `        <!-- Step 0: Set Password (first login only) -->
        <div id="step0" style="display:none;">
            <p style="font-size:14px;color:#374151;margin-bottom:20px;line-height:1.6;">
                Welcome! Your account was created by the barangay admin.<br>
                Please set a password before continuing.
            </p>
            <div style="margin-bottom:14px;">
                <label style="display:block;font-size:12px;font-weight:700;color:#374151;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:6px;">New Password</label>
                <input type="password" id="firstPwA" placeholder="At least 8 characters" autocomplete="new-password"
                    style="width:100%;padding:11px 14px;border:1.5px solid #D1D5DB;border-radius:10px;font-size:14px;font-family:inherit;outline:none;box-sizing:border-box;"
                    onfocus="this.style.borderColor='#059669'" onblur="this.style.borderColor='#D1D5DB'">
            </div>
            <div style="margin-bottom:18px;">
                <label style="display:block;font-size:12px;font-weight:700;color:#374151;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:6px;">Confirm Password</label>
                <input type="password" id="firstPwB" placeholder="Repeat your password" autocomplete="new-password"
                    style="width:100%;padding:11px 14px;border:1.5px solid #D1D5DB;border-radius:10px;font-size:14px;font-family:inherit;outline:none;box-sizing:border-box;"
                    onfocus="this.style.borderColor='#059669'" onblur="this.style.borderColor='#D1D5DB'">
            </div>
            <div id="firstPwError" style="display:none;background:#FEE2E2;border:1px solid #FECACA;border-radius:8px;padding:10px 14px;font-size:13px;color:#991b1b;margin-bottom:14px;"></div>
            <button onclick="submitFirstLoginPassword()"
                style="width:100%;padding:13px;border-radius:10px;border:none;font-size:14px;font-weight:700;font-family:inherit;cursor:pointer;background:#059669;color:#fff;transition:background 0.15s;"
                onmouseover="this.style.background='#047857'" onmouseout="this.style.background='#059669'">
                Set Password &amp; Continue
            </button>
        </div>

        <!-- Step 1: Scan QR Code -->
        <div id="step1">`;

let idx = c.indexOf(OLD_STEP1_START);
if (idx === -1) { console.log('MISS step1 start'); process.exit(1); }
c = c.substring(0, idx) + NEW_STEP0_AND_STEP1 + c.substring(idx + OLD_STEP1_START.length);
console.log('OK step0 password panel');

// ─── 2. Update DOMContentLoaded to show step0 for first-login ─────────────
const OLD_INIT = `            if (pendingRaw) {
                pendingUser = JSON.parse(pendingRaw);
            } else if (currentUser) {
                pendingUser = currentUser;
            } else {
                window.location.href = 'login.html';
                return;
            }

            // 2FA setup is now MANDATORY for users redirected from login
            // The skip button is hidden for all cases — no skipping allowed
            // (admins set up 2FA voluntarily from admin-settings.html)

            await initSetup();
            startTimer();`;

const NEW_INIT = `            if (pendingRaw) {
                pendingUser = JSON.parse(pendingRaw);
            } else if (currentUser) {
                pendingUser = currentUser;
            } else {
                window.location.href = 'login.html';
                return;
            }

            // First-login: show password step before TOTP
            const isFirstLogin = sessionStorage.getItem('totp_first_login') === 'true';
            if (isFirstLogin) {
                document.getElementById('step0').style.display = 'block';
                document.getElementById('step1').style.display = 'none';
                // Update subtitle
                var sub = document.querySelector('.subtitle');
                if (sub) sub.textContent = 'Step 1 of 3: Set your account password to secure your access.';
                return; // TOTP init happens after password is set
            }

            await initSetup();
            startTimer();`;

idx = c.indexOf(OLD_INIT);
if (idx === -1) { console.log('MISS DOMContentLoaded init'); process.exit(1); }
c = c.substring(0, idx) + NEW_INIT + c.substring(idx + OLD_INIT.length);
console.log('OK DOMContentLoaded first-login check');

// ─── 3. Add submitFirstLoginPassword function before initSetup ─────────────
const OLD_INIT_SETUP = `        // ── Generate Secret & QR Code ────────────────────────────
        async function initSetup() {`;

const NEW_PW_FN = `        // ── First-Login Password Setup ──────────────────────────
        async function submitFirstLoginPassword() {
            const a = document.getElementById('firstPwA').value;
            const b = document.getElementById('firstPwB').value;
            const errEl = document.getElementById('firstPwError');
            errEl.style.display = 'none';
            if (!a || a.length < 8) { errEl.textContent = 'Password must be at least 8 characters.'; errEl.style.display = 'block'; return; }
            if (a !== b) { errEl.textContent = 'Passwords do not match.'; errEl.style.display = 'block'; return; }
            try {
                const hashed = await hashPassword(a);
                if (window.supabase && pendingUser && pendingUser.id) {
                    const { error } = await window.supabase.from('users')
                        .update({ password: hashed })
                        .eq('id', pendingUser.id);
                    if (error) { errEl.textContent = 'Could not save password: ' + error.message; errEl.style.display = 'block'; return; }
                }
                // Update pending user object
                pendingUser.password = hashed;
                sessionStorage.setItem('totp_pending_user', JSON.stringify(pendingUser));
                sessionStorage.removeItem('totp_first_login');
                // Show TOTP step
                document.getElementById('step0').style.display = 'none';
                document.getElementById('step1').style.display = 'block';
                var sub = document.querySelector('.subtitle');
                if (sub) sub.textContent = 'Step 2 of 3: Link your Google Authenticator app for two-factor authentication.';
                await initSetup();
                startTimer();
            } catch (e) { errEl.textContent = 'Error: ' + e.message; errEl.style.display = 'block'; }
        }

        // ── Generate Secret & QR Code ────────────────────────────
        async function initSetup() {`;

idx = c.indexOf(OLD_INIT_SETUP);
if (idx === -1) { console.log('MISS initSetup function'); process.exit(1); }
c = c.substring(0, idx) + NEW_PW_FN + c.substring(idx + OLD_INIT_SETUP.length);
console.log('OK submitFirstLoginPassword function');

fs.writeFileSync('user-portal/setup-totp.html', c);
console.log('setup-totp.html saved');
