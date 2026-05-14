const fs = require('fs');
let a = fs.readFileSync('admin-portal/admin.html', 'utf8').replace(/\r\n/g, '\n');
let changes = 0;

function rep(old, neu, label) {
    const idx = a.indexOf(old);
    if (idx === -1) { console.log('MISS:', label); return; }
    a = a.substring(0, idx) + neu + a.substring(idx + old.length);
    changes++;
    console.log('OK:', label);
}

// ============================================================
// 1. REPLACE ADD USER MODAL BODY HTML
// ============================================================
rep(
`        <div style="padding:20px 22px;overflow-y:auto;flex:1;">
            <div id="addUserError" style="display:none;background:#FEE2E2;border:1px solid #FECACA;border-radius:6px;padding:10px 14px;font-size:13px;color:#991b1b;margin-bottom:16px;"></div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:14px;">
                <div>
                    <label style="font-size:12px;font-weight:700;color:#374151;display:block;margin-bottom:6px;">Barangay ID *</label>
                    <input type="text" id="newUserBarangayId" placeholder="e.g. BGY-001" style="width:100%;padding:9px 12px;border:1px solid #D1D5DB;border-radius:6px;font-size:13px;color:#1A1A2E;font-family:inherit;outline:none;box-sizing:border-box;" onfocus="this.style.borderColor='#1A3A6B'" onblur="this.style.borderColor='#D1D5DB'">
                    <div style="font-size:11px;color:#6B7280;margin-top:4px;">Unique resident identifier</div>
                </div>
                <div>
                    <label style="font-size:12px;font-weight:700;color:#374151;display:block;margin-bottom:6px;">Full Name *</label>
                    <input type="text" id="newUserFullName" placeholder="Juan dela Cruz" style="width:100%;padding:9px 12px;border:1px solid #D1D5DB;border-radius:6px;font-size:13px;color:#1A1A2E;font-family:inherit;outline:none;box-sizing:border-box;" onfocus="this.style.borderColor='#1A3A6B'" onblur="this.style.borderColor='#D1D5DB'">
                </div>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:14px;">
                <div>
                    <label style="font-size:12px;font-weight:700;color:#374151;display:block;margin-bottom:6px;">Phone</label>
                    <input type="text" id="newUserPhone" placeholder="09171234567" style="width:100%;padding:9px 12px;border:1px solid #D1D5DB;border-radius:6px;font-size:13px;color:#1A1A2E;font-family:inherit;outline:none;box-sizing:border-box;" onfocus="this.style.borderColor='#1A3A6B'" onblur="this.style.borderColor='#D1D5DB'">
                </div>
                <div>
                    <label style="font-size:12px;font-weight:700;color:#374151;display:block;margin-bottom:6px;">Email *</label>
                    <input type="email" id="newUserEmail" placeholder="juan@email.com" style="width:100%;padding:9px 12px;border:1px solid #D1D5DB;border-radius:6px;font-size:13px;color:#1A1A2E;font-family:inherit;outline:none;box-sizing:border-box;" onfocus="this.style.borderColor='#1A3A6B'" onblur="this.style.borderColor='#D1D5DB'">
                </div>
            </div>
            <div style="margin-bottom:14px;">
                <label style="font-size:12px;font-weight:700;color:#374151;display:block;margin-bottom:6px;">Address</label>
                <textarea id="newUserAddress" placeholder="123 Rizal St., Brgy. Sta. Lucia" rows="2" style="width:100%;padding:9px 12px;border:1px solid #D1D5DB;border-radius:6px;font-size:13px;color:#1A1A2E;font-family:inherit;outline:none;resize:vertical;box-sizing:border-box;" onfocus="this.style.borderColor='#1A3A6B'" onblur="this.style.borderColor='#D1D5DB'"></textarea>
            </div>
        </div>`,

`        <div style="padding:20px 22px;overflow-y:auto;flex:1;">
            <div id="addUserError" style="display:none;background:#FEE2E2;border:1px solid #FECACA;border-radius:6px;padding:10px 14px;font-size:13px;color:#991b1b;margin-bottom:14px;"></div>
            <!-- Auto-generated Barangay ID -->
            <div style="margin-bottom:14px;background:#f0f4ff;border:1px solid #c7d7ff;border-radius:8px;padding:10px 14px;display:flex;align-items:center;gap:10px;">
                <i class="bi bi-id-card" style="font-size:20px;color:#1A3A6B;flex-shrink:0;"></i>
                <div><div style="font-size:10px;font-weight:700;color:#1A3A6B;text-transform:uppercase;letter-spacing:0.06em;">Auto-Generated Barangay ID</div>
                <div style="font-size:20px;font-weight:800;color:#1A3A6B;" id="newUserBarangayId">Generating...</div></div>
            </div>
            <!-- Name fields -->
            <div style="font-size:10px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#6B7280;margin-bottom:8px;">Full Name</div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px;">
                <div><label style="font-size:12px;font-weight:700;color:#374151;display:block;margin-bottom:5px;">First Name *</label>
                    <input type="text" id="newUserFirstName" placeholder="Juan" style="width:100%;padding:9px 12px;border:1px solid #D1D5DB;border-radius:6px;font-size:13px;color:#1A1A2E;font-family:inherit;outline:none;box-sizing:border-box;" onfocus="this.style.borderColor='#1A3A6B'" onblur="this.style.borderColor='#D1D5DB'"></div>
                <div><label style="font-size:12px;font-weight:700;color:#374151;display:block;margin-bottom:5px;">Last Name *</label>
                    <input type="text" id="newUserLastName" placeholder="dela Cruz" style="width:100%;padding:9px 12px;border:1px solid #D1D5DB;border-radius:6px;font-size:13px;color:#1A1A2E;font-family:inherit;outline:none;box-sizing:border-box;" onfocus="this.style.borderColor='#1A3A6B'" onblur="this.style.borderColor='#D1D5DB'"></div>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:14px;">
                <div><label style="font-size:12px;font-weight:700;color:#374151;display:block;margin-bottom:5px;">Middle Name / Initial</label>
                    <input type="text" id="newUserMiddleName" placeholder="e.g. Santos or S." style="width:100%;padding:9px 12px;border:1px solid #D1D5DB;border-radius:6px;font-size:13px;color:#1A1A2E;font-family:inherit;outline:none;box-sizing:border-box;" onfocus="this.style.borderColor='#1A3A6B'" onblur="this.style.borderColor='#D1D5DB'"></div>
                <div><label style="font-size:12px;font-weight:700;color:#374151;display:block;margin-bottom:5px;">Suffix</label>
                    <select id="newUserSuffix" style="width:100%;padding:9px 12px;border:1px solid #D1D5DB;border-radius:6px;font-size:13px;color:#1A1A2E;font-family:inherit;outline:none;box-sizing:border-box;background:#fff;" onfocus="this.style.borderColor='#1A3A6B'" onblur="this.style.borderColor='#D1D5DB'">
                        <option value="">None</option><option value="Jr.">Jr.</option><option value="Sr.">Sr.</option><option value="II">II</option><option value="III">III</option><option value="IV">IV</option>
                    </select></div>
            </div>
            <!-- Contact -->
            <div style="font-size:10px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#6B7280;margin-bottom:8px;">Contact</div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:14px;">
                <div><label style="font-size:12px;font-weight:700;color:#374151;display:block;margin-bottom:5px;">Phone</label>
                    <input type="text" id="newUserPhone" placeholder="09171234567" style="width:100%;padding:9px 12px;border:1px solid #D1D5DB;border-radius:6px;font-size:13px;color:#1A1A2E;font-family:inherit;outline:none;box-sizing:border-box;" onfocus="this.style.borderColor='#1A3A6B'" onblur="this.style.borderColor='#D1D5DB'"></div>
                <div><label style="font-size:12px;font-weight:700;color:#374151;display:block;margin-bottom:5px;">Email *</label>
                    <input type="email" id="newUserEmail" placeholder="juan@email.com" style="width:100%;padding:9px 12px;border:1px solid #D1D5DB;border-radius:6px;font-size:13px;color:#1A1A2E;font-family:inherit;outline:none;box-sizing:border-box;" onfocus="this.style.borderColor='#1A3A6B'" onblur="this.style.borderColor='#D1D5DB'"></div>
            </div>
            <!-- Address -->
            <div style="font-size:10px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#6B7280;margin-bottom:8px;">Address</div>
            <div style="margin-bottom:10px;">
                <label style="font-size:12px;font-weight:700;color:#374151;display:block;margin-bottom:5px;">Sitio *</label>
                <select id="newUserSitio" onchange="_onSitioChange()" style="width:100%;padding:9px 12px;border:1px solid #D1D5DB;border-radius:6px;font-size:13px;color:#1A1A2E;font-family:inherit;outline:none;box-sizing:border-box;background:#fff;" onfocus="this.style.borderColor='#1A3A6B'" onblur="this.style.borderColor='#D1D5DB'">
                    <option value="">Select Sitio...</option>
                    <option value="I">Sitio I — Castro Compound, Plainville, Pamanaville, Sta. Marcela St.</option>
                    <option value="II">Sitio II — J. Rizal St., A. Luna St., Riveraville, Marco Polo</option>
                    <option value="III">Sitio III — J.P. Rizal St., Aguinaldo St., Lakandula St., Panday Pira</option>
                    <option value="IV">Sitio IV — A. Mabini St., A. Bonifacio St., Jose Abad Santos St.</option>
                    <option value="V">Sitio V — Sta. Lucia Avenue, Natividad Subdivision, T. Alonzo St.</option>
                    <option value="VI">Sitio VI — F. Agoncillo St., Veronica Court, Villa Carmen Subd.</option>
                    <option value="VII">Sitio VII — F. Calderon St., Jose Palma St., Lapu-lapu St.</option>
                </select>
            </div>
            <div style="margin-bottom:10px;">
                <label style="font-size:12px;font-weight:700;color:#374151;display:block;margin-bottom:5px;">Street *</label>
                <select id="newUserStreet" style="width:100%;padding:9px 12px;border:1px solid #D1D5DB;border-radius:6px;font-size:13px;color:#1A1A2E;font-family:inherit;outline:none;box-sizing:border-box;background:#fff;" onfocus="this.style.borderColor='#1A3A6B'" onblur="this.style.borderColor='#D1D5DB'">
                    <option value="">— Select Sitio first —</option>
                </select>
            </div>
            <div style="margin-bottom:4px;">
                <label style="font-size:12px;font-weight:700;color:#374151;display:block;margin-bottom:5px;">House / Unit Number (Optional)</label>
                <input type="text" id="newUserHouseNo" placeholder="e.g. 14 (optional)" style="width:100%;padding:9px 12px;border:1px solid #D1D5DB;border-radius:6px;font-size:13px;color:#1A1A2E;font-family:inherit;outline:none;box-sizing:border-box;" onfocus="this.style.borderColor='#1A3A6B'" onblur="this.style.borderColor='#D1D5DB'">
            </div>
        </div>`,
    'Add User modal body redesign'
);

// ============================================================
// 2. REPLACE openAddUserModal + closeAddUserModal + submitAddUser JS
// ============================================================
rep(
`            function openAddUserModal() {
                document.getElementById('addUserModal').classList.add('active');
                document.getElementById('addUserError').style.display = 'none';
                ['newUserBarangayId','newUserFullName','newUserPhone','newUserEmail','newUserAddress'].forEach(function(id){
                    var el=document.getElementById(id); if(el) el.value='';
                });
            }

            function closeAddUserModal() {
                document.getElementById('addUserModal').classList.remove('active');
            }

            async function submitAddUser() {
                var bid = (document.getElementById('newUserBarangayId').value||'').trim();
                var name = (document.getElementById('newUserFullName').value||'').trim();
                var phone = (document.getElementById('newUserPhone').value||'').trim();
                var email = (document.getElementById('newUserEmail').value||'').trim();
                var addr = (document.getElementById('newUserAddress').value||'').trim();
                var errEl = document.getElementById('addUserError');
                var showErr = function(msg){errEl.textContent=msg;errEl.style.display='block';};
                errEl.style.display='none';
                if (!bid) return showErr('Barangay ID is required.');
                if (!name) return showErr('Full Name is required.');
                var btn=document.getElementById('addUserSubmitBtn');
                var orig=btn.innerHTML;
                btn.innerHTML='<i class="bi bi-hourglass-split" style="margin-right:6px;"></i>Adding...';
                btn.disabled=true;
                try {
                    // Check duplicate in users table
                    var chk = await supabase.from('users').select('id').eq('barangay_id', bid);
                    if (chk.data && chk.data.length > 0) { btn.innerHTML=orig; btn.disabled=false; return showErr('Barangay ID "'+bid+'" already exists.'); }
                    var chkU = await supabase.from('users').select('id').eq('username', bid);
                    if (chkU.data && chkU.data.length > 0) { btn.innerHTML=orig; btn.disabled=false; return showErr('Barangay ID "'+bid+'" is already in use.'); }
                    // Insert into users table — barangay_id and username both set to the ID
                    // totp_enabled is null (not false) so login forces first-login setup flow
                    var ins = await supabase.from('users').insert([{
                        barangay_id: bid,
                        username: bid,
                        full_name: name,
                        phone: phone || null,
                        email: email || null,
                        address: addr || null,
                        role: 'user',
                        avatar: name.trim().charAt(0).toUpperCase(),
                        totp_enabled: null,
                        password: null
                    }]);
                    if (ins.error) { btn.innerHTML=orig; btn.disabled=false; return showErr('Save error: '+ins.error.message); }
                    closeAddUserModal();
                    showAlert('User "'+name+'" added. They can log in with Barangay ID: '+bid+' and will be prompted to set up their account on first login.', 'success');
                    loadUsers();
                } catch(e) {
                    btn.innerHTML=orig; btn.disabled=false; showErr('Unexpected error: '+e.message);
                }
            }`,

`            function openAddUserModal() {
                document.getElementById('addUserModal').classList.add('active');
                document.getElementById('addUserError').style.display = 'none';
                ['newUserFirstName','newUserLastName','newUserMiddleName','newUserPhone','newUserEmail','newUserHouseNo'].forEach(function(id){
                    var el=document.getElementById(id); if(el) el.value='';
                });
                var sfx=document.getElementById('newUserSuffix'); if(sfx) sfx.value='';
                var sEl=document.getElementById('newUserSitio'); if(sEl) sEl.value='';
                var stEl=document.getElementById('newUserStreet'); if(stEl) stEl.innerHTML='<option value="">— Select Sitio first —</option>';
                _generateNextBarangayId();
            }

            function closeAddUserModal() {
                document.getElementById('addUserModal').classList.remove('active');
            }

            async function _generateNextBarangayId() {
                var dispEl = document.getElementById('newUserBarangayId');
                if (!dispEl) return;
                dispEl.textContent = 'Generating...';
                try {
                    var { data } = await supabase.from('users').select('barangay_id').ilike('barangay_id', 'RM-%');
                    var maxNum = 0;
                    (data || []).forEach(function(u) {
                        var m = (u.barangay_id||'').match(/^RM-(\d+)$/i);
                        if (m) { var n=parseInt(m[1]); if(n>maxNum) maxNum=n; }
                    });
                    var nextId = 'RM-' + String(maxNum+1).padStart(3,'0');
                    dispEl.textContent = nextId;
                    dispEl.dataset.value = nextId;
                } catch(e) {
                    var fb = 'RM-' + String(Math.floor(Math.random()*900)+100).padStart(3,'0');
                    dispEl.textContent = fb; dispEl.dataset.value = fb;
                }
            }

            function _onSitioChange() {
                var sitio = document.getElementById('newUserSitio').value;
                var streetSel = document.getElementById('newUserStreet');
                var streets = {
                    'I':   ['Castro Compound','Plainville','Pamanaville','Upper Sta. Marcela St.','Paguio Compound','Area Trinidad','Galvez Compound','F. Balagtas St.'],
                    'II':  ['J. Rizal St.','A. Luna St.','Riveraville','Dela Cruz St.','Marco Polo','E. Jacinto St.','Diego Silang St.','Panganiban St.','M.H. Del Pilar','M. Aquino St.'],
                    'III': ['J.P. Rizal St.','Interior 19','Aguinaldo St.','Interior 21','Lakandula St.','Visayas Ave. (right facing east)','Lopez Jaena St.','P. Bukaneg St.','San Francisco Subd.','Panday Pira'],
                    'IV':  ['Visayas Ave. (left facing east)','A. Mabini St.','A. Bonifacio St.','Jose Abad Santos St. (left facing north)','P. Gomez St.','P. Burgos St.','Zamora St.','Naning Ponce St.','Jose Basa St.','Homabon St.'],
                    'V':   ['Jose Abad Santos St. (right facing north)','T. Alonzo St.','Sta. Lucia Avenue','A. Bonifacio St. (right facing north)','A. Mabini St. (right facing north)','Visayas Ave. (right facing north)','Natividad Subdivision','P. Paterno St.','P. Soliman St.'],
                    'VI':  ['T. Alonzo St. (latter part)','P. Paterno St. (latter part)','Jose Abad Santos St. (latter part)','F. Agoncillo St.','Veronica Court / Villa Carmen Subdivision'],
                    'VII': ['F. Calderon St.','Jose Palma St.','Lapu-lapu St.','Tarrahville area']
                };
                if (!sitio||!streets[sitio]) { streetSel.innerHTML='<option value="">— Select Sitio first —</option>'; return; }
                streetSel.innerHTML = '<option value="">Select street...</option>' + streets[sitio].map(function(s){ return '<option value="'+s+'">'+s+'</option>'; }).join('');
            }

            async function submitAddUser() {
                var bid = (document.getElementById('newUserBarangayId').dataset.value || document.getElementById('newUserBarangayId').textContent || '').trim();
                var firstName  = (document.getElementById('newUserFirstName').value||'').trim();
                var lastName   = (document.getElementById('newUserLastName').value||'').trim();
                var middleName = (document.getElementById('newUserMiddleName').value||'').trim();
                var suffix     = (document.getElementById('newUserSuffix').value||'').trim();
                var phone      = (document.getElementById('newUserPhone').value||'').trim();
                var email      = (document.getElementById('newUserEmail').value||'').trim();
                var sitio      = (document.getElementById('newUserSitio').value||'').trim();
                var street     = (document.getElementById('newUserStreet').value||'').trim();
                var houseNo    = (document.getElementById('newUserHouseNo').value||'').trim();
                var errEl = document.getElementById('addUserError');
                var showErr = function(msg){errEl.textContent=msg;errEl.style.display='block';};
                errEl.style.display='none';
                if (!bid||!/^RM-\d+$/i.test(bid)) return showErr('Barangay ID could not be generated. Close and reopen the form.');
                if (!firstName) return showErr('First Name is required.');
                if (!lastName)  return showErr('Last Name is required.');
                if (!sitio)     return showErr('Please select a Sitio.');
                if (!street)    return showErr('Please select a Street.');
                var fullName = firstName + (middleName?' '+middleName:'') + ' ' + lastName + (suffix&&suffix!=='None'?' '+suffix:'');
                var addr = 'Sitio ' + sitio + ', ' + street + (houseNo?', #'+houseNo:'') + ', Brgy. Sta. Lucia';
                var phone4 = phone.replace(/\\D/g,'').slice(-4);
                if (phone4.length < 4) phone4 = String(Math.floor(1000+Math.random()*9000));
                var tempPassword = 'Stl' + phone4;
                var btn=document.getElementById('addUserSubmitBtn');
                var orig=btn.innerHTML;
                btn.innerHTML='<i class="bi bi-hourglass-split" style="margin-right:6px;"></i>Adding...';
                btn.disabled=true;
                try {
                    // Ensure ID is unique (auto-increment if taken)
                    var chk = await supabase.from('users').select('id').eq('barangay_id', bid).maybeSingle();
                    if (chk.data) {
                        var m=bid.match(/^RM-(\d+)$/i);
                        if(m) bid='RM-'+String(parseInt(m[1])+1).padStart(3,'0');
                    }
                    // Hash password with SHA-256 (same as app.js)
                    var hashedPw = null;
                    try {
                        var buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(tempPassword));
                        hashedPw = Array.from(new Uint8Array(buf)).map(b=>b.toString(16).padStart(2,'0')).join('');
                    } catch(he){}
                    var ins = await supabase.from('users').insert([{
                        barangay_id: bid, username: bid, full_name: fullName,
                        phone: phone||null, email: email||null, address: addr,
                        role: 'user', avatar: firstName.charAt(0).toUpperCase(),
                        totp_enabled: null, password: hashedPw
                    }]);
                    if (ins.error) { btn.innerHTML=orig; btn.disabled=false; return showErr('Save error: '+ins.error.message); }
                    closeAddUserModal();
                    showAlert('Resident <strong>'+fullName+'</strong> added successfully! Barangay ID: <strong>'+bid+'</strong> &nbsp;|&nbsp; Temporary password: <strong>'+tempPassword+'</strong> (give this to the resident)', 'success');
                    loadUsers();
                } catch(e) { btn.innerHTML=orig; btn.disabled=false; showErr('Unexpected error: '+e.message); }
            }`,
    'openAddUserModal + submitAddUser + new helpers'
);

// ============================================================
// 3. AUDIT LOG - add barangay_id to Supabase join
// ============================================================
rep(
    `await supabase.from('audit_log').select('*, users(id, full_name, username, email, role)').order('created_at', { ascending: false }).limit(500);`,
    `await supabase.from('audit_log').select('*, users(id, full_name, username, email, role, barangay_id)').order('created_at', { ascending: false }).limit(500);`,
    'loadAuditLog add barangay_id to join'
);

// ============================================================
// 4. AUDIT LOG RENDER - show barangay_id in "Performed By" col
// ============================================================
rep(
    `                    const who  = a.users ? (a.users.full_name || a.users.username || 'System') : (a.target_username || 'System');`,
    `                    const who  = a.users ? (a.users.full_name || a.users.username || 'System') : (a.target_username || 'System');
                    const whoBid = a.users && a.users.barangay_id ? ' <span style="font-size:10px;font-weight:700;color:#0e9488;background:#f0fdfa;padding:1px 5px;border-radius:4px;border:1px solid #99f6e4;vertical-align:middle;">' + a.users.barangay_id + '</span>' : '';`,
    'renderAuditLog who barangay_id'
);
rep(
    `                        <td style="padding:12px;font-weight:600;color:#1A1A2E;">${who}</td>`,
    `                        <td style="padding:12px;font-weight:600;color:#1A1A2E;">${who}${whoBid}</td>`,
    'renderAuditLog who cell'
);

// ============================================================
// 5. ADMIN BELL - join user name in notification messages
// ============================================================
rep(
    `                            supabase.from('facility_reservations').select('id, user_id, date, time, created_at, status').eq('status', 'pending').order('created_at', { ascending: false }).limit(20),
                            supabase.from('borrowings').select('id, user_id, equipment, quantity, created_at, status').eq('status', 'pending').order('created_at', { ascending: false }).limit(20),
                            supabase.from('concerns').select('id, user_id, title, description, created_at, status').eq('status', 'pending').order('created_at', { ascending: false }).limit(20)`,
    `                            supabase.from('facility_reservations').select('id, user_id, date, time, venue, created_at, status, users(full_name, barangay_id)').eq('status', 'pending').order('created_at', { ascending: false }).limit(20),
                            supabase.from('borrowings').select('id, user_id, equipment, quantity, borrow_date, return_date, created_at, status, users(full_name, barangay_id)').eq('status', 'pending').order('created_at', { ascending: false }).limit(20),
                            supabase.from('concerns').select('id, user_id, title, category, description, created_at, status, users(full_name, barangay_id)').eq('status', 'pending').order('created_at', { ascending: false }).limit(20)`,
    'adminBell join users'
);

// Bell booking items - add venue & resident name, green icon
rep(
    `                        (bookingsRes.data || []).forEach(b => items.push({
                            id: 'booking_' + b.id,
                            refId: b.id,
                            type: 'booking',
                            icon: '<i class="bi bi-calendar-check-fill"></i>',
                            title: 'Facility Reservation',
                            message: 'Pending reservation on ' + (b.date ? new Date(b.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : b.date),
                            createdAt: b.created_at
                        }));`,
    `                        (bookingsRes.data || []).forEach(b => {
                            var bName = b.users ? (b.users.full_name || 'Resident') : 'Resident';
                            var venue = b.venue || 'Facility';
                            var dateStr = b.date ? new Date(b.date+'T00:00:00').toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}) : '';
                            items.push({
                                id: 'booking_' + b.id, refId: b.id, type: 'booking',
                                icon: '<i class="bi bi-building"></i>',
                                iconColor: '#16a34a', iconBg: 'rgba(22,163,74,0.12)',
                                title: 'New Facility Reservation',
                                message: bName + ' — ' + venue + (dateStr ? ' on ' + dateStr : '') + (b.time ? ' at ' + b.time : ''),
                                createdAt: b.created_at
                            });
                        });`,
    'adminBell booking items'
);

// Bell borrow items - add resident name + date range, blue icon
rep(
    `                        (borrowingsRes.data || []).forEach(b => items.push({
                            id: 'borrow_' + b.id,
                            refId: b.id,
                            type: 'borrow',
                            icon: '<i class="bi bi-box-seam"></i>',
                            title: 'Equipment Request',
                            message: (b.quantity || 1) + 'x ' + (b.equipment || 'Item') + ' requested',
                            createdAt: b.created_at
                        }));`,
    `                        (borrowingsRes.data || []).forEach(b => {
                            var rName = b.users ? (b.users.full_name || 'Resident') : 'Resident';
                            var dateRange = b.borrow_date ? new Date(b.borrow_date+'T00:00:00').toLocaleDateString('en-US',{month:'short',day:'numeric'}) + (b.return_date ? ' – ' + new Date(b.return_date+'T00:00:00').toLocaleDateString('en-US',{month:'short',day:'numeric'}) : '') : '';
                            items.push({
                                id: 'borrow_' + b.id, refId: b.id, type: 'borrow',
                                icon: '<i class="bi bi-box-seam"></i>',
                                iconColor: '#2563eb', iconBg: 'rgba(37,99,235,0.1)',
                                title: 'New Borrow Request',
                                message: rName + ' — ' + (b.equipment||'Item') + ' x' + (b.quantity||1) + (dateRange ? ' (' + dateRange + ')' : ''),
                                createdAt: b.created_at
                            });
                        });`,
    'adminBell borrow items'
);

// Bell concern items - add resident name + category, orange icon
rep(
    `                        (concernsRes.data || []).forEach(c => items.push({
                            id: 'concern_' + c.id,
                            refId: c.id,
                            type: 'concern',
                            icon: '<i class="bi bi-megaphone-fill"></i>',
                            title: 'New Concern',
                            message: c.title || c.description || 'Untitled concern',
                            createdAt: c.created_at
                        }));`,
    `                        (concernsRes.data || []).forEach(c => {
                            var cName = c.users ? (c.users.full_name || 'Resident') : 'Resident';
                            items.push({
                                id: 'concern_' + c.id, refId: c.id, type: 'concern',
                                icon: '<i class="bi bi-chat-left-text"></i>',
                                iconColor: '#ea580c', iconBg: 'rgba(234,88,12,0.1)',
                                title: 'New Concern Submitted',
                                message: cName + ': ' + (c.title||c.description||'Untitled') + (c.category ? ' — ' + c.category : ''),
                                createdAt: c.created_at
                            });
                        });`,
    'adminBell concern items'
);

// Bell render - use per-item icon color
rep(
    `                    return \`<div class="admin-bell-item is-unread" data-notif-id="\${n.id}" onclick="handleAdminBellClick('\${n.id}', '\${n.type}')">
                        <div class="admin-bell-icon-circle">\${n.icon}</div>`,
    `                    var iconStyle = n.iconColor ? 'background:'+n.iconBg+';color:'+n.iconColor+';' : '';
                    return \`<div class="admin-bell-item is-unread" data-notif-id="\${n.id}" onclick="handleAdminBellClick('\${n.id}', '\${n.type}')">
                        <div class="admin-bell-icon-circle" style="\${iconStyle}">\${n.icon}</div>`,
    'adminBell icon color'
);

fs.writeFileSync('admin-portal/admin.html', a);
console.log('Done.', changes, 'changes applied');
