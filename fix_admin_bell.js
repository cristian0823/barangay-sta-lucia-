const fs = require('fs');

let html = fs.readFileSync('admin.html', 'utf8');

// The new markAllAdminBellRead
const newMarkAll = `async function markAllAdminBellRead() {
                try {
                    const supabaseAvailable = typeof isSupabaseAvailable === 'function' ? await isSupabaseAvailable() : false;
                    if (supabaseAvailable) {
                        const currentUser = typeof getCurrentUser === 'function' ? getCurrentUser() : null;
                        if (currentUser && currentUser.id) {
                            const ADMIN_NOTIF_TYPES = ['borrow', 'booking', 'concern', 'cancel_borrow', 'cancel_booking'];
                            await supabase
                                .from('user_notifications')
                                .update({ is_read: true })
                                .eq('user_id', currentUser.id)
                                .in('type', ADMIN_NOTIF_TYPES)
                                .eq('is_read', false);
                        }
                    }
                    localStorage.setItem('last_admin_bell_view', Date.now().toString());
                    refreshAdminBell();
                    const drop = document.getElementById('adminBellDropdown');
                    if (drop) drop.style.display = 'none';
                } catch(e) { console.warn('markAllAdminBellRead error:', e); }
            }`;

// Replace everything between `async function markAllAdminBellRead() {` and `// Refresh bell every 30 seconds`
const regex = /async function markAllAdminBellRead\(\) \{[\s\S]*?\/\/\s*Refresh bell every 30 seconds/g;

if (regex.test(html)) {
    html = html.replace(regex, `${newMarkAll}\n\n            // Refresh bell every 30 seconds`);
    fs.writeFileSync('admin.html', html, 'utf8');
    fs.copyFileSync('admin.html', 'admin-portal/admin.html');
    console.log('✅ Fixed markAllAdminBellRead');
} else {
    console.warn('⚠️ Could not find markAllAdminBellRead target text');
}
