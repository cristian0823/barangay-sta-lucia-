const fs = require('fs');
let c = fs.readFileSync('user-portal/user-dashboard.html', 'utf8').replace(/\r\n/g, '\n');

let changes = 0;
function rep(old, neu) {
    const idx = c.indexOf(old);
    if (idx === -1) { console.log('MISS:', JSON.stringify(old.substring(0,80))); return; }
    c = c.substring(0, idx) + neu + c.substring(idx + old.length);
    changes++;
}
function repAll(old, neu) {
    const n = c.split(old).length - 1;
    c = c.split(old).join(neu);
    if (n === 0) console.log('MISS(all):', JSON.stringify(old.substring(0,60)));
    else changes += n;
}

// Sidebar active item: orange left border → navy
rep(
    'border-left: 4px solid #F59E0B !important; box-shadow: none; }',
    'border-left: 4px solid #1e3a5f !important; box-shadow: none; }'
);

// Calendar today outline orange → navy
rep(
    "dayDiv.style.outline = '3px solid #F59E0B'; dayDiv.style.outlineOffset = '",
    "dayDiv.style.outline = '3px solid #1e3a5f'; dayDiv.style.outlineOffset = '"
);

// Step colors: step 0 orange (#f59e0b) → navy
rep(
    "const stepColors = {active:{ 0:'#f59e0b', 1:'#3b82f6', 2:",
    "const stepColors = {active:{ 0:'#1e3a5f', 1:'#1e3a5f', 2:"
);

// Progress bar step 2 orange → navy
rep(
    "statusLabel==='Rejected'?'#ef4444':'#f5a623' }}; const stepsHtml",
    "statusLabel==='Rejected'?'#ef4444':'#1e3a5f' }}; const stepsHtml"
);

// Progress bar gradient end orange → navy
rep(
    "ctive[1]+','+(statusLabel==='Rejected'?'#ef4444':'#f5a623')+')'",
    "ctive[1]+','+(statusLabel==='Rejected'?'#ef4444':'#1e3a5f')+')'"
);

// Concern tab active button gradient
rep(
    "iveBtn.style.background = 'linear-gradient(135deg,#f5a623,#0f1f3d)'; activeBtn.style.color = '",
    "iveBtn.style.background = 'linear-gradient(135deg,#1e3a5f,#0f1f3d)'; activeBtn.style.color = '"
);

// Approved badge orange border → navy
rep(
    "background:#e8edf5;color:#065f46;border:1px solid #f5a623;', 'Rejected':",
    "background:#e8edf5;color:#065f46;border:1px solid #1e3a5f;', 'Rejected':"
);

// .eq-Tables border stays orange (equipment semantic color) — skip

fs.writeFileSync('user-portal/user-dashboard.html', c);
console.log('Done.', changes, 'changes applied.');
