
        let currentSecret  = '';
        let pendingUser    = null;
        let timerInterval  = null;
        let selectedMethod = null; // 'totp' or 'email'

        // ── Auth Guard ───────────────────────────────────────────
        document.addEventListener('DOMContentLoaded', async () => {
            const pendingRaw  = sessionStorage.getItem('totp_pending_user');
            const currentUser = getCurrentUser();

            if (pendingRaw) {
                pendingUser = JSON.parse(pendingRaw);
            } else if (currentUser) {
                pendingUser = currentUser;
            } else {
                window.location.href = 'login.html';
                return;
            }

            // First-login: show password step before method choice
            const isFirstLogin = sessionStorage.getItem('totp_first_login') === 'true';
            if (isFirstLogin) {
                document.getElementById('stepChoice').style.display = 'none';
                document.getElementById('step0').style.display = 'block';
                document.getElementById('step1').style.display = 'none';
                document.getElementById('setupSubtitle').textContent = 'Step 1 of 3: Set your account password to secure your access.';
                return;
            }
            // Show method choice by default (step0, step1 hidden)
            document.getElementById('step0').style.display = 'none';
            document.getElementById('step1').style.display = 'none';
        });

        // ── Method Selection ─────────────────────────────────────
        async function chooseMethod(method) {
            selectedMethod = method;
            document.getElementById('stepChoice').style.display = 'none';
            document.getElementById('stepsBar').style.display = 'flex';
            if (method === 'email') {
                document.getElementById('setupTitle').textContent = 'Email Verification Setup';
                document.getElementById('setupSubtitle').textContent = 'We will send a one-time code to your email each time you log in.';
                const email = pendingUser.email || '';
                document.getElementById('emailOTPDisplay').textContent = email || '(no email on file — contact barangay office)';
                if (!email) {
                    document.getElementById('emailSendError').textContent = 'No email address found on your account. Please contact the barangay office.';
                    document.getElementById('emailSendError').style.display = 'block';
                    document.getElementById('sendOTPBtn').disabled = true;
                }
                document.getElementById('stepEmailSend').style.display = 'block';
                setStepState(1);
            } else {
                document.getElementById('setupTitle').textContent = 'Setup Google Authenticator';
                document.getElementById('setupSubtitle').textContent = 'Link your Google Authenticator app. This only takes a minute.';
                document.getElementById('step1').style.display = 'block';
                setStepState(1);
                await initSetup();
                startTimer();
            }
        }

        function backToChoice() {
            selectedMethod = null;
            document.getElementById('stepEmailSend').style.display = 'none';
            document.getElementById('stepEmailVerify').style.display = 'none';
            document.getElementById('step1').style.display = 'none';
            document.getElementById('stepsBar').style.display = 'none';
            document.getElementById('stepChoice').style.display = 'block';
            document.getElementById('setupTitle').textContent = 'Secure Your Account';
            document.getElementById('setupSubtitle').textContent = 'This is a required security step. Choose how you want to verify your identity every time you log in.';
        }

        // ── Email OTP Setup ──────────────────────────────────────
        async function sendEmailOTPCode() {
            const btn = document.getElementById('sendOTPBtn');
            btn.disabled = true; btn.textContent = 'Sending...';
            document.getElementById('emailSendError').style.display = 'none';
            try {
                const { error } = await window.supabase.auth.signInWithOtp({
                    email: pendingUser.email,
                    options: { shouldCreateUser: true }
                });
                if (error) {
                    document.getElementById('emailSendError').textContent = 'Could not send code: ' + error.message;
                    document.getElementById('emailSendError').style.display = 'block';
                    btn.disabled = false; btn.textContent = 'Send Code to My Email';
                    return;
                }
                // Advance to verify step
                document.getElementById('stepEmailSend').style.display = 'none';
                document.getElementById('emailVerifyHint').textContent = 'Sent to ' + pendingUser.email;
                document.getElementById('stepEmailVerify').style.display = 'block';
                setStepState(2);
                document.getElementById('e0').focus();
            } catch (e) {
                document.getElementById('emailSendError').textContent = 'Error: ' + e.message;
                document.getElementById('emailSendError').style.display = 'block';
                btn.disabled = false; btn.textContent = 'Send Code to My Email';
            }
        }

        function backToEmailSend() {
            document.getElementById('stepEmailVerify').style.display = 'none';
            clearEmailSetupDigits();
            document.getElementById('stepEmailSend').style.display = 'block';
            document.getElementById('sendOTPBtn').disabled = false;
            document.getElementById('sendOTPBtn').textContent = 'Send Code to My Email';
            setStepState(1);
        }

        function getEmailSetupDigits() {
            return [0,1,2,3,4,5].map(i => document.getElementById('e' + i).value).join('');
        }
        function clearEmailSetupDigits() {
            for (let i = 0; i < 6; i++) {
                document.getElementById('e' + i).value = '';
                document.getElementById('e' + i).classList.remove('filled');
            }
            document.getElementById('emailVerifyError').style.display = 'none';
            document.getElementById('emailVerifySuccess').style.display = 'none';
        }

        document.addEventListener('DOMContentLoaded', () => {
            for (let i = 0; i < 6; i++) {
                const el = document.getElementById('e' + i);
                el.addEventListener('input', function () {
                    this.value = this.value.replace(/\D/g, '').slice(-1);
                    this.classList.toggle('filled', !!this.value);
                    if (this.value && i < 5) document.getElementById('e' + (i + 1)).focus();
                    if (getEmailSetupDigits().length === 6) verifyEmailOTPCode();
                });
                el.addEventListener('keydown', function (e) {
                    if (e.key === 'Backspace' && !this.value && i > 0) document.getElementById('e' + (i - 1)).focus();
                });
                el.addEventListener('paste', function (e) {
                    e.preventDefault();
                    const text = (e.clipboardData || window.clipboardData).getData('text').replace(/\D/g, '').slice(0, 6);
                    for (let j = 0; j < 6; j++) {
                        const d = document.getElementById('e' + j);
                        d.value = text[j] || '';
                        d.classList.toggle('filled', !!d.value);
                    }
                    if (text.length === 6) verifyEmailOTPCode();
                });
            }
        });

        async function verifyEmailOTPCode() {
            const code = getEmailSetupDigits();
            if (code.length !== 6) return;
            const btn = document.getElementById('emailVerifyBtn');
            btn.disabled = true; btn.textContent = 'Verifying...';
            document.getElementById('emailVerifyError').style.display = 'none';
            document.getElementById('emailVerifySuccess').style.display = 'none';
            try {
                const { error } = await window.supabase.auth.verifyOtp({
                    email: pendingUser.email, token: code, type: 'email'
                });
                if (error) {
                    document.getElementById('emailVerifyError').style.display = 'block';
                    clearEmailSetupDigits();
                    btn.disabled = false; btn.textContent = 'Verify & Enable 2FA';
                    document.getElementById('e0').focus();
                    return;
                }
                // Save otp_method to DB
                await window.supabase.from('users').update({ totp_enabled: true, otp_method: 'email' }).eq('id', pendingUser.id);
                await window.supabase.auth.signOut();
                if (typeof logActivity === 'function') {
                    logActivity('2FA Enabled', 'User ' + pendingUser.username + ' enabled Email OTP');
                }
                document.getElementById('emailVerifySuccess').style.display = 'block';
                setTimeout(() => {
                    document.getElementById('stepEmailVerify').style.display = 'none';
                    document.getElementById('step3').style.display = 'block';
                    document.getElementById('step3').querySelector('.success-text').textContent = 'Email OTP is now active on your account. A code will be sent to your email each time you log in.';
                    setStepState(3);
                }, 800);
            } catch (e) {
                document.getElementById('emailVerifyError').style.display = 'block';
                btn.disabled = false; btn.textContent = 'Verify & Enable 2FA';
            }
        }

        // ── First-Login Password Setup ──────────────────────────
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
                // Show method choice after password is set
                document.getElementById('step0').style.display = 'none';
                document.getElementById('stepChoice').style.display = 'block';
                document.getElementById('setupTitle').textContent = 'Secure Your Account';
                document.getElementById('setupSubtitle').textContent = 'Choose how you want to verify your identity every time you log in.';
            } catch (e) { errEl.textContent = 'Error: ' + e.message; errEl.style.display = 'block'; }
        }

        // ── Generate Secret & QR Code ────────────────────────────
        async function initSetup() {
            currentSecret = await generateTOTPSecretAsync();
            document.getElementById('secretDisplay').textContent = formatSecret(currentSecret);

            const otpUri = buildOTPAuthURI(pendingUser.username, currentSecret);

            try {
                const qr = new QRious({
                    element: document.getElementById('qrCanvas'),
                    value: otpUri,
                    size: 200,
                    level: 'M',
                    foreground: '#064e3b'
                });
                document.getElementById('qrLoading').style.display = 'none';
            } catch (err) {
                console.error("QR Auth visuals error:", err);
                document.getElementById('qrLoading').textContent = "Failed to load visual QR frame. Please use the manual entry key below.";
                document.getElementById('qrLoading').style.color = "#991b1b";
            }
        }

        function formatSecret(s) {
            // Remove any potential padding for visual cleanliness
            const clean = s.replace(/=/g, '');
            return clean.match(/.{1,4}/g).join(' ');
        }

        function copySecret() {
            navigator.clipboard.writeText(currentSecret).then(() => {
                const btn = document.querySelector('.copy-btn');
                btn.textContent = 'Copied!';
                setTimeout(() => btn.textContent = 'Copy', 1500);
            });
        }

        // ── Timer ring ───────────────────────────────────────────
        function startTimer() {
            clearInterval(timerInterval);
            timerInterval = setInterval(() => {
                const now = Math.floor(Date.now() / 1000);
                const remaining = 30 - (now % 30);
                const pct = ((30 - remaining) / 30) * 100;
                document.getElementById('timerNum').textContent = remaining;
                document.getElementById('timerFill').setAttribute('stroke-dashoffset', pct);
            }, 1000);
        }

        // ── Step Navigation ──────────────────────────────────────
        function goToStep2() {
            document.getElementById('step1').style.display = 'none';
            document.getElementById('step2').style.display = 'block';
            setStepState(2);
            document.getElementById('d0').focus();
        }

        function backToStep1() {
            document.getElementById('step2').style.display = 'none';
            document.getElementById('step1').style.display = 'block';
            clearDigits();
            setStepState(1);
        }

        function setStepState(active) {
            [1,2,3].forEach(i => {
                const dot  = document.getElementById('stepDot' + i);
                const line = document.getElementById('stepLine' + (i));
                if (i < active) {
                    dot.className = 'step-dot done';
                    dot.textContent = '✓';
                    if (line) line.className = 'step-line done';
                } else if (i === active) {
                    dot.className = 'step-dot active';
                    dot.textContent = i < 3 ? i : '✓';
                } else {
                    dot.className = 'step-dot inactive';
                    dot.textContent = i < 3 ? i : '✓';
                }
            });
        }

        // ── Digit input handling ─────────────────────────────────
        document.addEventListener('DOMContentLoaded', () => {
            for (let i = 0; i < 6; i++) {
                const el = document.getElementById('d' + i);
                el.addEventListener('input', function () {
                    this.value = this.value.replace(/\D/g, '').slice(-1);
                    this.classList.toggle('filled', !!this.value);
                    if (this.value && i < 5) document.getElementById('d' + (i + 1)).focus();
                    if (getDigits().length === 6) verifyCode();
                });
                el.addEventListener('keydown', function (e) {
                    if (e.key === 'Backspace' && !this.value && i > 0) {
                        document.getElementById('d' + (i - 1)).focus();
                    }
                });
                el.addEventListener('paste', function (e) {
                    e.preventDefault();
                    const text = (e.clipboardData || window.clipboardData).getData('text').replace(/\D/g, '').slice(0, 6);
                    for (let j = 0; j < 6; j++) {
                        const d = document.getElementById('d' + j);
                        d.value = text[j] || '';
                        d.classList.toggle('filled', !!d.value);
                    }
                    if (text.length === 6) verifyCode();
                });
            }
        });

        function getDigits() { return [0,1,2,3,4,5].map(i => document.getElementById('d' + i).value).join(''); }
        function clearDigits() {
            for (let i = 0; i < 6; i++) {
                document.getElementById('d' + i).value = '';
                document.getElementById('d' + i).classList.remove('filled');
            }
            document.getElementById('verifyError').style.display = 'none';
            document.getElementById('verifySuccess').style.display = 'none';
        }

        // ── Verify & Save ────────────────────────────────────────
        async function verifyCode() {
            const code = getDigits();
            if (code.length !== 6) return;

            const btn = document.getElementById('verifyBtn');
            btn.disabled = true;
            btn.textContent = 'Verifying...';
            document.getElementById('verifyError').style.display = 'none';
            document.getElementById('verifySuccess').style.display = 'none';

            const valid = await verifyTOTPCode(currentSecret, code);

            if (valid) {
                document.getElementById('verifySuccess').style.display = 'block';
                await saveTOTPSecretToDB(pendingUser.id, currentSecret);
                await window.supabase.from('users').update({ otp_method: 'totp' }).eq('id', pendingUser.id);
                if (typeof logActivity === 'function') {
                    logActivity('2FA Enabled', `User ${pendingUser.username} enabled Google Authenticator`);
                }
                setTimeout(() => showSuccessScreen(), 800);
            } else {
                document.getElementById('verifyError').style.display = 'block';
                clearDigits();
                btn.disabled = false;
                btn.textContent = 'Verify & Enable 2FA';
                document.getElementById('d0').focus();
            }
        }

        function showSuccessScreen() {
            clearInterval(timerInterval);
            document.getElementById('step2').style.display = 'none';
            document.getElementById('step3').style.display = 'block';
            setStepState(3);
        }

        async function finishSetup() {
            // Complete the deferred login session
            const pendingRaw = sessionStorage.getItem('totp_pending_user');
            if (pendingRaw) {
                const user = JSON.parse(pendingRaw);
                const rememberMe = sessionStorage.getItem('totp_remember_me') === 'true';
                user.totp_enabled = true;
                if (rememberMe) {
                    localStorage.setItem('currentUser', JSON.stringify(user));
                } else {
                    sessionStorage.setItem('currentUser', JSON.stringify(user));
                }
                
                // Log the first-time login success via Google Auth setup
                if (typeof window.logSecurity === 'function') {
                    const authM = user.role === 'admin' ? 'Password' : 'Google Auth';
                    window.logSecurity('Login Success', authM, 'info', 'Login successful.', user.username);
                }

                // Cleanup failed attempts
                try {
                    const _logKey = 'barangay_local_security_log';
                    const _localLogs = JSON.parse(localStorage.getItem(_logKey)) || [];
                    const _cleaned = _localLogs.filter(l => {
                        const et = l.event_type || '';
                        const isFailedEvent = et === 'Login Failed' || et === 'Account Locked';
                        const isSameUser = (l.target_username || '').toLowerCase() === (user.username || '').toLowerCase();
                        return !(isFailedEvent && isSameUser);
                    });
                    localStorage.setItem(_logKey, JSON.stringify(_cleaned));
                    if (window.supabase && user.username) {
                        await window.supabase.from('security_log').delete()
                            .in('event_type', ['Login Failed', 'Account Locked'])
                            .eq('target_username', user.username);
                        if (user.id) {
                            await window.supabase.from('security_log').delete()
                                .in('event_type', ['Login Failed', 'Account Locked'])
                                .eq('user_id', user.id);
                        }
                    }
                } catch(e) { console.warn('Cleanup error:', e); }

                sessionStorage.removeItem('totp_pending_user');
                sessionStorage.removeItem('totp_remember_me');
            }
            // Redirect based on role
            if (pendingUser && pendingUser.role === 'admin') {
                window.location.href = 'admin.html';
            } else {
                window.location.href = 'user-dashboard.html';
            }
        }

        function skipSetup() {
            // Only for optional (non-admin) users — save session as-is
            const pendingRaw = sessionStorage.getItem('totp_pending_user');
            if (pendingRaw) {
                const user = JSON.parse(pendingRaw);
                const rememberMe = sessionStorage.getItem('totp_remember_me') === 'true';
                if (rememberMe) {
                    localStorage.setItem('currentUser', JSON.stringify(user));
                } else {
                    sessionStorage.setItem('currentUser', JSON.stringify(user));
                }
                sessionStorage.removeItem('totp_pending_user');
                sessionStorage.removeItem('totp_remember_me');
            }
            window.location.href = 'user-dashboard.html';
        }
    