const fs = require('fs');

const adminPaths = ['admin.html', 'admin-portal/admin.html'];

for (const path of adminPaths) {
    if (!fs.existsSync(path)) continue;
    let content = fs.readFileSync(path, 'utf8');

    // FIX 1: The JavaScript text content setting for Pending Actions
    // Drop the " pending", " open", " active", " total" suffix
    const oldJS = `                if (el('glancePendingReqs')) el('glancePendingReqs').textContent = pendingReqs + ' pending';
                if (el('glancePendingCons')) el('glancePendingCons').textContent = pendingCons + ' open';
                if (el('glanceBookings')) el('glanceBookings').textContent = activeBooks + ' active';
                if (el('glanceUsers')) el('glanceUsers').textContent = users.filter(u => u.role !== 'admin').length + ' total';`;
                
    const newJS = `                if (el('glancePendingReqs')) el('glancePendingReqs').textContent = pendingReqs;
                if (el('glancePendingCons')) el('glancePendingCons').textContent = pendingCons;
                if (el('glanceBookings')) el('glanceBookings').textContent = activeBooks;
                if (el('glanceUsers')) el('glanceUsers').textContent = users.filter(u => u.role !== 'admin').length;`;
                
    if (content.includes(oldJS)) {
        content = content.replace(oldJS, newJS);
    }

    // FIX 2: Layout of the Pending Actions items
    const replacements = [
        [
            `<span style="font-size:13px;font-weight:600;color:var(--text-main);"> Equipment Requests</span>`,
            `<span style="font-size:13px;font-weight:600;color:var(--text-main);">Equipment Requests</span>`
        ],
        [
            `<span style="font-size:13px;font-weight:600;color:var(--text-main);"> Open Concerns</span>`,
            `<span style="font-size:13px;font-weight:600;color:var(--text-main);">Open Concerns</span>`
        ],
        [
            `<span style="font-size:13px;font-weight:600;color:var(--text-main);"> Active Bookings</span>`,
            `<span style="font-size:13px;font-weight:600;color:var(--text-main);">Active Bookings</span>`
        ],
        [
            `<span style="font-size:13px;font-weight:600;color:var(--text-main);"> Registered Users</span>`,
            `<span style="font-size:13px;font-weight:600;color:var(--text-main);">Registered Users</span>`
        ]
    ];
    
    // Convert the glance spans to badges
    content = content.replaceAll(
        `id="glancePendingReqs" style="font-weight:800;font-size:15px;color:var(--text);"`, 
        `id="glancePendingReqs" style="font-weight:800;font-size:13px;background:var(--border);color:var(--text);padding:2px 8px;border-radius:12px;"`
    );
    content = content.replaceAll(
        `id="glancePendingCons" style="font-weight:800;font-size:15px;color:var(--text);"`, 
        `id="glancePendingCons" style="font-weight:800;font-size:13px;background:var(--border);color:var(--text);padding:2px 8px;border-radius:12px;"`
    );
    content = content.replaceAll(
        `id="glanceBookings" style="font-weight:800;font-size:15px;color:var(--text);"`, 
        `id="glanceBookings" style="font-weight:800;font-size:13px;background:var(--border);color:var(--text);padding:2px 8px;border-radius:12px;"`
    );
    content = content.replaceAll(
        `id="glanceUsers" style="font-weight:800;font-size:15px;color:var(--text);"`, 
        `id="glanceUsers" style="font-weight:800;font-size:13px;background:var(--border);color:var(--text);padding:2px 8px;border-radius:12px;"`
    );

    for (const [from, to] of replacements) {
        content = content.replaceAll(from, to);
    }

    // FIX 3: Recent Activity feed layout to support long text gracefully and fix colors for dark mode
    const oldFeedItem = `<div style="font-size:11px;color:#6b7280;margin-top:1px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">\${detail || actor}</div>`;
    const newFeedItem = `<div style="font-size:11px;color:var(--muted);margin-top:2px;line-height:1.4;word-break:break-word;">\${detail || actor}</div>`;
    
    if (content.includes(oldFeedItem)) {
        content = content.replace(oldFeedItem, newFeedItem);
    }
    
    // Also remove the ?? emojis to fix rendering
    const oldIcons = `const evtIcon = ev => {
                            if (!ev) return '??';
                            if (ev.includes('Login') || ev.includes('Logout')) return '??';
                            if (ev.includes('Borrow') || ev.includes('Equipment')) return '??';
                            if (ev.includes('Reservation') || ev.includes('Court') || ev.includes('Booking')) return '??';
                            if (ev.includes('Concern')) return '??';
                            if (ev.includes('Event')) return '??';
                            if (ev.includes('User') || ev.includes('Resident')) return '??';
                            if (ev.includes('Delete') || ev.includes('Remove')) return '???';
                            if (ev.includes('Update') || ev.includes('Edit')) return '??';
                            return '??';
                        };`;
                        
    const newIcons = `const evtIcon = ev => {
                            if (!ev) return '📝';
                            if (ev.includes('Login') || ev.includes('Logout')) return '🔑';
                            if (ev.includes('Borrow') || ev.includes('Equipment')) return '📦';
                            if (ev.includes('Reservation') || ev.includes('Court') || ev.includes('Booking')) return '📅';
                            if (ev.includes('Concern')) return '📢';
                            if (ev.includes('Event')) return '🎉';
                            if (ev.includes('User') || ev.includes('Resident')) return '👤';
                            if (ev.includes('Delete') || ev.includes('Remove')) return '🗑️';
                            if (ev.includes('Update') || ev.includes('Edit')) return '✏️';
                            return '📝';
                        };`;

    if (content.includes(oldIcons)) {
        content = content.replace(oldIcons, newIcons);
    }

    fs.writeFileSync(path, content, 'utf8');
    console.log(`Updated layout and styling for ${path}`);
}
