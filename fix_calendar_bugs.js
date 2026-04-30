const fs = require('fs');

const paths = ['user-dashboard.html', 'user-portal/user-dashboard.html'];

for (const path of paths) {
    if (!fs.existsSync(path)) continue;
    let content = fs.readFileSync(path, 'utf8');
    let changed = false;

    // Fix 1: Replace raw HTML venue label with emoji for textContent (both files)
    const oldVenueLabel = `const venueLabel = selectedVenue === 'basketball' ? '<i class="bi bi-dribbble mr-2"></i>Basketball Court' : '<i class="bi bi-building mr-2"></i>Multi-Purpose Hall';`;
    const newVenueLabel = `const venueLabel = selectedVenue === 'basketball' ? '\uD83C\uDFC0 Basketball Court' : '\uD83C\uDFE2 Multi-Purpose Hall';`;
    if (content.includes(oldVenueLabel)) {
        content = content.replaceAll(oldVenueLabel, newVenueLabel);
        changed = true;
        console.log("Fixed venue label in", path);
    }

    // Fix 2: Replace raw HTML in event venue label (in refreshDsSchedule)
    const oldEvLabel = `? '<i class="bi bi-building mr-2"></i>Multi-Purpose Hall' : '<i class="bi bi-dribbble mr-2"></i>Basketball Court';`;
    const newEvLabel = `? '\uD83C\uDFE2 Multi-Purpose Hall' : '\uD83C\uDFC0 Basketball Court';`;
    if (content.includes(oldEvLabel)) {
        content = content.replaceAll(oldEvLabel, newEvLabel);
        changed = true;
        console.log("Fixed event venue label in", path);
    }

    // Fix 3: Ensure rejected/admin_cancelled/completed are filtered from day popup
    const oldFilter = `b.status !== 'cancelled' && b.status !== 'cancelled_by_admin' && b.status !== 'rejected' &&\n                (b.venue === venue || b.venueName === venueLabel)`;
    const newFilter = `b.status !== 'cancelled' && b.status !== 'cancelled_by_admin' && b.status !== 'rejected' && b.status !== 'admin_cancelled' && b.status !== 'completed' &&\n                (b.venue === venue || b.venueName === venueLabel)`;
    if (content.includes(oldFilter)) {
        content = content.replaceAll(oldFilter, newFilter);
        changed = true;
        console.log("Fixed status filter in", path);
    }

    if (changed) {
        fs.writeFileSync(path, content, 'utf8');
    }
}
