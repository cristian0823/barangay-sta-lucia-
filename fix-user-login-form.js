/**
 * fix-user-login-form.js
 * Restores the missing Sign In button, Remember Me, and footer
 * that were accidentally cut from user-portal/login.html
 */
const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'user-portal', 'login.html');
let html = fs.readFileSync(file, 'utf8');

// The form was truncated after the username field's closing </div>
// We need to insert the rest of the form right before <div id="toast">
const missingForm = `
                <div class="check-row" style="justify-content: space-between;">
                    <div style="display: flex; align-items: center; gap: 9px;">
                        <input type="checkbox" id="rememberMe">
                        <label for="rememberMe">Remember me</label>
                    </div>
                </div>

                <button type="submit" id="loginBtn" class="btn-main">Sign In</button>
            </form>

            <div class="form-footer">
                <p style="color:#6b7280;font-size:13px;">Enter your <strong>Barangay ID</strong> to access resident services.<br>Your ID is provided by the Barangay Office.</p>
                <div class="terms-lnk">
                    <a href="terms.html" target="_blank">Terms &amp; Conditions</a>
                </div>
            </div>

            <!-- TOTP Step 2 Panel (hidden by default) -->
            <div id="totpPanel" class="totp-panel" style="display:none;">
                <div class="totp-title">&#x1F511; Two-Factor Authentication</div>
                <p class="totp-sub">Enter the 6-digit code from your <strong>Google Authenticator</strong> app.</p>
                <div class="totp-timer">
                    <span class="totp-timer-text">Code refreshes every <strong id="totpCountdown">30</strong>s</span>
                </div>
                <div class="code-wrap">
                    <input class="code-digit" type="text" inputmode="numeric" maxlength="1" id="td0">
                    <input class="code-digit" type="text" inputmode="numeric" maxlength="1" id="td1">
                    <input class="code-digit" type="text" inputmode="numeric" maxlength="1" id="td2">
                    <input class="code-digit" type="text" inputmode="numeric" maxlength="1" id="td3">
                    <input class="code-digit" type="text" inputmode="numeric" maxlength="1" id="td4">
                    <input class="code-digit" type="text" inputmode="numeric" maxlength="1" id="td5">
                </div>
                <div id="totpError" class="alert alert-danger hidden">&#x274C; Invalid code. Please try again.</div>
                <button type="button" id="totpVerifyBtn" class="btn-main" onclick="submitTOTPCode()">Verify Code</button>
                <button type="button" class="totp-back" onclick="cancelTOTP()">&#x2190; Back to Login</button>
            </div>

        </div>
    </div>
`;

// Insert the missing form content right before <div id="toast">
if (html.includes('<div id="toast">')) {
    html = html.replace('<div id="toast">', missingForm + '\n    <div id="toast">');
    console.log('✅ Form elements injected before toast div');
} else {
    console.error('❌ Could not find injection point');
    process.exit(1);
}

fs.writeFileSync(file, html, { encoding: 'utf8' });

// Verify
const out = fs.readFileSync(file, 'utf8');
console.log('  Sign In button present:', out.includes('id="loginBtn"') ? 'YES' : 'NO');
console.log('  Remember Me present:', out.includes('id="rememberMe"') ? 'YES' : 'NO');
console.log('  Form footer present:', out.includes('form-footer') ? 'YES' : 'NO');
console.log('  TOTP panel present:', out.includes('totpPanel') ? 'YES' : 'NO');
