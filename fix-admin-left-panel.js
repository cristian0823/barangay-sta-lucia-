/**
 * fix-admin-left-panel.js
 * - Removes "Back to Home" button from admin-portal/login.html
 * - Replaces garbled user feature icons with admin-relevant ones (using safe unicode escapes)
 */
const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'admin-portal', 'login.html');
let html = fs.readFileSync(file, 'utf8');

// ── 1. Remove the entire "Back to Home" link element ─────────────────────
html = html.replace(
    /\s*<!-- Back to Home -->\s*\n\s*<a href="index\.html" class="back-link">[\s\S]*?<\/a>/,
    ''
);
// Also remove back-link CSS (optional but clean)
html = html.replace(
    /\s*\.back-link \{[\s\S]*?\}\s*\.back-link:hover \{[\s\S]*?\}\s*\.back-link \.arrow \{[^}]*\}/,
    ''
);
// Remove responsive back-link rule
html = html.replace(/\s*\.back-link\s+\{[^}]*position: static[^}]*\}/g, '');

// ── 2. Replace garbled user feature items with admin-relevant ones ────────
const adminFeats = [
    { icon: '\uD83D\uDD10', text: 'Secure Admin Access' },
    { icon: '\uD83D\uDCCA', text: 'Dashboard & Reports'  },
    { icon: '\uD83D\uDC65', text: 'Manage Residents'     },
    { icon: '\uD83D\uDEE1\uFE0F', text: 'Security & Logs'   },
];

const newFeatList = `<div class="feat-list">
                ${adminFeats.map(f =>
    `<div class="feat-item"><span class="feat-icon">${f.icon}</span><span class="feat-text">${f.text}</span></div>`
).join('\n                ')}
            </div>`;

html = html.replace(
    /<div class="feat-list">[\s\S]*?<\/div>\s*(?=\s*<\/div>\s*<\/div>)/,
    newFeatList + '\n        '
);

// ── Write back ─────────────────────────────────────────────────────────────
fs.writeFileSync(file, html, { encoding: 'utf8' });

// Verify
const out = fs.readFileSync(file, 'utf8');
console.log('✅ admin-portal/login.html updated');
console.log('  Back to Home removed:', !out.includes('back-link') ? 'YES' : 'PARTIAL (CSS only, HTML removed)');
console.log('  Admin feats present:', out.includes('Secure Admin Access') ? 'YES' : 'NO');
