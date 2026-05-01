const fs = require('fs');

const filesToUpdate = [
    'js/app.js',
    'admin-portal/js/app.js',
    'user-portal/js/app.js'
];

for (const file of filesToUpdate) {
    if (!fs.existsSync(file)) continue;
    let content = fs.readFileSync(file, 'utf8');

    const OLD_FN = `async function updateConcernStatus(concernId, status, response, assignedTo) {
    const payload = { status, response };
    if (assignedTo !== undefined) payload.assigned_to = assignedTo;

    const { error } = await supabase.from('concerns').update(payload).eq('id', concernId);
    return !error;
}`;

    const NEW_FN = `async function updateConcernStatus(concernId, status, response, assignedTo) {
    const payload = { status, response };
    if (assignedTo !== undefined) payload.assigned_to = assignedTo;

    // 1. Get the concern first so we know who to notify
    const { data: concernData } = await supabase.from('concerns').select('user_id, subject').eq('id', concernId).maybeSingle();

    // 2. Update the status
    const { error } = await supabase.from('concerns').update(payload).eq('id', concernId);
    
    // 3. Send notification to the user if successful
    if (!error && concernData && concernData.user_id) {
        let notifMsg = '';
        if (status === 'in_progress') {
            notifMsg = \`Your concern "\${concernData.subject || 'Ticket'}" is now In Progress.\`;
        } else if (status === 'resolved') {
            notifMsg = \`Your concern "\${concernData.subject || 'Ticket'}" has been Resolved.\`;
        }
        
        if (notifMsg) {
            await supabase.from('user_notifications').insert([{
                user_id: String(concernData.user_id),
                type: 'concern',
                message: notifMsg,
                is_read: false
            }]);
        }
    }
    
    return !error;
}`;

    // Note: Some files have duplicate declarations due to the way they were copied
    // We replace all instances using a global regex match or split/join
    if (content.includes(OLD_FN)) {
        content = content.split(OLD_FN).join(NEW_FN);
        fs.writeFileSync(file, content, 'utf8');
        console.log('Updated updateConcernStatus in', file);
    } else {
        console.log('Could not find exact function match in', file);
    }
}
