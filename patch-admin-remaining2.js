const fs = require('fs');
let c = fs.readFileSync('admin-portal/admin.html', 'utf8').replace(/\r\n/g, '\n');

// =====================================================================
// 1. RETURN FLOW (#16) — replace simple confirm with modal
//    Add return condition modal HTML before rejectEqModal
// =====================================================================
const OLD_RETURN_FUNC = `            async function returnRequest(id) {
                if (await showConfirmModal('Mark this equipment as returned?', 'Return Equipment', 'Yes, Returned', 'Cancel', 'info')) {
                    const result = await returnEquipmentRequest(id);
                    if (result && result.success) {
                        showAlert('Equipment marked as returned', 'success');
                        _updateReqRow(id, 'returned');
                        loadStats();
                    } else if (result) {
                        showAlert(result.message || 'Error returning equipment', 'error');
                    }
                }
            }`;

const NEW_RETURN_FUNC = `            let _currentReturnId = null;

            function returnRequest(id) {
                _currentReturnId = id;
                const condEl = document.getElementById('returnCondition');
                const notesEl = document.getElementById('returnNotes');
                if (condEl) condEl.value = 'good';
                if (notesEl) notesEl.value = '';
                document.getElementById('returnEquipModal').style.display = 'flex';
            }

            async function confirmReturnEquip() {
                const id = _currentReturnId;
                if (!id) return;
                const condition = document.getElementById('returnCondition')?.value || 'good';
                const notes = document.getElementById('returnNotes')?.value?.trim() || '';
                document.getElementById('returnEquipModal').style.display = 'none';
                _currentReturnId = null;

                const result = await returnEquipmentRequest(id);
                if (result && result.success) {
                    // If damaged or lost, adjust stock
                    if (condition !== 'good') {
                        const reqObj = (_allAdminRequestsList || []).find(r => r.id === id);
                        if (reqObj) {
                            const equipList = await getEquipment();
                            const eq = equipList.find(e => String(e.name) === String(reqObj.equipment));
                            if (eq) {
                                const addBroken = condition === 'damaged' ? (parseInt(reqObj.quantity) || 1) : 0;
                                const addDisposal = condition === 'lost' ? (parseInt(reqObj.quantity) || 1) : 0;
                                await updateEquipment(eq.id, {
                                    broken: (eq.broken || 0) + addBroken,
                                    disposal: parseInt(eq.category) + addDisposal
                                });
                            }
                        }
                    }
                    const condLabel = condition === 'damaged' ? ' (Damaged — added to repair)' : condition === 'lost' ? ' (Lost — added to disposal)' : '';
                    showAlert('Equipment marked as returned' + condLabel, 'success');
                    _updateReqRow(id, 'returned');
                    loadStats();
                    await loadEquipment();
                    if (notes) {
                        logAudit('borrowing', id, 'Returned', { condition, notes });
                    }
                } else if (result) {
                    showAlert(result.message || 'Error returning equipment', 'error');
                }
            }`;

let idx = c.indexOf(OLD_RETURN_FUNC);
if (idx === -1) { console.log('MISS #1 returnRequest'); } else { c = c.substring(0, idx) + NEW_RETURN_FUNC + c.substring(idx + OLD_RETURN_FUNC.length); console.log('OK #1 return flow'); }

// =====================================================================
// 2. RETURN MODAL HTML — add before rejectEqModal
// =====================================================================
const OLD_REJECT_EQ_MODAL = `        <!-- Admin Eq Reject Modal -->
        <div id="rejectEqModal"`;

const NEW_REJECT_EQ_MODAL = `        <!-- Return Equipment Condition Modal (#16) -->
        <div id="returnEquipModal" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,0.55);z-index:9000;align-items:center;justify-content:center;padding:16px;">
            <div style="background:#fff;border-radius:18px;padding:28px;width:100%;max-width:420px;box-shadow:0 24px 60px rgba(0,0,0,0.2);">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
                    <h3 style="font-size:18px;font-weight:800;color:#111;display:flex;align-items:center;gap:8px;"><i class="bi bi-box-arrow-in-left" style="color:#3b82f6;"></i> Mark as Returned</h3>
                    <button onclick="document.getElementById('returnEquipModal').style.display='none'" style="width:30px;height:30px;border-radius:50%;background:#f3f4f6;border:none;font-size:18px;cursor:pointer;display:flex;align-items:center;justify-content:center;color:#374151;">&times;</button>
                </div>
                <div style="margin-bottom:14px;">
                    <label style="display:block;font-size:12px;font-weight:700;color:#374151;margin-bottom:6px;text-transform:uppercase;letter-spacing:0.06em;">Item Condition</label>
                    <select id="returnCondition" style="width:100%;padding:10px 12px;border:1.5px solid #D1D5DB;border-radius:8px;font-size:13px;font-weight:600;color:#111;font-family:inherit;background:#fff;outline:none;" onfocus="this.style.borderColor='#3b82f6'" onblur="this.style.borderColor='#D1D5DB'">
                        <option value="good">Good — No issues</option>
                        <option value="damaged">Damaged — Needs repair</option>
                        <option value="lost">Lost / Cannot return</option>
                    </select>
                </div>
                <div style="margin-bottom:20px;">
                    <label style="display:block;font-size:12px;font-weight:700;color:#374151;margin-bottom:6px;text-transform:uppercase;letter-spacing:0.06em;">Notes <span style="font-weight:400;text-transform:none;color:#9CA3AF;">(optional)</span></label>
                    <textarea id="returnNotes" rows="3" placeholder="Describe condition, damage, or circumstances..." style="width:100%;padding:10px 12px;border:1.5px solid #D1D5DB;border-radius:8px;font-size:13px;color:#111;font-family:inherit;resize:vertical;box-sizing:border-box;outline:none;" onfocus="this.style.borderColor='#3b82f6'" onblur="this.style.borderColor='#D1D5DB'"></textarea>
                </div>
                <div style="display:flex;gap:10px;">
                    <button onclick="document.getElementById('returnEquipModal').style.display='none'" style="flex:1;padding:11px;border:1.5px solid #D1D5DB;border-radius:10px;background:#fff;color:#374151;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;">Cancel</button>
                    <button onclick="confirmReturnEquip()" style="flex:1;padding:11px;border:none;border-radius:10px;background:#3b82f6;color:#fff;font-size:13px;font-weight:700;cursor:pointer;font-family:inherit;transition:background 0.15s;" onmouseover="this.style.background='#2563eb'" onmouseout="this.style.background='#3b82f6'"><i class="bi bi-check-lg"></i> Confirm Return</button>
                </div>
            </div>
        </div>

        <!-- Admin Eq Reject Modal -->
        <div id="rejectEqModal"`;

idx = c.indexOf(OLD_REJECT_EQ_MODAL);
if (idx === -1) { console.log('MISS #2 return modal html'); } else { c = c.substring(0, idx) + NEW_REJECT_EQ_MODAL + c.substring(idx + OLD_REJECT_EQ_MODAL.length); console.log('OK #2 return modal html'); }

// =====================================================================
// 3. ANNOUNCEMENTS — Add JS functions to load/create announcements
//    (requires `announcements` table to exist in Supabase)
// =====================================================================
const OLD_MARK_CONCERN_RESOLVED = `            async function markConcernResolved(id) {`;

const NEW_MARK_CONCERN_RESOLVED = `            // ======================== ANNOUNCEMENTS (#15) ========================
            async function loadAnnouncements() {
                const listEl = document.getElementById('announcementsList');
                if (!listEl) return;
                const supabase = window.supabase;
                if (!supabase) return;
                listEl.innerHTML = '<div style="padding:32px;text-align:center;color:#94a3b8;font-size:13px;">Loading...</div>';
                try {
                    const { data, error } = await supabase.from('announcements').select('*').order('created_at', { ascending: false }).limit(50);
                    if (error) throw error;
                    if (!data || data.length === 0) {
                        listEl.innerHTML = '<div style="padding:48px;text-align:center;"><div style="font-size:36px;margin-bottom:12px;">&#128226;</div><p style="font-size:15px;font-weight:700;color:#374151;margin:0 0 6px;">No announcements yet</p><p style="font-size:13px;color:#9CA3AF;">Post the first barangay announcement.</p></div>';
                        return;
                    }
                    const catColors = { General:'#1A3A6B', Health:'#dc2626', Infrastructure:'#d97706', Events:'#16a34a', Safety:'#7c3aed' };
                    listEl.innerHTML = data.map(a => {
                        const expired = a.expires_at && new Date(a.expires_at) < new Date();
                        const cat = a.category || 'General';
                        const color = catColors[cat] || '#1A3A6B';
                        const dateStr = new Date(a.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                        return '<div style="background:#fff;border:1.5px solid ' + (expired?'#e5e7eb':'#e2e8f0') + ';border-left:4px solid ' + color + ';border-radius:10px;padding:16px 20px;opacity:' + (expired?'0.6':'1') + ';">'
                            + '<div style="display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-bottom:8px;">'
                            + '<div style="display:flex;align-items:center;gap:8px;">'
                            + '<span style="font-size:11px;font-weight:700;padding:2px 10px;border-radius:20px;background:' + color + '18;color:' + color + ';border:1px solid ' + color + '33;">' + cat + '</span>'
                            + (expired ? '<span style="font-size:11px;color:#9CA3AF;font-weight:600;">Expired</span>' : '')
                            + '</div>'
                            + '<div style="display:flex;align-items:center;gap:10px;">'
                            + '<span style="font-size:11px;color:#9CA3AF;">' + dateStr + '</span>'
                            + '<button onclick="deleteAnnouncement(\\'' + a.id + '\\')" style="font-size:11px;color:#dc2626;background:none;border:none;cursor:pointer;padding:2px 6px;border-radius:4px;font-weight:600;" onmouseover="this.style.background=\'#fee2e2\'" onmouseout="this.style.background=\'none\'"><i class="bi bi-trash3"></i></button>'
                            + '</div></div>'
                            + '<h4 style="font-size:15px;font-weight:700;color:#0f2952;margin:0 0 6px;">' + (a.title || '') + '</h4>'
                            + '<p style="font-size:13px;color:#374151;margin:0;line-height:1.5;white-space:pre-wrap;">' + (a.content || '') + '</p>'
                            + '</div>';
                    }).join('');
                } catch(e) { listEl.innerHTML = '<div style="padding:24px;text-align:center;color:#dc2626;font-size:13px;">Error loading announcements: ' + e.message + '</div>'; }
            }

            async function submitAnnouncement() {
                const title   = document.getElementById('annTitle')?.value?.trim();
                const content = document.getElementById('annContent')?.value?.trim();
                const cat     = document.getElementById('annCategory')?.value || 'General';
                const expiry  = document.getElementById('annExpiry')?.value;
                if (!title || !content) { showAlert('Please fill in title and content', 'error'); return; }
                const supabase = window.supabase;
                const user = getCurrentUser();
                const { error } = await supabase.from('announcements').insert({
                    title, content, category: cat,
                    expires_at: expiry || null,
                    created_by: user?.fullName || user?.username || 'Admin'
                });
                if (error) { showAlert('Error: ' + error.message, 'error'); return; }
                showAlert('Announcement posted!', 'success');
                document.getElementById('addAnnouncementModal').classList.remove('active');
                loadAnnouncements();
            }

            async function deleteAnnouncement(id) {
                if (!await showConfirmModal('Delete this announcement?', 'Delete', 'Yes, Delete', 'Cancel', 'danger')) return;
                const { error } = await window.supabase.from('announcements').delete().eq('id', id);
                if (error) { showAlert('Error: ' + error.message, 'error'); } else { showAlert('Deleted', 'success'); loadAnnouncements(); }
            }
            // ======================== END ANNOUNCEMENTS ========================

            async function markConcernResolved(id) {`;

idx = c.indexOf(OLD_MARK_CONCERN_RESOLVED);
if (idx === -1) { console.log('MISS #3 announcements JS'); } else { c = c.substring(0, idx) + NEW_MARK_CONCERN_RESOLVED + c.substring(idx + OLD_MARK_CONCERN_RESOLVED.length); console.log('OK #3 announcements JS'); }

// =====================================================================
// 4. CONCERN RESPONSE THREAD (#18) — enhance openConcernModal
//    Add response thread panel + submit reply button
// =====================================================================
const OLD_CONCERN_DETAILS = `                    document.getElementById('concernDetails').innerHTML = \`
                    <div class="concern-details">
                        <p><strong>Category:</strong> \${concern.category}</p>
                        <p><strong>Title:</strong> \${concern.title}</p>
                        <p><strong>Address:</strong> \${concern.address || 'N/A'}</p>
                        <p><strong>Description:</strong> \${concern.description}</p>
                        <p><strong>Submitted by:</strong> \${concern.userName}</p>
                    </div>
                \`;`;

const NEW_CONCERN_DETAILS = `                    document.getElementById('concernDetails').innerHTML = \`
                    <div class="concern-details">
                        <p><strong>Category:</strong> \${concern.category}</p>
                        <p><strong>Title:</strong> \${concern.title}</p>
                        <p><strong>Address:</strong> \${concern.address || 'N/A'}</p>
                        <p><strong>Description:</strong> \${concern.description}</p>
                        <p><strong>Submitted by:</strong> \${concern.userName}</p>
                    </div>
                \`;
                // Load concern response thread
                loadConcernResponses(concernId);`;

idx = c.indexOf(OLD_CONCERN_DETAILS);
if (idx === -1) { console.log('MISS #4 concern details'); } else { c = c.substring(0, idx) + NEW_CONCERN_DETAILS + c.substring(idx + OLD_CONCERN_DETAILS.length); console.log('OK #4 concern details'); }

// =====================================================================
// 5. CONCERN RESPONSE FUNCTIONS
// =====================================================================
const OLD_CLOSE_CONCERN_MODAL = `            async function markConcernResolved(id) {`;

const OLD_CLOSE_AFTER_CONCERN = c.indexOf('            // ======================== ANNOUNCEMENTS');

// Insert concern response functions before announcements section
const CONCERN_RESPONSE_JS = `            // ======================== CONCERN RESPONSES (#18) ========================
            async function loadConcernResponses(concernId) {
                const threadEl = document.getElementById('concernResponseThread');
                const replySection = document.getElementById('concernReplySection');
                if (replySection) replySection.style.display = 'block';
                if (!threadEl) return;
                threadEl.innerHTML = '<div style="color:#9CA3AF;font-size:12px;padding:8px 0;">Loading responses...</div>';
                try {
                    const { data, error } = await window.supabase.from('concern_responses').select('*').eq('concern_id', concernId).order('created_at', { ascending: true });
                    if (error) throw error;
                    if (!data || data.length === 0) { threadEl.innerHTML = '<div style="color:#9CA3AF;font-size:12px;padding:8px 0;">No responses yet.</div>'; return; }
                    threadEl.innerHTML = data.map(r => {
                        const dateStr = new Date(r.created_at).toLocaleString('en-US', { month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' });
                        return '<div style="padding:10px 14px;background:#f0f9ff;border:1px solid #bae6fd;border-radius:8px;margin-bottom:8px;">'
                            + '<div style="font-size:11px;font-weight:700;color:#0369a1;margin-bottom:4px;">' + (r.admin_id || 'Admin') + ' &bull; ' + dateStr + '</div>'
                            + '<div style="font-size:13px;color:#0f2952;line-height:1.5;white-space:pre-wrap;">' + r.message + '</div></div>';
                    }).join('');
                } catch(e) {
                    threadEl.innerHTML = '<div style="color:#9CA3AF;font-size:12px;padding:8px 0;">Responses unavailable (table may not exist yet).</div>';
                }
            }

            async function submitConcernReply() {
                const concernId = document.getElementById('concernId')?.value;
                const msg = document.getElementById('concernReplyText')?.value?.trim();
                if (!msg) { showAlert('Enter a reply message', 'error'); return; }
                const user = getCurrentUser();
                const { error } = await window.supabase.from('concern_responses').insert({
                    concern_id: concernId, message: msg,
                    admin_id: user?.fullName || user?.username || 'Admin'
                });
                if (error) { showAlert('Error: ' + error.message, 'error'); return; }
                document.getElementById('concernReplyText').value = '';
                showAlert('Reply sent', 'success');
                loadConcernResponses(concernId);
                // Also send notification to resident
                const supabase = window.supabase;
                const concernList = await getAllConcerns();
                const concern = concernList.find(c2 => c2.id === concernId);
                if (concern && concern.userId) {
                    await supabase.from('user_notifications').insert({
                        user_id: concern.userId, type: 'concern_in_progress',
                        message: 'May bagong tugon ang admin sa inyong concern: "' + (concern.title || '') + '"',
                        is_read: false
                    });
                }
            }
            // ======================== END CONCERN RESPONSES ========================

`;

// Insert before announcements section
const ANN_MARKER = '            // ======================== ANNOUNCEMENTS (#15) ========================';
const idxAnn = c.indexOf(ANN_MARKER);
if (idxAnn === -1) { console.log('MISS #5 concern response insertion point'); } else { c = c.substring(0, idxAnn) + CONCERN_RESPONSE_JS + c.substring(idxAnn); console.log('OK #5 concern response JS'); }

// =====================================================================
// 6. CONCERN MODAL — add response thread + reply UI in modal
// =====================================================================
const OLD_CONCERN_MODAL_END = `                <div id="concernDetails" class="concern-details-container mb-4"></div>`;

const NEW_CONCERN_MODAL_END = `                <div id="concernDetails" class="concern-details-container mb-4"></div>
                <div id="concernReplySection" style="display:none;border-top:1px solid #e5e7eb;padding-top:14px;margin-top:6px;">
                    <div style="font-size:12px;font-weight:700;color:#0f2952;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:8px;">Admin Responses</div>
                    <div id="concernResponseThread" style="max-height:150px;overflow-y:auto;margin-bottom:10px;"></div>
                    <textarea id="concernReplyText" rows="2" placeholder="Type a reply to the resident..." style="width:100%;padding:8px 12px;border:1.5px solid #D1D5DB;border-radius:8px;font-size:13px;font-family:inherit;resize:vertical;box-sizing:border-box;outline:none;" onfocus="this.style.borderColor='#1A3A6B'" onblur="this.style.borderColor='#D1D5DB'"></textarea>
                    <button onclick="submitConcernReply()" style="margin-top:8px;padding:8px 18px;background:#1A3A6B;color:#fff;border:none;border-radius:8px;font-size:13px;font-weight:700;cursor:pointer;font-family:inherit;transition:background 0.15s;display:flex;align-items:center;gap:6px;" onmouseover="this.style.background='#0F2547'" onmouseout="this.style.background='#1A3A6B'"><i class="bi bi-send-fill"></i> Send Reply</button>
                </div>`;

idx = c.indexOf(OLD_CONCERN_MODAL_END);
if (idx === -1) { console.log('MISS #6 concern modal end'); } else { c = c.substring(0, idx) + NEW_CONCERN_MODAL_END + c.substring(idx + OLD_CONCERN_MODAL_END.length); console.log('OK #6 concern reply UI'); }

// =====================================================================
// 7. ANNOUNCEMENTS MODAL
// =====================================================================
const OLD_RETURN_EQUIP_MODAL = `        <!-- Return Equipment Condition Modal (#16) -->`;

const NEW_RETURN_EQUIP_MODAL = `        <!-- Add Announcement Modal (#15) -->
        <div class="modal" id="addAnnouncementModal">
            <div class="modal-content" style="max-width:540px;width:92vw;border-radius:12px;overflow:hidden;padding:0;display:flex;flex-direction:column;max-height:90vh;">
                <div style="background:#1A3A6B;padding:18px 22px;display:flex;align-items:center;justify-content:space-between;flex-shrink:0;">
                    <div style="font-size:16px;font-weight:700;color:#fff;display:flex;align-items:center;gap:8px;"><i class="bi bi-megaphone-fill" style="color:#FDB913;"></i> New Announcement</div>
                    <button onclick="closeModal('addAnnouncementModal')" style="width:30px;height:30px;border-radius:50%;background:rgba(255,255,255,0.12);border:none;color:#fff;cursor:pointer;font-size:20px;line-height:1;display:flex;align-items:center;justify-content:center;">&times;</button>
                </div>
                <div style="padding:20px 22px;overflow-y:auto;flex:1;display:flex;flex-direction:column;gap:14px;">
                    <div>
                        <label style="display:block;font-size:12px;font-weight:600;color:#374151;margin-bottom:5px;">Title *</label>
                        <input type="text" id="annTitle" placeholder="Announcement title" style="width:100%;padding:9px 12px;border:1.5px solid #D1D5DB;border-radius:7px;font-size:13px;color:#111;font-family:inherit;outline:none;box-sizing:border-box;" onfocus="this.style.borderColor='#1A3A6B'" onblur="this.style.borderColor='#D1D5DB'">
                    </div>
                    <div>
                        <label style="display:block;font-size:12px;font-weight:600;color:#374151;margin-bottom:5px;">Category</label>
                        <select id="annCategory" style="width:100%;padding:9px 12px;border:1.5px solid #D1D5DB;border-radius:7px;font-size:13px;color:#111;font-family:inherit;outline:none;box-sizing:border-box;background:#fff;" onfocus="this.style.borderColor='#1A3A6B'" onblur="this.style.borderColor='#D1D5DB'">
                            <option value="General">General</option>
                            <option value="Health">Health</option>
                            <option value="Infrastructure">Infrastructure</option>
                            <option value="Events">Events</option>
                            <option value="Safety">Safety</option>
                        </select>
                    </div>
                    <div>
                        <label style="display:block;font-size:12px;font-weight:600;color:#374151;margin-bottom:5px;">Content *</label>
                        <textarea id="annContent" rows="5" placeholder="Write the announcement..." style="width:100%;padding:9px 12px;border:1.5px solid #D1D5DB;border-radius:7px;font-size:13px;color:#111;font-family:inherit;resize:vertical;outline:none;box-sizing:border-box;" onfocus="this.style.borderColor='#1A3A6B'" onblur="this.style.borderColor='#D1D5DB'"></textarea>
                    </div>
                    <div>
                        <label style="display:block;font-size:12px;font-weight:600;color:#374151;margin-bottom:5px;">Expires on <span style="font-weight:400;color:#9CA3AF;">(optional)</span></label>
                        <input type="date" id="annExpiry" style="width:100%;padding:9px 12px;border:1.5px solid #D1D5DB;border-radius:7px;font-size:13px;color:#111;font-family:inherit;outline:none;box-sizing:border-box;" onfocus="this.style.borderColor='#1A3A6B'" onblur="this.style.borderColor='#D1D5DB'">
                    </div>
                </div>
                <div style="padding:14px 22px;border-top:1px solid #E5E7EB;background:#FAFAFA;display:flex;gap:10px;justify-content:flex-end;flex-shrink:0;">
                    <button onclick="closeModal('addAnnouncementModal')" style="height:38px;padding:0 18px;border:1.5px solid #1A3A6B;border-radius:7px;background:transparent;color:#1A3A6B;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;">Cancel</button>
                    <button onclick="submitAnnouncement()" style="height:38px;padding:0 18px;border:none;border-radius:7px;background:#1A3A6B;color:#fff;font-size:13px;font-weight:700;cursor:pointer;font-family:inherit;" onmouseover="this.style.background='#0F2547'" onmouseout="this.style.background='#1A3A6B'"><i class="bi bi-send-fill" style="margin-right:5px;"></i>Post Announcement</button>
                </div>
            </div>
        </div>

        <!-- Return Equipment Condition Modal (#16) -->`;

idx = c.indexOf(OLD_RETURN_EQUIP_MODAL);
if (idx === -1) { console.log('MISS #7 announcement modal'); } else { c = c.substring(0, idx) + NEW_RETURN_EQUIP_MODAL + c.substring(idx + OLD_RETURN_EQUIP_MODAL.length); console.log('OK #7 announcement modal'); }

// =====================================================================
// 8. LOAD ANNOUNCEMENTS on section switch + initial load
// =====================================================================
const OLD_SWITCH_SECTION_CALL = `            function switchSection(section, btn) {
                if (section === 'equipment') { setTimeout(loadStockThresholdUI, 50); }`;

const NEW_SWITCH_SECTION_CALL = `            function switchSection(section, btn) {
                if (section === 'equipment') { setTimeout(loadStockThresholdUI, 50); }
                if (section === 'announcements') { setTimeout(loadAnnouncements, 50); }`;

idx = c.indexOf(OLD_SWITCH_SECTION_CALL);
if (idx === -1) { console.log('MISS #8 switchSection announcements'); } else { c = c.substring(0, idx) + NEW_SWITCH_SECTION_CALL + c.substring(idx + OLD_SWITCH_SECTION_CALL.length); console.log('OK #8 switchSection announcements'); }

fs.writeFileSync('admin-portal/admin.html', c);
console.log('Done writing admin.html pass 2');
