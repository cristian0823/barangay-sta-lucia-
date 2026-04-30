const fs = require('fs');
let html = fs.readFileSync('user-dashboard.html', 'utf8');

const replacements = [
    { from: '👋', to: '' },
    { from: '<span class="mr-2">📦</span>', to: '<span class="mr-2"><i class="bi bi-box-seam"></i></span>' },
    { from: '<span class="mr-2">💬</span>', to: '<span class="mr-2"><i class="bi bi-megaphone-fill"></i></span>' },
    { from: '<span class="mr-2">📅</span>', to: '<span class="mr-2"><i class="bi bi-calendar-check-fill"></i></span>' },
    { from: '📦 Equipment Borrowing', to: '<i class="bi bi-box-seam mr-2"></i>Equipment Borrowing' },
    { from: '💬 Submit a Concern', to: '<i class="bi bi-chat-left-text-fill mr-2"></i>Submit a Concern' },
    { from: '📅 Court Reservation', to: '<i class="bi bi-calendar-check-fill mr-2"></i>Court Reservation' },
    { from: '🎉 Upcoming Court Events', to: '<i class="bi bi-calendar-event-fill mr-2"></i>Upcoming Court Events' },
    { from: '<span class="uqa-icon">📦</span>', to: '<span class="uqa-icon"><i class="bi bi-box-seam"></i></span>' },
    { from: '<span class="uqa-icon">💬</span>', to: '<span class="uqa-icon"><i class="bi bi-chat-left-text-fill"></i></span>' },
    { from: '<span class="uqa-icon">📅</span>', to: '<span class="uqa-icon"><i class="bi bi-calendar-check-fill"></i></span>' },
    { from: '<span class="uqa-icon">🎉</span>', to: '<span class="uqa-icon"><i class="bi bi-calendar-event-fill"></i></span>' },
    { from: '📊', to: '<i class="bi bi-bar-chart-fill"></i>' },
    { from: '🏘️', to: '<i class="bi bi-houses-fill"></i>' },
    { from: '📋', to: '<i class="bi bi-card-list"></i>' },
    { from: '📝 New Report', to: '<i class="bi bi-pencil-square mr-2"></i>New Report' },
    { from: '🚧', to: '' },
    { from: '⚡', to: '' },
    { from: '💧', to: '' },
    { from: '🗑️', to: '' },
    { from: '📝 Other', to: 'Other' },
    { from: '📷 Attach Photo', to: '<i class="bi bi-camera-fill mr-2"></i>Attach Photo' },
    { from: '👤', to: '<i class="bi bi-person-fill"></i>' },
    { from: '✔ Save Changes', to: '<i class="bi bi-check-circle mr-2"></i>Save Changes' },
    { from: '✔', to: '<i class="bi bi-check-all"></i>' },
    { from: '⚙️ Settings', to: '<i class="bi bi-gear-fill mr-2"></i>Settings' },
    { from: '🚪 Logout', to: '<i class="bi bi-box-arrow-right mr-2"></i>Logout' },
    { from: '🔔', to: '<i class="bi bi-bell-fill"></i>' },
    { from: '🌙', to: '<i class="bi bi-moon-fill"></i>' },
    { from: '🔍', to: '<i class="bi bi-search"></i>' },
    { from: '🏀 Basketball Court', to: '<i class="bi bi-dribbble mr-2"></i>Basketball Court' },
    { from: '🏢 Multi-Purpose Hall', to: '<i class="bi bi-building mr-2"></i>Multi-Purpose Hall' },
    { from: '>🏀<', to: '><i class="bi bi-dribbble"></i><' },
    { from: '>📦<', to: '><i class="bi bi-box-seam"></i><' },
    { from: '>💬<', to: '><i class="bi bi-chat-left-text-fill"></i><' },
    { from: '→', to: '<i class="bi bi-arrow-right"></i>' },
    { from: '←', to: '<i class="bi bi-arrow-left"></i>' }
];

replacements.forEach(r => {
    html = html.split(r.from).join(r.to);
});

// Extra cleanup for emojis missed
html = html.replace(/👋/g, '');

fs.writeFileSync('user-dashboard.html', html);
console.log("Done");
