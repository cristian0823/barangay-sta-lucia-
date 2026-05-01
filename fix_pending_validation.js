const fs = require('fs');

const filesToUpdate = [
    'js/app.js',
    'admin-portal/js/app.js',
    'user-portal/js/app.js'
];

for (const file of filesToUpdate) {
    if (!fs.existsSync(file)) continue;
    let content = fs.readFileSync(file, 'utf8');

    // Replace within checkEquipmentAvailability only
    const TARGET_START = 'async function checkEquipmentAvailability(';
    let idx = content.indexOf(TARGET_START);
    if (idx !== -1) {
        let fnEndIdx = content.indexOf('async function', idx + 10);
        if (fnEndIdx === -1) fnEndIdx = content.length;
        
        let before = content.substring(0, idx);
        let fnBody = content.substring(idx, fnEndIdx);
        let after = content.substring(fnEndIdx);
        
        // Supabase query
        fnBody = fnBody.replace(/.in\('status',\s*\['approved',\s*'pending'\]\)/g, ".eq('status', 'approved')");
        
        // LocalStorage fallback
        fnBody = fnBody.replace(/b.status === 'approved' \|\| b.status === 'pending'/g, "b.status === 'approved'");
        
        content = before + fnBody + after;
        fs.writeFileSync(file, content, 'utf8');
        console.log('Successfully patched checkEquipmentAvailability in', file);
    } else {
        console.log('checkEquipmentAvailability not found in', file);
    }
}
