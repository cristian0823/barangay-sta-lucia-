const fs = require('fs');
let txt = fs.readFileSync('user-portal/user-dashboard.html', 'utf8');

// Modal Headers & Buttons
txt = txt.replace(/from-blue-700 to-blue-500/g, 'from-emerald-700 to-emerald-500');
txt = txt.replace(/from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800/g, 'from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800');
txt = txt.replace(/focus:ring-blue-400/g, 'focus:ring-emerald-400');

// Banners in Modal JS
txt = txt.replace('background:linear-gradient(135deg,#6d28d9,#7c3aed)', 'background:linear-gradient(135deg,#10b981,#059669)');
txt = txt.replace('background:linear-gradient(135deg,#1e1b4b,#3730a3)', 'background:linear-gradient(135deg,#064e3b,#047857)');

// Reschedule Banner Colors
txt = txt.replace('bg-blue-50 text-blue-800 p-3 rounded-lg mb-4 text-sm font-bold border border-blue-200', 'bg-emerald-50 text-emerald-800 p-3 rounded-lg mb-4 text-sm font-bold border border-emerald-200');
txt = txt.replace('text-blue-700\">Original Time', 'text-emerald-700\">Original Time');

// Schedule list dot
txt = txt.replace("const dot = isBk ? '🔴' : '🟣';", "const dot = isBk ? '🔴' : '🟢';");

fs.writeFileSync('user-portal/user-dashboard.html', txt);
console.log('Done fixing modal colors!');
