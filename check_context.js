const fs = require('fs');
const txt = fs.readFileSync('admin.html', 'utf8');
const idx = txt.indexOf('id="audit-log-section"');
console.log(txt.substring(Math.max(0, idx - 1000), idx + 200));
