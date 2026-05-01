const fs = require('fs');

const adminFiles = ['admin.html', 'admin-portal/admin.html'];
const userFiles = ['user-dashboard.html', 'user-portal/user-dashboard.html'];

console.log("Fixing Admin Dashboards...");
for (const file of adminFiles) {
    if (!fs.existsSync(file)) continue;
    let content = fs.readFileSync(file, 'utf8');
    
    // Stats Cards Text
    content = content.replace(/<h3\s+style="font-size:11px;color:var\(--green-xl\);font-weight:700;text-transform:uppercase;letter-spacing:0\.5px;margin-bottom:6px;">/g,
                              '<h3 style="font-size:11px;color:#6b7280;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:6px;">');
    
    content = content.replace(/style="font-size:32px;font-weight:800;color:var\(--green-xl\);line-height:1;"/g,
                              'style="font-size:32px;font-weight:800;color:var(--text);line-height:1;"');
                              
    // Quick Action Cards Text
    content = content.replace(/<div class="qa-label" style="color:var\(--green-xl\);">/g, 
                              '<div class="qa-label">');
    content = content.replace(/<div class="qa-sub" style="color:var\(--green-xl\);">/g, 
                              '<div class="qa-sub">');
                              
    // Pending Actions Card Text
    content = content.replace(/<span style="font-size:13px;font-weight:600;color:var\(--green-xl\);">/g,
                              '<span style="font-size:13px;font-weight:600;color:var(--text-main);">');

    fs.writeFileSync(file, content, 'utf8');
    console.log(`Fixed colors in ${file}`);
}

console.log("\nFixing User Dashboards...");
for (const file of userFiles) {
    if (!fs.existsSync(file)) continue;
    let content = fs.readFileSync(file, 'utf8');
    
    // User Stats Cards Text (Active Borrowings, etc.)
    content = content.replace(/<div class="user-stat-label" style="color:var\(--green-xl\);">/g, 
                              '<div class="user-stat-label">');
    content = content.replace(/style="color:var\(--green-xl\);"/g, function(match, offset, str) {
        // We only want to replace it if it's NOT an icon.
        // Let's just do targeted replacements.
        return match;
    });
    
    // targeted replaces for User Quick Action Cards
    content = content.replace(/<div class="uqa-label" style="color:var\(--green-xl\);">/g, 
                              '<div class="uqa-label">');
    content = content.replace(/<div class="uqa-sub" style="color:var\(--green-xl\);">/g, 
                              '<div class="uqa-sub">');
                              
    // targeted replaces for My Overview
    content = content.replace(/<span id="dash-statEquip" style="font-weight:800;font-size:15px;color:var\(--green-xl\);">/g,
                              '<span id="dash-statEquip" style="font-weight:800;font-size:15px;color:var(--text-main);">');
    content = content.replace(/<span id="dash-statConcerns" style="font-weight:800;font-size:15px;color:var\(--green-xl\);">/g,
                              '<span id="dash-statConcerns" style="font-weight:800;font-size:15px;color:var(--text-main);">');
    content = content.replace(/<span id="dash-statBookings" style="font-weight:800;font-size:15px;color:var\(--green-xl\);">/g,
                              '<span id="dash-statBookings" style="font-weight:800;font-size:15px;color:var(--text-main);">');
    
    // For values like user-stat-value, let's fix them manually:
    content = content.replace(/class="user-stat-value" id="(.*?)" style="color:var\(--green-xl\);"/g,
                              'class="user-stat-value" id="$1" style="color:var(--text);"');

    fs.writeFileSync(file, content, 'utf8');
    console.log(`Fixed colors in ${file}`);
}
