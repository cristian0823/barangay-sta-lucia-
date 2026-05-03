const fs = require('fs');
let txt = fs.readFileSync('admin-portal/admin.html', 'utf8');

// Fix admin calendar event colors (Court Events)
txt = txt.replace(
    '[data-theme="dark"] #adminCalendarGrid .cal-box-event     { background: #6d28d9 !important; border-color: #5b21b6 !important; color: #ffffff   !important; }',
    '[data-theme="dark"] #adminCalendarGrid .cal-box-event     { background: #047857 !important; border-color: #064e3b !important; color: #ffffff   !important; }'
);
txt = txt.replace(
    '.cal-box-event { background: #9333ea; border: 1px solid #7e22ce; color: #ffffff; }',
    '.cal-box-event { background: #059669; border: 1px solid #047857; color: #ffffff; }'
);
txt = txt.replace(
    '[data-theme="dark"] .cal-box-event { background: #7e22ce !important; border-color: #6b21a8 !important; color: #ffffff !important; }',
    '[data-theme="dark"] .cal-box-event { background: #047857 !important; border-color: #064e3b !important; color: #ffffff !important; }'
);

fs.writeFileSync('admin-portal/admin.html', txt);
console.log('Done fixing admin calendar purple events!');
