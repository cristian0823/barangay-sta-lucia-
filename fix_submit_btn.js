const fs = require('fs');
const files = ['user-dashboard.html'];
for (const file of files) {
    if (!fs.existsSync(file)) continue;
    let c = fs.readFileSync(file, 'utf8');
    c = c.replace('✅ Submit Borrow Request', 'Submit Borrow Request');
    // Add margin-bottom to submit button
    c = c.replace(
        /(<button type="submit" id="submitBorrowBtn"[^>]*cursor-pointer")>/,
        '$1 style="margin-bottom:32px;">'
    );
    fs.writeFileSync(file, c, 'utf8');
    console.log('Done', file);
}
