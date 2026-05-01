const fs = require('fs');
let content = fs.readFileSync('user-dashboard.html', 'utf8');
content = content.replace(/if\s*\(\s*helpEl\s*\)\s*helpEl\.innerHTML\s*=\s*'📦 Max: '\s*\+\s*item\.available\s*\+\s*' units available';/g, "if(helpEl) helpEl.innerHTML = '📦 Max: ' + item.available + (item.available === 1 ? ' unit available' : ' units available');");
fs.writeFileSync('user-dashboard.html', content, 'utf8');
console.log('Patched user-dashboard.html');
