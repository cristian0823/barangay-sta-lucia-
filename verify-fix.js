const fs = require('fs');
const lines = fs.readFileSync('admin.html', 'utf8').split('\n');

const evCount = lines.filter(l => l.includes('id="events-section"')).length;
const concernsTableCount = lines.filter(l => l.includes('id="concernsTable"')).length;
const adminSelectedVenueCount = lines.filter(l => l.includes('id="adminSelectedVenue"')).length;
const adminCalendarMonthCount = lines.filter(l => l.includes('id="adminCalendarMonth"')).length;

console.log('events-section divs:', evCount, '(should be 1)');
console.log('concernsTable tbodys:', concernsTableCount, '(should be 1)');
console.log('adminSelectedVenue inputs:', adminSelectedVenueCount, '(should be 1)');
console.log('adminCalendarMonth h2s:', adminCalendarMonthCount, '(should be 1)');
console.log('Total lines:', lines.length);
