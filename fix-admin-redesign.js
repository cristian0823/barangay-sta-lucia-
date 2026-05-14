const fs = require('fs');
let c = fs.readFileSync('admin-portal/admin.html', 'utf8').replace(/\r\n/g, '\n');

let count = 0;
function rep(old, neo, label) {
  const idx = c.indexOf(old);
  if (idx === -1) { console.log('MISS: ' + label); return; }
  c = c.substring(0, idx) + neo + c.substring(idx + old.length);
  count++;
  console.log('OK: ' + label);
}

// ==============================
// 1. REMOVE LIVE CLOCK BLOCK
// ==============================
// Remove the entire right-side div with liveStatusBadge, heroClock, "Philippine Standard Time"
rep(
  '<div style="text-align:right;">\n                                    <div id="liveStatusBadge" style="display:inline-flex;align-items:center;gap:5px;background:rgba(22,163,74,0.2);border:1px solid rgba(22,163,74,0.35);border-radius:20px;padding:3px 10px;margin-bottom:6px;">\n                                        <span id="liveDot" style="width:6px;height:6px;background:#4ADE80;border-radius:50%;display:inline-block;animation:pulse-dot 1.8s infinite;"></span>\n                                        <span id="liveLabel" style="font-size:10px;font-weight:700;color:#4ADE80;letter-spacing:0.1em;">LIVE</span>\n                                    </div>\n                                    <div style="font-size:38px;font-weight:700;color:#FFFFFF;font-variant-numeric:tabular-nums;letter-spacing:-1px;line-height:1;" id="heroClock">00:00:00</div>\n                                    <div style="font-size:12px;color:rgba(255,255,255,0.6);margin-top:4px;">Philippine Standard Time</div>\n                                </div>',
  '',
  'remove admin live clock block'
);

// ==============================
// 2. REMOVE QUICK ACCESS SECTION
// ==============================
// Remove from "<!-- QUICK ACCESS -->" label to closing </div></div>
const QA_START = '                        <!-- QUICK ACCESS -->\n                        <div style="margin-bottom:22px;">';
const QA_END = '\n                    </div>\n\n\n                    <div id="requests-section"';

const qaStart = c.indexOf(QA_START);
const qaEnd = c.indexOf(QA_END);
if (qaStart !== -1 && qaEnd !== -1) {
  c = c.substring(0, qaStart) + '\n\n\n                    <div id="requests-section"' + c.substring(qaEnd + QA_END.length);
  count++;
  console.log('OK: remove Quick Access section');
} else {
  // Try alternate label
  const QA_START2 = '                        <!-- Quick Access -->';
  const QA_START3 = '                        <div style="margin-bottom:22px;">\n                            <div style="font-size:11px;font-weight:700;letter-spacing:0.12em;color:#6B7280;text-transform:uppercase;margin-bottom:12px;">Quick Access</div>';
  const qa3 = c.indexOf(QA_START3);
  if (qa3 !== -1 && qaEnd !== -1) {
    c = c.substring(0, qa3) + '' + c.substring(qaEnd + QA_END.length);
    count++;
    console.log('OK: remove Quick Access section (alt)');
  } else {
    console.log('MISS: Quick Access section (qaStart=' + qaStart + ', qaEnd=' + qaEnd + ', qa3=' + qa3 + ')');
    // Debug: show what's around line 534
    const lines = c.split('\n');
    for (let i = 530; i < 545; i++) {
      console.log('L' + (i+1) + ': ' + JSON.stringify(lines[i]));
    }
  }
}

// ==============================
// 3. CHECK FOR DARK MODE TOGGLE IN ADMIN
// ==============================
if (c.indexOf('toggleDarkMode') !== -1) {
  const idx = c.indexOf('toggleDarkMode');
  const lineNo = c.substring(0, idx).split('\n').length;
  console.log('Admin has toggleDarkMode at line ' + lineNo + ': ' + c.substring(idx-50, idx+100));
} else {
  console.log('INFO: No toggleDarkMode in admin.html (already removed or not present)');
}

fs.writeFileSync('admin-portal/admin.html', c);
console.log('\nDone! ' + count + ' changes applied.');
