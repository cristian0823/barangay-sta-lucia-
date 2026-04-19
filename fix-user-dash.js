const fs = require('fs');
let html = fs.readFileSync('user-dashboard.html', 'utf8');

// 1. Remove Start/End Time HTML block from modal
const startEndHtmlRegex = /<div class="grid grid-cols-2 gap-3">[\s\S]*?<label[^>]*>Start Time<\/label>[\s\S]*?<\/div>\s*<\/div>/;
html = html.replace(startEndHtmlRegex, '');

// 2. Remove or bypass JS validation in submitDsBooking
// It's around line 2829:
// const startTime = document.getElementById('dsStartTime').value;
// const endTime = document.getElementById('dsEndTime').value;
html = html.replace(
    /const startTime = document\.getElementById\('dsStartTime'\)\.value;\s*const endTime = document\.getElementById\('dsEndTime'\)\.value;/,
    "const startTime = ''; const endTime = ''; // Removed time inputs"
);

// If there's an if(!startTime || !endTime) check, disable it:
html = html.replace(
    /if\s*\(!startTime\s*\|\|\s*!endTime\)\s*\{[\s\S]*?return;\s*\}/,
    "if(false) { // Time check disabled"
);

// 3. Rename texts
html = html.replace(/Court Booking/g, 'Court Reservation');
html = html.replace(/Court Bookings/g, 'Court Reservations');
html = html.replace(/Hall Booking/g, 'Hall Reservation');
html = html.replace(/Hall Bookings/g, 'Hall Reservations');
html = html.replace(/Confirm Booking/g, 'Confirm Reservation');
html = html.replace(/Add Court Reservation/g, 'Add Court Reservation'); // already renamed Court Booking
html = html.replace(/Book the Court/g, 'Reserve the Court');
html = html.replace(/court bookings/g, 'court reservations');
html = html.replace(/Cancel Booking/g, 'Cancel Reservation');
html = html.replace(/Reschedule My Booking/g, 'Reschedule My Reservation');
html = html.replace(/Upcoming Bookings/g, 'Upcoming Reservations');
html = html.replace(/Active Bookings/g, 'Active Reservations');
html = html.replace(/Active Borrowings/g, 'Active Borrowings');

fs.writeFileSync('user-dashboard.html', html);
console.log('✅ Updated user-dashboard.html properly');
