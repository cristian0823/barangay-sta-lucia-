const fs = require('fs');
const txt = fs.readFileSync('admin.html', 'utf8');
const idx = txt.indexOf('id="overview-section"');
console.log(txt.substring(Math.max(0, idx - 100), idx + 100));
