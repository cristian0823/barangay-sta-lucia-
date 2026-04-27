/**
 * patch-admin-login.js
 * Cleanly patches admin-portal/login.html to be admin-only.
 * Run: node patch-admin-login.js
 */
const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'admin-portal', 'login.html');
let html = fs.readFileSync(file, 'utf8');

// 1. Inject portal scripts before </head>
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

// 2. Change title to Admin Login (the h2)
html = html.replace(
    /<h2 class="form-title" id="loginFormTitle">.*?<\/h2>/,
    '<h2 class="form-title" id="loginFormTitle">🔐 Admin Login</h2>'
);

// 3. Change subtitle
html = html.replace(
    /<p class="form-subtitle" id="loginFormSubtitle">.*?<\/p>/,
    '<p class="form-subtitle" id="loginFormSubtitle">Sign in with your admin credentials</p>'
);

// 4. Change username label and placeholder
html = html.replace(
    /<label for="username" id="usernameLabel">.*?<\/label>/,
    '<label for="username" id="usernameLabel">Username</label>'
);
html = html.replace(
    /placeholder="Enter your Barangay ID"/,
    'placeholder="Enter your admin username"'
);

// 5. Remove oninput="checkAdminField()" from username input
html = html.replace(/\s*oninput="checkAdminField\(\)"/g, '');

// 6. Make password field always visible (remove 'hidden' class)
html = html.replace(
    '<div class="field hidden" id="passwordField">',
    '<div class="field" id="passwordField">'
);

// 7. Make password required
html = html.replace(
    /<input type="password" id="password" placeholder="Enter your password"/,
    '<input type="password" id="password" required placeholder="Enter your password"'
);

// 8. Update password label
html = html.replace(
    /<label for="password" id="passwordLabel">.*?<\/label>/,
    '<label for="password" id="passwordLabel">Password</label>'
);

// 9. Update footer text
html = html.replace(
    /Enter your <strong>Barangay ID<\/strong> to access resident services\.<br>Your ID is provided by the Barangay Office\./,
    'This portal is restricted to authorized personnel only.'
);

// 10. In the DOMContentLoaded block — replace the role-checking logic with admin-only init
// Remove checkAdminField function definition entirely
html = html.replace(
    /window\.checkAdminField = function\(\)[\s\S]*?\};\s*\n/,
    ''
);

// 11. Remove the role param block (if/else if roleParam === 'admin' etc.)
html = html.replace(
    /\/\/ \u2500\u2500 ROLE PRE-CONFIGURATION[\s\S]*?if \(user\) redirectToDashboard\(\);/,
    `// Admin portal: always show admin login\n            const params = new URLSearchParams(window.location.search);\n            if (params.get('suspended') === '1') {\n                const until = params.get('until') || 'a future date';\n                showToast(\`\uD83D\uDD12 Your account is suspended until \${until}.\`, 'error');\n            }\n\n            // Check if already logged in\n            const user = getCurrentUser();\n            if (user) redirectToDashboard();`
);

// 12. Block non-admin login attempts in the submit handler
html = html.replace(
    /const isAdminAttempt = username\.toLowerCase\(\)\.startsWith\('admin'\);\s*\n\s*if \(isAdminAttempt && !password\)[^}]+}/,
    `const isAdminAttempt = !username.toLowerCase().startsWith('admin');\n                if (isAdminAttempt) { showToast('This portal is for admin use only.', 'error'); btn.disabled = false; btn.textContent = 'Sign In'; return; }`
);

fs.writeFileSync(file, html, 'utf8');
console.log('✅ admin-portal/login.html patched successfully');
