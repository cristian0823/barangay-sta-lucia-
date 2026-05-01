const fs = require('fs');

const filesToUpdate = [
    'js/app.js',
    'admin-portal/js/app.js',
    'user-portal/js/app.js'
];

for (const file of filesToUpdate) {
    if (!fs.existsSync(file)) continue;
    let content = fs.readFileSync(file, 'utf8');

    const FIND_STR = 'are available for selected dates';
    const REPL_STR = 'is available';

    if (content.includes(FIND_STR)) {
        content = content.replace(new RegExp(FIND_STR, 'g'), REPL_STR);
        fs.writeFileSync(file, content, 'utf8');
        console.log('Successfully patched grammar in', file);
    } else {
        console.log('Could not find grammar pattern in', file);
    }
}
