const fs = require('fs');

['admin.html', 'user-dashboard.html'].forEach(file => {
    let content = fs.readFileSync(file, 'utf8');

    // Remove the newly discovered UTF-8 corruption sequences starting with ðŸ and â
    content = content.replace(/ðŸ[^\w\s<>="'\/\\-]{0,10}/g, '');
    content = content.replace(/â[^\w\s<>="'\/\\-]{0,10}/g, '');
    
    fs.writeFileSync(file, content, 'utf8');
    console.log('Cleaned leftover garbage from ' + file);
});
