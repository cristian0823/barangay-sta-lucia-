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

// ============================================================
// 5. SECURITY LOG KPI CARDS — all to blue
// ============================================================

// Failed Attempts card: amber → blue
rep(
  '<div style="background:#fff;border:1px solid #D1D5DB;border-top:4px solid #FDB913;border-radius:12px;padding:18px 20px;box-shadow:0 1px 3px rgba(0,0,0,0.05);">\n            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">\n                <span style="font-size:11px;font-weight:600;color:#6B7280;text-transform:uppercase;letter-spacing:0.08em;">Failed Attempts</span>\n                <div style="width:36px;height:36px;border-radius:50%;background:rgba(253,185,19,0.15);display:flex;align-items:center;justify-content:center;color:#D97706;"><i class="bi bi-key-fill"></i></div>',
  '<div style="background:#fff;border:1px solid #D1D5DB;border-top:4px solid #2563eb;border-radius:12px;padding:18px 20px;box-shadow:0 1px 3px rgba(0,0,0,0.05);">\n            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">\n                <span style="font-size:11px;font-weight:600;color:#6B7280;text-transform:uppercase;letter-spacing:0.08em;">Failed Attempts</span>\n                <div style="width:36px;height:36px;border-radius:50%;background:rgba(37,99,235,0.1);display:flex;align-items:center;justify-content:center;color:#2563eb;"><i class="bi bi-key-fill"></i></div>',
  'security log Failed Attempts amber→blue'
);

// Anomalies Today card: red → blue
rep(
  '<div style="background:#fff;border:1px solid #D1D5DB;border-top:4px solid #CE1126;border-radius:12px;padding:18px 20px;box-shadow:0 1px 3px rgba(0,0,0,0.05);">\n            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">\n                <span style="font-size:11px;font-weight:600;color:#6B7280;text-transform:uppercase;letter-spacing:0.08em;">Anomalies Today</span>\n                <div style="width:36px;height:36px;border-radius:50%;background:rgba(206,17,38,0.1);display:flex;align-items:center;justify-content:center;color:#CE1126;"><i class="bi bi-exclamation-triangle-fill"></i></div>\n            </div>\n            <div id="secStatAnomalies" style="font-size:32px;font-weight:700;color:#CE1126;line-height:1;">0</div>',
  '<div style="background:#fff;border:1px solid #D1D5DB;border-top:4px solid #2563eb;border-radius:12px;padding:18px 20px;box-shadow:0 1px 3px rgba(0,0,0,0.05);">\n            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">\n                <span style="font-size:11px;font-weight:600;color:#6B7280;text-transform:uppercase;letter-spacing:0.08em;">Anomalies Today</span>\n                <div style="width:36px;height:36px;border-radius:50%;background:rgba(37,99,235,0.1);display:flex;align-items:center;justify-content:center;color:#2563eb;"><i class="bi bi-exclamation-triangle-fill"></i></div>\n            </div>\n            <div id="secStatAnomalies" style="font-size:32px;font-weight:700;color:#1e3a5f;line-height:1;">0</div>',
  'security log Anomalies red→blue'
);

// Total Records card: green → blue
rep(
  '<div style="background:#fff;border:1px solid #D1D5DB;border-top:4px solid #16A34A;border-radius:12px;padding:18px 20px;box-shadow:0 1px 3px rgba(0,0,0,0.05);">\n            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">\n                <span style="font-size:11px;font-weight:600;color:#6B7280;text-transform:uppercase;letter-spacing:0.08em;">Total Records</span>\n                <div style="width:36px;height:36px;border-radius:50%;background:rgba(22,163,74,0.1);display:flex;align-items:center;justify-content:center;color:#16A34A;"><i class="bi bi-database-fill"></i></div>',
  '<div style="background:#fff;border:1px solid #D1D5DB;border-top:4px solid #2563eb;border-radius:12px;padding:18px 20px;box-shadow:0 1px 3px rgba(0,0,0,0.05);">\n            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">\n                <span style="font-size:11px;font-weight:600;color:#6B7280;text-transform:uppercase;letter-spacing:0.08em;">Total Records</span>\n                <div style="width:36px;height:36px;border-radius:50%;background:rgba(37,99,235,0.1);display:flex;align-items:center;justify-content:center;color:#2563eb;"><i class="bi bi-database-fill"></i></div>',
  'security log Total Records green→blue'
);

// Fix anomaly checkbox accent color: red → blue
rep(
  'style="width:16px;height:16px;cursor:pointer;accent-color:#CE1126;"',
  'style="width:16px;height:16px;cursor:pointer;accent-color:#2563eb;"',
  'anomaly checkbox accent red→blue'
);

// ============================================================
// Security log tab buttons: active = solid blue #2563eb
// ============================================================
rep(
  '<button onclick="setSecQuickFilter(\'logins\')" id="sqf_logins" style="padding:6px 14px;border-radius:6px;border:none;background:#1A3A6B;color:#fff;font-weight:600;font-size:13px;cursor:pointer;font-family:inherit;">Login Events</button>\n        <button onclick="setSecQuickFilter(\'all\')" id="sqf_all" style="padding:6px 14px;border-radius:6px;border:none;background:transparent;color:#6B7280;font-weight:500;font-size:13px;cursor:pointer;font-family:inherit;">All Events</button>\n        <button onclick="setSecQuickFilter(\'failed\')" id="sqf_failed" style="padding:6px 14px;border-radius:6px;border:none;background:transparent;color:#6B7280;font-weight:500;font-size:13px;cursor:pointer;font-family:inherit;">Failed Only</button>\n        <button onclick="setSecQuickFilter(\'anomaly\')" id="sqf_anomaly" style="padding:6px 14px;border-radius:6px;border:none;background:transparent;color:#6B7280;font-weight:500;font-size:13px;cursor:pointer;font-family:inherit;">Anomalies</button>\n        <button onclick="setSecQuickFilter(\'residents\')" id="sqf_residents" style="padding:6px 14px;border-radius:6px;border:none;background:transparent;color:#6B7280;font-weight:500;font-size:13px;cursor:pointer;font-family:inherit;">Residents</button>',
  '<button onclick="setSecQuickFilter(\'logins\')" id="sqf_logins" style="padding:6px 14px;border-radius:6px;border:1.5px solid #2563eb;background:#2563eb;color:#fff;font-weight:600;font-size:13px;cursor:pointer;font-family:inherit;">Login Events</button>\n        <button onclick="setSecQuickFilter(\'all\')" id="sqf_all" style="padding:6px 14px;border-radius:6px;border:1.5px solid #e2e8f0;background:transparent;color:#6B7280;font-weight:500;font-size:13px;cursor:pointer;font-family:inherit;">All Events</button>\n        <button onclick="setSecQuickFilter(\'failed\')" id="sqf_failed" style="padding:6px 14px;border-radius:6px;border:1.5px solid #e2e8f0;background:transparent;color:#6B7280;font-weight:500;font-size:13px;cursor:pointer;font-family:inherit;">Failed Only</button>\n        <button onclick="setSecQuickFilter(\'anomaly\')" id="sqf_anomaly" style="padding:6px 14px;border-radius:6px;border:1.5px solid #e2e8f0;background:transparent;color:#6B7280;font-weight:500;font-size:13px;cursor:pointer;font-family:inherit;">Anomalies</button>\n        <button onclick="setSecQuickFilter(\'residents\')" id="sqf_residents" style="padding:6px 14px;border-radius:6px;border:1.5px solid #e2e8f0;background:transparent;color:#6B7280;font-weight:500;font-size:13px;cursor:pointer;font-family:inherit;">Residents</button>',
  'security log tab buttons'
);

// Also update setSecQuickFilter JS to use blue active style
const SQF_START = 'function setSecQuickFilter(filter) {';
const sqfIdx = c.indexOf(SQF_START);
if (sqfIdx !== -1) {
  const sqfEnd = c.indexOf('renderSecurityLog(true);', sqfIdx) + 'renderSecurityLog(true);'.length;
  const sqfBlock = c.substring(sqfIdx, sqfEnd + 10);
  // Replace #1A3A6B active color with #2563eb in the setSecQuickFilter function
  if (sqfBlock.includes('#1A3A6B')) {
    const newBlock = sqfBlock.replace(/#1A3A6B/g, '#2563eb').replace(/border:none/g, 'border:1.5px solid #2563eb');
    c = c.substring(0, sqfIdx) + newBlock + c.substring(sqfIdx + sqfBlock.length);
    count++;
    console.log('OK: setSecQuickFilter active color');
  } else {
    console.log('INFO: setSecQuickFilter no #1A3A6B found, looking for pattern');
    // Find and show the function
    console.log(c.substring(sqfIdx, sqfIdx + 400));
  }
}

fs.writeFileSync('admin-portal/admin.html', c);
console.log('\nAdmin: ' + count + ' changes applied.');
