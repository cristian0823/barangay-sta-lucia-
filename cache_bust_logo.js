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
const timestamp = new Date().getTime();

htmlFiles.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  // Add cache buster to barangay-sun-logo.jpg
  // e.g., src="barangay-sun-logo.jpg" -> src="barangay-sun-logo.jpg?v=timestamp"
  // href="barangay-sun-logo.jpg" -> href="barangay-sun-logo.jpg?v=timestamp"
  // url('barangay-sun-logo.jpg') -> url('barangay-sun-logo.jpg?v=timestamp')
  
  content = content.replace(/src="(?:..\/)?barangay\.jpg"/g, (match) => match.slice(0, -1) + '?v=' + timestamp + '"');
  content = content.replace(/href="(?:..\/)?barangay\.jpg"/g, (match) => match.slice(0, -1) + '?v=' + timestamp + '"');
  content = content.replace(/url\('(?:..\/)?barangay\.jpg'\)/g, (match) => match.slice(0, -2) + '?v=' + timestamp + "')");

  if (content !== original) {
    fs.writeFileSync(file, content);
    updated++;
  }
});

console.log('Total HTML files cache-busted: ' + updated);
