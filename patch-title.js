const fs = require('fs');
let html = fs.readFileSync('user-dashboard.html', 'utf8');

html = html.replace('<h2 id="bookingPanelTitle" class="panel-header text-blue-600">📅 Facility Reservation</h2>', '<h2 id="bookingPanelTitle" class="panel-header text-blue-600">📅 Court Reservation</h2>');

html = html.replace("if (titleEl) titleEl.innerHTML = '📅 Facility Reservation';", "if (titleEl) titleEl.innerHTML = '📅 Court Reservation';");

fs.writeFileSync('user-dashboard.html', html);
console.log('Fixed panel titles!');
