const fs = require('fs');

const adminPaths = ['admin.html', 'admin-portal/admin.html'];

const replacements = [
    // Stat card borders - change accent to gray
    ['border-left:4px solid #f59e0b;padding:22px;border-radius:14px;', 'border-left:4px solid #94a3b8;padding:22px;border-radius:14px;'],
    ['border-left:4px solid #ef4444;padding:22px;border-radius:14px;', 'border-left:4px solid #94a3b8;padding:22px;border-radius:14px;'],
    ['border-left:4px solid #3b82f6;padding:22px;border-radius:14px;', 'border-left:4px solid #94a3b8;padding:22px;border-radius:14px;'],
    ['border-left:4px solid #10b981;padding:22px;border-radius:14px;', 'border-left:4px solid #94a3b8;padding:22px;border-radius:14px;'],

    // Stat icons - change accent colored bg to gray
    ['background:#fffbeb;border:1px solid #fde68a; color:#f59e0b;', 'background:#f8fafc;border:1px solid #e2e8f0; color:#64748b;'],
    ['background:#fef2f2;border:1px solid #fecaca; color:#ef4444;', 'background:#f8fafc;border:1px solid #e2e8f0; color:#64748b;'],
    ['background:#eff6ff;border:1px solid #bfdbfe; color:#3b82f6;', 'background:#f8fafc;border:1px solid #e2e8f0; color:#64748b;'],
    ['background:#ecfdf5;border:1px solid #a7f3d0; color:#10b981;', 'background:#f8fafc;border:1px solid #e2e8f0; color:#64748b;'],

    // Stat values - change accent to dark gray
    ['font-size:32px;font-weight:800;color:#ea580c;line-height:1;', 'font-size:32px;font-weight:800;color:#334155;line-height:1;'],
    ['font-size:32px;font-weight:800;color:#dc2626;line-height:1;', 'font-size:32px;font-weight:800;color:#334155;line-height:1;'],
    ['font-size:32px;font-weight:800;color:#2563eb;line-height:1;', 'font-size:32px;font-weight:800;color:#334155;line-height:1;'],
    ['font-size:32px;font-weight:800;color:#059669;line-height:1;', 'font-size:32px;font-weight:800;color:#334155;line-height:1;'],

    // Quick action cards - change accent to gray
    ['class="quick-action-card" style="--qa-color:#3b82f6;"', 'class="quick-action-card" style="--qa-color:#64748b;"'],
    ['class="quick-action-card" style="--qa-color:#f59e0b;"', 'class="quick-action-card" style="--qa-color:#64748b;"'],
    ['class="quick-action-card" style="--qa-color:#ef4444;"', 'class="quick-action-card" style="--qa-color:#64748b;"'],
    ['class="quick-action-card" style="--qa-color:#8b5cf6;"', 'class="quick-action-card" style="--qa-color:#64748b;"'],

    // Pending Actions card header icon - amber gradient to gray
    ['background:linear-gradient(135deg,#fef3c7,#fde68a);border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:18px;',
     'background:#f1f5f9;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:18px;'],

    // Pending actions rows bg colors
    ['background:#fffbeb;border-radius:10px;border:1px solid #fde68a;', 'background:var(--input-bg);border-radius:10px;border:1px solid var(--border);'],
    ['background:#fef2f2;border-radius:10px;border:1px solid #fecaca;', 'background:var(--input-bg);border-radius:10px;border:1px solid var(--border);'],
    ['background:#eff6ff;border-radius:10px;border:1px solid #bfdbfe;', 'background:var(--input-bg);border-radius:10px;border:1px solid var(--border);'],
    ['background:#f0fdf4;border-radius:10px;border:1px solid #bbf7d0;', 'background:var(--input-bg);border-radius:10px;border:1px solid var(--border);'],

    // Pending actions text
    ['font-size:13px;font-weight:600;color:#92400e;"', 'font-size:13px;font-weight:600;color:var(--text-main);"'],
    ['font-size:13px;font-weight:600;color:#991b1b;"', 'font-size:13px;font-weight:600;color:var(--text-main);"'],
    ['font-size:13px;font-weight:600;color:#1e40af;"', 'font-size:13px;font-weight:600;color:var(--text-main);"'],
    ['font-size:13px;font-weight:600;color:#065f46;"', 'font-size:13px;font-weight:600;color:var(--text-main);"'],

    // Pending actions count
    ['id="glancePendingReqs" style="font-weight:800;font-size:15px;color:#d97706;"', 'id="glancePendingReqs" style="font-weight:800;font-size:15px;color:#334155;"'],
    ['id="glancePendingCons" style="font-weight:800;font-size:15px;color:#dc2626;"', 'id="glancePendingCons" style="font-weight:800;font-size:15px;color:#334155;"'],
    ['id="glanceBookings" style="font-weight:800;font-size:15px;color:#2563eb;"', 'id="glanceBookings" style="font-weight:800;font-size:15px;color:#334155;"'],
    ['id="glanceUsers" style="font-weight:800;font-size:15px;color:#059669;"', 'id="glanceUsers" style="font-weight:800;font-size:15px;color:#334155;"'],

    // Pending Actions heading color
    ['font-size:14px;font-weight:700;color:#1e293b;">Pending Actions', 'font-size:14px;font-weight:700;color:var(--text-main);">Pending Actions'],
];

for (const path of adminPaths) {
    if (!fs.existsSync(path)) continue;
    let content = fs.readFileSync(path, 'utf8');
    let count = 0;
    for (const [from, to] of replacements) {
        if (content.includes(from)) { content = content.replaceAll(from, to); count++; }
    }
    fs.writeFileSync(path, content, 'utf8');
    console.log(`Updated ${count} replacements in ${path}`);
}
