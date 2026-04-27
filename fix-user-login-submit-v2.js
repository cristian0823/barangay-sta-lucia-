/**
 * fix-user-login-submit-v2.js  
 * Fixes the null crash using simple targeted string replacements that handle CRLF line endings.
 */
const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'user-portal', 'login.html');
let html = fs.readFileSync(file, 'utf8');

// Fix 1: Replace the null-crashing password line
html = html.replace(
    "const password   = document.getElementById('password').value;",
    "const password   = ''; // Residents log in with Barangay ID only - no password needed"
);

// Fix 2: Move btn declaration before the admin check
// Current order: adminCheck references btn, then btn is declared
// New order: declare btn first, then do adminCheck
html = html.replace(
    "if (isAdminAttempt) { showToast('Please use the Admin Portal for admin access.', 'error'); btn.disabled = false; btn.textContent = 'Sign In'; return; }",
    "if (isAdminAttempt) { showToast('Please use the Admin Portal for admin access.', 'error'); document.getElementById('loginBtn').disabled = false; document.getElementById('loginBtn').textContent = 'Sign In'; return; }"
);

fs.writeFileSync(file, html, { encoding: 'utf8' });

const out = fs.readFileSync(file, 'utf8');
const hasNull = out.includes("getElementById('password').value");
const hasEmpty = out.includes("const password   = ''");
console.log('✅ Done');
console.log('  password null reference removed:', !hasNull ? 'YES' : 'NO - STILL PRESENT');
console.log('  password set to empty string:', hasEmpty ? 'YES' : 'NO');
