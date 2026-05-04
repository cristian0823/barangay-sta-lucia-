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

  // Replace brgy.png with barangay-sun-logo.jpg
  content = content.replace(/url\(['"]?brgy\.png['"]?\)/g, "url('barangay-sun-logo.jpg')");
  
  // Replace brgy.png with barangay-sun-logo.jpg anywhere else it might just be the raw file name (like in JS that replaces HTML)
  content = content.replace(/brgy\.png/g, "barangay-sun-logo.jpg");

  // Fix logo styles in user-dashboard and others
  content = content.replace(/class="w-\[46px\] h-\[46px\] rounded-xl border-2 border-emerald-200 object-cover"/g, 'class="w-[46px] h-[46px] object-contain"');
  content = content.replace(/class="w-10 h-10 rounded-full border-2 border-white"/g, 'class="w-10 h-10 object-contain"');
  content = content.replace(/class="w-10 h-10 rounded-full"/g, 'class="w-10 h-10 object-contain"');
  
  // Fix logo image css in admin.html and admin_clean.html
  content = content.replace(/\.logo-image\s*\{\s*width:\s*38px;\s*height:\s*38px;\s*border-radius:\s*10px;\s*border:\s*1\.5px\s*solid\s*var\(--green-200\);\s*object-fit:\s*cover;\s*\}/g, '.logo-image { width: 38px; height: 38px; object-fit: contain; }');
  
  // Alternative dark mode logo image override in admin.html just in case
  content = content.replace(/border-radius:10px;border:1\.5px solid var\(--green-200\)/g, '');

  if (content !== original) {
    fs.writeFileSync(file, content);
    console.log('Updated ' + file);
    updated++;
  }
});

console.log('Total HTML files updated: ' + updated);
