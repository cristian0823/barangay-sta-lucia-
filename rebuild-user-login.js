/**
 * rebuild-user-login.js
 * Rebuilds user-portal/login.html from source with correct encoding.
 * - Resident login only (no admin toggle, no password field)
 * - Keeps "Back to Home" button
 * - Fixes all emoji encoding
 */
const fs = require('fs');
const path = require('path');

const src  = path.join(__dirname, 'login.html');
const dest = path.join(__dirname, 'user-portal', 'login.html');

let html = fs.readFileSync(src, 'utf8');

// ── 1. Inject portal scripts ──────────────────────────────────────────────
if (!html.includes('portal-config.js')) {
    html = html.replace(
        '<script src="js/supabase-config.js"></script>',
        `<script src="js/portal-config.js"></script>\n    <script src="js/supabase-config.js"></script>`
    );
}
if (!html.includes('portal-overrides.js')) {
    html = html.replace(
        '<script src="js/app.js"></script>',
        `<script src="js/app.js"></script>\n    <script src="js/portal-overrides.js"></script>`
    );
}

// ── 2. Title & subtitle ────────────────────────────────────────────────────
html = html.replace(
    /<h2 class="form-title" id="loginFormTitle">.*?<\/h2>/,
    '<h2 class="form-title" id="loginFormTitle">\uD83E\uDEAA Resident Login</h2>'
);
html = html.replace(
    /<p class="form-subtitle" id="loginFormSubtitle">.*?<\/p>/,
    '<p class="form-subtitle" id="loginFormSubtitle">Enter your Barangay ID Number to continue</p>'
);

// ── 3. Remove oninput="checkAdminField()" ────────────────────────────────
html = html.replace(/\s*oninput="checkAdminField\(\)"/g, '');

// ── 4. Remove entire password field block ─────────────────────────────────
html = html.replace(
    /\s*<div class="field hidden" id="passwordField">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/,
    ''
);

// ── 5. Fix feature icons with proper Unicode escapes ──────────────────────
html = html.replace(
    /<div class="feat-list">[\s\S]*?<\/div>\s*(?=\s*<\/div>\s*<\/div>)/,
    `<div class="feat-list">
                <div class="feat-item"><span class="feat-icon">\uD83E\uDE91</span><span class="feat-text">Borrow Equipment</span></div>
                <div class="feat-item"><span class="feat-icon">\uD83C\uDFC0</span><span class="feat-text">Book the Court</span></div>
                <div class="feat-item"><span class="feat-icon">\uD83D\uDCCB</span><span class="feat-text">Submit Concerns</span></div>
                <div class="feat-item"><span class="feat-icon">\uD83D\uDCC5</span><span class="feat-text">Community Events</span></div>
            </div>
        `
);

// ── 6. Fix "Back to Home" arrow using Unicode escape ─────────────────────
html = html.replace(
    /<span class="arrow">.*?<\/span>\s*Back to Home/,
    '<span class="arrow">\u2190</span> Back to Home'
);

// ── 7. Remove checkAdminField function definition ─────────────────────────
html = html.replace(
    /\s*window\.checkAdminField = function\(\) \{[\s\S]*?\};\s*\n/,
    '\n'
);

// ── 8. Remove roleParam if/else block ─────────────────────────────────────
html = html.replace(
    /\/\/ ── ROLE PRE-CONFIGURATION[\s\S]*?(?=\/\/ Check if already logged in)/,
    ''
);

// ── 9. Simplify DOMContentLoaded — just add suspension check ─────────────
// Fix indentation issue from previous edits (suspension block misaligned)
html = html.replace(
    /\s{24}\/\/ Check if redirected due to suspension/,
    '\n            // Check if redirected due to suspension'
);

// ── 10. Block admin login on user portal ──────────────────────────────────
html = html.replace(
    /const isAdminAttempt = username\.toLowerCase\(\)\.startsWith\('admin'\);\s*\n\s*if \(isAdminAttempt && !password\) \{ showToast\('Please enter your admin password\.', 'error'\); return; \}/,
    `// User portal: reject admin usernames\n                const isAdminAttempt = username.toLowerCase().startsWith('admin');\n                if (isAdminAttempt) { showToast('Please use the Admin Portal for admin access.', 'error'); btn.disabled = false; btn.textContent = 'Sign In'; return; }`
);

// ── Write without BOM ─────────────────────────────────────────────────────
fs.writeFileSync(dest, html, { encoding: 'utf8' });

const out = fs.readFileSync(dest, 'utf8');
console.log('✅ user-portal/login.html rebuilt');
console.log('  Resident Login title:', out.includes('Resident Login') ? 'YES' : 'NO');
console.log('  No password field:', !out.includes('"passwordField"') ? 'YES' : 'NO');
console.log('  No checkAdminField:', !out.includes('checkAdminField') ? 'YES' : 'NO');
console.log('  No roleParam:', !out.includes("roleParam === 'admin'") ? 'YES' : 'NO');
console.log('  Portal scripts:', out.includes('portal-overrides.js') ? 'YES' : 'NO');
console.log('  Feature icons present:', out.includes('Borrow Equipment') ? 'YES' : 'NO');
