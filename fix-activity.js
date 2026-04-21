const fs = require('fs');
let html = fs.readFileSync('user-dashboard.html', 'utf8');

// 1. Fix missing </div> closing for panel-profile
html = html.replace(
    /<\/div>\n\s*<!-- PANEL 7: HISTORY -->/,
    '</div>\n                </div>\n\n            <!-- PANEL 7: HISTORY -->'
);

// 2. Redesign the HTML header for panel-history
const oldHeader = /<div class="mb-8 border-b pb-6" style="border-color: var\(--border-color\);">[\s\S]*?<h2 class="text-3xl font-extrabold text-emerald-600 mb-2">📜 My Activity<\/h2>[\s\S]*?<p style="color: var\(--text-muted\);">View all your borrowings, concerns, and court reservations\.<\/p>[\s\S]*?<\/div>/;

const newHeader = `<div class="settings-hero" style="position:relative; background:linear-gradient(135deg,#0f172a 0%,#1e3a5f 50%,#065f46 100%); border-radius:20px; padding:24px 28px; margin-bottom:24px; overflow:hidden;">
                    <div style="position:relative;z-index:1;display:flex;align-items:center;gap:16px;">
                        <div style="width:52px;height:52px;border-radius:14px;background:rgba(16,185,129,0.2);border:1px solid rgba(16,185,129,0.35);display:flex;align-items:center;justify-content:center;font-size:24px;flex-shrink:0;">📜</div>
                        <div>
                            <div class="settings-hero-title" style="font-size:22px;font-weight:800;color:#fff;margin-bottom:3px;">My Activity Tracker</div>
                            <div style="font-size:13px;color:#cbd5e1;">A complete timeline of your interactions, requests, and reservations.</div>
                        </div>
                    </div>
                </div>`;
html = html.replace(oldHeader, newHeader);

// 3. Redesign the generated JS cards & fix Tailwind runtime dynamic colors
// Current colors: blue, amber, emerald. 
// We will pre-generate full classes in the object instead of using `bg-${a.color}-100`.
const oldItemRender = /<div class="flex items-start gap-4 p-4 rounded-xl border border-gray-100 hover:shadow-md transition bg-gray-50\/50 dark:bg-slate-800\/50 dark:border-slate-700">[\s\S]*?<\/div><\/div><\/div>`/g;

// To target the exact replacement for the JS array mapping:
// We need to look at lines 3004-3006
html = html.replace(/color: 'blue'/g, "colorClass: 'bg-blue-100 text-blue-600 border-blue-200 dark:bg-blue-900/30 dark:border-blue-800/50 dark:text-blue-400'");
html = html.replace(/color: 'amber'/g, "colorClass: 'bg-amber-100 text-amber-600 border-amber-200 dark:bg-amber-900/30 dark:border-amber-800/50 dark:text-amber-400'");
html = html.replace(/color: 'emerald'/g, "colorClass: 'bg-emerald-100 text-emerald-600 border-emerald-200 dark:bg-emerald-900/30 dark:border-emerald-800/50 dark:text-emerald-400'");

const newCardTemplate = `
<div class="group relative flex items-start gap-4 p-5 rounded-2xl border hover:-translate-y-1 hover:shadow-xl transition-all duration-300 bg-white dark:bg-slate-800/70 border-gray-100 dark:border-slate-700 overflow-hidden">
    <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent dark:via-white/5 opacity-0 group-hover:opacity-100 -translate-x-[100%] group-hover:translate-x-[100%] transition-all duration-700 ease-in-out pointer-events-none"></div>
    <div class="\${a.colorClass} w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-black border shadow-sm shrink-0 transition-transform group-hover:scale-110">
        \${a.icon}
    </div>
    <div class="flex-1 w-full flex flex-col justify-center">
        <div class="flex justify-between items-start gap-3 w-full">
            <h4 class="font-extrabold text-gray-900 dark:text-white text-[15px] leading-snug">\${a.title}</h4>
            <span class="text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-1.5 rounded-lg shadow-sm border border-white/50 backdrop-blur-md \${statusColor} shrink-0">\${displayStatus}</span>
        </div>
        <div class="flex items-center gap-3 mt-3 text-xs text-gray-500 dark:text-gray-400 font-semibold w-full">
            <span class="bg-gray-100 dark:bg-slate-700/80 px-2.5 py-1 rounded-md text-[11px] shadow-sm flex items-center gap-1">
                📌 \${a.type}
            </span>
            <span class="flex items-center gap-1.5">
                <i class="bi bi-clock"></i>
                \${isNaN(a.date.getTime())?'Unknown Date':a.date.toLocaleDateString('en-US', {month:'short', day:'numeric', year:'numeric'})+' at '+a.date.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}
            </span>
        </div>
    </div>
</div>\``;

html = html.replace(
    /(return `)<div class="flex items-start gap-4 p-4 rounded-xl border border-gray-100[\s\S]*?<\/div><\/div><\/div>(`;)/, 
    "$1" + newCardTemplate + "$2"
);

// We should also replace the container for unifiedHistoryList to make it a CSS grid if possible, or just add some better spacing.
const historyListHtml = '<div id="unifiedHistoryList" class="space-y-4">';
const newHistoryListHtml = '<div id="unifiedHistoryList" class="grid grid-cols-1 md:grid-cols-2 gap-5">';
html = html.replace(historyListHtml, newHistoryListHtml);

fs.writeFileSync('user-dashboard.html', html);
console.log('✅ Activity panel rebuilt with premium design and structural fix applied');
