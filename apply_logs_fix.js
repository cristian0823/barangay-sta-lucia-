const fs = require('fs');

let appJs = fs.readFileSync('js/app.js', 'utf8');

// Use literal string replace for app.js login activity
appJs = appJs.replace(
    /logActivity\('Login', `User logged in: \$\{sessionData.username\}`\);/g,
    `const lType = (sessionData.role === 'admin' || sessionData.role === 'Admin') ? 'Admin login' : 'User login';
                window.logSecurity('Login Success', 'Password', 'info', \`\${lType} successful.\`, sessionData.username);`
);

appJs = appJs.replace(
    /logActivity\('Login', `Local User logged in: \$\{sessionData.username\}`\);/g,
    `const lType = (sessionData.role === 'admin' || sessionData.role === 'Admin') ? 'Admin login' : 'User login';
            window.logSecurity('Login Success', 'Password', 'info', \`Local \${lType} successful.\`, sessionData.username);`
);

const failedBlockOriginal = `        if (failedUser) {
            const newCount = (failedUser.login_fail_count || 0) + 1;
            const updates = { login_fail_count: newCount };
            if (newCount >= 5) {
                updates.lockout_until = new Date(Date.now() + 15 * 60 * 1000).toISOString();
            }
            await supabase.from('users').update(updates).eq('id', failedUser.id);
        }`;

const failedBlockReplacement = `        if (failedUser) {
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

appJs = appJs.replace(failedBlockOriginal, failedBlockReplacement);

fs.writeFileSync('js/app.js', appJs);

let adminHtml = fs.readFileSync('admin.html', 'utf8');

adminHtml = adminHtml.replace(/<button onclick="mobileSwitchSection\('reports'\)">.*?Reports<\/button>\r?\n?/g, '');
adminHtml = adminHtml.replace(/<button class="sidebar-btn" onclick="switchSection\('reports', this\)">[\s\S]*?<\/button>\r?\n?/g, '');

adminHtml = adminHtml.replace(/'reports', /g, '');
adminHtml = adminHtml.replace(/if \(section === 'reports'\) loadSimpleReport\(\);\r?\n?/g, '');
adminHtml = adminHtml.replace(/'reports': 6,\s*/g, '');

adminHtml = adminHtml.replace(/<div id="reports-section" class="section-container"[\s\S]*?<!-- Activity Log Section \(Premium\) -->/g, '<!-- Activity Log Section (Premium) -->');

adminHtml = adminHtml.replace(/let _allReportTransactions = \[\];[\s\S]*?if \(nextBtn\) nextBtn\.disabled = page >= totalPages;\r?\n\s*\}/g, '');

fs.writeFileSync('admin.html', adminHtml);
console.log('done');
