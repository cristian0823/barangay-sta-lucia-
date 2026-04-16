const fs = require('fs');
let html = fs.readFileSync('admin.html', 'utf8');

// Sidebar
html = html.replace(/<span class="nav-icon-box">.*?<\/span>\s*Overview/g, '<span class="nav-icon-box"><i class="bi bi-grid-1x2-fill"></i></span> Overview');
html = html.replace(/<span class="nav-icon-box">.*?<\/span>\s*Court Bookings/g, '<span class="nav-icon-box"><i class="bi bi-calendar-check-fill"></i></span> Court Bookings');
html = html.replace(/<span class="nav-icon-box">.*?<\/span>\s*Multi-Purpose Hall/g, '<span class="nav-icon-box"><i class="bi bi-building-fill"></i></span> Multi-Purpose Hall');
html = html.replace(/<span class="nav-icon-box">.*?<\/span>\s*Equipment Requests/g, '<span class="nav-icon-box"><i class="bi bi-box-fill"></i></span> Equipment Requests');
html = html.replace(/<span class="nav-icon-box">.*?<\/span>\s*Concerns/g, '<span class="nav-icon-box"><i class="bi bi-megaphone-fill"></i></span> Concerns');
html = html.replace(/<span class="nav-icon-box">.*?<\/span>\s*Manage Users/g, '<span class="nav-icon-box"><i class="bi bi-people-fill"></i></span> Manage Users');
html = html.replace(/<span class="nav-icon-box">.*?<\/span>\s*Court Events/g, '<span class="nav-icon-box"><i class="bi bi-calendar-event-fill"></i></span> Court Events');
html = html.replace(/<span class="nav-icon-box">.*?<\/span>\s*Equipment/g, '<span class="nav-icon-box"><i class="bi bi-tools"></i></span> Equipment');
html = html.replace(/<span class="nav-icon-box">.*?<\/span>\s*Reports/g, '<span class="nav-icon-box"><i class="bi bi-file-earmark-bar-graph-fill"></i></span> Reports');
html = html.replace(/<span class="nav-icon-box">.*?<\/span>\s*Activity Log/g, '<span class="nav-icon-box"><i class="bi bi-clock-history"></i></span> Activity Log');

// Quick Actions
html = html.replace(/<div class="qa-icon">.*?<\/div>\s*<div class="qa-label">Court Bookings<\/div>/g, '<div class="qa-icon" style="color:var(--qa-color)"><i class="bi bi-calendar-check-fill"></i></div>\n                                <div class="qa-label">Court Bookings</div>');
html = html.replace(/<div class="qa-icon">.*?<\/div>\s*<div class="qa-label">Equipment Requests<\/div>/g, '<div class="qa-icon" style="color:var(--qa-color)"><i class="bi bi-box-fill"></i></div>\n                                <div class="qa-label">Equipment Requests</div>');
html = html.replace(/<div class="qa-icon">.*?<\/div>\s*<div class="qa-label">Citizen Concerns<\/div>/g, '<div class="qa-icon" style="color:var(--qa-color)"><i class="bi bi-megaphone-fill"></i></div>\n                                <div class="qa-label">Citizen Concerns</div>');
html = html.replace(/<div class="qa-icon">.*?<\/div>\s*<div class="qa-label">Court Events<\/div>/g, '<div class="qa-icon" style="color:var(--qa-color)"><i class="bi bi-calendar-event-fill"></i></div>\n                                <div class="qa-label">Court Events</div>');

// Stat Cards
html = html.replace(/<div class="stat-icon"\s+style="background:#fffbeb;border:1px solid #fde68a;">.*?<\/div>/g, '<div class="stat-icon" style="background:#fffbeb;border:1px solid #fde68a; color:#f59e0b; display:flex; align-items:center; justify-content:center; font-size:24px;"><i class="bi bi-box-fill"></i></div>');
html = html.replace(/<div class="stat-icon"\s+style="background:#fef2f2;border:1px solid #fecaca;">.*?<\/div>/g, '<div class="stat-icon" style="background:#fef2f2;border:1px solid #fecaca; color:#ef4444; display:flex; align-items:center; justify-content:center; font-size:24px;"><i class="bi bi-megaphone-fill"></i></div>');
html = html.replace(/<div class="stat-icon"\s+style="background:#eff6ff;border:1px solid #bfdbfe;">.*?<\/div>/g, '<div class="stat-icon" style="background:#eff6ff;border:1px solid #bfdbfe; color:#3b82f6; display:flex; align-items:center; justify-content:center; font-size:24px;"><i class="bi bi-calendar-check-fill"></i></div>');
html = html.replace(/<div class="stat-icon"\s+style="background:#ecfdf5;border:1px solid #a7f3d0;">.*?<\/div>/g, '<div class="stat-icon" style="background:#ecfdf5;border:1px solid #a7f3d0; color:#10b981; display:flex; align-items:center; justify-content:center; font-size:24px;"><i class="bi bi-people-fill"></i></div>');

// Mobile Bottom Nav
html = html.replace(/<span class="tab-icon">.*?<\/span>\s*<span class="tab-label">Home<\/span>/g, '<span class="tab-icon"><i class="bi bi-grid-1x2-fill"></i></span>\n                <span class="tab-label">Home</span>');
html = html.replace(/<span class="tab-icon">.*?<\/span>\s*<span class="tab-label">Bookings<\/span>/g, '<span class="tab-icon"><i class="bi bi-calendar-check-fill"></i></span>\n                <span class="tab-label">Bookings</span>');
html = html.replace(/<span class="tab-icon">.*?<\/span>\s*<span class="tab-label">Requests<\/span>/g, '<span class="tab-icon"><i class="bi bi-box-fill"></i></span>\n                <span class="tab-label">Requests</span>');
html = html.replace(/<span class="tab-icon">.*?<\/span>\s*<span class="tab-label">More<\/span>/g, '<span class="tab-icon"><i class="bi bi-list"></i></span>\n                <span class="tab-label">More</span>');

fs.writeFileSync('admin.html', html);
console.log('admin.html updated');
