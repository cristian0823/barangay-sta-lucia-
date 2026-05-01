const fs = require('fs');

const files = ['user-portal/user-dashboard.html', 'user-dashboard.html'];

for (const file of files) {
    if (!fs.existsSync(file)) continue;
    let content = fs.readFileSync(file, 'utf8');

    const FIND_STR = `.on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'user_notifications' }, payload => {`;
    
    const REPL_STR = `.on('postgres_changes', { event: '*', schema: 'public', table: 'borrowings' }, () => {
                        console.log('Borrowing changed! Reloading equipment...');
                        if (typeof loadEquipmentView === 'function') loadEquipmentView();
                        if (typeof loadMyBorrowingsList === 'function') loadMyBorrowingsList();
                    })
                    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'user_notifications' }, payload => {`;

    if (content.includes(FIND_STR)) {
        content = content.replace(FIND_STR, REPL_STR);
        fs.writeFileSync(file, content, 'utf8');
        console.log('Successfully patched realtime listener in', file);
    } else {
        console.log('Could not find FIND_STR in', file);
    }
}
