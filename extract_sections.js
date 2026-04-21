const fs = require('fs');
const html = fs.readFileSync('admin.html', 'utf8');

const regex = /id=["']([a-zA-Z0-9\-]+-section)["']/g;
let match;
while ((match = regex.exec(html)) !== null) {
  console.log('Section ID found:', match[1]);
}
