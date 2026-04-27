/**
 * fix-admin-login-clean.js
 * Removes the leftover roleParam block from admin-portal/login.html
 */
const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'admin-portal', 'login.html');
let html = fs.readFileSync(file, 'utf8');

// Remove the entire roleParam/resident block (lines ~429-459)
// Replace everything between the suspension check and "Check if already logged in"
html = html.replace(
    /\/\/ [^\n]*ROLE PRE-CONFIGURATION[\s\S]*?} else if \(roleParam === 'resident'\) \{[\s\S]*?\}\s*\n/,
    ''
);

// Also fix the indentation of the suspension check block (has extra whitespace)
html = html.replace(
    /\n\s{24}\/\/ Check if redirected due to suspension/,
    '\n            // Check if redirected due to suspension'
);

fs.writeFileSync(file, html, 'utf8');

// Verify
const lines = html.split('\n');
const hasSuspension = lines.some(l => l.includes('suspended'));
const hasRoleParam = lines.some(l => l.includes('roleParam'));
const hasResidentBlock = lines.some(l => l.includes("roleParam === 'resident'"));

console.log('✅ Done');
console.log('  Has suspension check:', hasSuspension);
console.log('  Has roleParam (should be false):', hasRoleParam);
console.log('  Has resident block (should be false):', hasResidentBlock);
