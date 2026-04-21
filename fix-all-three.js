const fs = require('fs');

// ===== FIX 1: Admin Sidebar - compress to no-scroll =====
let admin = fs.readFileSync('admin.html', 'utf8');

// Compress left-sidebar-top padding
admin = admin.replace(
    'padding: 20px 16px 12px;',
    'padding: 10px 12px 8px;'
);

// Compress left-sidebar-nav gap and padding
admin = admin.replace(
    /\.left-sidebar-nav \{[\s\S]*?padding: 12px 10px;[\s\S]*?gap: 4px;/m,
    '.left-sidebar-nav {\n            padding: 6px 8px;\n            display: flex;\n            flex-direction: column;\n            gap: 2px;'
);

// Make sidebar-btn more compact
admin = admin.replace(
    'padding: 10px 14px;\n            border-radius: 14px;',
    'padding: 7px 10px;\n            border-radius: 12px;'
);
admin = admin.replace(
    '            font-size: 14px;\n            font-weight: 600;',
    '            font-size: 13px;\n            font-weight: 600;'
);

// Make the icon box smaller
admin = admin.replace(
    '            width: 38px;\n            height: 38px;\n            border-radius: 12px;',
    '            width: 32px;\n            height: 32px;\n            border-radius: 10px;'
);
admin = admin.replace(
    '            font-size: 18px;',
    '            font-size: 15px;'
);

// Compress left-sidebar-footer
admin = admin.replace(
    'padding: 10px;\n            border-top: 1px solid var(--border);',
    'padding: 6px;\n            border-top: 1px solid var(--border);'
);

// Make gap in .left-sidebar-nav gap spacing (already did above some)

fs.writeFileSync('admin.html', admin);
console.log('✅ Admin sidebar compressed');

// ===== FIX 2: Equipment icons in user-dashboard - replace emojis with Bootstrap icons =====
let usr = fs.readFileSync('user-dashboard.html', 'utf8');

// Replace the getEquipmentIcon function to use Bootstrap icons instead of emoji/SVG
const oldFn = `function getEquipmentIcon(name) {
            if (!name) name = '';
            const n = name.trim();
            const getBox = (html, classes) => \`<div class=\"w-12 h-12 rounded-xl border flex items-center justify-center shrink-0 shadow-sm transition-all \${classes}\">\${html}</div>\`;
            
            if (n === 'Chairs') return getBox('🪑', 'bg-blue-50 border-blue-200 dark:bg-blue-500/10 dark:border-blue-500/20 text-xl');
            if (n === 'Tables') return getBox(\`<svg width="24" height="24" viewBox="0 0 24 24" fill="#059669"><rect x="1" y="7" width="22" height="3" rx="1.5"/><rect x="3" y="10" width="2.5" height="10" rx="1.25"/><rect x="18.5" y="10" width="2.5" height="10" rx="1.25"/><rect x="5" y="10" width="14" height="1.5" rx="0.75"/></svg>\`, 'bg-emerald-50 border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/20');
            if (n === 'Tents') return getBox('⛺', 'bg-fuchsia-50 border-fuchsia-200 dark:bg-fuchsia-500/10 dark:border-fuchsia-500/20 text-xl');
            if (n === 'Ladder') return getBox(\`<svg width="24" height="24" viewBox="0 0 24 24" fill="#d97706"><rect x="5" y="1" width="2.5" height="22" rx="1.25"/><rect x="16.5" y="1" width="2.5" height="22" rx="1.25"/><rect x="5" y="4" width="14" height="2" rx="1"/><rect x="5" y="10" width="14" height="2" rx="1"/><rect x="5" y="16" width="14" height="2" rx="1"/></svg>\`, 'bg-orange-50 border-orange-200 dark:bg-orange-500/10 dark:border-orange-500/20');
            if (n === 'Microphone') return getBox(\`<svg width="20" height="20" viewBox="0 0 16 16" fill="#dc2626"><path d="M5 3a3 3 0 0 1 6 0v5a3 3 0 0 1-6 0z"/><path d="M3.5 6.5A.5.5 0 0 1 4 7v1a4 4 0 0 0 8 0V7a.5.5 0 0 1 1 0v1a5 5 0 0 1-4.5 4.975V15h3a.5.5 0 0 1 0 1h-7a.5.5 0 0 1 0-1h3v-2.025A5 5 0 0 1 3 8V7a.5.5 0 0 1 .5-.5"/></svg>\`, 'bg-red-50 border-red-200 dark:bg-red-500/10 dark:border-red-500/20');
            if (n === 'Speaker') return getBox(\`<svg width="20" height="20" viewBox="0 0 16 16" fill="#7c3aed"><path d="M9 4a1 1 0 1 1 2 0v8a1 1 0 0 1-2 0zm-2.5.5a.5.5 0 1 1 1 0v6a.5.5 0 0 1-1 0zm-2 .5a.5.5 0 1 1 1 0v4a.5.5 0 0 1-1 0zm-2 .5a.5.5 0 1 1 1 0v2a.5.5 0 0 1-1 0z"/></svg>\`, 'bg-purple-50 border-purple-200 dark:bg-purple-500/10 dark:border-purple-500/20');
            if (n === 'Electric Fan') return getBox(\`<svg width="20" height="20" viewBox="0 0 16 16" fill="#3b82f6"><path d="M10 3c0 1.313-.304 2.508-.8 3.4a1.991 1.991 0 0 0-1.484-.38c-.28-.982-.91-2.04-1.838-2.969a8.368 8.368 0 0 0-1.081-.928c.812-1.15 1.773-1.699 2.854-1.699C8.867 1.424 10 2.22 10 3zm-4.484.582c.448.91 1.077 1.986 1.996 2.915a1.99 1.99 0 0 0-1.483 1.13c-.983-.28-2.04-.91-2.97-1.838A8.35 8.35 0 0 1 2.13 4.708c.553.072 1.144.332 1.731.782a17.202 17.202 0 0 1 .655.492zM8 4.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0z"/></svg>\`, 'bg-blue-50 border-blue-200 dark:bg-blue-500/10 dark:border-blue-500/20');
            
            // Default check from db first
            let symbol = '📦';
            if (allEquipmentList && allEquipmentList.length > 0) {
                const found = allEquipmentList.find(e => e.name && e.name.toLowerCase() === n.toLowerCase());
                if (found && found.icon) symbol = found.icon;
            }
            return getBox(symbol, 'bg-emerald-50 border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/20 text-xl');
        }`;

const newFn = `function getEquipmentIcon(name) {
            if (!name) name = '';
            const n = name.trim().toLowerCase();
            const getBox = (icon, colorClass) => \`<div class="w-12 h-12 rounded-xl border flex items-center justify-center shrink-0 shadow-sm \${colorClass}"><i class="bi \${icon}" style="font-size:20px;"></i></div>\`;

            if (n === 'chairs' || n.includes('chair')) return getBox('bi-person-workspace', 'bg-blue-50 border-blue-200 dark:bg-blue-500/10 dark:border-blue-500/20 text-blue-600');
            if (n === 'tables' || n.includes('table')) return getBox('bi-table', 'bg-emerald-50 border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/20 text-emerald-600');
            if (n === 'tents' || n.includes('tent')) return getBox('bi-house-fill', 'bg-fuchsia-50 border-fuchsia-200 dark:bg-fuchsia-500/10 dark:border-fuchsia-500/20 text-fuchsia-600');
            if (n === 'ladder' || n.includes('ladder')) return getBox('bi-ladder', 'bg-orange-50 border-orange-200 dark:bg-orange-500/10 dark:border-orange-500/20 text-orange-600');
            if (n === 'microphone' || n.includes('mic')) return getBox('bi-mic-fill', 'bg-red-50 border-red-200 dark:bg-red-500/10 dark:border-red-500/20 text-red-500');
            if (n === 'speaker' || n.includes('speaker')) return getBox('bi-speaker-fill', 'bg-purple-50 border-purple-200 dark:bg-purple-500/10 dark:border-purple-500/20 text-purple-600');
            if (n.includes('fan')) return getBox('bi-wind', 'bg-blue-50 border-blue-200 dark:bg-blue-500/10 dark:border-blue-500/20 text-blue-500');
            if (n.includes('projector') || n.includes('screen')) return getBox('bi-projector-fill', 'bg-indigo-50 border-indigo-200 dark:bg-indigo-500/10 dark:border-indigo-500/20 text-indigo-600');
            if (n.includes('generator') || n.includes('power')) return getBox('bi-lightning-charge-fill', 'bg-yellow-50 border-yellow-200 dark:bg-yellow-500/10 dark:border-yellow-500/20 text-yellow-600');
            if (n.includes('sound') || n.includes('audio')) return getBox('bi-music-note-beamed', 'bg-pink-50 border-pink-200 dark:bg-pink-500/10 dark:border-pink-500/20 text-pink-600');
            if (n.includes('camera')) return getBox('bi-camera-fill', 'bg-teal-50 border-teal-200 dark:bg-teal-500/10 dark:border-teal-500/20 text-teal-600');
            if (n.includes('wire') || n.includes('cable')) return getBox('bi-ethernet', 'bg-gray-50 border-gray-200 dark:bg-gray-500/10 dark:border-gray-500/20 text-gray-600');
            // default
            return getBox('bi-box-seam-fill', 'bg-emerald-50 border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/20 text-emerald-600');
        }`;

usr = usr.replace(oldFn, newFn);

// ===== FIX 3: Court Reservation - add "Today" label centered between arrows =====
// Replace the month nav area to include a Today button centered
usr = usr.replace(
    `<div class="flex justify-between items-center mb-6">
                        <h3 id="calendarMonthTitle" class="text-lg font-extrabold" style="color: var(--text-main);">Month</h3>
                        <div class="flex gap-2">
                            <button onclick="changeBookingMonth(-1)" class="w-9 h-9 flex items-center justify-center rounded-xl font-bold transition border" style="background-color: var(--input-bg); border-color: var(--border-color); color: var(--text-main);">←</button>
                            <button onclick="changeBookingMonth(1)" class="w-9 h-9 flex items-center justify-center rounded-xl font-bold transition border" style="background-color: var(--input-bg); border-color: var(--border-color); color: var(--text-main);">→</button>
                        </div>
                    </div>`,
    `<div class="flex justify-between items-center mb-6">
                        <h3 id="calendarMonthTitle" class="text-lg font-extrabold" style="color: var(--text-main);">Month</h3>
                        <div class="flex items-center gap-2">
                            <button onclick="changeBookingMonth(-1)" class="w-9 h-9 flex items-center justify-center rounded-xl font-bold transition border" style="background-color: var(--input-bg); border-color: var(--border-color); color: var(--text-main);">←</button>
                            <button onclick="(function(){const t=new Date();bookingYear=t.getFullYear();bookingMonth=t.getMonth();renderBookingCalendar();})()" class="px-3 h-9 flex items-center justify-center rounded-xl font-bold text-xs transition border border-emerald-400 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-700" style="min-width:52px;">Today</button>
                            <button onclick="changeBookingMonth(1)" class="w-9 h-9 flex items-center justify-center rounded-xl font-bold transition border" style="background-color: var(--input-bg); border-color: var(--border-color); color: var(--text-main);">→</button>
                        </div>
                    </div>`
);

fs.writeFileSync('user-dashboard.html', usr);
console.log('✅ Equipment icons updated and Today button added');
