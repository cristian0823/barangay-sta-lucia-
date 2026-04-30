const fs = require('fs');
let h = fs.readFileSync('admin.html', 'utf8');

// 1. Add audit-log and security-log to the switchSection logic
// It might look like: const allSections = ['overview', 'requests', ... 'activity-log'];
const regexAllSections = /(const|var|let)\s+([a-zA-Z0-9_]+)\s*=\s*\[(.*?)\];/;
// Let's replace 'activity-log' with 'audit-log', 'security-log' entirely across any array inside switchSection
h = h.replace(/'activity-log'/g, "'audit-log', 'security-log'");

// Some places might have `if (section === 'activity-log') loadActivityLog();`
h = h.replace(/if\s*\(\s*section\s*===\s*'activity-log'\s*\)\s*loadActivityLog\(\);/g, 
    "if (section === 'audit-log') loadAuditLog();\nif (section === 'security-log') loadSecurityLog();");

// Fix inline styles: if the tables are initially visible, we should add style="display:none;" explicitly to their wrappers
h = h.replace(/<div class="section hidden" id="audit-log-section">/g, '<div class="section" id="audit-log-section" style="display:none;">');
h = h.replace(/<div class="section hidden" id="security-log-section">/g, '<div class="section" id="security-log-section" style="display:none;">');

// Write changes
fs.writeFileSync('admin.html', h);
console.log('Fixed Section Visibility and State Management!');
