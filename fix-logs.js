const fs = require('fs');
let code = fs.readFileSync('js/app.js', 'utf8');

// Replace "User ${user.fullName || user.username} " with "User "
code = code.replace(/User \$\{user\.fullName \|\| user\.username\} /g, "User ");

// Replace "Local User ${user.fullName || user.username} " with "Local User "
code = code.replace(/Local User \$\{user\.fullName \|\| user\.username\} /g, "Local User ");

// Swap order in logActivity
code = code.replace(
    "const adminUsername = user ? (user.username || user.fullName || 'admin') : 'system';",
    "const adminUsername = user ? (user.fullName || user.username || 'admin') : 'system';"
);

fs.writeFileSync('js/app.js', code);
console.log('Fixed app.js logs!');
