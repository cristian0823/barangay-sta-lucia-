const fs = require('fs');
let c = fs.readFileSync('user-portal/user-dashboard.html', 'utf8').replace(/\r\n/g, '\n');

let changes = 0;
function rep(old, neu) {
    const idx = c.indexOf(old);
    if (idx === -1) { console.log('MISS:', JSON.stringify(old.substring(0,70))); return; }
    c = c.substring(0, idx) + neu + c.substring(idx + old.length);
    changes++;
}
function repAll(old, neu) {
    const n = c.split(old).length - 1;
    c = c.split(old).join(neu);
    if (n === 0) console.log('MISS(all):', JSON.stringify(old.substring(0,60)));
    else changes += n;
}

// ─── Calendar: selected day orange → navy ─────────────────────────────────
repAll(
    "background:#f5a623;color:#fff;cursor:pointer;box-shadow:0 2px 8px rgba(",
    "background:#1e3a5f;color:#fff;cursor:pointer;box-shadow:0 2px 8px rgba("
);
repAll(
    "rgba(245,166,35,0.4);outline:2px solid #f5a623;outline-offset:0;",
    "rgba(30,58,95,0.4);outline:2px solid #1e3a5f;outline-offset:0;"
);
rep(
    "dayDiv.style.color = isDark ? '#f5a623' : '#065f46';",
    "dayDiv.style.color = '#1e3a5f';"
);

// ─── Borrowing status Approved badge border orange → navy ─────────────────
rep(
    "background:#e8edf5;color:#065f46;border:1px solid #f5a623;', 'Rejected':",
    "background:#e8edf5;color:#065f46;border:1px solid #1e3a5f;', 'Rejected':"
);

// ─── Progress steps active/done color orange → navy ───────────────────────
repAll(
    "stepColors.active[i]||'#f5a623'",
    "stepColors.active[i]||'#1e3a5f'"
);
rep(
    "const col = done ? '#f5a623' :",
    "const col = done ? '#1e3a5f' :"
);
repAll(
    ": (active ? (stepColors.active[i]||'#1e3a5f') : 'transparent'); const border",
    ": (active ? (stepColors.active[i]||'#1e3a5f') : 'transparent'); const border"
);
rep(
    "const border = done ? '#f5a623' :",
    "const border = done ? '#1e3a5f' :"
);
rep(
    "const textCol = done ? '#f5a623' :",
    "const textCol = done ? '#1e3a5f' :"
);
rep(
    "= 1 ? 'background:linear-gradient(90deg,#f5a623,'+stepColors.active[1]+')'",
    "= 1 ? 'background:linear-gradient(90deg,#1e3a5f,'+stepColors.active[1]+')'"
);
rep(
    ",(statusLabel==='Rejected'?'#ef4444':'#f5a623')+')' : 'background:var(--border-color)'",
    ",(statusLabel==='Rejected'?'#ef4444':'#1e3a5f')+')' : 'background:var(--border-color)'"
);

// ─── Activity log dot orange → navy ───────────────────────────────────────
rep(
    "const logItems = [{dot:'#f5a623', title:'Concern submitted'",
    "const logItems = [{dot:'#1e3a5f', title:'Concern submitted'"
);

// ─── Concern history status dot: Resolved orange → green ──────────────────
rep(
    "const dot = lbl==='Resolved'?'#f5a623':lbl==='Rejected'?'#ef4444':'#f59e0b';",
    "const dot = lbl==='Resolved'?'#16a34a':lbl==='Rejected'?'#ef4444':'#f59e0b';"
);

// ─── Admin reply badge orange → navy ──────────────────────────────────────
rep(
    "background:rgba(245,166,35,0.12);color:#f5a623;border:1px solid rgba(245,166,35,0.3);\">&#10003; Rep",
    "background:rgba(30,58,95,0.1);color:#1e3a5f;border:1px solid rgba(30,58,95,0.25);\">&#10003; Rep"
);
rep(
    "text-transform:uppercase;color:#f5a623;margin-bottom:8px;\">Admin reply</div>",
    "text-transform:uppercase;color:#1e3a5f;margin-bottom:8px;\">Admin reply</div>"
);

// ─── Concern tab active button gradient + border ───────────────────────────
rep(
    "activeBtn.style.background = 'linear-gradient(135deg,#f5a623,#0f1f3d)'; activeBtn.style.color = '",
    "activeBtn.style.background = 'linear-gradient(135deg,#1e3a5f,#0f1f3d)'; activeBtn.style.color = '"
);
rep(
    "activeBtn.style.borderColor = '#f5a623';",
    "activeBtn.style.borderColor = '#1e3a5f';"
);

// ─── Success notification theme orange → navy ─────────────────────────────
rep(
    "success: { bg: '#e8edf5', border: '#f5a623', icon: '', text: '#065f46', progress: '#f5a623' }",
    "success: { bg: '#e8edf5', border: '#1e3a5f', icon: '', text: '#065f46', progress: '#1e3a5f' }"
);

// ─── Remaining rgba(245,166,35,...) ───────────────────────────────────────
repAll('rgba(245,166,35,0.12)', 'rgba(30,58,95,0.1)');
repAll('rgba(245,166,35,0.3)', 'rgba(30,58,95,0.25)');
repAll('rgba(245,166,35,0.4)', 'rgba(30,58,95,0.4)');
repAll('rgba(245,166,35,0.08)', 'rgba(30,58,95,0.08)');

fs.writeFileSync('user-portal/user-dashboard.html', c);
console.log('Done.', changes, 'changes applied.');
