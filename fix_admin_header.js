const fs = require('fs');

const files = ['admin.html', 'admin-portal/admin.html'];

for (const file of files) {
    if (fs.existsSync(file)) {
        let content = fs.readFileSync(file, 'utf8');
        
        // 1. Fix the broken header dropdown layout
        const badHeaderRegex = /<div class="admin-bell-footer" onclick="switchSection\('audit-log'\); document\.getElementById\('adminBellDropdown'\)\.style\.display='none';">\s*See all activity in Audit Log\s*<\/div>\s*<\/div>\s*<\/div>\s*<div class="admin-bell-footer" onclick="switchSection\('audit-log'\); document\.getElementById\('adminBellDropdown'\)\.style\.display='none';">\s*See all activity in Audit Log\s*<\/div>\s*<\/div>\s*<\/div>/;
        
        if (content.match(badHeaderRegex)) {
            content = content.replace(badHeaderRegex, `<div class="admin-bell-footer" onclick="switchSection('audit-log'); document.getElementById('adminBellDropdown').style.display='none';">\n                        See all activity in Audit Log\n                    </div>\n                </div>\n            </div>\n        </div>`);
            console.log("Fixed header duplication in", file);
        } else {
            // Alternative match if it was slightly different
            const badHeaderRegex2 = /<div class="admin-bell-footer" onclick="switchSection\('audit-log'\); document\.getElementById\('adminBellDropdown'\)\.style\.display='none';">\s*See all activity in Audit Log\s*<\/div>\s*<\/div>\s*<\/div>\s*<div class="admin-bell-footer"[^>]*>\s*See all activity in Audit Log\s*<\/div>\s*<\/div>\s*<\/div>/;
            if (content.match(badHeaderRegex2)) {
                content = content.replace(badHeaderRegex2, `<div class="admin-bell-footer" onclick="switchSection('audit-log'); document.getElementById('adminBellDropdown').style.display='none';">\n                        See all activity in Audit Log\n                    </div>\n                </div>\n            </div>\n        </div>`);
                console.log("Fixed header duplication (alt) in", file);
            }
        }

        // 2. Fix the pills back to green
        const greyPillStyle = `style="font-weight:800;font-size:13px;background:#f1f5f9;color:#475569;padding:2px 8px;border-radius:12px;"`;
        const greenPillStyle = `style="font-weight:800;font-size:13px;background:var(--green-xl);color:#fff;padding:2px 8px;border-radius:12px;"`;
        
        if (content.includes(greyPillStyle)) {
            content = content.replace(new RegExp(greyPillStyle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), greenPillStyle);
            console.log("Fixed pills to green in", file);
        }

        fs.writeFileSync(file, content, 'utf8');
    }
}
