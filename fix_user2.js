const fs = require('fs');
let txt = fs.readFileSync('user-portal/user-dashboard.html', 'utf8');

// Activity Tracker Head
txt = txt.replace('background:linear-gradient(135deg,#0f172a 0%,#1e3a5f 50%,#065f46 100%)', 'background:linear-gradient(135deg,#064e3b 0%,#047857 50%,#0f766e 100%)');
txt = txt.replace('>📜</div>', '><i class="bi bi-journal-text" style="color:#10b981;"></i></div>');

// History Data Icons & Colors
txt = txt.replace(/icon: '📦', colorClass: 'bg-blue-100 text-blue-600 border-blue-200 dark:bg-blue-900\/30 dark:border-blue-800\/50 dark:text-blue-400'/g, `icon: '<i class="bi bi-box-seam"></i>', colorClass: 'bg-emerald-100 text-emerald-600 border-emerald-200 dark:bg-emerald-900/30 dark:border-emerald-800/50 dark:text-emerald-400'`);
txt = txt.replace(/icon: '💬', colorClass: 'bg-amber-100 text-amber-600 border-amber-200 dark:bg-amber-900\/30 dark:border-amber-800\/50 dark:text-amber-400'/g, `icon: '<i class="bi bi-chat-left-text"></i>', colorClass: 'bg-emerald-100 text-emerald-600 border-emerald-200 dark:bg-emerald-900/30 dark:border-emerald-800/50 dark:text-emerald-400'`);
txt = txt.replace(/icon: '📅', colorClass: 'bg-emerald-100 text-emerald-600 border-emerald-200 dark:bg-emerald-900\/30 dark:border-emerald-800\/50 dark:text-emerald-400'/g, `icon: '<i class="bi bi-calendar-event"></i>', colorClass: 'bg-emerald-100 text-emerald-600 border-emerald-200 dark:bg-emerald-900/30 dark:border-emerald-800/50 dark:text-emerald-400'`);

// History Type Tag
txt = txt.replace('📌 ${a.type}', '<i class="bi bi-tag mr-1"></i> ${a.type}');

// Court Reservation Header
txt = txt.replace('class="panel-header text-blue-600"', 'class="panel-header text-emerald-600"');
txt = txt.replace(/titleEl.innerHTML = '🏢 Hall Reservation';/g, "titleEl.innerHTML = '<i class=\"bi bi-building mr-2\"></i>Hall Reservation';");

// Switch Venue button styles
txt = txt.replace('class="px-6 py-2.5 rounded-xl font-bold text-sm bg-blue-600 text-white', 'class="px-6 py-2.5 rounded-xl font-bold text-sm bg-emerald-600 text-white');
txt = txt.replace("const activeClass = 'px-6 py-2.5 rounded-xl font-bold text-sm bg-blue-600 text-white shadow-md transition-all border-none cursor-pointer transform hover:scale-105 active:scale-95';", "const activeClass = 'px-6 py-2.5 rounded-xl font-bold text-sm bg-emerald-600 text-white shadow-md transition-all border-none cursor-pointer transform hover:scale-105 active:scale-95';");

fs.writeFileSync('user-portal/user-dashboard.html', txt);
console.log('Done user-dashboard!');
