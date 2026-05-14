const fs = require('fs');
let a = fs.readFileSync('admin-portal/admin.html', 'utf8').replace(/\r\n/g, '\n');
let h = fs.readFileSync('user-portal/user-dashboard.html', 'utf8').replace(/\r\n/g, '\n');
let ac = 0, hc = 0;

function repA(old, neu, label) {
    const idx = a.indexOf(old);
    if (idx === -1) { console.log('MISS admin:', label || old.substring(0,70)); return; }
    a = a.substring(0, idx) + neu + a.substring(idx + old.length);
    ac++;
    console.log('OK admin:', label);
}
function repH(old, neu, label) {
    const idx = h.indexOf(old);
    if (idx === -1) { console.log('MISS user:', label || old.substring(0,70)); return; }
    h = h.substring(0, idx) + neu + h.substring(idx + old.length);
    hc++;
    console.log('OK user:', label);
}

// ═══════════════════════════════════════════════════════════════════
// 1. BORROWING REQUESTS — redesign purposeHtml and status badges
// ═══════════════════════════════════════════════════════════════════

// Replace entire purposeHtml + deliveryBadgeHtml building block
repA(
    `                    var cleanPurpose = b.purpose || '';
                    var deliveryBadgeHtml = '';
                    if (cleanPurpose.indexOf('| Delivery:')>=0) {
                        var dm = cleanPurpose.match(/\\| Delivery:\\s*([^|]+)/);
                        if (dm) {
                            var isDeliv = dm[1].trim().toLowerCase().indexOf('delivery')===0;
                            deliveryBadgeHtml = isDeliv
                                ? '<span style="display:inline-block;font-size:10px;font-weight:700;padding:2px 8px;border-radius:20px;background:#eff6ff;color:#1d4ed8;border:1px solid #bfdbfe;white-space:nowrap;">&#128666; Delivery</span>'
                                : '<span style="display:inline-block;font-size:10px;font-weight:700;padding:2px 8px;border-radius:20px;background:#f0fdf4;color:#166534;border:1px solid #bbf7d0;white-space:nowrap;">&#127963; Pickup</span>';
                        }
                    }
                    if (cleanPurpose.indexOf('| Purpose:')>=0) {
                        var pm = cleanPurpose.match(/Purpose:\\s*([^|]+)/);
                        if (pm) cleanPurpose = pm[1].trim();
                    }
                    if (cleanPurpose.length>50) cleanPurpose = cleanPurpose.substring(0,50)+'...';
                    var fmtD = function(d) {`,
    `                    var rawPurpose = b.purpose || '';
                    var purposeTypeBadge = '';
                    var purposeNotes = rawPurpose;
                    var deliveryBadgeHtml = '';
                    // Extract [Event] or [Funeral Viewing] prefix
                    var _ptM = rawPurpose.match(/^\\[([^\\]]+)\\]/);
                    if (_ptM) {
                        var _ptL = _ptM[1].trim().toLowerCase();
                        if (_ptL.indexOf('funeral') !== -1 || _ptL === 'burol') {
                            purposeTypeBadge = '<span style="display:inline-block;font-size:10px;font-weight:700;padding:2px 8px;border-radius:4px;background:#374151;color:#fff;white-space:nowrap;"><i class=\\"bi bi-shield-fill\\" style=\\"margin-right:3px;font-size:9px;\\"></i>Funeral Viewing</span>';
                        } else {
                            purposeTypeBadge = '<span style="display:inline-block;font-size:10px;font-weight:700;padding:2px 8px;border-radius:4px;background:#1A3A6B;color:#fff;white-space:nowrap;"><i class=\\"bi bi-calendar-event-fill\\" style=\\"margin-right:3px;font-size:9px;\\"></i>Event</span>';
                        }
                        purposeNotes = rawPurpose.substring(_ptM[0].length).trim();
                    }
                    // Extract delivery method
                    if (purposeNotes.indexOf('| Delivery:') >= 0) {
                        var _dm = purposeNotes.match(/\\| Delivery:\\s*([^|]+)/);
                        if (_dm) {
                            var _isDeliv = _dm[1].trim().toLowerCase().indexOf('delivery') === 0;
                            deliveryBadgeHtml = _isDeliv
                                ? '<span style="display:inline-block;font-size:10px;font-weight:600;padding:2px 7px;border-radius:4px;background:#eff6ff;color:#1d4ed8;border:1px solid #bfdbfe;white-space:nowrap;"><i class=\\"bi bi-truck\\" style=\\"margin-right:3px;\\"></i>Delivery</span>'
                                : '<span style="display:inline-block;font-size:10px;font-weight:600;padding:2px 7px;border-radius:4px;background:#f0fdf4;color:#166534;border:1px solid #bbf7d0;white-space:nowrap;"><i class=\\"bi bi-building\\" style=\\"margin-right:3px;\\"></i>Pickup</span>';
                            purposeNotes = purposeNotes.replace(/\\| Delivery:\\s*[^|]+/, '').trim();
                        }
                    }
                    if (purposeNotes.indexOf('| Purpose:') >= 0) {
                        var _pm = purposeNotes.match(/\\| Purpose:\\s*(.+)/);
                        if (_pm) purposeNotes = _pm[1].trim();
                    }
                    if (purposeNotes.length > 60) purposeNotes = purposeNotes.substring(0, 60) + '…';
                    var fmtD = function(d) {`,
    'Redesign purpose variable extraction'
);

// Replace purposeHtml construction
repA(
    `                    var purposeHtml = '<div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;">'+deliveryBadgeHtml+'<span style="color:#1A1A2E;font-size:13px;">'+cleanPurpose+'</span></div>';`,
    `                    var purposeHtml = '<div style="display:flex;flex-direction:column;gap:5px;min-width:160px;">'
                        + '<div style="display:flex;align-items:center;gap:4px;flex-wrap:wrap;">'
                        + purposeTypeBadge + deliveryBadgeHtml
                        + '</div>'
                        + (purposeNotes ? '<span style="font-size:12px;color:#6B7280;line-height:1.4;">' + purposeNotes + '</span>' : '')
                        + '</div>';`,
    'Redesign purposeHtml construction'
);

// Redesign status badges with border-radius:4px (formal government look)
repA(
    `                    var bb = 'padding:3px 10px;border-radius:20px;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.04em;display:inline-block;';
                    var statusBadge;
                    if(st==='pending') statusBadge='<span style="'+bb+'background:#FEF3C7;color:#92400e;border:1px solid #FDE68A;">Pending</span>';
                    else if(st==='approved') statusBadge='<span style="'+bb+'background:#DCFCE7;color:#166534;border:1px solid #86EFAC;">Approved</span>';
                    else if(st==='rejected') statusBadge='<span style="'+bb+'background:#FEE2E2;color:#991b1b;border:1px solid #FECACA;">Rejected</span>';
                    else if(st==='returned') statusBadge='<span style="'+bb+'background:#DBEAFE;color:#1e40af;border:1px solid #93C5FD;">Returned</span>';
                    else statusBadge='<span style="'+bb+'background:#F3F4F6;color:#6B7280;border:1px solid #D1D5DB;">'+(b.status||'')+'</span>';`,
    `                    var bb = 'padding:3px 10px;border-radius:4px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;display:inline-block;';
                    var statusBadge;
                    if(st==='pending') statusBadge='<span style="'+bb+'background:#FEF3C7;color:#92400e;border:1px solid #FDE68A;">Pending</span>';
                    else if(st==='approved') statusBadge='<span style="'+bb+'background:#DCFCE7;color:#166534;border:1px solid #86EFAC;">Approved</span>';
                    else if(st==='rejected') statusBadge='<span style="'+bb+'background:#FEE2E2;color:#991b1b;border:1px solid #FECACA;">Rejected</span>';
                    else if(st==='returned') statusBadge='<span style="'+bb+'background:#DBEAFE;color:#1e40af;border:1px solid #93C5FD;">Returned</span>';
                    else statusBadge='<span style="'+bb+'background:#F3F4F6;color:#6B7280;border:1px solid #D1D5DB;">'+(b.status||'')+'</span>';`,
    'Formal status badge border-radius'
);

// Row hover to light gray
repA(
    `rows += '<tr data-req-id="'+b.id+'" onclick="openRequestRespond('+b.id+')" style="border-top:1px solid #F3F4F6;cursor:pointer;transition:background 0.15s;" onmouseover="this.style.background=\'#F8FAFF\'" onmouseout="this.style.background=\'\'">'`,
    `rows += '<tr data-req-id="'+b.id+'" onclick="openRequestRespond('+b.id+')" style="border-top:1px solid #F3F4F6;cursor:pointer;transition:background 0.15s;" onmouseover="this.style.background=\'#f5f5f5\'" onmouseout="this.style.background=\'\'">'`,
    'Row hover light gray'
);

// ═══════════════════════════════════════════════════════════════════
// 2. CONCERNS TABLE — add Tags column, clean title cell
// ═══════════════════════════════════════════════════════════════════

// Add Tags column header after Title
repA(
    `<th style="padding:14px 18px;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;color:#fff;text-align:left;">Title</th>
                                        <th style="padding:14px 18px;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;color:#fff;text-align:left;">Date</th>
                                        <th style="padding:14px 18px;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;color:#fff;text-align:left;">Status</th>
                                        <th style="padding:14px 18px;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;color:#fff;text-align:left;">Action</th>`,
    `<th style="padding:14px 18px;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;color:#fff;text-align:left;">Title</th>
                                        <th style="padding:14px 18px;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;color:#fff;text-align:left;">Tags</th>
                                        <th style="padding:14px 18px;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;color:#fff;text-align:left;">Date</th>
                                        <th style="padding:14px 18px;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;color:#fff;text-align:left;">Status</th>
                                        <th style="padding:14px 18px;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;color:#fff;text-align:left;">Action</th>`,
    'Add Tags column header'
);

// Update the concerns status badge to use border-radius:4px
repA(
    `const badge='<span style="padding:3px 10px;border-radius:20px;font-size:11px;font-weight:600;background:'+s.bg+';color:'+s.c+';text-transform:uppercase;letter-spacing:0.04em;">'+label+'</span>';`,
    `const badge='<span style="padding:3px 10px;border-radius:4px;font-size:11px;font-weight:700;background:'+s.bg+';color:'+s.c+';text-transform:uppercase;letter-spacing:0.06em;">'+label+'</span>';`,
    'Concerns status badge formal style'
);

// Clean title cell (remove resp+img) and add new Tags td
repA(
    `+'<td style="padding:12px 18px;border-bottom:1px solid #F3F4F6;color:#1A1A2E;"><div style="display:flex;flex-direction:column;gap:3px;"><span>'+( c.title||'')+'</span>'+resp+( img ? '<div>'+img+'</div>' : '')+'</div></td>'
                        +'<td style="padding:12px 18px;border-bottom:1px solid #F3F4F6;font-size:12px;color:#6B7280;">'+date+'</td>'`,
    `+'<td style="padding:12px 18px;border-bottom:1px solid #F3F4F6;color:#1A1A2E;font-size:13px;font-weight:500;">'+(c.title||'')+'</td>'
                        +'<td style="padding:12px 18px;border-bottom:1px solid #F3F4F6;"><div style="display:flex;flex-direction:column;gap:4px;">'+resp+(img||'')+'</div></td>'
                        +'<td style="padding:12px 18px;border-bottom:1px solid #F3F4F6;font-size:12px;color:#6B7280;">'+date+'</td>'`,
    'Clean title cell, move tags to new column'
);

// Restyle Replied badge (border-radius:4px)
repA(
    `const resp = _adminParseConcernResponse(c.response).reply ? '<span style="display:inline-flex;align-items:center;gap:4px;margin-top:4px;background:#DCFCE7;color:#166534;padding:2px 8px;border-radius:20px;font-size:10px;font-weight:600;"><i class=\\"bi bi-check-circle-fill\\"></i> Replied</span>' : '';`,
    `const resp = _adminParseConcernResponse(c.response).reply ? '<span style="display:inline-flex;align-items:center;gap:4px;background:#DCFCE7;color:#166534;padding:3px 8px;border-radius:4px;font-size:10px;font-weight:700;white-space:nowrap;"><i class=\\"bi bi-check-circle-fill\\" style=\\"font-size:9px;\\"></i>Replied</span>' : '';`,
    'Restyle Replied badge'
);

// Restyle Photo badge (border-radius:4px)
repA(
    `const img = (c.description&&c.description.includes('[ATTACHED_IMAGE_DATA]'))||c.imageUrl ? '<span style="display:inline-flex;align-items:center;gap:4px;margin-left:6px;background:#DBEAFE;color:#1E40AF;padding:2px 8px;border-radius:20px;font-size:10px;font-weight:600;"><i class=\\"bi bi-image-fill\\"></i> Photo</span>' : '';`,
    `const img = (c.description&&c.description.includes('[ATTACHED_IMAGE_DATA]'))||c.imageUrl ? '<span style="display:inline-flex;align-items:center;gap:4px;background:#DBEAFE;color:#1E40AF;padding:3px 8px;border-radius:4px;font-size:10px;font-weight:700;white-space:nowrap;"><i class=\\"bi bi-image-fill\\" style=\\"font-size:9px;\\"></i>Photo</span>' : '';`,
    'Restyle Photo badge'
);

// Concerns row hover
repA(
    `onmouseover="this.style.background=\'rgba(26,58,107,0.04)\'" onmouseout="this.style.background=\'\'">'`,
    `onmouseover="this.style.background=\'#f5f5f5\'" onmouseout="this.style.background=\'\'">'`,
    'Concerns row hover gray'
);

// Fix colspan for no-concerns row (was 8, now 9 with new Tags column)
// Find the specific no-concerns td
repA(
    `'<tr><td colspan="8" style="text-align:center;padding:32px;color:#9ca3af;">No concerns found</td></tr>'`,
    `'<tr><td colspan="9" style="text-align:center;padding:32px;color:#9ca3af;">No concerns found</td></tr>'`,
    'Fix no-concerns colspan'
);

// ═══════════════════════════════════════════════════════════════════
// 3. CANCELLATION POLICY MOJIBAKE — user-dashboard.html
// ═══════════════════════════════════════════════════════════════════
repH(
    '<span class="text-sm leading-none">Â¸Â</span>',
    '<i class="bi bi-info-circle" style="font-size:14px;color:#3b82f6;flex-shrink:0;margin-top:2px;"></i>',
    'Fix cancellation policy mojibake'
);

fs.writeFileSync('admin-portal/admin.html', a);
fs.writeFileSync('user-portal/user-dashboard.html', h);
console.log('\nDone. Admin changes:', ac, '| User changes:', hc);
