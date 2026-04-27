/**
 * fix-user-portal.js
 * 1. Removes "Admin Login" button from user-portal/index.html
 * 2. Fixes the garbled 🪪 emoji in user-portal/login.html title (replace with simpler ID emoji)
 */
const fs = require('fs');
const path = require('path');

// ── Fix 1: user-portal/index.html ─────────────────────────────────────────
const indexFile = path.join(__dirname, 'user-portal', 'index.html');
let index = fs.readFileSync(indexFile, 'utf8');

// Remove the Admin Login nav button
index = index.replace(
    /\s*<a href="login\.html\?role=admin"[^>]*>Admin Login<\/a>/g,
    ''
);

// Also remove btn-nav-admin CSS if present
index = index.replace(
    /\s*\.btn-nav-admin\s*\{[^}]*\}/g,
    ''
);

fs.writeFileSync(indexFile, index, { encoding: 'utf8' });
console.log('✅ user-portal/index.html: Admin Login button removed');
console.log('  Admin Login still present:', index.includes('Admin Login') ? 'YES (check)' : 'NO (good)');

// ── Fix 2: user-portal/login.html ─────────────────────────────────────────
const loginFile = path.join(__dirname, 'user-portal', 'login.html');
let login = fs.readFileSync(loginFile, 'utf8');

// Replace the 🪪 emoji (U+1FAA9 - very new, poor support) with 🪪 HTML entity
// or use a simpler well-supported emoji: 🆔 (U+1F194) or just ID card text
// Using 🪪 HTML entity to avoid encoding issues
login = login.replace(
    /<h2 class="form-title" id="loginFormTitle">.*?Resident Login<\/h2>/,
    '<h2 class="form-title" id="loginFormTitle">&#x1FAA9; Resident Login</h2>'
);

fs.writeFileSync(loginFile, login, { encoding: 'utf8' });
console.log('\u2705 user-portal/login.html: emoji replaced with HTML entity');
console.log('  Uses HTML entity:', login.includes('&#x1FAA9;') ? 'YES' : 'NO');
