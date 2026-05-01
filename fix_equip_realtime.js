const fs = require('fs');

const files = ['user-portal/user-dashboard.html', 'user-dashboard.html'];

for (const file of files) {
    if (!fs.existsSync(file)) continue;
    let content = fs.readFileSync(file, 'utf8');

    const OLD_LIVE = `        // Real-time live flow: Wait for new notifications immediately
        document.addEventListener('DOMContentLoaded', async () => {
            if (typeof isSupabaseAvailable === 'function' && await isSupabaseAvailable()) {
                supabase
                    .channel('live-notifications')`;

    const NEW_LIVE = `        // Real-time live flow: Wait for new notifications immediately
        document.addEventListener('DOMContentLoaded', async () => {
            if (typeof isSupabaseAvailable === 'function' && await isSupabaseAvailable()) {
                
                // --- EQUIPMENT REAL-TIME AUTO-REFRESH ---
                // Listen to any changes in the borrowings table (like admin marking 'returned')
                // so the inventory availability syncs immediately without manual refresh.
                supabase.channel('live-borrowings')
                    .on('postgres_changes', { event: '*', schema: 'public', table: 'borrowings' }, payload => {
                        console.log('[Realtime] Borrowings changed:', payload);
                        if (typeof loadEquipmentView === 'function') loadEquipmentView();
                        if (typeof loadMyBorrowingsList === 'function') loadMyBorrowingsList();
                        if (typeof loadDashboardStats === 'function') loadDashboardStats();
                    })
                    .subscribe();

                supabase
                    .channel('live-notifications')`;

    if (content.includes(OLD_LIVE)) {
        content = content.replace(OLD_LIVE, NEW_LIVE);
        fs.writeFileSync(file, content, 'utf8');
        console.log('Added realtime borrowings listener to', file);
    } else {
        console.log('Could not find live-notifications pattern in', file);
    }
}
