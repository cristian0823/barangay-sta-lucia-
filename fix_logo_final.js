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

  // Replace all variants of the old logo filenames with the clean new one
  content = content.replace(/BARANGAY%20SUN%20LOGO\.jpg/g, "barangay-sun-logo.jpg");
  content = content.replace(/BARANGAY SUN LOGO\.jpg/g, "barangay-sun-logo.jpg");
  content = content.replace(/BARANGAY LOGO\.jpg/g, "barangay-sun-logo.jpg");
  content = content.replace(/barangay\.jpg(?:\?v=\d+)?/g, "barangay-sun-logo.jpg");

  if (content !== original) {
    fs.writeFileSync(file, content);
    updated++;
  }
});

console.log('Total files updated to barangay-sun-logo.jpg: ' + updated);
