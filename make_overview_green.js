const fs = require('fs');

let html = fs.readFileSync('admin.html', 'utf8');

// The Quick Actions Card for Equipment Requests
const qaOld = `<button onclick="switchSection('requests', document.querySelectorAll('.sidebar-btn')[3])"
                                class="quick-action-card" style="--qa-color:var(--muted);">`;
const qaNew = `<button onclick="switchSection('requests', document.querySelectorAll('.sidebar-btn')[3])"
                                class="quick-action-card" style="--qa-color:var(--green-xl);">`;

// The Stats Card for Pending Requests
const statOld = `<div class="stat-card"
                                onclick="switchSection('requests', document.querySelectorAll('.sidebar-btn')[3])"
                                style="cursor:pointer;border-left:4px solid var(--muted);padding:22px;border-radius:14px;">
                                <div class="stat-icon" style="background:var(--input-bg);border:1px solid var(--border); color:var(--muted); display:flex; align-items:center; justify-content:center; font-size:24px;"><i class="bi bi-box-fill"></i></div>`;

const statNew = `<div class="stat-card"
                                onclick="switchSection('requests', document.querySelectorAll('.sidebar-btn')[3])"
                                style="cursor:pointer;border-left:4px solid var(--green-xl);padding:22px;border-radius:14px;">
                                <div class="stat-icon" style="background:var(--input-bg);border:1px solid var(--border); color:var(--green-xl); display:flex; align-items:center; justify-content:center; font-size:24px;"><i class="bi bi-box-fill"></i></div>`;

let changes = 0;
if (html.includes(qaOld)) {
    html = html.replace(qaOld, qaNew);
    changes++;
    console.log('✅ Updated Equipment Requests quick action card to green');
} else {
    // maybe no carriage return?
    const qAlt = `class="quick-action-card" style="--qa-color:var(--muted);">
                                <div class="qa-icon" style="color:var(--qa-color)"><i class="bi bi-box-fill"></i></div>
                                <div class="qa-label">Equipment Requests</div>`;
    const qAltNew = `class="quick-action-card" style="--qa-color:var(--green-xl);">
                                <div class="qa-icon" style="color:var(--qa-color)"><i class="bi bi-box-fill"></i></div>
                                <div class="qa-label">Equipment Requests</div>`;
    if (html.includes(qAlt)) {
        html = html.replace(qAlt, qAltNew);
        changes++;
        console.log('✅ Updated Equipment Requests quick action card (alt)');
    } else {
        console.warn('⚠️ Could not find Equipment Requests quick action card');
    }
}

if (html.includes(statOld)) {
    html = html.replace(statOld, statNew);
    changes++;
    console.log('✅ Updated Pending Requests stat card to green');
} else {
    // alternate
    const sAlt = `style="cursor:pointer;border-left:4px solid var(--muted);padding:22px;border-radius:14px;">
                                <div class="stat-icon" style="background:var(--input-bg);border:1px solid var(--border); color:var(--muted); display:flex; align-items:center; justify-content:center; font-size:24px;"><i class="bi bi-box-fill"></i></div>
                                <div class="stat-content">
                                    <h3
                                        style="font-size:11px;color:#6b7280;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:6px;">
                                        Pending Requests</h3>`;
    const sAltNew = `style="cursor:pointer;border-left:4px solid var(--green-xl);padding:22px;border-radius:14px;">
                                <div class="stat-icon" style="background:var(--input-bg);border:1px solid var(--border); color:var(--green-xl); display:flex; align-items:center; justify-content:center; font-size:24px;"><i class="bi bi-box-fill"></i></div>
                                <div class="stat-content">
                                    <h3
                                        style="font-size:11px;color:#6b7280;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:6px;">
                                        Pending Requests</h3>`;
    
    if (html.includes(sAlt)) {
        html = html.replace(sAlt, sAltNew);
        changes++;
        console.log('✅ Updated Pending Requests stat card to green (alt)');
    } else {
        console.warn('⚠️ Could not find Pending Requests stat card');
    }
}

if (changes > 0) {
    fs.writeFileSync('admin.html', html, 'utf8');
    fs.copyFileSync('admin.html', 'admin-portal/admin.html');
}
