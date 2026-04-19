const fs = require('fs');

// ─── FIX 1: user-dashboard.html — Replace the broken Edit Court Booking modal ──
{
    let h = fs.readFileSync('user-dashboard.html', 'utf8');

    const startMarker = '    <div id="editCourtBookingModal"';
    const endMarker = '    </div>\n    \n    <script>';

    const startIdx = h.indexOf(startMarker);
    const endIdx = h.indexOf(endMarker, startIdx);

    if (startIdx > -1 && endIdx > -1) {
        const newModal = `    <div id="editCourtBookingModal" class="fixed inset-0 z-[400] flex items-center justify-center hidden" style="background:rgba(0,0,0,0.55);backdrop-filter:blur(4px);">
        <div style="background:var(--panel-bg,#fff);border-radius:20px;width:100%;max-width:420px;box-shadow:0 24px 60px rgba(0,0,0,0.2);padding:0;overflow:hidden;border:1.5px solid var(--border-color,#e5e7eb);">
            <div style="background:linear-gradient(135deg,#2563eb,#3b82f6);padding:20px 24px;display:flex;align-items:center;justify-content:space-between;">
                <div>
                    <h3 style="color:#fff;font-size:18px;font-weight:800;margin:0;">Edit Court Booking</h3>
                    <p style="color:rgba(255,255,255,0.75);font-size:12px;margin:4px 0 0;">Update your reservation details</p>
                </div>
                <button onclick="closeEditCourtBookingModal()" style="background:rgba(255,255,255,0.2);border:none;color:#fff;width:32px;height:32px;border-radius:50%;font-size:18px;cursor:pointer;display:flex;align-items:center;justify-content:center;">&times;</button>
            </div>
            <div style="padding:24px;">
                <form id="editCourtBookingForm">
                    <input type="hidden" id="editCourtBookingId">
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:14px;">
                        <div>
                            <label style="display:block;font-size:11px;font-weight:700;color:var(--text-muted,#6b7280);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:6px;">Date</label>
                            <input type="date" id="editCourtDate" required style="width:100%;padding:10px 12px;border:1.5px solid var(--border-color,#e5e7eb);border-radius:10px;font-size:14px;color:var(--text-main,#111);background:var(--input-bg,#f9fafb);outline:none;box-sizing:border-box;" onfocus="this.style.borderColor='#3b82f6'" onblur="this.style.borderColor=''">
                        </div>
                        <div>
                            <label style="display:block;font-size:11px;font-weight:700;color:var(--text-muted,#6b7280);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:6px;">Venue</label>
                            <select id="editCourtVenue" required style="width:100%;padding:10px 12px;border:1.5px solid var(--border-color,#e5e7eb);border-radius:10px;font-size:14px;color:var(--text-main,#111);background:var(--input-bg,#f9fafb);outline:none;box-sizing:border-box;">
                                <option value="basketball">Basketball Court</option>
                                <option value="multipurpose">Multi-Purpose Hall</option>
                            </select>
                        </div>
                    </div>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:14px;">
                        <div>
                            <label style="display:block;font-size:11px;font-weight:700;color:var(--text-muted,#6b7280);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:6px;">Start Time</label>
                            <select id="editCourtStartTime" required style="width:100%;padding:10px 12px;border:1.5px solid var(--border-color,#e5e7eb);border-radius:10px;font-size:14px;color:var(--text-main,#111);background:var(--input-bg,#f9fafb);outline:none;box-sizing:border-box;"></select>
                        </div>
                        <div>
                            <label style="display:block;font-size:11px;font-weight:700;color:var(--text-muted,#6b7280);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:6px;">End Time</label>
                            <select id="editCourtEndTime" required style="width:100%;padding:10px 12px;border:1.5px solid var(--border-color,#e5e7eb);border-radius:10px;font-size:14px;color:var(--text-main,#111);background:var(--input-bg,#f9fafb);outline:none;box-sizing:border-box;"></select>
                        </div>
                    </div>
                    <div style="margin-bottom:20px;">
                        <label style="display:block;font-size:11px;font-weight:700;color:var(--text-muted,#6b7280);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:6px;">Purpose</label>
                        <input type="text" id="editCourtPurpose" required placeholder="e.g. Basketball practice" style="width:100%;padding:10px 12px;border:1.5px solid var(--border-color,#e5e7eb);border-radius:10px;font-size:14px;color:var(--text-main,#111);background:var(--input-bg,#f9fafb);outline:none;box-sizing:border-box;" onfocus="this.style.borderColor='#3b82f6'" onblur="this.style.borderColor=''">
                    </div>
                    <div style="display:flex;gap:12px;">
                        <button type="button" onclick="closeEditCourtBookingModal()" style="flex:1;padding:12px;border:1.5px solid var(--border-color,#e5e7eb);border-radius:12px;font-weight:700;font-size:14px;cursor:pointer;background:transparent;color:var(--text-main,#374151);transition:background 0.2s;" onmouseover="this.style.background='#f3f4f6'" onmouseout="this.style.background='transparent'">Cancel</button>
                        <button type="submit" style="flex:1;padding:12px;border:none;border-radius:12px;font-weight:700;font-size:14px;cursor:pointer;background:linear-gradient(135deg,#2563eb,#3b82f6);color:#fff;box-shadow:0 4px 14px rgba(37,99,235,0.4);">Save Changes</button>
                    </div>
                </form>
            </div>
        </div>
    </div>`;

        h = h.substring(0, startIdx) + newModal + '\n' + h.substring(endIdx);
        fs.writeFileSync('user-dashboard.html', h);
        console.log('FIX 1 OK: Edit Court Booking modal replaced');
    } else {
        console.log('FIX 1 SKIP: Could not locate edit court booking modal bounds');
    }
}

// ─── FIX 2: admin.html — Multi-fix ──────────────────────────────────────────
{
    let h = fs.readFileSync('admin.html', 'utf8');
    let changed = 0;

    // 2a: Replace read-only concern footer with respond form
    const oldFooter = '                <!-- Read-only footer -->';
    const oldFooterEnd = '                </div>\n            </div>\n        </div>\n\n        <!-- ==========================================';
    const fi = h.indexOf(oldFooter);
    const fe = h.indexOf(oldFooterEnd, fi);
    if (fi > -1 && fe > -1) {
        const newFooter = `                <!-- Respond Form -->
                <div style="padding:16px 28px 28px;">
                    <div style="margin-bottom:10px;">
                        <label style="display:block;font-size:11px;font-weight:700;color:var(--muted,#6b7280);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:7px;">Admin Response</label>
                        <textarea id="adminConcernResponseText" rows="3" placeholder="Type your response..." style="width:100%;padding:12px;border:1.5px solid var(--border,#e5e7eb);border-radius:12px;font-size:14px;color:var(--text,#111);background:var(--panel-bg,#f9fafb);outline:none;font-family:inherit;resize:vertical;box-sizing:border-box;" onfocus="this.style.borderColor='#10b981'" onblur="this.style.borderColor=''"></textarea>
                    </div>
                    <div style="display:flex;gap:10px;flex-wrap:wrap;">
                        <button onclick="submitAdminConcernResponse('in-progress')" style="flex:1;min-width:120px;padding:11px 8px;background:#3b82f6;color:#fff;border:none;border-radius:12px;font-size:13px;font-weight:700;cursor:pointer;">Mark In Progress</button>
                        <button onclick="submitAdminConcernResponse('resolved')" style="flex:1;min-width:120px;padding:11px 8px;background:#059669;color:#fff;border:none;border-radius:12px;font-size:13px;font-weight:700;cursor:pointer;">Mark Resolved</button>
                        <button onclick="closeAdminConcernModal()" style="flex:1;min-width:100px;padding:11px 8px;border:1.5px solid var(--border,#e5e7eb);border-radius:12px;font-size:13px;font-weight:700;cursor:pointer;background:transparent;color:var(--text,#374151);">Close</button>
                    </div>
                </div>`;
        h = h.substring(0, fi) + newFooter + '\n            </div>\n        </div>\n\n        <!-- ==========================================' + h.substring(fe + oldFooterEnd.length);
        changed++;
        console.log('FIX 2a OK: Concern modal now has respond form');
    } else {
        console.log('FIX 2a SKIP: Could not find read-only footer (may already be fixed)');
    }

    // 2b: Add submitAdminConcernResponse function after closeAdminConcernModal
    if (!h.includes('submitAdminConcernResponse')) {
        h = h.replace(
            'function closeAdminConcernModal() {\n                document.getElementById(\'adminConcernModal\').style.display = \'none\';\n                _currentConcernId = null;\n            }',
            `function closeAdminConcernModal() {
                document.getElementById('adminConcernModal').style.display = 'none';
                _currentConcernId = null;
            }

            async function submitAdminConcernResponse(newStatus) {
                const concernId = _currentConcernId;
                const responseText = (document.getElementById('adminConcernResponseText') || {}).value || '';
                if (!concernId) return;
                try {
                    const updateData = { status: newStatus };
                    if (responseText.trim()) updateData.response = responseText.trim();
                    const supabaseAvail = await isSupabaseAvailable();
                    if (supabaseAvail) {
                        await supabase.from('concerns').update(updateData).eq('id', concernId);
                    }
                    const c = _allAdminConcerns.find(function(x){ return x.id === concernId; });
                    if (c) { c.status = newStatus; if (responseText.trim()) c.response = responseText.trim(); }
                    await logActivity('Concern Responded', 'Admin responded to concern #' + concernId + ' — Status: ' + newStatus);
                    showAlert('Concern marked as ' + newStatus + '.', 'success');
                    closeAdminConcernModal();
                    loadConcerns();
                } catch(err) {
                    console.error('Concern respond error:', err);
                    showAlert('Failed to submit response. Please try again.', 'error');
                }
            }`
        );
        changed++;
        console.log('FIX 2b OK: submitAdminConcernResponse function added');
    } else {
        console.log('FIX 2b SKIP: submitAdminConcernResponse already exists');
    }

    // 2c: Fix activity log avatar - replace blank admin-icon span with initials circle
    const oldAdminCell = '<td data-label="User / Admin" style="text-align: center;"><div class="admin-cell"><span class="admin-icon"></span> <strong>${log.adminUsername || \'System\'}</strong></div></td>';
    const newAdminCell = '<td data-label="User / Admin" style="text-align:center;"><div style="display:flex;align-items:center;justify-content:center;gap:8px;"><div style="width:34px;height:34px;border-radius:50%;background:linear-gradient(135deg,#10b981,#059669);color:#fff;font-weight:800;font-size:13px;display:flex;align-items:center;justify-content:center;flex-shrink:0;">${(log.adminUsername||\'S\').charAt(0).toUpperCase()}</div><strong style="font-size:13px;">${log.adminUsername || \'System\'}</strong></div></td>';
    if (h.includes(oldAdminCell)) {
        h = h.replace(oldAdminCell, newAdminCell);
        changed++;
        console.log('FIX 2c OK: Activity log avatar initials added');
    } else {
        console.log('FIX 2c SKIP: Activity log cell already updated or pattern changed');
    }

    // 2d: Add Status and Action columns to concerns table header
    const oldConcernTh = '<th>Date</th>\n                                    </tr>\n                                </thead>\n                                <tbody id="concernsTableBody">';
    const newConcernTh = '<th>Date</th>\n                                        <th>Status</th>\n                                        <th>Action</th>\n                                    </tr>\n                                </thead>\n                                <tbody id="concernsTableBody">';
    if (h.includes(oldConcernTh)) {
        h = h.replace(oldConcernTh, newConcernTh);
        changed++;
        console.log('FIX 2d OK: Status + Action headers added to Concerns table');
    } else {
        console.log('FIX 2d SKIP: Concerns table header pattern not matched');
    }

    // 2e: Add Status badge + Respond button to concern rows
    const oldReturnRow = "                        return `<tr data-cid=\"${c.id}\" onclick=\"openConcernRespond(${c.id})\"";
    if (h.includes(oldReturnRow) && !h.includes('statusColors[c.status]')) {
        h = h.replace(
            oldReturnRow,
            `                        const scMap = {pending:'#f59e0b',resolved:'#10b981','in-progress':'#3b82f6',closed:'#6b7280'};
                        const sbMap = {pending:'#fffbeb',resolved:'#d1fae5','in-progress':'#dbeafe',closed:'#f3f4f6'};
                        const sBadgeHtml = '<span style="padding:3px 10px;border-radius:20px;font-size:11px;font-weight:700;background:' + (sbMap[c.status]||'#f3f4f6') + ';color:' + (scMap[c.status]||'#9ca3af') + ';">' + (c.status||'pending') + '</span>';
                        return \`<tr data-cid="\${c.id}" onclick="openConcernRespond(\${c.id})"`
        );

        // Also add the status and action cells to the row's end
        h = h.replace(
            `<td>\${date}</td>\n                    </tr>\`;`,
            `<td>\${date}</td>\n                        <td>\${sBadgeHtml}</td>\n                        <td onclick="event.stopPropagation()"><button onclick="openConcernRespond(\${c.id})" style="padding:6px 14px;background:#059669;color:#fff;border:none;border-radius:8px;font-size:12px;font-weight:700;cursor:pointer;">Respond</button></td>\n                    </tr>\`;`
        );
        changed++;
        console.log('FIX 2e OK: Status badge + Respond button added to concern rows');
    } else {
        console.log('FIX 2e SKIP: Concern row already has status badge or pattern not matched');
    }

    // 2f: Reports filter row - improve visual styling
    const oldFilterStyle = 'style="display:flex; gap:12px; align-items:flex-end; flex-wrap:wrap; margin-bottom:20px;"';
    const newFilterStyle = 'style="display:flex;gap:14px;align-items:flex-end;flex-wrap:wrap;margin-bottom:24px;padding:18px;background:var(--panel-bg,#f9fafb);border-radius:14px;border:1.5px solid var(--border,#e5e7eb);"';
    if (h.includes(oldFilterStyle)) {
        h = h.replace(oldFilterStyle, newFilterStyle);
        changed++;
        console.log('FIX 2f OK: Reports filter row styling improved');
    } else {
        console.log('FIX 2f SKIP: Reports filter style pattern not matched');
    }

    fs.writeFileSync('admin.html', h);
    console.log('admin.html saved. Changes applied: ' + changed);
}

// ─── FIX 3: Also populate adminConcernResponseText with existing response when modal opens ─
{
    let h = fs.readFileSync('admin.html', 'utf8');
    const target = "document.getElementById('adminConcernModal').style.display = 'flex';";
    if (h.includes(target) && !h.includes('adminConcernResponseText').length > 1) {
        h = h.replace(
            target,
            `const _respTextEl = document.getElementById('adminConcernResponseText');
                if (_respTextEl) _respTextEl.value = concern && concern.response ? concern.response : '';
                document.getElementById('adminConcernModal').style.display = 'flex';`
        );
        fs.writeFileSync('admin.html', h);
        console.log('FIX 3 OK: Concern response textarea pre-populates with existing response');
    }
}

console.log('\nAll fixes done. Now run: git add -A && git commit -m "fix" && git push origin main');
