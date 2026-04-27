/**
 * rebuild-admin-login.js
 * Rebuilds admin-portal/login.html from source with correct encoding.
 */
const fs = require('fs');
const path = require('path');

const src  = path.join(__dirname, 'login.html');
const dest = path.join(__dirname, 'admin-portal', 'login.html');

// Copy with correct encoding (no BOM)
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
    '<h2 class="form-title" id="loginFormTitle">\uD83D\uDD10 Admin Login</h2>'
);
html = html.replace(
    /<p class="form-subtitle" id="loginFormSubtitle">.*?<\/p>/,
    '<p class="form-subtitle" id="loginFormSubtitle">Sign in with your admin credentials</p>'
);

// ── 3. Username label & placeholder ───────────────────────────────────────
html = html.replace(
    /<label for="username" id="usernameLabel">.*?<\/label>/,
    '<label for="username" id="usernameLabel">Username</label>'
);
html = html.replace('placeholder="Enter your Barangay ID"', 'placeholder="Enter your admin username"');

// ── 4. Remove oninput="checkAdminField()" ────────────────────────────────
html = html.replace(/\s*oninput="checkAdminField\(\)"/g, '');

// ── 5. Password field: always visible, required ───────────────────────────
html = html.replace(
    '<div class="field hidden" id="passwordField">',
    '<div class="field" id="passwordField">'
);
html = html.replace(
    '<label for="password" id="passwordLabel">Password (Admin)</label>',
    '<label for="password" id="passwordLabel">Password</label>'
);
html = html.replace(
    '<input type="password" id="password" placeholder="Enter your password"',
    '<input type="password" id="password" required placeholder="Enter your password"'
);

// ── 6. Footer text ────────────────────────────────────────────────────────
html = html.replace(
    /Enter your <strong>Barangay ID<\/strong> to access resident services\.<br>Your ID is provided by the Barangay Office\./,
    'This portal is restricted to authorized personnel only.'
);

// ── 7. Remove checkAdminField function ────────────────────────────────────
html = html.replace(
    /\s*window\.checkAdminField = function\(\) \{[\s\S]*?\};\s*\n/,
    '\n'
);

// ── 8. Remove entire roleParam if/else block ──────────────────────────────
// Match from the "ROLE PRE-CONFIGURATION" comment to just before "Check if already logged in"
html = html.replace(
    /\/\/ ── ROLE PRE-CONFIGURATION[\s\S]*?(?=\/\/ Check if already logged in)/,
    ''
);

// ── 9. Block non-admin logins in submit handler ───────────────────────────
html = html.replace(
    /const isAdminAttempt = username\.toLowerCase\(\)\.startsWith\('admin'\);\s*\n\s*if \(isAdminAttempt && !password\) \{ showToast\('Please enter your admin password\.', 'error'\); return; \}/,
    `// Admin portal: reject non-admin usernames\n                const isAdminAttempt = !username.toLowerCase().startsWith('admin');\n                if (isAdminAttempt) { showToast('This portal is for admin use only.', 'error'); btn.disabled = false; btn.textContent = 'Sign In'; return; }`
);

// Write WITHOUT BOM
fs.writeFileSync(dest, html, { encoding: 'utf8' });

// Quick sanity checks
const out = fs.readFileSync(dest, 'utf8');
console.log('✅ admin-portal/login.html rebuilt');
console.log('  🔐 Admin Login title:', out.includes('Admin Login') ? 'YES' : 'NO');
console.log('  Password always visible:', out.includes('"field" id="passwordField"') ? 'YES' : 'NO');
console.log('  No roleParam block:', !out.includes("roleParam === 'resident'") ? 'YES' : 'NO');
console.log('  No checkAdminField:', !out.includes('checkAdminField') ? 'YES' : 'NO');
console.log('  Portal scripts injected:', out.includes('portal-overrides.js') ? 'YES' : 'NO');
