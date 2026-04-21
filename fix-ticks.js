const fs = require('fs');
let html = fs.readFileSync('user-dashboard.html', 'utf8');
html = html.split('</div>``;').join('</div>`;');
fs.writeFileSync('user-dashboard.html', html);
console.log('Fixed double backticks syntax error');
