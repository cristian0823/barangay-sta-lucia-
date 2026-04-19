const fs = require('fs');

['admin.html', 'user-dashboard.html'].forEach(file => {
    if(fs.existsSync(file)) {
        let html = fs.readFileSync(file, 'utf8');

        // Target the specific garbled characters starting with Ã (U+00C3)
        // that got burned into the file during the encoding loop.
        // We match Ã followed by characters that are not normal English alphanumeric or standard html punctuation.
        html = html.replace(/Ã[^\w\s<>="'\/\\-]{1,15}/g, '');
        // Erase any leftover standalone Ã
        html = html.replace(/Ã/g, '');
        
        fs.writeFileSync(file, html, 'utf8');
        console.log('Cleaned gibberish from ' + file);
    }
});
