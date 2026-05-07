const fs = require('fs');
const path = require('path');

// Copy the logo into user-portal and admin-portal subfolders
const logoSrc = path.resolve(__dirname, 'barangay-sun-logo.jpg');
const copies = [
  'user-portal/barangay-sun-logo.jpg',
  'admin-portal/barangay-sun-logo.jpg',
];

copies.forEach(dest => {
  const destPath = path.resolve(__dirname, dest);
  if (fs.existsSync(path.dirname(destPath))) {
    fs.copyFileSync(logoSrc, destPath);
    console.log('Copied logo to ' + dest);
  } else {
    console.log('Skipped (folder not found): ' + dest);
  }
});

console.log('Done.');
