const fs = require('fs');

const files = ['admin.html', 'admin-portal/admin.html'];

for (const file of files) {
    if (fs.existsSync(file)) {
        let content = fs.readFileSync(file, 'utf8');
        
        // Remove the extra </div> that closes user-menu prematurely
        const targetRegex = /<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*<button class="admin-dark-toggle/;
        const replacementStr = `</div>\n                </div>\n            </div>\n                <button class="admin-dark-toggle`;

        if (content.match(targetRegex)) {
            content = content.replace(targetRegex, replacementStr);
            fs.writeFileSync(file, content, 'utf8');
            console.log("Fixed alignment in", file);
        } else {
            console.log("Alignment target not found in", file);
        }
    }
}
