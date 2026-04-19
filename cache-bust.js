const fs = require('fs');
let h = fs.readFileSync('user-dashboard.html', 'utf8');

// Title verification for cache bypassing
h = h.replace('<title>User Dashboard - Barangay Sta. Lucia</title>', '<title>User Dashboard - Barangay Sta. Lucia (v2.1)</title>');

// My Activity Robustness Catch
let st = h.indexOf('async function loadHistoryView()');
let catchStart = h.indexOf('} catch (err) {', st);
if (catchStart > -1 && catchStart < st + 2500) {
    let catchEnd = h.indexOf('}', catchStart + 10);
    const newCatch = '} catch (err) {\\n                console.error(err);\\n                document.getElementById("unifiedHistoryList").innerHTML = \'<p class="text-red-500 italic text-sm">Failed to load history correctly. JS Error encountered.</p>\';\\n            }';
    h = h.substring(0, catchStart) + newCatch + h.substring(catchEnd + 1);
}

// Add a quick check in loadHistoryView just in case data mapped is empty
h = h.replace("if (all.length === 0) { container.innerHTML = '<p class=\"text-gray-500 italic text-sm\">No activity history found yet.</p>'; return; }", "if (all.length === 0) { container.innerHTML = '<p class=\"text-gray-500 italic text-[15px] font-bold mt-4\">No activity history found yet. If you believe this is an error, please try logging out and in again.</p>'; return; }");

fs.writeFileSync('user-dashboard.html', h);
console.log('Cache bust and defensive catch applied.');
