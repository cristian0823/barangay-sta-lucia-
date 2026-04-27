/**
 * fix-resident-icon-v2.js
 * Replaces the SVG (rendering poorly) with a widely supported emoji: 👤 (U+1F464)
 */
const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'user-portal', 'login.html');
let html = fs.readFileSync(file, 'utf8');

// Replace whatever is currently in the h2 title (SVG or emoji) with 👤 HTML entity
html = html.replace(
    /<h2 class="form-title" id="loginFormTitle">[\s\S]*?Resident Login<\/h2>/,
    '<h2 class="form-title" id="loginFormTitle">&#x1F464; Resident Login</h2>'
);

fs.writeFileSync(file, html, { encoding: 'utf8' });

const out = fs.readFileSync(file, 'utf8');
const match = out.match(/<h2 class="form-title" id="loginFormTitle">.*?<\/h2>/s);
console.log('✅ Done');
console.log('  Title line:', match ? match[0] : 'NOT FOUND');
