const fs = require('fs');

let oldH = fs.readFileSync('orig-dashboard.html', 'utf8');
let newH = fs.readFileSync('user-dashboard.html', 'utf8');

const fallbackStart = oldH.indexOf('id="panel-history"');
if (fallbackStart > -1) {
    let fBlockStart = oldH.lastIndexOf('<div', fallbackStart);
    let fBlockEnd = oldH.indexOf('<!-- MODALS -->', fBlockStart);
    if (fBlockEnd > -1) {
         const hHtml = oldH.substring(fBlockStart, fBlockEnd);
         const modIdx = newH.indexOf('<!-- MODALS -->');
         if (modIdx > -1) {
             newH = newH.substring(0, modIdx) + hHtml + newH.substring(modIdx);
             console.log('Restored history using exact index extraction block!');
         }
    }
} else {
    console.log('Could not find panel-history in orig-dashboard.html!');
}

fs.writeFileSync('user-dashboard.html', newH);
