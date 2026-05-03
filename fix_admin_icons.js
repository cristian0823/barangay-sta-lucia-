const fs = require('fs');
let txt = fs.readFileSync('admin-portal/admin.html', 'utf8');

txt = txt.replace(
    '<div style="width:36px;height:36px;background:var(--input-bg);border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:18px;">⚡</div>',
    '<div style="width:36px;height:36px;background:#dcfce7;color:#16a34a;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:18px;"><i class="bi bi-lightning-charge"></i></div>'
);

txt = txt.replace(
    '<div style="width:36px;height:36px;background:linear-gradient(135deg,#dcfce7,#bbf7d0);border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:18px;">📋</div>',
    '<div style="width:36px;height:36px;background:linear-gradient(135deg,#dcfce7,#bbf7d0);color:#16a34a;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:18px;"><i class="bi bi-journal-text"></i></div>'
);

fs.writeFileSync('admin-portal/admin.html', txt);
console.log('Done admin!');
