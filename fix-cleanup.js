const fs = require('fs');
let html = fs.readFileSync('user-dashboard.html', 'utf8');

// 1. Remove leftover old icon code from the botched partial replace:
const leftoverStart = `            
            if (n === 'Chairs') return getBox('🪑', 'bg-blue-50 border-blue-200 dark:bg-blue-500/10 dark:border-blue-500/20 text-xl');`;
const leftoverEnd = `            return getBox(symbol, 'bg-emerald-50 border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/20 text-xl');
        }`;

const leftoverStartIdx = html.indexOf(leftoverStart);
const leftoverEndIdx = html.indexOf(leftoverEnd);
if (leftoverStartIdx !== -1 && leftoverEndIdx !== -1) {
    html = html.substring(0, leftoverStartIdx) + html.substring(leftoverEndIdx + leftoverEnd.length);
    console.log('✅ Removed leftover old icon code');
} else {
    console.log('⚠️ Could not find leftover code, skipping');
}

// 2. Fix Today button - find the exact calendar nav
const oldCalNav = `<div class="flex gap-2">
                            <button onclick="changeBookingMonth(-1)"`;
const newCalNav = `<div class="flex items-center gap-2">
                            <button onclick="changeBookingMonth(-1)"`;

if (html.includes(oldCalNav)) {
    html = html.replace(oldCalNav, newCalNav);
    // Now inject the Today button between the two nav buttons
    const oldNavEnd = `style="background-color: var(--input-bg); border-color: var(--border-color); color: var(--text-main);">←</button>
                            <button onclick="changeBookingMonth(1)"`;
    const newNavEnd = `style="background-color: var(--input-bg); border-color: var(--border-color); color: var(--text-main);">←</button>
                            <button onclick="(function(){const t=new Date();bookingYear=t.getFullYear();bookingMonth=t.getMonth();renderBookingCalendar();})()" class="px-3 h-9 flex items-center justify-center rounded-xl font-bold text-xs transition border border-emerald-400 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-700" style="min-width:52px;">Today</button>
                            <button onclick="changeBookingMonth(1)"`;
    html = html.replace(oldNavEnd, newNavEnd);
    console.log('✅ Today button added');
} else {
    console.log('Trying alternate nav pattern...');
    // Try finding the nav by looking for the arrow characters
    html = html.replace(
        /(<div class="flex [^"]*gap-2[^"]*">\s*<button onclick="changeBookingMonth\(-1\)"[^>]+>)←(<\/button>\s*<button onclick="changeBookingMonth\(1\)")/,
        '$1←</button>\n                            <button onclick="(function(){const t=new Date();bookingYear=t.getFullYear();bookingMonth=t.getMonth();renderBookingCalendar();})()" class="px-3 h-9 flex items-center justify-center rounded-xl font-bold text-xs transition border border-emerald-400 bg-emerald-50 text-emerald-700 hover:bg-emerald-100" style="min-width:52px;">Today</button>\n                            $2'
    );
    console.log('✅ Applied alternate Today fix');
}

fs.writeFileSync('user-dashboard.html', html);
console.log('Done!');
