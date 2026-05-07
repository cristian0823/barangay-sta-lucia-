
const fs = require('fs');
let html = fs.readFileSync('user-dashboard.html', 'utf8');

// Replace the broken loadOperatingHours function with the correct full version
const brokenFn = `        async function loadOperatingHours() {
            // 1. Apply localStorage cache synchronously so OPERATING_HOURS is
            //    always up-to-date before any async awaits
            try {
                const ls = JSON.parse(localStorage.getItem('brgy_operating_hours') || '{}');
                if (ls.equipment_open_hour  != null) OPERATING_HOURS.equipOpen     = ls.equipment_open_hour;
                if (ls.equipment_close_hour != null) OPERATING_HOURS.equipClose    = ls.equipment_close_hour;
                if (ls.facility_open_hour   != null) OPERATING_HOURS.facilityOpen  = ls.facility_open_hour;
                if (ls.facility_close_hour  != null) OPERATING_HOURS.facilityClose = ls.facility_close_hour;
            } catch(e) {}
            // 2. Supabase overrides and writes back to localStorage so cache
            //    is always fresh for the NEXT synchronous read
            try {
                        data.forEach(r => { cache[r.key] = parseInt(r.value); });
                        localStorage.setItem('brgy_operating_hours', JSON.stringify(cache));
                    } catch(e) {}
                }
            } catch(e) { /* use defaults/localStorage */ }
        }`;

const fixedFn = `        async function loadOperatingHours() {
            // 1. Apply localStorage cache synchronously so OPERATING_HOURS is
            //    always up-to-date before any async awaits
            try {
                const ls = JSON.parse(localStorage.getItem('brgy_operating_hours') || '{}');
                if (ls.equipment_open_hour  != null) OPERATING_HOURS.equipOpen     = ls.equipment_open_hour;
                if (ls.equipment_close_hour != null) OPERATING_HOURS.equipClose    = ls.equipment_close_hour;
                if (ls.facility_open_hour   != null) OPERATING_HOURS.facilityOpen  = ls.facility_open_hour;
                if (ls.facility_close_hour  != null) OPERATING_HOURS.facilityClose = ls.facility_close_hour;
            } catch(e) {}
            // 2. Supabase overrides and writes back to localStorage so cache
            //    is always fresh for the NEXT synchronous read
            try {
                const { data, error } = await supabase.from('site_settings').select('key,value');
                if (!error && data) {
                    data.forEach(r => {
                        if (r.key === 'equipment_open_hour')  OPERATING_HOURS.equipOpen     = parseInt(r.value);
                        if (r.key === 'equipment_close_hour') OPERATING_HOURS.equipClose    = parseInt(r.value);
                        if (r.key === 'facility_open_hour')   OPERATING_HOURS.facilityOpen  = parseInt(r.value);
                        if (r.key === 'facility_close_hour')  OPERATING_HOURS.facilityClose = parseInt(r.value);
                    });
                    // Persist back to localStorage so the next visit reads fresh values instantly
                    try {
                        const cache = {};
                        data.forEach(r => { cache[r.key] = parseInt(r.value); });
                        localStorage.setItem('brgy_operating_hours', JSON.stringify(cache));
                    } catch(e) {}
                }
            } catch(e) { /* use defaults/localStorage */ }
            // Always update the Barangay Services card after hours are resolved
            updateServiceStatusBadges();
        }`;

// Normalize CRLF to LF for comparison
const htmlNorm = html.replace(/\r\n/g, '\n');
const brokenNorm = brokenFn.replace(/\r\n/g, '\n');
const fixedNorm = fixedFn.replace(/\r\n/g, '\n');

if (!htmlNorm.includes(brokenNorm)) {
    console.error('ERROR: Could not find broken function block. Manual check needed.');
    // Show what's actually there
    const idx = htmlNorm.indexOf('async function loadOperatingHours');
    console.log('Current function at that location:\n', htmlNorm.slice(idx, idx + 800));
    process.exit(1);
}

const fixed = htmlNorm.replace(brokenNorm, fixedNorm);

// Also ensure DOMContentLoaded calls updateServiceStatusBadges immediately
// It should already be there from the previous edit - verify
if (fixed.includes('updateServiceStatusBadges();\r\n') || fixed.includes('updateServiceStatusBadges();\n')) {
    console.log('DOMContentLoaded badge call: already present');
} else {
    console.log('DOMContentLoaded badge call: NOT found, will add manually');
}

fs.writeFileSync('user-dashboard.html', fixed, 'utf8');
console.log('loadOperatingHours restored and updateServiceStatusBadges() injected successfully');
