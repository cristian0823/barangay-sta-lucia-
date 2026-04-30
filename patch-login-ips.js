/**
 * patch-login-ips.js
 * Injects the known_ips_ logic directly into submitTOTPCode for both admin and user portals
 * so that new IPs are properly logged upon successful 2FA authentication.
 */
const fs = require('fs');
const path = require('path');

const filesToPatch = [
    path.join(__dirname, 'admin-portal', 'login.html'),
    path.join(__dirname, 'user-portal', 'login.html')
];

const targetPattern = /logActivity\('Login', `User logged in with 2FA: \$\{totpPendingUser\.username\}`\);\s*if \(typeof window\.logSecurity === 'function'\) \{\s*const authM = totpPendingUser\.role === 'admin' \? 'Password' : 'Google Auth';\s*window\.logSecurity\('Login Success', authM, 'info', 'Login successful\.', totpPendingUser\.username\);\s*\}/s;

const replacement = `const authM = totpPendingUser.role === 'admin' ? 'Password' : 'Google Auth';
                if (typeof window.logSecurity === 'function') {
                    const _knownIps = JSON.parse(localStorage.getItem('known_ips_' + totpPendingUser.username)) || [];
                    const _curIP = typeof _cachedDeviceIP !== 'undefined' ? _cachedDeviceIP : 'Unavailable';
                    if (_curIP !== 'Unavailable' && !_knownIps.includes(_curIP)) {
                        _knownIps.push(_curIP);
                        localStorage.setItem('known_ips_' + totpPendingUser.username, JSON.stringify(_knownIps));
                        if (_knownIps.length === 1) {
                            window.logSecurity('Login Success', authM, 'info', \`Login successful. First login from IP \${_curIP}.\`, totpPendingUser.username);
                        } else {
                            window.logSecurity('Suspicious Login Activity', authM, 'warning', \`Login from new IP (\${_curIP}). Previous sessions used a different location.\`, totpPendingUser.username);
                        }
                    } else {
                        window.logSecurity('Login Success', authM, 'info', 'Login successful.', totpPendingUser.username);
                    }
                }`;

for (const file of filesToPatch) {
    if (!fs.existsSync(file)) continue;
    let html = fs.readFileSync(file, 'utf8');
    
    if (targetPattern.test(html)) {
        html = html.replace(targetPattern, replacement);
        fs.writeFileSync(file, html, { encoding: 'utf8' });
        console.log(`✅ Patched ${path.basename(path.dirname(file))}/login.html`);
    } else {
        console.log(`⚠️ Pattern not found in ${path.basename(path.dirname(file))}/login.html (already patched?)`);
    }
}
