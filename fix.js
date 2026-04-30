const fs = require('fs');
let content = fs.readFileSync('js/app.js', 'utf8');

const target = `        if (failedUser) {
            const newCount = (failedUser.login_fail_count || 0) + 1;
            const updates = { login_fail_count: newCount };
            if (newCount >= 5) {
                updates.lockout_until = new Date(Date.now() + 15 * 60 * 1000).toISOString();
            }
            await supabase.from('users').update(updates).eq('id', failedUser.id);
        }`;

const replacement = `        if (failedUser) {
            const newCount = (failedUser.login_fail_count || 0) + 1;
            const updates = { login_fail_count: newCount };
            if (newCount >= 5) {
                updates.lockout_until = new Date(Date.now() + 15 * 60 * 1000).toISOString();
                window.logSecurity('Brute Force Attempt', 'Password', 'critical', \`Brute force attempt detected for \${username}. Account locked.\`, username);
            } else {
                window.logSecurity('Login Failed', 'Password', 'warning', \`Failed login attempt for \${username} (\${newCount}/5).\`, username);
            }
            await supabase.from('users').update(updates).eq('id', failedUser.id);
        } else {
            window.logSecurity('Login Failed', 'Password', 'warning', \`Failed login attempt for unknown user: \${username}\`, username);
        }`;

const normalizedContent = content.replace(/\r\n/g, '\n');
const normalizedTarget = target.replace(/\r\n/g, '\n');

if (normalizedContent.includes(normalizedTarget)) {
    fs.writeFileSync('js/app.js', normalizedContent.replace(normalizedTarget, replacement));
    console.log('Success');
} else {
    console.log('Target not found');
}
