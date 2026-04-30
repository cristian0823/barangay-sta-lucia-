const fs = require('fs');

const path = 'user-portal/js/app.js';
let content = fs.readFileSync(path, 'utf8');

// 1. Equipment Borrowing
const borrowAdminNotif = "await addNotification('admin', 'borrow', `User requested to borrow ${quantity}x ${item.name}`);";
if (content.includes(borrowAdminNotif) && !content.includes("type: 'equipment_requested'")) {
    const borrowUserNotif = `await supabase.from('user_notifications').insert([{
            user_id: resolvedUserIdB,
            type: 'equipment_requested',
            message: \`You successfully requested to borrow \${quantity}x \${item.name}.\`,
            is_read: false
        }]);`;
    content = content.replace(borrowAdminNotif, borrowAdminNotif + '\n        ' + borrowUserNotif);
}

// 2. Concern Submission
const concernAdminNotif = "await addNotification('admin', 'concern', `User submitted a concern: ${title}`);";
if (content.includes(concernAdminNotif) && !content.includes("type: 'concern_submitted'")) {
    const concernUserNotif = `await supabase.from('user_notifications').insert([{
            user_id: resolvedUserIdC,
            type: 'concern_submitted',
            message: \`You successfully submitted a concern: \${title}.\`,
            is_read: false
        }]);`;
    content = content.replace(concernAdminNotif, concernAdminNotif + '\n        ' + concernUserNotif);
}

// 3. Facility Reservation
const bookingAdminNotif = "await addNotification('admin', 'booking', `User reserved the ${venueLabel} for ${combinedTime}`);";
if (content.includes(bookingAdminNotif) && !content.includes("type: 'booking_submitted'")) {
    const bookingUserNotif = `await supabase.from('user_notifications').insert([{
                user_id: resolvedUserId,
                type: 'booking_submitted',
                message: \`You successfully reserved the \${venueLabel} for \${combinedTime}.\`,
                is_read: false
            }]);`;
    content = content.replace(bookingAdminNotif, bookingAdminNotif + '\n            ' + bookingUserNotif);
}

fs.writeFileSync(path, content, 'utf8');
console.log('Patched user-portal/js/app.js with user notifications');
