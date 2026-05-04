const fs = require('fs');
const path = require('path');

const walkSync = function(dir, filelist) {
  let files = fs.readdirSync(dir);
  filelist = filelist || [];
  files.forEach(function(file) {
    if (fs.statSync(path.join(dir, file)).isDirectory()) {
      if (file !== 'node_modules' && file !== '.git' && file !== 'supabase') {
        filelist = walkSync(path.join(dir, file), filelist);
      }
    } else {
      if (file.endsWith('.html') || file.endsWith('.js')) {
        filelist.push(path.join(dir, file));
      }
    }
  });
  return filelist;
};

const allFiles = walkSync('.');
let updated = 0;

allFiles.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  // Replace barangay-sun-logo.jpg with barangay-sun-logo.jpg for HTML src safety
  content = content.replace(/BARANGAY SUN LOGO\.jpg/g, "barangay-sun-logo.jpg");

  if (content !== original) {
    fs.writeFileSync(file, content);
    updated++;
  }
});

console.log('Total files changed to URL-encoded filename: ' + updated);
