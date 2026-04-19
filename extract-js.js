const fs = require('fs');
const doc = fs.readFileSync('user-dashboard.html', 'utf8');

const scriptRegex = /<script\b[^>]*>([\s\S]*?)<\/script>/gi;
let match;
let count = 0;
while ((match = scriptRegex.exec(doc)) !== null) {
    if (match[1].trim() !== '') {
        count++;
        fs.writeFileSync('temp-script-' + count + '.js', match[1]);
        const { execSync } = require('child_process');
        try {
            execSync('node -c temp-script-' + count + '.js', { stdio: 'pipe' });
            console.log('Script block ' + count + ' OK');
        } catch (e) {
            console.error('Script block ' + count + ' SYNTAX ERROR!');
            console.error(e.stderr.toString());
        }
    }
}
