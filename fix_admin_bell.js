const fs = require('fs');
let txt = fs.readFileSync('admin-portal/admin.html', 'utf8');

txt = txt.replace(/supabase.from\('facility_reservations'\)\.select\('id, user_id, date, time, venue_name, created_at, status'\)/g, "supabase.from('facility_reservations').select('id, user_id, date, time, created_at, status')");
txt = txt.replace(/supabase.from\('concerns'\)\.select\('id, user_id, subject, message, created_at'\)\.eq\('is_read', false\)/g, "supabase.from('concerns').select('id, user_id, title, description, created_at, status').eq('status', 'pending')");

txt = txt.replace(/message: 'New facility reservation for ' \+ \(b.venue_name \|\| 'venue'\) \+ ' on ' \+ b.date/g, "message: 'New facility reservation on ' + b.date");
txt = txt.replace(/message: 'New concern: ' \+ \(c.subject \|\| c.message \|\| 'Untitled'\)/g, "message: 'New concern: ' + (c.title || 'Untitled')");

txt = txt.replace(/const concerns = \(JSON.parse\(localStorage.getItem\('barangayConcerns'\)\) \|\| \[\]\)\.filter\(c => !c.isRead\);/g, "const concerns = (JSON.parse(localStorage.getItem('barangayConcerns')) || []).filter(c => c.status === 'pending');");
txt = txt.replace(/message: 'New concern: ' \+ \(c.subject \|\| 'Untitled'\)/g, "message: 'New concern: ' + (c.title || 'Untitled')");

fs.writeFileSync('admin-portal/admin.html', txt);
console.log('Done');
