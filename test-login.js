
    const SECURITY = { maxAttempts: 5, lockoutDuration: 15 * 60 * 1000 };

    function generateCSRFToken() {
        const token = crypto.randomUUID();
        document.getElementById('csrfToken').value = token;
        sessionStorage.setItem('csrfToken', token);
    }

    function sanitizeInput(input) {
        const div = document.createElement('div');
        div.textContent = input;
        return div.innerHTML;
    }

    function validateUsername(username) {
        return /^[a-zA-Z0-9_]{3,50}$/.test(username);
    }

    function getLoginAttempts() {
        const a = localStorage.getItem('loginAttempts');
        return a ? JSON.parse(a) : { count: 0, lockedUntil: null, username: '' };
    }

    function saveLoginAttempts(a) { localStorage.setItem('loginAttempts', JSON.stringify(a)); }

    function updateAttemptsWarning() {
        const a = getLoginAttempts();
        const lock = document.getElementById('lockoutWarning');
        const btn  = document.getElementById('loginBtn');
        if (a.lockedUntil && Date.now() < a.lockedUntil) {
            lock.classList.remove('hidden');
            btn.disabled = true; btn.textContent = 'Account Locked';
            return true;
        }
        lock.classList.add('hidden');
        btn.disabled = false; btn.textContent = 'Sign In';
        return false;
    }

    function resetLoginAttempts() { saveLoginAttempts({ count: 0, lockedUntil: null, username: '' }); updateAttemptsWarning(); }

    function recordFailedAttempt(username) {
        const a = getLoginAttempts();
        if (a.username !== username) { a.count = 0; a.username = username; }
        a.count++;
        if (a.count >= SECURITY.maxAttempts) a.lockedUntil = Date.now() + SECURITY.lockoutDuration;
        saveLoginAttempts(a); updateAttemptsWarning();
        if (typeof trackFailedLogin === 'function') trackFailedLogin(username);
    }

    function showToast(message, type = 'success') {
        const t = document.getElementById('toast');
        t.className = type; t.textContent = message;
        t.style.transform = 'translateY(0)';
        setTimeout(() => { t.style.transform = 'translateY(80px)'; }, 3000);
    }

    document.addEventListener('DOMContentLoaded', function () {
        generateCSRFToken();
        updateAttemptsWarning();

        document.getElementById('username').addEventListener('input', function (e) {
            e.target.value = e.target.value.replace(/[^a-zA-Z0-9_\-@.]/g, '');
        });
        const params = new URLSearchParams(window.location.search);
        if (params.get('suspended') === '1') {
            const until = params.get('until') || 'a future date';
            showToast(`Your account is suspended until ${until}.`, 'error');
        }
        const user = getCurrentUser();
        if (user) redirectToDashboard();
    });

    // -- TOTP State --
    let totpPendingUser  = null;
    let totpRememberMe   = false;
    let totpTimerInterval = null;

    function startTOTPTimer() {
        clearInterval(totpTimerInterval);
        totpTimerInterval = setInterval(() => {
            const remaining = 30 - (Math.floor(Date.now() / 1000) % 30);
            const el = document.getElementById('totpCountdown');
            if (el) el.textContent = remaining;
        }, 1000);
    }

    function showTOTPPanel(user, rememberMe) {
        totpPendingUser = user;
        totpRememberMe  = rememberMe;
        document.getElementById('loginForm').style.display = 'none';
        document.getElementById('totpPanel').style.display = 'block';
        clearTOTPDigits();
        startTOTPTimer();
        document.getElementById('td0').focus();
    }

    function cancelTOTP() {
        clearInterval(totpTimerInterval);
        totpPendingUser = null;
        document.getElementById('loginForm').style.display = 'block';
        document.getElementById('totpPanel').style.display = 'none';
        document.getElementById('loginBtn').disabled = false;
        document.getElementById('loginBtn').textContent = 'Sign In';
    }

    function getTOTPDigits() {
        return [0,1,2,3,4,5].map(i => document.getElementById('td' + i).value).join('');
    }
    function clearTOTPDigits() {
        for (let i = 0; i < 6; i++) {
            document.getElementById('td' + i).value = '';
            document.getElementById('td' + i).classList.remove('filled');
        }
        document.getElementById('totpError').classList.add('hidden');
    }

    document.addEventListener('DOMContentLoaded', () => {
        for (let i = 0; i < 6; i++) {
            const el = document.getElementById('td' + i);
            el.addEventListener('input', function () {
                this.value = this.value.replace(/\D/g, '').slice(-1);
                this.classList.toggle('filled', !!this.value);
                if (this.value && i < 5) document.getElementById('td' + (i + 1)).focus();
                if (getTOTPDigits().length === 6) submitTOTPCode();
            });
            el.addEventListener('keydown', function (e) {
                if (e.key === 'Backspace' && !this.value && i > 0)
                    document.getElementById('td' + (i - 1)).focus();
            });
            el.addEventListener('paste', function (e) {
                e.preventDefault();
                const text = (e.clipboardData || window.clipboardData).getData('text').replace(/\D/g, '').slice(0, 6);
                for (let j = 0; j < 6; j++) {
                    const d = document.getElementById('td' + j);
                    d.value = text[j] || '';
                    d.classList.toggle('filled', !!d.value);
                }
                if (text.length === 6) submitTOTPCode();
            });
        }
    });

    async function submitTOTPCode() {
        if (!totpPendingUser) return;
        const code = getTOTPDigits();
        if (code.length !== 6) return;

        const btn = document.getElementById('totpVerifyBtn');
        btn.disabled = true;
        btn.textContent = 'Verifying...';
        document.getElementById('totpError').classList.add('hidden');

        let totpSecret = totpPendingUser.totp_secret;
        if (!totpSecret) {
            const info = await fetchUserTOTPInfo(totpPendingUser.id);
            totpSecret = info.totp_secret;
        }
        const valid = totpSecret ? await verifyTOTPCode(totpSecret, code) : false;

        if (valid) {
            clearInterval(totpTimerInterval);
            showToast('Login successful! Redirecting...', 'success');
            resetLoginAttempts();
            if (totpRememberMe) {
                localStorage.setItem('currentUser', JSON.stringify(totpPendingUser));
            } else {
                sessionStorage.setItem('currentUser', JSON.stringify(totpPendingUser));
            }
            if (typeof window.logSecurity === 'function') {
                window.logSecurity('Login Success', 'Google Auth', 'info', 'Login successful.', totpPendingUser.username);
            }
            setTimeout(() => redirectToDashboard(), 1200);
        } else {
            document.getElementById('totpError').classList.remove('hidden');
            btn.disabled = false;
            btn.textContent = 'Verify Code';
            clearTOTPDigits();
            document.getElementById('td0').focus();
        }
    }

    // -- Email OTP State --
    let emailOTPPendingUser = null;
    let emailOTPRememberMe  = false;
    let emailOTPAddress     = null;

    function maskEmail(email) {
        if (!email) return 'your email';
        const [local, domain] = email.split('@');
        if (!domain) return email;
        const visible = local.length > 2 ? local.substring(0, 2) + '***' : local[0] + '***';
        return visible + '@' + domain;
    }

    async function sendEmailOTP(email) {
        try {
            const { error } = await window.supabase.auth.signInWithOtp({
                email: email,
                options: { shouldCreateUser: true }
            });
            if (error) { showToast('Could not send code: ' + error.message, 'error'); return false; }
            return true;
        } catch (e) { console.error('sendEmailOTP:', e); return false; }
    }

    async function showEmailOTPPanel(user, rememberMe) {
        emailOTPPendingUser = user;
        emailOTPRememberMe  = rememberMe;
        emailOTPAddress     = user.email;
        document.getElementById('loginForm').style.display = 'none';
        document.getElementById('emailOTPPanel').style.display = 'block';
        document.getElementById('emailOTPAddress').textContent = maskEmail(emailOTPAddress);
        clearEmailOTPDigits();
        const ok = await sendEmailOTP(emailOTPAddress);
        if (ok) showToast('Code sent! Check your inbox.', 'success');
        document.getElementById('ed0').focus();
    }

    async function resendEmailOTP() {
        const btn = document.getElementById('resendOTPBtn');
        btn.disabled = true; btn.textContent = 'Sending...';
        const ok = await sendEmailOTP(emailOTPAddress);
        if (ok) showToast('Code resent! Check your inbox.', 'success');
        setTimeout(() => { btn.disabled = false; btn.textContent = 'Resend Code'; }, 30000);
    }

    function getEmailOTPDigits() {
        return [0,1,2,3,4,5].map(i => document.getElementById('ed' + i).value).join('');
    }
    function clearEmailOTPDigits() {
        for (let i = 0; i < 6; i++) {
            document.getElementById('ed' + i).value = '';
            document.getElementById('ed' + i).classList.remove('filled');
        }
        document.getElementById('emailOTPError').classList.add('hidden');
    }

    async function submitEmailOTPCode() {
        if (!emailOTPPendingUser) return;
        const code = getEmailOTPDigits();
        if (code.length !== 6) return;
        const btn = document.getElementById('emailOTPVerifyBtn');
        btn.disabled = true; btn.textContent = 'Verifying...';
        document.getElementById('emailOTPError').classList.add('hidden');
        try {
            const { error } = await window.supabase.auth.verifyOtp({
                email: emailOTPAddress, token: code, type: 'email'
            });
            if (error) {
                document.getElementById('emailOTPError').classList.remove('hidden');
                btn.disabled = false; btn.textContent = 'Verify Code';
                clearEmailOTPDigits();
                document.getElementById('ed0').focus();
                return;
            }
            await window.supabase.auth.signOut();
            showToast('Login successful! Redirecting...', 'success');
            resetLoginAttempts();
            if (emailOTPRememberMe) {
                localStorage.setItem('currentUser', JSON.stringify(emailOTPPendingUser));
            } else {
                sessionStorage.setItem('currentUser', JSON.stringify(emailOTPPendingUser));
            }
            if (typeof window.logSecurity === 'function') {
                window.logSecurity('Login Success', 'Email OTP', 'info', 'Login successful.', emailOTPPendingUser.username);
            }
            setTimeout(() => redirectToDashboard(), 1200);
        } catch (e) {
            console.error('submitEmailOTPCode:', e);
            btn.disabled = false; btn.textContent = 'Verify Code';
        }
    }

    function cancelEmailOTP() {
        emailOTPPendingUser = null;
        document.getElementById('loginForm').style.display = 'block';
        document.getElementById('emailOTPPanel').style.display = 'none';
        document.getElementById('loginBtn').disabled = false;
        document.getElementById('loginBtn').textContent = 'Sign In';
    }

    document.addEventListener('DOMContentLoaded', () => {
        for (let i = 0; i < 6; i++) {
            const el = document.getElementById('ed' + i);
            el.addEventListener('input', function () {
                this.value = this.value.replace(/\D/g, '').slice(-1);
                this.classList.toggle('filled', !!this.value);
                if (this.value && i < 5) document.getElementById('ed' + (i + 1)).focus();
                if (getEmailOTPDigits().length === 6) submitEmailOTPCode();
            });
            el.addEventListener('keydown', function (e) {
                if (e.key === 'Backspace' && !this.value && i > 0) document.getElementById('ed' + (i - 1)).focus();
            });
            el.addEventListener('paste', function (e) {
                e.preventDefault();
                const text = (e.clipboardData || window.clipboardData).getData('text').replace(/\D/g, '').slice(0, 6);
                for (let j = 0; j < 6; j++) {
                    const d = document.getElementById('ed' + j);
                    d.value = text[j] || '';
                    d.classList.toggle('filled', !!d.value);
                }
                if (text.length === 6) submitEmailOTPCode();
            });
        }
    });

    function togglePassword(id, btn) {
        const input = document.getElementById(id);
        const isPassword = input.type === 'password';
        input.type = isPassword ? 'text' : 'password';
        const eyeOn  = btn.querySelector('.icon-eye');
        const eyeOff = btn.querySelector('.icon-eye-off');
        if (eyeOn)  eyeOn.style.display  = isPassword ? 'none' : '';
        if (eyeOff) eyeOff.style.display = isPassword ? '' : 'none';
    }

    // ── LOGIN FORM SUBMIT HANDLER ─────────────────────────────────────────────
    document.getElementById('loginForm').addEventListener('submit', async function (e) {
        e.preventDefault();
        try {
            if (updateAttemptsWarning()) { showToast('Too many failed attempts. Please wait.', 'error'); return; }
            const username   = sanitizeInput(document.getElementById('username').value.trim());
            const rememberMe = document.getElementById('rememberMe') ? document.getElementById('rememberMe').checked : false;

            if (!username) { showToast('Please enter your Barangay ID or email.', 'error'); return; }

            const btn = document.getElementById('loginBtn');
            btn.disabled = true; btn.textContent = 'Signing in...';

            // ── HARD BYPASS: testuser goes straight to dashboard instantly ──
            if (username === 'testuser') {
                const testSession = {
                    id: 'test-user-001',
                    username: 'testuser',
                    fullName: 'Test User Account',
                    full_name: 'Test User Account',
                    role: 'user',
                    avatar: 'T',
                    email: 'testuser@barangay.gov',
                    loginTime: new Date().toISOString(),
                    totp_bypass: true
                };
                if (rememberMe) {
                    localStorage.setItem('currentUser', JSON.stringify(testSession));
                } else {
                    sessionStorage.setItem('currentUser', JSON.stringify(testSession));
                }
                showToast('✅ Login successful! Redirecting...', 'success');
                setTimeout(() => redirectToDashboard(), 1000);
                return;
            }
            // ── End bypass ─────────────────────────────────────────────────────

            // Normal resident login (passwordless)
            const result = await loginUser(username, '', rememberMe, { deferSession: true });

            btn.disabled = false; btn.textContent = 'Sign In';

            if (result.success) {
                resetLoginAttempts();

                // Check 2FA status
                let totpEnabled = false;
                let totpSecret  = null;
                let otpMethod   = null;
                let userEmail   = result.user.email || null;
                try {
                    if (window.supabase) {
                        const { data: totpRow } = await window.supabase
                            .from('users').select('totp_secret, totp_enabled, otp_method, email, id')
                            .eq('username', result.user.username).maybeSingle();
                        if (totpRow) {
                            totpEnabled = !!totpRow.totp_enabled;
                            totpSecret  = totpRow.totp_secret || null;
                            otpMethod   = totpRow.otp_method || null;
                            userEmail   = totpRow.email || userEmail;
                        }
                    }
                } catch(e) {
                    totpEnabled = !!result.user.totp_enabled;
                    totpSecret  = result.user.totp_secret || null;
                }

                if (totpEnabled) {
                    if (otpMethod === 'email') {
                        result.user.otp_method = 'email';
                        result.user.email = userEmail;
                        showEmailOTPPanel(result.user, rememberMe);
                        return;
                    }
                    result.user.totp_secret  = totpSecret;
                    result.user.totp_enabled = true;
                    showTOTPPanel(result.user, rememberMe);
                    return;
                }

                // 2FA not set up — mandatory setup for all residents
                const isFirstLogin = !result.user.password;
                sessionStorage.setItem('totp_pending_user', JSON.stringify(result.user));
                sessionStorage.setItem('totp_remember_me', rememberMe ? 'true' : 'false');
                if (isFirstLogin) {
                    sessionStorage.setItem('totp_first_login', 'true');
                    showToast('Welcome! Please set up your account to continue.', 'success');
                } else {
                    showToast('Please set up two-factor authentication to continue.', 'success');
                }
                setTimeout(() => window.location.href = 'setup-totp.html', 1200);
            } else {
                recordFailedAttempt(username);
                showToast(result.message || 'Barangay ID not found. Please contact the Barangay Office.', 'error');
            }
        } catch (err) {
            console.error('Login error:', err);
            document.getElementById('loginBtn').disabled = false;
            document.getElementById('loginBtn').textContent = 'Sign In';
            showToast('An error occurred. Please try again.', 'error');
        }
    });

