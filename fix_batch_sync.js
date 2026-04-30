const fs = require('fs');

const adminHtmlPaths = ['admin.html', 'admin-portal/admin.html'];

for (const path of adminHtmlPaths) {
    if (!fs.existsSync(path)) continue;
    let content = fs.readFileSync(path, 'utf8');

    const regex = /logActivity\('Batch Upload', `Admin uploaded \$\{inserted\} residents via CSV.`\);/;
    
    if (regex.test(content)) {
        content = content.replace(regex, 
            `logActivity('Batch Upload', \`Admin uploaded \${inserted} residents via CSV.\`);\n                    if (typeof broadcastSync === 'function') broadcastSync();`);
        fs.writeFileSync(path, content, 'utf8');
        console.log("Updated batch upload in", path);
    } else {
        console.log("Could not find regex in", path);
    }
}
