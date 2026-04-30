const fs = require('fs');
const html = fs.readFileSync('admin.html', 'utf8');
const scriptRegex = /<script[\s\S]*?>([\s\S]*?)<\/script>/g;
let match;
let count = 0;
while ((match = scriptRegex.exec(html)) !== null) {
  count++;
  try {
    new Function(match[1]);
  } catch (e) {
    console.error(`Syntax error in script block ${count}:`, e.message);
    const scriptLines = match[1].split('\n');
    console.error('Context:', scriptLines.slice(0, 15).join('\n'));
  }
}
console.log(`Checked ${count} script blocks in admin.html.`);
