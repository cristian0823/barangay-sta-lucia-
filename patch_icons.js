const fs = require('fs');
let html = fs.readFileSync('user-portal/user-dashboard.html', 'utf8');

// Fix 1: Add checkmark to successModal
html = html.replace(
    '<span class="text-4xl"></span>',
    '<span class="text-4xl"><i class="bi bi-check-lg text-green-600"></i></span>'
);

// Fix 2: Add close icon to dayScheduleModal
html = html.replace(
    '<button onclick="closeDayScheduleModal()" class="absolute top-4 right-4 bg-white/20 hover:bg-white/30 border-0 text-white w-8 h-8 rounded-full text-lg cursor-pointer flex items-center justify-center transition"></button>',
    '<button onclick="closeDayScheduleModal()" class="absolute top-4 right-4 bg-white/20 hover:bg-white/30 border-0 text-white w-8 h-8 rounded-full text-lg cursor-pointer flex items-center justify-center transition"><i class="bi bi-x-lg"></i></button>'
);

fs.writeFileSync('user-portal/user-dashboard.html', html);
console.log('Fixed missing icons in modals!');
