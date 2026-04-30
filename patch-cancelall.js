const fs = require('fs');

// ============================================================
// PATCH admin.html
// - Add Start Time + End Time to Cancel All modal form
// - Use those times when creating the event
// - After success, force-clear events cache so calendar refreshes
// - Make adminRemoveEvent work for clearing events in day schedule
// ============================================================
let adminHtml = fs.readFileSync('admin.html', 'utf8');

// 1. Add Start Time + End Time fields to the Cancel All form (between Capacity and Reason)
adminHtml = adminHtml.replace(
    `                <div style="margin-bottom:14px;">
                    <label style="display:block; font-size:12px; font-weight:700; color:#374151; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:6px;">Capacity (max attendees)</label>
                    <input type="number" id="amcCapacity" placeholder="e.g. 100" min="0"
                        style="width:100%; padding:11px 14px; border:1.5px solid #d1d5db; border-radius:10px; font-size:14px; font-family:inherit; outline:none; box-sizing:border-box;"
                        onfocus="this.style.borderColor='#dc2626'" onblur="this.style.borderColor='#d1d5db'">
                </div>
                <div style="margin-bottom:20px;">`,
    `                <div style="margin-bottom:14px;">
                    <label style="display:block; font-size:12px; font-weight:700; color:#374151; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:6px;">Capacity (max attendees)</label>
                    <input type="number" id="amcCapacity" placeholder="e.g. 100" min="0"
                        style="width:100%; padding:11px 14px; border:1.5px solid #d1d5db; border-radius:10px; font-size:14px; font-family:inherit; outline:none; box-sizing:border-box;"
                        onfocus="this.style.borderColor='#dc2626'" onblur="this.style.borderColor='#d1d5db'">
                </div>
                <div style="display:flex;gap:10px;margin-bottom:14px;">
                    <div style="flex:1;">
                        <label style="display:block; font-size:12px; font-weight:700; color:#374151; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:6px;">Start Time *</label>
                        <select id="amcStartTime" required style="width:100%; padding:11px 14px; border:1.5px solid #d1d5db; border-radius:10px; font-size:14px; font-family:inherit; outline:none; box-sizing:border-box; background:#fff;"
                            onfocus="this.style.borderColor='#dc2626'" onblur="this.style.borderColor='#d1d5db'">
                            <option value="">Select...</option>
                            <option value="06:00">6:00 AM</option><option value="07:00" selected>7:00 AM</option>
                            <option value="08:00">8:00 AM</option><option value="09:00">9:00 AM</option>
                            <option value="10:00">10:00 AM</option><option value="11:00">11:00 AM</option>
                            <option value="12:00">12:00 PM</option><option value="13:00">1:00 PM</option>
                            <option value="14:00">2:00 PM</option><option value="15:00">3:00 PM</option>
                            <option value="16:00">4:00 PM</option><option value="17:00">5:00 PM</option>
                            <option value="18:00">6:00 PM</option><option value="19:00">7:00 PM</option>
                            <option value="20:00">8:00 PM</option><option value="21:00">9:00 PM</option>
                            <option value="22:00">10:00 PM</option>
                        </select>
                    </div>
                    <div style="flex:1;">
                        <label style="display:block; font-size:12px; font-weight:700; color:#374151; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:6px;">End Time *</label>
                        <select id="amcEndTime" required style="width:100%; padding:11px 14px; border:1.5px solid #d1d5db; border-radius:10px; font-size:14px; font-family:inherit; outline:none; box-sizing:border-box; background:#fff;"
                            onfocus="this.style.borderColor='#dc2626'" onblur="this.style.borderColor='#d1d5db'">
                            <option value="">Select...</option>
                            <option value="07:00">7:00 AM</option><option value="08:00">8:00 AM</option>
                            <option value="09:00">9:00 AM</option><option value="10:00">10:00 AM</option>
                            <option value="11:00">11:00 AM</option><option value="12:00">12:00 PM</option>
                            <option value="13:00">1:00 PM</option><option value="14:00">2:00 PM</option>
                            <option value="15:00">3:00 PM</option><option value="16:00">4:00 PM</option>
                            <option value="17:00">5:00 PM</option><option value="18:00">6:00 PM</option>
                            <option value="19:00">7:00 PM</option><option value="20:00">8:00 PM</option>
                            <option value="21:00">9:00 PM</option><option value="22:00" selected>10:00 PM</option>
                        </select>
                    </div>
                </div>
                <div style="margin-bottom:20px;">`
);

// 2. Update confirmAdminMassCancel to read start/end time and validate them, and use them in newEvent
adminHtml = adminHtml.replace(
    `                const organizer = document.getElementById('amcOrganizer') ? document.getElementById('amcOrganizer').value.trim() : 'Barangay Council';
                const capacity = document.getElementById('amcCapacity') ? parseInt(document.getElementById('amcCapacity').value || '0', 10) : 0;
                if (!eventName || !reason || !organizer) {
                    showAlert('Please provide Event Name, Organizer, and Reason.', 'error');
                    return;
                }`,
    `                const organizer = document.getElementById('amcOrganizer') ? document.getElementById('amcOrganizer').value.trim() : 'Barangay Council';
                const capacity = document.getElementById('amcCapacity') ? parseInt(document.getElementById('amcCapacity').value || '0', 10) : 0;
                const amcStartTime = document.getElementById('amcStartTime') ? document.getElementById('amcStartTime').value : '07:00';
                const amcEndTime = document.getElementById('amcEndTime') ? document.getElementById('amcEndTime').value : '22:00';
                if (!eventName || !reason || !organizer || !amcStartTime || !amcEndTime) {
                    showAlert('Please fill in all required fields including Start and End Time.', 'error');
                    return;
                }`
);

// 3. Use amcStartTime and amcEndTime in the newEvent object
adminHtml = adminHtml.replace(
    `                    const newEvent = {
                        title: eventName,
                        date: adminSelectedDate,
                        time: '07:00',
                        start_time: '07:00',
                        end_time: '22:00',
                        organizer: organizer || 'Barangay Council',
                        location: 'Basketball Court',
                        capacity: capacity || 0,
                        description: '',
                        status: 'approved',
                        created_at: new Date().toISOString()
                    };`,
    `                    const newEvent = {
                        title: eventName,
                        date: adminSelectedDate,
                        time: amcStartTime,
                        start_time: amcStartTime,
                        end_time: amcEndTime,
                        organizer: organizer || 'Barangay Council',
                        location: 'Basketball Court',
                        capacity: capacity || 0,
                        description: '',
                        status: 'approved',
                        created_at: new Date().toISOString()
                    };`
);

// 4. After inserting event, clear any cached events so both calendars see fresh data
adminHtml = adminHtml.replace(
    `                    if (available) {
                        await supabase.from('events').insert([newEvent]);`,
    `                    if (available) {
                        // Clear local events cache so both user and admin calendars show the new event
                        if (typeof window._eventsCache !== 'undefined') window._eventsCache = null;
                        if (typeof window._eventsCacheTime !== 'undefined') window._eventsCacheTime = null;
                        await supabase.from('events').insert([newEvent]);`
);

// 5. Also clear form fields including new ones on success
adminHtml = adminHtml.replace(
    `                    // Clear form\n                    ['amcEventName','amcOrganizer','amcCapacity','amcReason'].forEach(id => { const el = document.getElementById(id); if(el) el.value = ''; });`,
    `                    // Clear form\n                    ['amcEventName','amcOrganizer','amcCapacity','amcStartTime','amcEndTime','amcReason'].forEach(id => { const el = document.getElementById(id); if(el) el.value = ''; });`
);

fs.writeFileSync('admin.html', adminHtml);
console.log('Patched admin.html - Cancel All form with times + event creation');
console.log('Done!');
