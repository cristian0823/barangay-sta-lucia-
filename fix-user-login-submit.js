/**
 * fix-user-login-submit.js
 * Fixes the submit handler in user-portal/login.html:
 * 1. Removes the null-crashing password read (no password field exists)
 * 2. Moves btn declaration before the admin check that references it
 */
const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'user-portal', 'login.html');
let html = fs.readFileSync(file, 'utf8');

// Fix the submit handler block
const broken = `                const username   = sanitizeInput(document.getElementById('username').value.trim());
                const password   = document.getElementById('password').value;
                const rememberMe = document.getElementById('rememberMe').checked;
                
                // User portal: reject admin usernames
                const isAdminAttempt = username.toLowerCase().startsWith('admin');
                if (isAdminAttempt) { showToast('Please use the Admin Portal for admin access.', 'error'); btn.disabled = false; btn.textContent = 'Sign In'; return; }

                const btn = document.getElementById('loginBtn');
                btn.disabled = true; btn.textContent = 'Signing in...';`;

const fixed = `                const username   = sanitizeInput(document.getElementById('username').value.trim());
                const password   = ''; // Residents log in with Barangay ID only — no password
                const rememberMe = document.getElementById('rememberMe').checked;

                const btn = document.getElementById('loginBtn');
                btn.disabled = true; btn.textContent = 'Signing in...';

                // User portal: reject admin usernames
                const isAdminAttempt = username.toLowerCase().startsWith('admin');
                if (isAdminAttempt) { showToast('Please use the Admin Portal for admin access.', 'error'); btn.disabled = false; btn.textContent = 'Sign In'; return; }`;

if (html.includes(broken.trim().slice(0, 80))) {
    html = html.replace(broken, fixed);
    console.log('✅ Used exact match replacement');
} else {
    // Fallback: line-by-line targeted replacements
    html = html.replace(
        "const password   = document.getElementById('password').value;",
        "const password   = ''; // Residents log in with Barangay ID only"
    );
    // Move btn before admin check - fix the isAdminAttempt block that uses undefined btn
    html = html.replace(
        `// User portal: reject admin usernames\n                const isAdminAttempt = username.toLowerCase().startsWith('admin');\n                if (isAdminAttempt) { showToast('Please use the Admin Portal for admin access.', 'error'); btn.disabled = false; btn.textContent = 'Sign In'; return; }\n\n                const btn = document.getElementById('loginBtn');\n                btn.disabled = true; btn.textContent = 'Signing in...';`,
        `const btn = document.getElementById('loginBtn');\n                btn.disabled = true; btn.textContent = 'Signing in...';\n\n                // User portal: reject admin usernames\n                const isAdminAttempt = username.toLowerCase().startsWith('admin');\n                if (isAdminAttempt) { showToast('Please use the Admin Portal for admin access.', 'error'); btn.disabled = false; btn.textContent = 'Sign In'; return; }`
    );
    console.log('✅ Used fallback line replacements');
}

fs.writeFileSync(file, html, { encoding: 'utf8' });

const out = fs.readFileSync(file, 'utf8');
console.log("  Password null removed:", !out.includes("getElementById('password').value") ? 'YES' : 'NO');
console.log("  Password is empty string:", out.includes("const password   = ''") || out.includes('const password   = "";') ? 'YES' : 'NO');
