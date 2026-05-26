const fs = require('fs');

function fix(file, name, oldStr, newStr) {
    let c = fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n');
    const idx = c.indexOf(oldStr);
    if (idx === -1) { console.log('MISS:', name, 'in', file); return; }
    c = c.substring(0, idx) + newStr + c.substring(idx + oldStr.length);
    fs.writeFileSync(file, c);
    console.log('OK:', name);
}

const AD = 'admin-portal/admin.html';

// ── FIX 1 ────────────────────────────────────────────────────
// Batch upload was encrypting barangay_id with encryptData(), storing
// "ENC:..." in the DB. The ID generator queries ilike('barangay_id','RM%'),
// which never matches encrypted values → always generates RM-001.
// barangay_id must NOT be encrypted (per CLAUDE.md and login logic).
fix(AD, 'fix1-batch-upload-no-encrypt-barangay_id',
`                            barangay_id: await encryptData(String(row.barangay_id)),`,
`                            barangay_id: String(row.barangay_id),`
);

// ── FIX 2 ────────────────────────────────────────────────────
// Replace generator with MAX()-based dual-column scan:
//   • barangay_id column  — covers all records going forward
//   • username column     — always plain text, covers legacy batch-uploaded
//                           records whose barangay_id is still stored as ENC:...
// Takes the maximum numeric suffix across both columns so the next ID is
// always strictly above the highest existing one.
fix(AD, 'fix2-generate-next-barangay-id',
`            async function _generateNextBarangayId() {
                try {
                    // Use 'RM%' (no hyphen) so it also matches batch-uploaded IDs like RM001
                    var { data } = await supabase.from('users').select('barangay_id').ilike('barangay_id','RM%').range(0,9999);
                    var maxNum = 0;
                    if (data && data.length) {
                        data.forEach(function(r){
                            // Match RM-001, RM001, rm-001, rm001, etc.
                            var m=(r.barangay_id||'').match(/^RM-?(\d+)$/i);
                            if(m){var n=parseInt(m[1],10);if(n>maxNum)maxNum=n;}
                        });
                    }
                    return 'RM-'+String(maxNum+1).padStart(3,'0');
                } catch(e){ console.warn('_generateNextBarangayId error:',e); return 'RM-001'; }
            }`,
`            async function _generateNextBarangayId() {
                try {
                    // Scan both columns in parallel:
                    //   barangay_id — correct for all records after the batch-upload fix
                    //   username    — always stored plain-text; covers legacy records where
                    //                 barangay_id was accidentally encrypted as ENC:...
                    var results = await Promise.all([
                        supabase.from('users').select('barangay_id').ilike('barangay_id','RM%').range(0,9999),
                        supabase.from('users').select('username').ilike('username','RM%').range(0,9999)
                    ]);
                    var maxNum = 0;
                    var extract = function(val) {
                        var m = (val||'').match(/^RM-?(\\d+)$/i);
                        if (m) { var n = parseInt(m[1],10); if (n > maxNum) maxNum = n; }
                    };
                    if (results[0].data) results[0].data.forEach(function(r){ extract(r.barangay_id); });
                    if (results[1].data) results[1].data.forEach(function(r){ extract(r.username); });
                    return 'RM-'+String(maxNum+1).padStart(3,'0');
                } catch(e){ console.warn('_generateNextBarangayId error:',e); return 'RM-001'; }
            }`
);

// ── FIX 3a ───────────────────────────────────────────────────
// Pre-save duplicate check: also match by username so it catches legacy
// batch-uploaded records (encrypted barangay_id but plain-text username).
fix(AD, 'fix3a-pre-check-also-by-username',
`                    var chkBid = await supabase.from('users').select('id').eq('barangay_id',bid).maybeSingle();
                    if (chkBid.data) { btn.innerHTML=orig;btn.disabled=false;return showErr('Barangay ID "'+bid+'" already exists. Please refresh and try again.'); }`,
`                    var chkBid = await supabase.from('users').select('id').or('barangay_id.eq.'+bid+',username.eq.'+bid).limit(1);
                    if (chkBid.data && chkBid.data.length > 0) { btn.innerHTML=orig;btn.disabled=false;return showErr('Barangay ID "'+bid+'" already exists. Please refresh and try again.'); }`
);

// ── FIX 3b ───────────────────────────────────────────────────
// Retry-once safeguard: if the DB insert fails with a unique constraint
// (race condition — two admins opening the modal at the same time), re-query
// MAX()+1 and retry the insert once before surfacing an error.
fix(AD, 'fix3b-insert-retry-on-unique-constraint',
`                    var ins = await supabase.from('users').insert([{
                        barangay_id: bid,
                        username: bid,
                        full_name: fullName,
                        phone: rawPhone,
                        email: email || null,
                        address: address,
                        role: 'user',
                        avatar: firstName.charAt(0).toUpperCase(),
                        totp_enabled: null,
                        password: hashedPw
                    }]);
                    if (ins.error) { btn.innerHTML=orig;btn.disabled=false;return showErr('Save error: '+ins.error.message); }`,
`                    var _payload = {
                        barangay_id: bid,
                        username: bid,
                        full_name: fullName,
                        phone: rawPhone,
                        email: email || null,
                        address: address,
                        role: 'user',
                        avatar: firstName.charAt(0).toUpperCase(),
                        totp_enabled: null,
                        password: hashedPw
                    };
                    var ins = await supabase.from('users').insert([_payload]);
                    if (ins.error) {
                        var _isUniq = ins.error.code === '23505'
                            || (ins.error.message||'').toLowerCase().includes('unique')
                            || (ins.error.message||'').includes('barangay_id')
                            || (ins.error.message||'').includes('username');
                        if (_isUniq) {
                            bid = await _generateNextBarangayId();
                            var _bidEl = document.getElementById('newUserBid'); if (_bidEl) _bidEl.textContent = bid;
                            _payload.barangay_id = bid;
                            _payload.username = bid;
                            ins = await supabase.from('users').insert([_payload]);
                            if (ins.error) { btn.innerHTML=orig;btn.disabled=false;return showErr('Save error: '+ins.error.message); }
                        } else {
                            btn.innerHTML=orig;btn.disabled=false;return showErr('Save error: '+ins.error.message);
                        }
                    }`
);

console.log('\nAll done.');
