/**
 * patch-setup-totp.js
 * Injects the known_ips_ logic directly into setup-totp.html
 * so that new IPs are properly logged upon initial 2FA setup.
 */
const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'setup-totp.html');
let html = fs.readFileSync(file, 'utf8');

const targetPattern = /if \(typeof window\.logSecurity === 'function'\) \{\s*const authM = user\.role === 'admin' \? 'Password' : 'Google Auth';\s*window\.logSecurity\('Login Success', authM, 'info', 'Login successful\.', user\.username\);\s*\}/s;

const replacement = `if (typeof window.logSecurity === 'function') {
                    const authM = user.role === 'admin' ? 'Password' : 'Google Auth';
                    const _knownIps = JSON.parse(localStorage.getItem('known_ips_' + user.username)) || [];
                    const _curIP = typeof _cachedDeviceIP !== 'undefined' ? _cachedDeviceIP : 'Unavailable';
                    if (_curIP !== 'Unavailable' && !_knownIps.includes(_curIP)) {
                        _knownIps.push(_curIP);
                        localStorage.setItem('known_ips_' + user.username, JSON.stringify(_knownIps));
                        if (_knownIps.length === 1) {
                            window.logSecurity('Login Success', authM, 'info', \`Login successful. First login from IP \${_curIP}.\`, user.username);
                        } else {
                            window.logSecurity('Suspicious Login Activity', authM, 'warning', \`Login from new IP (\${_curIP}). Previous sessions used a different location.\`, user.username);
                        }
                    } else {
                        window.logSecurity('Login Success', authM, 'info', 'Login successful.', user.username);
                    }
                }`;

if (targetPattern.test(html)) {
    html = html.replace(targetPattern, replacement);
    fs.writeFileSync(file, html, { encoding: 'utf8' });
    console.log(`✅ Patched setup-totp.html`);
} else {
    console.log(`⚠️ Pattern not found in setup-totp.html`);
}
