const fs = require('fs');

const replacement = `async function autoCompleteExpiredBookings() {
    const supabaseAvailable = await isSupabaseAvailable();
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const todayStr = \`\${year}-\${month}-\${day}\`; // YYYY-MM-DD local

    if (supabaseAvailable) {
        try {
            // Fetch all active bookings on or before today
            const { data: activeBookings, error: fetchErr } = await supabase
                .from('facility_reservations')
                .select('id, date, time')
                .in('status', ['approved', 'pending'])
                .lte('date', todayStr);

            if (fetchErr || !activeBookings || activeBookings.length === 0) return;

            const toCompleteIds = [];

            activeBookings.forEach(b => {
                if (b.date < todayStr) {
                    toCompleteIds.push(b.id);
                } else if (b.date === todayStr && b.time) {
                    // It's today, check the time
                    // e.g. "Basketball Court | 08:00 AM - 10:00 AM" or "08:00 AM - 10:00 AM"
                    let timeStr = String(b.time);
                    if (timeStr.includes('|')) timeStr = timeStr.split('|')[1].trim();
                    const parts = timeStr.split('-');
                    if (parts.length >= 2) {
                        const endPart = parts[1].trim(); // "10:00 AM"
                        const timeMatch = endPart.match(/(\\d+):(\\d+)\\s*(AM|PM)?/i);
                        if (timeMatch) {
                            let hours = parseInt(timeMatch[1]);
                            const mins = parseInt(timeMatch[2]);
                            const period = timeMatch[3] ? timeMatch[3].toUpperCase() : null;
                            if (period === 'PM' && hours < 12) hours += 12;
                            if (period === 'AM' && hours === 12) hours = 0;
                            
                            const endDateTime = new Date(year, today.getMonth(), today.getDate(), hours, mins, 0);
                            if (today > endDateTime) {
                                toCompleteIds.push(b.id);
                            }
                        }
                    }
                }
            });

            if (toCompleteIds.length > 0) {
                const { error: updErr } = await supabase
                    .from('facility_reservations')
                    .update({ status: 'completed' })
                    .in('id', toCompleteIds);
                if (updErr) console.warn('autoCompleteExpiredBookings updErr:', updErr.message);
                else broadcastSync();
            }
        } catch(e) { console.warn('autoCompleteExpiredBookings exception:', e); }
    } else {
        // LocalStorage fallback
        const bookings = JSON.parse(localStorage.getItem(LOCAL_BOOKINGS_KEY)) || [];
        let changed = false;
        bookings.forEach(b => {
            if ((b.status === 'approved' || b.status === 'pending') && b.date <= todayStr) {
                if (b.date < todayStr) {
                    b.status = 'completed';
                    changed = true;
                } else if (b.date === todayStr && b.time) {
                    let timeStr = String(b.time);
                    if (timeStr.includes('|')) timeStr = timeStr.split('|')[1].trim();
                    const parts = timeStr.split('-');
                    if (parts.length >= 2) {
                        const endPart = parts[1].trim();
                        const timeMatch = endPart.match(/(\\d+):(\\d+)\\s*(AM|PM)?/i);
                        if (timeMatch) {
                            let hours = parseInt(timeMatch[1]);
                            const mins = parseInt(timeMatch[2]);
                            const period = timeMatch[3] ? timeMatch[3].toUpperCase() : null;
                            if (period === 'PM' && hours < 12) hours += 12;
                            if (period === 'AM' && hours === 12) hours = 0;
                            const endDateTime = new Date(year, today.getMonth(), today.getDate(), hours, mins, 0);
                            if (today > endDateTime) {
                                b.status = 'completed';
                                changed = true;
                            }
                        }
                    }
                }
            }
        });
        if (changed) localStorage.setItem(LOCAL_BOOKINGS_KEY, JSON.stringify(bookings));
    }
}`;

const files = ['js/app.js', 'user-portal/js/app.js', 'admin-portal/js/app.js'];

for (const file of files) {
    if (!fs.existsSync(file)) continue;
    let content = fs.readFileSync(file, 'utf8');
    
    // Find the old autoCompleteExpiredBookings
    const regex = /async function autoCompleteExpiredBookings\(\) \{[\s\S]*?(?=\nasync function|\nfunction|\n\n\n)/;
    const match = content.match(regex);
    if (match) {
        // Double check it ends correctly, let's just replace the exact block if we can isolate it, or use regex.
        // The previous function ended with:
        //         if (changed) localStorage.setItem(LOCAL_BOOKINGS_KEY, JSON.stringify(bookings));
        //     }
        // }
        // So we can do a precise extraction:
        const oldRegex = /async function autoCompleteExpiredBookings\(\) \{[\s\S]*?if \(changed\) localStorage\.setItem\(LOCAL_BOOKINGS_KEY, JSON\.stringify\(bookings\)\);\n    \}\n\}/;
        if (content.match(oldRegex)) {
            content = content.replace(oldRegex, replacement);
            fs.writeFileSync(file, content, 'utf8');
            console.log("Updated", file);
        } else {
            console.log("Regex miss on", file);
        }
    } else {
        console.log("Could not find autoCompleteExpiredBookings in", file);
    }
}
