const fs = require('fs');
let content = fs.readFileSync('court-scheduling.html', 'utf8');

content = content.replace(/<span>Booked<\/span>/g, '<span>Reserved</span>');
content = content.replace(/Book Your Venue/g, 'Reserve Your Venue');
content = content.replace(/New Booking/g, 'New Reservation');
content = content.replace(/purpose of your booking/g, 'purpose of your reservation');
content = content.replace(/Submit Booking/g, 'Submit Reservation');
content = content.replace(/My Bookings/g, 'My Reservations');
content = content.replace(/All Bookings \(Admin\)/g, 'All Reservations (Admin)');
content = content.replace(/>Booked</g, '>Reserved<');
content = content.replace(/Book for/g, 'Reserve for');
content = content.replace(/book slots/g, 'reserve slots');
content = content.replace(/Book Your Court/g, 'Reserve Your Court');
content = content.replace(/No bookings yet/g, 'No reservations yet');
content = content.replace(/book the basketball court/g, 'reserve the basketball court');
content = content.replace(/available for booking/g, 'available for reservation');
content = content.replace(/✅ Booked/g, '✅ Reserved');
content = content.replace(/👤 Booked by/g, '👤 Reserved by');
content = content.replace(/delete this booking\?/g, 'delete this reservation?');
content = content.replace(/'Delete Booking'/g, "'Delete Reservation'");

fs.writeFileSync('court-scheduling.html', content);
console.log('court-scheduling.html updated.');
