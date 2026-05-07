
const fs = require('fs');

// ── 1. Fix admin.html garbled characters ──────────────────────────────────
let admin = fs.readFileSync('admin-portal/admin.html', 'utf8');

// Fix Maintenance Log button
admin = admin.replace(
  /\uFFFD+\s*Maintenance Log<\/button>/g,
  '<i class="bi bi-clipboard2-pulse"></i> Maintenance Log</button>'
);
// More targeted fix using the actual bytes pattern visible in the file
admin = admin.replace(
  /> *[\u00c0-\u00ff][\u00c0-\u00ff][\u00c0-\u00ff][\u00c0-\u00ff][\u00c0-\u00ff][\u00c0-\u00ff][\u00c0-\u00ff][\u00c0-\u00ff][\u00c0-\u00ff][\u00c0-\u00ff][\u00c0-\u00ff][\u00c0-\u00ff] Maintenance Log<\/button>/g,
  '><i class="bi bi-clipboard2-pulse"></i> Maintenance Log</button>'
);

// Fix Security Log quick-filter tab labels (keep structure, just fix labels)
admin = admin.replace(
  /(<button[^>]*id="sqf_logins"[^>]*>)[^<]*(<\/button>)/g,
  '$1<i class="bi bi-person-check-fill"></i> Login Events$2'
);
admin = admin.replace(
  /(<button[^>]*id="sqf_all"[^>]*>)[^<]*(<\/button>)/g,
  '$1<i class="bi bi-list-ul"></i> All Events$2'
);
admin = admin.replace(
  /(<button[^>]*id="sqf_failed"[^>]*>)[^<]*(<\/button>)/g,
  '$1<i class="bi bi-x-circle-fill"></i> Failed Only$2'
);
admin = admin.replace(
  /(<button[^>]*id="sqf_anomaly"[^>]*>)[^<]*(<\/button>)/g,
  '$1<i class="bi bi-exclamation-triangle-fill"></i> Anomalies$2'
);

// Fix Concerns "Replied" badge - replace the garbled checkmark emoji with BI icon
admin = admin.replace(
  /font-style:italic;['"]\>[\u00c0-\u00ff\u0080-\u00bf]{3,20} Replied<\/div>/g,
  "font-style:italic;\"><i class=\"bi bi-check-circle-fill\"></i> Replied</div>"
);

// Fix Concerns "Photo" badge - replace garbled camera emoji with BI icon
admin = admin.replace(
  /font-weight:700;['"]\>[\u00c0-\u00ff\u0080-\u00bf]{3,20} Photo<\/span>/g,
  "font-weight:700;\"><i class=\"bi bi-image-fill\"></i> Photo</span>"
);

// Fix pagination "–" garbled character
admin = admin.replace(/\>Showing ' \+ s \+ '[\u00c0-\u00ff\u0080-\u00bf]{3,10}'/g, ">Showing ' + s + '\u2013'");

// Fix Status -> arrow garbled in audit log action label
admin = admin.replace(/return \{ label: '[\u00c0-\u00ff\u0080-\u00bf]{3,20}', dot: '#94a3b8' \}/g,
  "return { label: '-', dot: '#94a3b8' }");

fs.writeFileSync('admin-portal/admin.html', admin, 'utf8');
console.log('admin.html garbled fixes applied');

// ── 2. Fix user-dashboard.html: dynamic Barangay Services status ─────────
let dash = fs.readFileSync('user-dashboard.html', 'utf8');

// Add IDs to the Equipment Lending and Facility Reservations status spans
dash = dash.replace(
  /<span style="font-size:11px;background:#d1fae5;color:#065f46;padding:2px 9px;border-radius:20px;font-weight:700;">Open<\/span>/,
  '<span id="svc-equip-badge" style="font-size:11px;background:#d1fae5;color:#065f46;padding:2px 9px;border-radius:20px;font-weight:700;">Open</span>'
);
dash = dash.replace(
  /<span style="font-size:11px;background:var\(--input-bg\);color:#475569;padding:2px 9px;border-radius:20px;font-weight:700;">Open<\/span>/,
  '<span id="svc-facility-badge" style="font-size:11px;padding:2px 9px;border-radius:20px;font-weight:700;">Open</span>'
);

// Add the updateServiceStatusBadges() call inside loadOperatingHours() after the Supabase block
const insertAfter = "} catch(e) { /* use defaults/localStorage */ }\n        }";
const withStatusCall = "} catch(e) { /* use defaults/localStorage */ }\n            // Update Barangay Services badges on the dashboard\n            updateServiceStatusBadges();\n        }";
dash = dash.replace(insertAfter, withStatusCall);

// Inject the updateServiceStatusBadges function right before loadOperatingHours
const fnTarget = "        async function loadOperatingHours() {";
const statusFn = `        function updateServiceStatusBadges() {
            const equipBadge = document.getElementById('svc-equip-badge');
            const facilityBadge = document.getElementById('svc-facility-badge');
            const equipOpen = isEquipOpen();
            const facilOpen = isFacilityOpen();
            if (equipBadge) {
                equipBadge.textContent = equipOpen ? 'Open' : 'Closed';
                equipBadge.style.background = equipOpen ? '#d1fae5' : '#fee2e2';
                equipBadge.style.color = equipOpen ? '#065f46' : '#991b1b';
            }
            if (facilityBadge) {
                facilityBadge.textContent = facilOpen ? 'Open' : 'Closed';
                facilityBadge.style.background = facilOpen ? '#d1fae5' : '#fee2e2';
                facilityBadge.style.color = facilOpen ? '#065f46' : '#991b1b';
            }
        }

        async function loadOperatingHours() {`;

dash = dash.replace(fnTarget, statusFn);

fs.writeFileSync('user-dashboard.html', dash, 'utf8');
console.log('user-dashboard.html service status badges applied');
console.log('Done!');
