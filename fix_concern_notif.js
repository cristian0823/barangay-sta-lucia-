const fs = require('fs');

const appJsPath = 'js/app.js';
let content = fs.readFileSync(appJsPath, 'utf8');

// Update `updateConcernStatus` to notify on 'in_progress'
const oldUpdateConcern = `        if (!error && concern && concern.user_id && status === 'resolved') {
             await supabase.from('user_notifications').insert([{
                user_id: concern.user_id,
                type: 'concern_resolved',
                message: \`Your concern "\${concern.title}" has been resolved.\`,`;

const newUpdateConcern = `        if (!error && concern && concern.user_id && (status === 'resolved' || status === 'in_progress')) {
             await supabase.from('user_notifications').insert([{
                user_id: concern.user_id,
                type: status === 'resolved' ? 'concern_resolved' : 'concern_in_progress',
                message: status === 'resolved' ? \`Your concern "\${concern.title}" has been resolved.\` : \`Your concern "\${concern.title}" is now in progress.\`,`;

if (content.includes(oldUpdateConcern)) {
    content = content.replace(oldUpdateConcern, newUpdateConcern);
    console.log("Updated updateConcernStatus successfully.");
} else {
    console.log("Could not find the exact string to replace in app.js.");
}

fs.writeFileSync(appJsPath, content, 'utf8');
