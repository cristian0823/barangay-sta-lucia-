const fs = require('fs');
const { execSync } = require('child_process');

['admin.html', 'user-dashboard.html'].forEach(file => {
    // Get the exact perfect original CSS from 82fb5a5
    let oldVersion = execSync('git show 82fb5a5:' + file, { encoding: 'utf8' });
    let currentVersion = fs.readFileSync(file, 'utf8');

    // Extract everything from beginning of file up to </style> in the old version
    let oldStyleEnd = oldVersion.indexOf('</style>') + 8;
    let oldStyleBlock = oldVersion.substring(0, oldStyleEnd);
    
    // Find the equivalent position in the current version
    let currentStyleEnd = currentVersion.indexOf('</style>') + 8;
    
    // Reconstruct with old CSS and new Body
    let restoredVersion = oldStyleBlock + currentVersion.substring(currentStyleEnd);

    // Remove any leftover gibberish globally just in case (the broken text)
    restoredVersion = restoredVersion.replace(/Ã[^\w\s<>="'\/\\-]{1,15}/g, '');
    restoredVersion = restoredVersion.replace(/Ã/g, '');

    fs.writeFileSync(file, restoredVersion, 'utf8');
    console.log('Restored pristine aesthetic CSS styling for ' + file);
});
