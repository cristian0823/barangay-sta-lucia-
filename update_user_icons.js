const fs = require('fs');
let html = fs.readFileSync('user-dashboard.html', 'utf8');

// Sidebar
html = html.replace(/<div class="nav-icon-box">.*?<\/div>\s*Dashboard/g, '<div class="nav-icon-box"><i class="bi bi-grid-1x2-fill"></i></div> Dashboard');
html = html.replace(/<div class="nav-icon-box">.*?<\/div>\s*Equipment/g, '<div class="nav-icon-box"><i class="bi bi-tools"></i></div> Equipment');
html = html.replace(/<div class="nav-icon-box">.*?<\/div>\s*Concerns/g, '<div class="nav-icon-box"><i class="bi bi-megaphone-fill"></i></div> Concerns');
html = html.replace(/<div class="nav-icon-box">.*?<\/div>\s*Court Booking/g, '<div class="nav-icon-box"><i class="bi bi-calendar-check-fill"></i></div> Court Booking');
html = html.replace(/<div class="nav-icon-box">.*?<\/div>\s*Events/g, '<div class="nav-icon-box"><i class="bi bi-calendar-event-fill"></i></div> Events');
html = html.replace(/<div class="nav-icon-box">.*?<\/div>\s*My Activity/g, '<div class="nav-icon-box"><i class="bi bi-clock-history"></i></div> My Activity');

// User Stat Icons
html = html.replace(/<div class="user-stat-icon"\s+style="background:#eff6ff;border:1px solid #bfdbfe;">.*?<\/div>/g, '<div class="user-stat-icon" style="background:#eff6ff;border:1px solid #bfdbfe; color:#3b82f6; display:flex; align-items:center; justify-content:center; font-size:24px;"><i class="bi bi-calendar-check-fill"></i></div>');
html = html.replace(/<div class="user-stat-icon"\s+style="background:#fffbeb;border:1px solid #fde68a;">.*?<\/div>/g, '<div class="user-stat-icon" style="background:#fffbeb;border:1px solid #fde68a; color:#f59e0b; display:flex; align-items:center; justify-content:center; font-size:24px;"><i class="bi bi-box-fill"></i></div>');
html = html.replace(/<div class="user-stat-icon"\s+style="background:#f5f3ff;border:1px solid #ddd6fe;">.*?<\/div>/g, '<div class="user-stat-icon" style="background:#f5f3ff;border:1px solid #ddd6fe; color:#8b5cf6; display:flex; align-items:center; justify-content:center; font-size:24px;"><i class="bi bi-calendar-event-fill"></i></div>');

// User Quick Actions (uqa-icon)
html = html.replace(/<span class="uqa-icon">.*?<\/span>\s*<span class="uqa-label">Borrow Equipment<\/span>/g, '<span class="uqa-icon"><i class="bi bi-tools"></i></span>\n                                <span class="uqa-label">Borrow Equipment</span>');
html = html.replace(/<span class="uqa-icon">.*?<\/span>\s*<span class="uqa-label">Report Concern<\/span>/g, '<span class="uqa-icon"><i class="bi bi-megaphone-fill"></i></span>\n                                <span class="uqa-label">Report Concern</span>');
html = html.replace(/<span class="uqa-icon">.*?<\/span>\s*<span class="uqa-label">Book a Court<\/span>/g, '<span class="uqa-icon"><i class="bi bi-calendar-check-fill"></i></span>\n                                <span class="uqa-label">Book a Court</span>');
html = html.replace(/<span class="uqa-icon">.*?<\/span>\s*<span class="uqa-label">View Events<\/span>/g, '<span class="uqa-icon"><i class="bi bi-calendar-event-fill"></i></span>\n                                <span class="uqa-label">View Events</span>');

// Mobile Bottom Nav
html = html.replace(/<span class="tab-icon">.*?<\/span>\s*<span class="tab-label">Home<\/span>/g, '<span class="tab-icon"><i class="bi bi-grid-1x2-fill"></i></span>\n                <span class="tab-label">Home</span>');
html = html.replace(/<span class="tab-icon">.*?<\/span>\s*<span class="tab-label">Bookings<\/span>/g, '<span class="tab-icon"><i class="bi bi-calendar-check-fill"></i></span>\n                <span class="tab-label">Bookings</span>');
html = html.replace(/<span class="tab-icon">.*?<\/span>\s*<span class="tab-label">Requests<\/span>/g, '<span class="tab-icon"><i class="bi bi-box-fill"></i></span>\n                <span class="tab-label">Requests</span>');
html = html.replace(/<span class="tab-icon">.*?<\/span>\s*<span class="tab-label">Activity<\/span>/g, '<span class="tab-icon"><i class="bi bi-clock-history"></i></span>\n                <span class="tab-label">Activity</span>');
html = html.replace(/<span class="tab-icon">.*?<\/span>\s*<span class="tab-label">Profile<\/span>/g, '<span class="tab-icon"><i class="bi bi-person-fill"></i></span>\n                <span class="tab-label">Profile</span>');

fs.writeFileSync('user-dashboard.html', html);
console.log('user-dashboard.html updated');
