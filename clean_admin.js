const fs = require('fs');
let html = fs.readFileSync('admin.html', 'utf8');

// The file was run through a double encode which caused characters like Ã°Å¸Â â‚¬ to appear.
// The left sidebar had garbled text or incorrect replacements.
// Let's replace these corrupted emojis with standard bootstrap icons
html = html.replace(/Ã°Å¸Â â‚¬ /g, '<i class="bi bi-calendar-check-fill"></i> ');
html = html.replace(/Ã°Å¸Â Â¢ /g, '<i class="bi bi-building-fill"></i> ');
html = html.replace(/Ã°Å¸â€œÂ¦ /g, '<i class="bi bi-box-fill"></i> ');
html = html.replace(/Ã°Å¸â€œâ€¹ /g, '<i class="bi bi-megaphone-fill"></i> ');
html = html.replace(/Ã°Å¸â€œâ€¦ /g, '<i class="bi bi-calendar-event-fill"></i> ');
html = html.replace(/Ã°Å¸Âªâ€˜ /g, '<i class="bi bi-tools"></i> ');
html = html.replace(/Ã°Å¸â€œÅ  /g, '<i class="bi bi-file-earmark-bar-graph-fill"></i> ');
html = html.replace(/Ã°Å¸â€œÂ  /g, '<i class="bi bi-clock-history"></i> ');
html = html.replace(/Ã¢Å¡â„¢Ã¯Â¸Â  /g, '<i class="bi bi-gear-fill"></i> ');
html = html.replace(/Ã¢Å“â€¢/g, '<i class="bi bi-x-lg"></i>');

// Overview Cards & Quick Actions
html = html.replace(/A[^\w<]{1,8}(Equipment Requests)/g, '<i class="bi bi-box-fill" style="margin-right:8px;"></i> $1');
html = html.replace(/A[^\w<]{1,8}(Open Concerns)/g, '<i class="bi bi-megaphone-fill" style="margin-right:8px;"></i> $1');
html = html.replace(/A[^\w<]{1,8}(Active Bookings)/g, '<i class="bi bi-calendar-check-fill" style="margin-right:8px;"></i> $1');
html = html.replace(/A[^\w<]{1,8}(Registered Users)/g, '<i class="bi bi-people-fill" style="margin-right:8px;"></i> $1');
html = html.replace(/A[^\w<]{1,8}(Pending Actions)/g, '<i class="bi bi-lightning-fill" style="margin-right:8px;"></i> $1');

// Other common corrupted patterns
html = html.replace(/id="glancePendingReqs"[^>]*>A[^\w<]{1,8}</g, 'id="glancePendingReqs" style="font-weight:800;font-size:15px;color:#d97706;">--<');
html = html.replace(/id="glancePendingCons"[^>]*>A[^\w<]{1,8}</g, 'id="glancePendingCons" style="font-weight:800;font-size:15px;color:#dc2626;">--<');
html = html.replace(/id="glanceBookings"[^>]*>A[^\w<]{1,8}</g, 'id="glanceBookings" style="font-weight:800;font-size:15px;color:#2563eb;">--<');
html = html.replace(/id="glanceUsers"[^>]*>A[^\w<]{1,8}</g, 'id="glanceUsers" style="font-weight:800;font-size:15px;color:#16a34a;">--<');

// Some lingering garbage characters across strings
html = html.replace(/>A[^\w<]{2,8}</g, '>--<'); 
html = html.replace(/A[^\w<]{2,8} /g, '');

fs.writeFileSync('admin.html', html);
console.log('Cleaned corrupted emojis');
