const fs = require('fs');

const files = ['admin.html', 'admin-portal/admin.html'];

for (const file of files) {
    if (fs.existsSync(file)) {
        let content = fs.readFileSync(file, 'utf8');
        
        const targetRegex = /id="(glancePendingCons|glanceBookings|glanceUsers)" style="font-weight:800;font-size:13px;background:var\(--border\);color:var\(--text\);padding:2px 8px;border-radius:12px;"/g;
        
        content = content.replace(targetRegex, 'id="$1" style="font-weight:800;font-size:13px;background:var(--green-xl);color:#fff;padding:2px 8px;border-radius:12px;"');
        
        fs.writeFileSync(file, content, 'utf8');
        console.log("Updated pills to green in", file);
    }
}
