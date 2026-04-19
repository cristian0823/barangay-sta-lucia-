const fs = require('fs'); 
let b = fs.readFileSync('admin.html', 'utf8'); 
b = b.replace('markConcernRead(concernId);', 'if (typeof supabase !== "undefined") supabase.from("concerns").update({is_read: true}).eq("id", concernId).then();'); 
fs.writeFileSync('admin.html', b);
