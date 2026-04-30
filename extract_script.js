const fs = require('fs');
const html = fs.readFileSync('admin.html', 'utf8');
const scriptRegex = /<script[\s\S]*?>([\s\S]*?)<\/script>/g;
let match;
for (let i = 0; i < 6; i++) {
  match = scriptRegex.exec(html);
}
fs.writeFileSync('script6.js', match[1]);
console.log('Saved script6.js');
