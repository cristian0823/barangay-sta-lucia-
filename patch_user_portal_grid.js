const fs = require('fs');
let html = fs.readFileSync('user-portal/user-dashboard.html', 'utf8');

// Fix 1: Equipment grid - use image_url instead of local file path
html = html.replace(
    `const imageName = item.name ? '../' + item.name.toLowerCase().replace(/s$/, '') + '.jpg' : '../barangay-sun-logo.jpg';

                return \`<div class="group relative overflow-hidden rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:shadow-2xl transition-all duration-300 flex flex-col h-full">
                    <!-- Image Header -->
                    <div class="relative h-48 w-full bg-gray-100 dark:bg-gray-700 overflow-hidden shrink-0">
                        <img src="\${imageName}" alt="\${item.name}" class="w-full h-full object-contain object-center bg-white dark:bg-gray-800 transition-transform duration-500 group-hover:scale-110" onerror="this.src='../barangay-sun-logo.jpg'; this.onerror=null;">`,
    `const imageSrc = item.image_url ? item.image_url : '../barangay-sun-logo.jpg';

                return \`<div class="group relative overflow-hidden rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:shadow-2xl transition-all duration-300 flex flex-col h-full">
                    <!-- Image Header -->
                    <div class="relative h-48 w-full bg-gray-100 dark:bg-gray-700 overflow-hidden shrink-0">
                        <img src="\${imageSrc}" alt="\${item.name}" class="w-full h-full object-cover object-center bg-white dark:bg-gray-800 transition-transform duration-500 group-hover:scale-110" onerror="this.src='../barangay-sun-logo.jpg'; this.onerror=null;">`
);

// Fix 2: Borrow modal - use image_url 
html = html.replace(
    `const imageName = item.name ? '../' + item.name.toLowerCase().replace(/s$/, '') + '.jpg' : '../barangay-sun-logo.jpg';
            document.getElementById('borrowModalImage').src = imageName;`,
    `const imageSrc = item.image_url ? item.image_url : '../barangay-sun-logo.jpg';
            document.getElementById('borrowModalImage').src = imageSrc;`
);

fs.writeFileSync('user-portal/user-dashboard.html', html);
console.log('Patched user-portal/user-dashboard.html');
console.log('image_url fix applied:', html.includes('item.image_url ? item.image_url') ? 'YES' : 'NO');
