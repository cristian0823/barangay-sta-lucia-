const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'user-portal', 'user-dashboard.html');
let content = fs.readFileSync(filePath, 'utf8');

const extraCSS = `
        /* ── EXTRA DARK MODE FIXES ── */
        [data-theme="dark"] .user-stat-icon { background: #1e3a5f !important; border-color: #334155 !important; }
        [data-theme="dark"] div[style*="background:#d1fae5"],
        [data-theme="dark"] div[style*="background:#dbeafe"],
        [data-theme="dark"] div[style*="background:#fef3c7"] { background: #1e293b !important; }
        [data-theme="dark"] span[style*="background:#f0fdf4"] { background: rgba(16,185,129,0.15) !important; color: #34d399 !important; border-color: rgba(16,185,129,0.3) !important; }
        [data-theme="dark"] span[style*="background:#d1fae5"] { background: rgba(16,185,129,0.15) !important; color: #34d399 !important; }
        [data-theme="dark"] span[style*="background:#dbeafe"] { background: rgba(59,130,246,0.15) !important; color: #93c5fd !important; }
        [data-theme="dark"] span[style*="background:#fef3c7"] { background: rgba(245,158,11,0.15) !important; color: #fcd34d !important; }
        [data-theme="dark"] #upcomingEventsContainer > div { background: #1e293b !important; border-color: #334155 !important; }
        [data-theme="dark"] #myBorrowingsList > div,
        [data-theme="dark"] #myReservationsList > div { background: #1e293b !important; border-color: #334155 !important; }
        [data-theme="dark"] td, [data-theme="dark"] th { color: #e2e8f0 !important; border-color: #334155 !important; }
        [data-theme="dark"] tbody tr:hover td { background: rgba(51,65,85,0.4) !important; }
        [data-theme="dark"] ::-webkit-scrollbar-track { background: #0f172a; }
        [data-theme="dark"] ::-webkit-scrollbar-thumb { background: #334155; border-radius: 4px; }
        [data-theme="dark"] ::-webkit-scrollbar-thumb:hover { background: #475569; }
`;

// Find the first </style> tag (the main style block closes here)
// It's right after the eq-Default dark mode line
const marker = '[data-theme="dark"] .eq-Default';
const markerIdx = content.indexOf(marker);
if (markerIdx === -1) { console.error('Marker not found!'); process.exit(1); }

// Find the end of that line
const lineEnd = content.indexOf('\n', markerIdx);
const insertPos = lineEnd + 1;

content = content.slice(0, insertPos) + extraCSS + content.slice(insertPos);
fs.writeFileSync(filePath, content, 'utf8');
console.log('Dark mode CSS injected successfully at position', insertPos);
