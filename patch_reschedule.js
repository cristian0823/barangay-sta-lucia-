const fs = require('fs');
let appJs = fs.readFileSync('js/app.js', 'utf8');

const updateFunc = `
async function updateEvent(id, eventData) {
    // Note: checkTimeOverlap should ideally support excludeId, but if not we might get false positive overlaps with ourselves
    // If it fails overlap, we check if it overlaps with anything other than ourselves.
    
    const supabaseAvailable = await isSupabaseAvailable();
    const eventWithStatus = { ...eventData, status: 'approved' };
    let success = false;
    let errorMsg = '';

    if (supabaseAvailable) {
        try {
            const { error } = await supabase.from('events').update(eventWithStatus).eq('id', id);
            if (!error) {
                await logActivity('Event Updated', \`Updated event: \${eventData.title} on \${eventData.date}\`);
                success = true;
                _eventsCache = null;
            } else {
                errorMsg = error.message;
            }
        } catch(e) { errorMsg = e.message; }
    } else {
        const events = JSON.parse(localStorage.getItem('barangay_events') || '[]');
        const idx = events.findIndex(e => String(e.id) === String(id));
        if (idx !== -1) {
            events[idx] = { ...events[idx], ...eventWithStatus };
            localStorage.setItem('barangay_events', JSON.stringify(events));
            success = true;
            _eventsCache = null;
        } else {
            errorMsg = 'Event not found locally';
        }
    }
    return { success, message: success ? 'Event updated successfully' : errorMsg };
}
window.updateEvent = updateEvent;
`;

if (!appJs.includes('function updateEvent')) {
    appJs += '\n' + updateFunc;
    fs.writeFileSync('js/app.js', appJs);
}

// ==========================================
// FIX admin.html
// ==========================================
let adminHtml = fs.readFileSync('admin.html', 'utf8');

// 1. Mark as Returned animated button
adminHtml = adminHtml.replace(
    /onclick="returnRequest\(\$\{req\.id\}\); closeAdminRequestModal\(\);"\s*style="flex:1;padding:12px;background:#f1f5f9;color:#475569;border:1px solid #cbd5e1;border-radius:12px;font-size:14px;font-weight:700;cursor:pointer;"/g,
    `onclick="returnRequest(\${req.id}); closeAdminRequestModal();" style="flex:1;padding:12px;background:#3b82f6;color:#fff;border:none;border-radius:12px;font-size:14px;font-weight:700;cursor:pointer;transition:transform 0.2s,box-shadow 0.2s;box-shadow:0 4px 10px rgba(59,130,246,0.3);" onmouseover="this.style.transform='scale(1.02)';this.style.boxShadow='0 6px 14px rgba(59,130,246,0.4)';" onmouseout="this.style.transform='scale(1)';this.style.boxShadow='0 4px 10px rgba(59,130,246,0.3)';"`
);
adminHtml = adminHtml.replace(/> Mark as Returned<\/button>/g, `> 📦 Mark as Returned</button>`);

// 2. Dark mode UI in schedule for this day
adminHtml = adminHtml.replace(
    /const isBk = en\.type === 'booking';\s*const bg = isBk \? '#fef2f2' : '#f5f3ff';\s*const border = isBk \? '#fca5a5' : '#c4b5fd';\s*const dot = isBk \? '' : '';\s*const clr = isBk \? '#b91c1c' : '#6d28d9';\s*const removeFn = isBk \? `adminRemoveBooking\('\$\{en\.id\}'\)` : `adminRemoveEvent\('\$\{en\.id\}'\)`;\s*return `<div style="display:flex;align-items:flex-start;gap:12px;padding:12px;border-radius:12px;border:1\.5px solid \$\{border\};background:\$\{bg\};margin-bottom:8px;">\s*<span style="font-size:18px;line-height:1;margin-top:2px;">\$\{dot\}<\/span>\s*<div style="flex:1;min-width:0;">\s*<p style="margin:0;font-size:13px;font-weight:800;color:\$\{clr\};white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">\$\{en\.timeStr\}<\/p>\s*<p style="margin:0;font-size:12px;font-weight:600;color:#374151;">\$\{en\.label\}<\/p>\s*\$\{en\.sub \? `<p style="margin:0;font-size:11px;color:#9ca3af;font-style:italic;">\$\{en\.sub\}<\/p>` : ''\}\s*<\/div>\s*<button onclick="\$\{removeFn\}" style="flex-shrink:0;padding:4px 10px;border-radius:8px;border:1\.5px solid #e5e7eb;background:#fff;font-size:11px;font-weight:700;color:#ef4444;cursor:pointer;"> Remove<\/button>\s*<\/div>`;/g,
    `const isBk = en.type === 'booking';
                        const bg = isBk ? 'var(--panel-bg, #fef2f2)' : 'var(--panel-bg, #f5f3ff)';
                        const border = isBk ? '#fca5a5' : '#c4b5fd';
                        const clr = isBk ? '#ef4444' : '#8b5cf6';
                        const removeFn = isBk ? \`adminRemoveBooking('\${en.id}')\` : \`adminRemoveEvent('\${en.id}')\`;
                        const reschedBtn = !isBk ? \`<button onclick="adminRescheduleEvent('\${en.id}')" style="flex-shrink:0;padding:4px 10px;border-radius:8px;border:1.5px solid var(--border);background:var(--panel-bg);font-size:11px;font-weight:700;color:#3b82f6;cursor:pointer;margin-right:4px;"> Reschedule</button>\` : '';

                        return \`<div style="display:flex;align-items:flex-start;gap:12px;padding:12px;border-radius:12px;border:1.5px solid \${border};background:\${bg};margin-bottom:8px;">
                            <div style="flex:1;min-width:0;">
                                <p style="margin:0;font-size:13px;font-weight:800;color:\${clr};white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">\${en.timeStr}</p>
                                <p style="margin:0;font-size:12px;font-weight:600;color:var(--text, #374151);">\${en.label}</p>
                                \${en.sub ? \`<p style="margin:0;font-size:11px;color:var(--muted, #9ca3af);font-style:italic;">\${en.sub}</p>\` : ''}
                            </div>
                            <div style="display:flex; gap:4px; align-items:center;">
                                \${reschedBtn}
                                <button onclick="\${removeFn}" style="flex-shrink:0;padding:4px 10px;border-radius:8px;border:1.5px solid var(--border);background:var(--panel-bg);font-size:11px;font-weight:700;color:#ef4444;cursor:pointer;"> Remove</button>
                            </div>
                        </div>\`;`
);


// 3. Add adminRescheduleEvent
const reschedFunc = `
            window.adminRescheduleEvent = async function(id) {
                const allEvs = await getEvents();
                const ev = allEvs.find(e => String(e.id) === String(id));
                if(!ev) return;
                
                document.getElementById('adsEventTitle').value = ev.title || '';
                document.getElementById('adsOrganizer').value = ev.organizer || '';
                if(document.getElementById('adsEventDescription')) document.getElementById('adsEventDescription').value = ev.description || '';
                
                document.getElementById('adsEventModal').style.display = 'flex';
                
                let form = document.getElementById('adsEventForm');
                form.dataset.editId = id; 
                
                const title = document.getElementById('adsEventModal').querySelector('h3');
                if(title) title.textContent = 'Reschedule Event';
                const btn = form.querySelector('button[type="submit"]');
                if(btn) btn.textContent = 'Update Event';
            };
`;
if (!adminHtml.includes('window.adminRescheduleEvent = async function')) {
    adminHtml = adminHtml.replace('window.closeAdsEventModal = function () {', reschedFunc + '\n            window.closeAdsEventModal = function () {');
}

// 4. Update handleAdsEventSubmit to use updateEvent if editId exists
adminHtml = adminHtml.replace(
    /const result = await createEvent\(eventData, massCancel\);/g,
    `const result = formObj.dataset.editId ? await updateEvent(formObj.dataset.editId, eventData) : await createEvent(eventData, massCancel);
                 if (result.success && formObj.dataset.editId) {
                     delete formObj.dataset.editId;
                     const title = document.getElementById('adsEventModal').querySelector('h3');
                     if(title) title.textContent = 'Add New Event';
                 }`
);

fs.writeFileSync('admin.html', adminHtml);
console.log('Finished patching admin.html');
