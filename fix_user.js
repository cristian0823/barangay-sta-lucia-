const fs = require('fs');
let txt = fs.readFileSync('user-portal/user-dashboard.html', 'utf8');

txt = txt.replace('bg-purple-100 border border-purple-300', 'bg-emerald-100 border border-emerald-300');
txt = txt.replace('text-purple-600 mb-2', 'text-emerald-600 mb-2');
txt = txt.replace('bg-purple-600 text-white border-2 border-purple-700 cursor-pointer hover:bg-purple-700', 'bg-emerald-600 text-white border-2 border-emerald-700 cursor-pointer hover:bg-emerald-700');
txt = txt.replace(/bg-purple-50 border-purple-200/g, 'bg-emerald-50 border-emerald-200');
txt = txt.replace(/text-purple-700/g, 'text-emerald-700');
txt = txt.replace('from-indigo-500 to-purple-600', 'from-emerald-500 to-emerald-700');
txt = txt.replace(/text-indigo-100/g, 'text-emerald-100');

txt = txt.replace('background:linear-gradient(135deg,#f59e0b,#ef4444)', 'background:linear-gradient(135deg,#10b981,#059669)');
txt = txt.replace('background:linear-gradient(135deg,#3b82f6,#1d4ed8)', 'background:linear-gradient(135deg,#10b981,#059669)');

fs.writeFileSync('user-portal/user-dashboard.html', txt);
console.log('Done!');
