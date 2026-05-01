const fs = require('fs');

const files = ['user-portal/user-dashboard.html', 'user-dashboard.html'];

for (const file of files) {
    if (!fs.existsSync(file)) continue;
    let content = fs.readFileSync(file, 'utf8');

    const FIND_STR = `if(helpEl) helpEl.innerHTML = '📦 Max: ' + item.available + ' units available';`;
    
    const REPL_STR = `if(helpEl) helpEl.innerHTML = '📦 Max: ' + item.available + (item.available === 1 ? ' unit available' : ' units available');`;

    if (content.includes(FIND_STR)) {
        content = content.replace(FIND_STR, REPL_STR);
        fs.writeFileSync(file, content, 'utf8');
        console.log('Successfully patched grammar in', file);
    } else {
        console.log('Could not find grammar pattern in', file);
    }
}
