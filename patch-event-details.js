const fs = require('fs');

let content = fs.readFileSync('user-dashboard.html', 'utf8');

const regex = /'<div class="flex items-center gap-2"><span class="text-sm">By ' \+ e\.organizer \+ '<\/span><\/div>'\s*\+\s*'<\/div><\/div>';/;

const replaceStr = `'<div class="flex items-center gap-2' + (e.capacity || e.description ? ' mb-2' : '') + '"><span class="text-sm">By ' + e.organizer + '</span></div>' +
                    (e.capacity ? '<div class="flex items-center gap-2 mb-2"><span class="text-sm font-bold text-indigo-100">👥 Capacity: ' + e.capacity + ' max</span></div>' : '') +
                    (e.description ? '<div class="mt-3 text-sm bg-black/20 p-3 rounded-lg italic shadow-inner border border-white/10">💬 ' + (typeof window.escapeHtml === 'function' ? escapeHtml(e.description) : e.description) + '</div>' : '') +
                    '</div></div>';`;

if (regex.test(content)) {
    content = content.replace(regex, replaceStr);
    fs.writeFileSync('user-dashboard.html', content);
    console.log('user-dashboard.html updated via regex.');
} else {
    console.log('Regex did NOT match user-dashboard.html');
}
