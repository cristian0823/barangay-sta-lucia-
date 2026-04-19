const fs = require('fs');

function processFile(filename) {
    if(!fs.existsSync(filename)) return;
    let html = fs.readFileSync(filename, 'utf8');

    // 1. Rename Bookings -> Reservations
    html = html.replace(/Court Booking/g, 'Court Reservation');
    html = html.replace(/Court Bookings/g, 'Court Reservations');
    html = html.replace(/Hall Booking/g, 'Hall Reservation');
    html = html.replace(/Hall Bookings/g, 'Hall Reservations');
    html = html.replace(/Confirm Booking/g, 'Confirm Reservation');
    html = html.replace(/Book the Court/g, 'Reserve the Court');
    html = html.replace(/court bookings/g, 'court reservations');
    html = html.replace(/Cancel Booking/g, 'Cancel Reservation');
    html = html.replace(/Reschedule My Booking/g, 'Reschedule My Reservation');
    html = html.replace(/Upcoming Bookings/g, 'Upcoming Reservations');
    html = html.replace(/Active Bookings/g, 'Active Reservations');
    // Ensure Title is updated too
    html = html.replace(/Add Court Reservation/g, 'Add Court Reservation');
    
    // 2. Remove the instruction in the comboboxes
    html = html.replace(/-- Start Time --/g, '');
    html = html.replace(/-- End Time --/g, '');
    html = html.replace(/-- Choose --/g, '');

    fs.writeFileSync(filename, html);
    console.log(`Processed ${filename}`);
}

processFile('user-dashboard.html');
processFile('home.html');

function processAdmin(filename) {
    if(!fs.existsSync(filename)) return;
    let html = fs.readFileSync(filename, 'utf8');

    // Remove the instruction in the comboboxes for Admin Events
    html = html.replace(/-- Start Time --/g, '');
    html = html.replace(/-- End Time --/g, '');
    html = html.replace(/-- Choose --/g, '');

    // Remove the Print button from Citizen Concerns
    html = html.replace(/onclick="printReport\('Citizen Concerns Report'[^>]+>\s*Print\s*<\/button>/g, '');

    fs.writeFileSync(filename, html);
    console.log(`Processed ${filename}`);
}

processAdmin('admin.html');
