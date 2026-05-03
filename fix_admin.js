const fs = require('fs');
let txt = fs.readFileSync('admin-portal/admin.html', 'utf8');

const rep1 = `<div style="position:relative; width:220px; flex-shrink:0;">
                        <i class="bi bi-search" style="position:absolute;left:10px;top:50%;transform:translateY(-50%);color:var(--muted);font-size:13px;pointer-events:none;"></i>
                        <input type="text" id="reqFilterSearch" placeholder="Search resident or equipment..." oninput="applyReqFilter()" style="width:100%; padding:8px 12px 8px 36px; border-radius:8px; border:1px solid var(--border); outline:none; background:var(--bg); color:var(--text);">
                    </div>`;

txt = txt.replace(/<input type="text" id="reqFilterSearch".*?>/, rep1);

const rep2 = `<div style="position:relative; width:220px; flex-shrink:0;">
                        <i class="bi bi-search" style="position:absolute;left:10px;top:50%;transform:translateY(-50%);color:var(--muted);font-size:13px;pointer-events:none;"></i>
                        <input type="text" id="courtBookingSearch" placeholder="Search resident..." oninput="loadAdminBookings()" style="width:100%; padding:8px 12px 8px 36px; border-radius:8px; border:1px solid var(--border); outline:none; background:var(--bg); color:var(--text);">
                    </div>`;

txt = txt.replace(/<input type="text" id="courtBookingSearch".*?>/, rep2);

const auditSearchOrig = `<input type="text" id="auditFilterSearch" onkeyup="renderAuditLog(true)" placeholder="user, details, entity..." style="width: 100%; padding: 8px 12px; border-radius: 8px 0 0 8px; border: 1px solid var(--border); background: var(--card-bg); color: var(--text); font-size: 13px; outline: none;">
                    <button onclick="renderAuditLog(true)" style="background: var(--text); color: var(--card-bg); border: none; padding: 0 16px; border-radius: 0 8px 8px 0; cursor: pointer;"><i class="bi bi-search"></i></button>`;
const auditSearchNew = `<div style="position:relative; width:100%;">
                        <i class="bi bi-search" style="position:absolute;left:10px;top:50%;transform:translateY(-50%);color:var(--muted);font-size:13px;pointer-events:none;"></i>
                        <input type="text" id="auditFilterSearch" onkeyup="renderAuditLog(true)" placeholder="user, details, entity..." style="width: 100%; padding: 8px 12px 8px 32px; border-radius: 8px; border: 1px solid var(--border); background: var(--card-bg); color: var(--text); font-size: 13px; outline: none;">
                    </div>`;

txt = txt.replace(auditSearchOrig, auditSearchNew);

const secSearchOrig = `<input type="text" id="secFilterSearch" onkeyup="renderSecurityLog(true)" placeholder="email, IP, details..." style="width: 100%; padding: 8px 12px; border-radius: 8px 0 0 8px; border: 1px solid var(--border); background: var(--card-bg); color: var(--text); font-size: 13px; outline: none;">
                    <button onclick="renderSecurityLog(true)" style="background: var(--text); color: var(--card-bg); border: none; padding: 0 16px; border-radius: 0 8px 8px 0; cursor: pointer;"><i class="bi bi-search"></i></button>`;
const secSearchNew = `<div style="position:relative; width:100%;">
                        <i class="bi bi-search" style="position:absolute;left:10px;top:50%;transform:translateY(-50%);color:var(--muted);font-size:13px;pointer-events:none;"></i>
                        <input type="text" id="secFilterSearch" onkeyup="renderSecurityLog(true)" placeholder="email, IP, details..." style="width: 100%; padding: 8px 12px 8px 32px; border-radius: 8px; border: 1px solid var(--border); background: var(--card-bg); color: var(--text); font-size: 13px; outline: none;">
                    </div>`;

txt = txt.replace(secSearchOrig, secSearchNew);

fs.writeFileSync('admin-portal/admin.html', txt);
console.log('done all');
