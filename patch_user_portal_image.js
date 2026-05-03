const fs = require('fs');
let html = fs.readFileSync('user-portal/user-dashboard.html', 'utf8');

// Fix 1: Equipment grid - replace local imageName with image_url
html = html.replace(
    "const imageName = item.name ? '../' + item.name.toLowerCase().replace(/s$/, '') + '.jpg' : '../barangay.jpg';",
    "const imageSrc = item.image_url ? item.image_url : '../barangay.jpg';"
);

// Fix 2: Update the img src tag to use imageSrc and object-cover
html = html.replace(
    '${imageName}" alt="${item.name}" class="w-full h-full object-contain',
    '${imageSrc}" alt="${item.name}" class="w-full h-full object-cover'
);

// Fix 3: Borrow modal - also use image_url
const oldBorrow = "const imageName = item.name ? '../' + item.name.toLowerCase().replace(/s$/, '') + '.jpg' : '../barangay.jpg';\n            document.getElementById('borrowModalImage').src = imageName;";
const newBorrow = "const imageSrc = item.image_url ? item.image_url : '../barangay.jpg';\n            document.getElementById('borrowModalImage').src = imageSrc;";
html = html.replace(oldBorrow, newBorrow);

fs.writeFileSync('user-portal/user-dashboard.html', html);

const hasOldImageName = html.includes("item.name.toLowerCase().replace(/s$/, '') + '.jpg'");
const hasImageSrc = html.includes('item.image_url ? item.image_url');
console.log('Old imageName still present:', hasOldImageName);
console.log('image_url fix applied:', hasImageSrc);
