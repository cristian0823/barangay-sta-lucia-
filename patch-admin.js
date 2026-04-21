const fs = require('fs');
let content = fs.readFileSync('admin.html', 'utf8');

content = content.replace(/> Reject Booking</g, '> Reject Reservation<');
content = content.replace(/This booking has already/g, 'This reservation has already');
content = content.replace(/No bookings or events for this day./g, 'No reservations or events for this day.');
content = content.replace(/> Cancel All Bookings for This Day</g, '> Cancel All Reservations for This Day<');
content = content.replace(/> Cancel All Bookings</g, '> Cancel All Reservations<');
content = content.replace(/>Keep Bookings</g, '>Keep Reservations<');
content = content.replace(/<span class="tab-label">Bookings<\/span>/g, '<span class="tab-label">Reservations</span>');

// Others that might be left:
content = content.replace(/Approve Booking/g, 'Approve Reservation');
content = content.replace(/>Approve<\/button>/g, '>Approve</button>'); // No change
content = content.replace(/Reject Booking/g, 'Reject Reservation');
content = content.replace(/Booking Details/g, 'Reservation Details');

fs.writeFileSync('admin.html', content);
console.log('admin.html patched.');
