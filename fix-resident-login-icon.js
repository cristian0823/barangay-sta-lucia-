/**
 * fix-resident-login-icon.js
 * Replaces the unsupported 🪪 emoji with an inline SVG ID card icon
 * in user-portal/login.html
 */
const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'user-portal', 'login.html');
let html = fs.readFileSync(file, 'utf8');

// SVG ID card icon (clean, modern, works everywhere)
const svgIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#064e3b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:middle;margin-right:8px;margin-bottom:3px"><rect x="2" y="5" width="20" height="14" rx="3"/><circle cx="8" cy="12" r="2"/><line x1="13" y1="10" x2="19" y2="10"/><line x1="13" y1="14" x2="19" y2="14"/></svg>`;

// Replace &#x1FAA9; (or any garbled version) before "Resident Login"
html = html.replace(
    /<h2 class="form-title" id="loginFormTitle">.*?Resident Login<\/h2>/,
    `<h2 class="form-title" id="loginFormTitle">${svgIcon} Resident Login</h2>`
);

fs.writeFileSync(file, html, { encoding: 'utf8' });

const out = fs.readFileSync(file, 'utf8');
console.log('✅ Resident Login icon updated');
console.log('  SVG icon present:', out.includes('<svg') && out.includes('Resident Login') ? 'YES' : 'NO');
