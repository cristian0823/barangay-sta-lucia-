const fs = require('fs');
let a = fs.readFileSync('admin-portal/admin.html', 'utf8').replace(/\r\n/g, '\n');
let changes = 0;

// Fix requests row hover — F8FAFF → f5f5f5
const r1 = a.indexOf("this.style.background=\\'#F8FAFF\\'");
if (r1 !== -1) {
    a = a.substring(0, r1) + "this.style.background=\\'#f5f5f5\\'" + a.substring(r1 + "this.style.background=\\'#F8FAFF\\'".length);
    changes++;
    console.log('OK: requests row hover');
} else {
    console.log('MISS: requests row hover');
}

// Fix concerns row hover — rgba(26,58,107,0.04) → #f5f5f5
const OLD_CON = "this.style.background=\\'rgba(26,58,107,0.04)\\'";
const r2 = a.indexOf(OLD_CON);
if (r2 !== -1) {
    a = a.substring(0, r2) + "this.style.background=\\'#f5f5f5\\'" + a.substring(r2 + OLD_CON.length);
    changes++;
    console.log('OK: concerns row hover');
} else {
    console.log('MISS: concerns row hover');
}

fs.writeFileSync('admin-portal/admin.html', a);
console.log('Done.', changes, 'changes');
