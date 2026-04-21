const fs = require('fs');
let html = fs.readFileSync('user-dashboard.html', 'utf8');

const targetStr = `                </div>
            

            <!-- PANEL 7: HISTORY -->
            <div id="panel-history" class="content-panel">`;

const replaceStr = `                </div>
            </div>

            <!-- PANEL 7: HISTORY -->
            <div id="panel-history" class="content-panel">`;

if (html.includes(targetStr)) {
    html = html.replace(targetStr, replaceStr);
    fs.writeFileSync('user-dashboard.html', html);
    console.log("Successfully added missing </div>");
} else {
    console.log("Target string not found - checking with regex");
    // Fallback regex if whitespace differs
    html = html.replace(
        /<\/div>[\s]*<!-- PANEL 7: HISTORY -->[\s]*<div id="panel-history"/,
        '</div>\n            </div>\n\n            <!-- PANEL 7: HISTORY -->\n            <div id="panel-history"'
    );
    fs.writeFileSync('user-dashboard.html', html);
    console.log("Applied regex fix");
}
