const fs = require('fs');
let h = fs.readFileSync('admin.html', 'utf8');

// The generated error string looks like: onmouseout="this.style.background='\'"
// Wait no, the string generated was:
// onmouseout="this.style.background=\'\\'">'
// So we need to replace '\\'' with '\\'\\'' inside the JS.
// Actually, let's just use string replace without confusing regex.
let searchStr = "onmouseout=\"this.style.background=\\'\\\\'\"";
let replaceStr = "onmouseout=\"this.style.background=\\'\\'\"";
h = h.split(searchStr).join(replaceStr);

fs.writeFileSync('admin.html', h);
console.log('Fixed js escaping');
