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
      if (file.endsWith('.html')) {
        filelist.push(path.join(dir, file));
      }
    }
  });
  return filelist;
};

const htmlFiles = walkSync('.');
let updated = 0;

htmlFiles.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  // Revert background image urls back to brgy.png
  content = content.replace(/url\(['"]?(?:\.\.\/)?barangay\.jpg(?:\?v=\d+)?['"]?\)/g, "url('brgy.png')");

  if (content !== original) {
    fs.writeFileSync(file, content);
    console.log('Reverted banner in ' + file);
    updated++;
  }
});
console.log('Total files reverted: ' + updated);
