const fs = require('fs');
let html = fs.readFileSync('user-portal/user-dashboard.html', 'utf8');

// 1. Image styling from object-cover to object-contain
html = html.replace('id="borrowModalImage" src="../barangay.jpg" alt="Equipment" class="w-full h-full object-cover', 'id="borrowModalImage" src="../barangay.jpg" alt="Equipment" class="w-full h-full object-contain');

// 2. Corrupted calendar emoji
html = html.replace(/<span class="w-8 h-8 bg-emerald-500 text-white rounded-lg flex items-center justify-center text-base shrink-0">[^<]+<\/span> Selected Borrowing Period/g, '<span class="w-8 h-8 bg-emerald-500 text-white rounded-lg flex items-center justify-center text-base shrink-0">&#128197;</span> Selected Borrowing Period');

// 3. Corrupted reminder warning emoji
html = html.replace(/<span class="text-base leading-none">[^<]+<\/span>\s*<div>\s*<strong>Reminder:<\/strong>/g, '<span class="text-base leading-none">&#9888;&#65039;</span>\n                            <div>\n                                <strong>Reminder:</strong>');

// 4. Corrupted box emoji in JS
html = html.replace(/helpEl\.innerHTML = '[^']+' \+ item\.available \+ \(item\.available === 1 \? ' unit available' : ' units available'\);/g, "helpEl.innerHTML = '&#128230; Max: ' + item.available + (item.available === 1 ? ' unit available' : ' units available');");

// 5. Corrupted warning emoji in pending notice
html = html.replace(/helpEl\.innerHTML \+= ' <br><span style="color:#b45309;font-size:11px;font-weight:600;">[^']+' \+ item\.pending \+ ' unit\(s\) pending from other users<\/span>';/g, "helpEl.innerHTML += ' <br><span style=\"color:#b45309;font-size:11px;font-weight:600;\">&#9888;&#65039; ' + item.pending + ' unit(s) pending from other users</span>';");

fs.writeFileSync('user-portal/user-dashboard.html', html);
console.log('Patch applied successfully.');
