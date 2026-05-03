const fs = require('fs');
let txt = fs.readFileSync('admin-portal/admin.html', 'utf8');

// Fix 1: equipment icons to green #10b981
txt = txt.replace(/color:#d97706/g, 'color:#10b981');
txt = txt.replace(/fill="#d97706"/g, 'fill="#10b981"');
txt = txt.replace(/color:#dc2626/g, 'color:#10b981');
txt = txt.replace(/color:#7c3aed/g, 'color:#10b981');
txt = txt.replace(/color:#3b82f6/g, 'color:#10b981');

// Fix 2: loadStats notifications logic update
let oldLoadStats = `                const pendingReqs = borrowings.filter(b => b.status === 'pending');
                const pendingCons = concerns.filter(c => c.status === 'pending');
                const upcomingEvts = events.filter(e => e.status === 'approved').length;
                const totalBookings = bookings.filter(b => b.status === 'pending' || b.status === 'approved').length;

                document.getElementById('pendingRequests').textContent = pendingReqs.length;
                document.getElementById('pendingConcerns').textContent = pendingCons.length;
                document.getElementById('upcomingEvents').textContent = totalBookings;
                document.getElementById('totalUsers').textContent = users.filter(u => u.role !== 'admin').length;

                const badge = document.getElementById('notificationBadge');
                const total = pendingReqs.length + pendingCons.length;
                badge.setAttribute('data-count', total);
                badge.style.display = total > 0 ? 'flex' : 'none';

                // Populate Dropdown
                populateNotificationDropdown(pendingReqs, pendingCons);`;

let newLoadStats = `                const pendingReqs = borrowings.filter(b => b.status === 'pending');
                const pendingCons = concerns.filter(c => c.status === 'pending');
                const pendingBookings = bookings.filter(b => b.status === 'pending');
                const upcomingEvts = events.filter(e => e.status === 'approved').length;
                const totalBookings = bookings.filter(b => b.status === 'pending' || b.status === 'approved').length;

                document.getElementById('pendingRequests').textContent = pendingReqs.length;
                document.getElementById('pendingConcerns').textContent = pendingCons.length;
                document.getElementById('upcomingEvents').textContent = totalBookings;
                document.getElementById('totalUsers').textContent = users.filter(u => u.role !== 'admin').length;

                const badge = document.getElementById('notificationBadge');
                const total = pendingReqs.length + pendingCons.length + pendingBookings.length;
                badge.setAttribute('data-count', total);
                badge.style.display = total > 0 ? 'flex' : 'none';

                // Populate Dropdown
                populateNotificationDropdown(pendingReqs, pendingCons, pendingBookings);`;

txt = txt.replace(oldLoadStats, newLoadStats);

// Fix 3: populateNotificationDropdown signature and body
let oldPopulate = `            function populateNotificationDropdown(pendingReqs, pendingCons) {
                const body = document.getElementById('notificationDropdownBody');
                if (!body) return;

                let notifications = [];

                pendingReqs.forEach(req => {
                    const date = new Date(req.created_at || req.createdAt || new Date());
                    notifications.push({
                        type: 'request',
                        icon: '',
                        title: \`New Borrowing Request\`,
                        detail: \`\${req.userName || req.user_name || 'Resident'} requested \${req.quantity}x \${req.equipment}\`,
                        time: date,
                        action: () => switchSection('requests', document.querySelectorAll('.sidebar-btn')[2])
                    });
                });

                pendingCons.forEach(con => {
                    const date = new Date(con.createdAt || new Date());
                    notifications.push({
                        type: 'concern',
                        icon: '',
                        title: \`New Citizen Concern\`,
                        detail: \`[\${con.category}] \${con.title}\`,
                        time: date,
                        action: () => switchSection('concerns', document.querySelectorAll('.sidebar-btn')[3])
                    });
                });`;

let newPopulate = `            function populateNotificationDropdown(pendingReqs, pendingCons, pendingBookings) {
                const body = document.getElementById('notificationDropdownBody');
                if (!body) return;

                let notifications = [];

                pendingReqs.forEach(req => {
                    const date = new Date(req.created_at || req.createdAt || new Date());
                    notifications.push({
                        type: 'request',
                        icon: '<i class="bi bi-box-seam" style="font-size: 20px; color: var(--primary-color);"></i>',
                        title: \`New Borrowing Request\`,
                        detail: \`\${req.userName || req.user_name || 'Resident'} requested \${req.quantity}x \${req.equipment}\`,
                        time: date,
                        action: () => switchSection('requests', document.querySelectorAll('.sidebar-btn')[2])
                    });
                });

                pendingCons.forEach(con => {
                    const date = new Date(con.createdAt || new Date());
                    notifications.push({
                        type: 'concern',
                        icon: '<i class="bi bi-megaphone" style="font-size: 20px; color: var(--primary-color);"></i>',
                        title: \`New Citizen Concern\`,
                        detail: \`[\${con.category}] \${con.title}\`,
                        time: date,
                        action: () => switchSection('concerns', document.querySelectorAll('.sidebar-btn')[3])
                    });
                });

                if (pendingBookings) {
                    pendingBookings.forEach(bk => {
                        const date = new Date(bk.created_at || bk.createdAt || new Date());
                        notifications.push({
                            type: 'booking',
                            icon: '<i class="bi bi-calendar-event" style="font-size: 20px; color: var(--primary-color);"></i>',
                            title: \`New Court Reservation\`,
                            detail: \`\${bk.userName || bk.user_name || 'Resident'} requested \${bk.facility} for \${bk.date}\`,
                            time: date,
                            action: () => switchSection('events', document.querySelectorAll('.sidebar-btn')[4])
                        });
                    });
                }`;

txt = txt.replace(oldPopulate, newPopulate);

// Fix 4: Icon layout inside dropdown rendering
let oldRender = `                        <div class="notification-item unread" onclick="handleNotificationClick(event, \${notifications.indexOf(n)})">
                            <div class="notification-icon" style="background:#e0f2fe;color:#0284c7;">\${n.icon}</div>
                            <div class="notification-content">`;
let newRender = `                        <div class="notification-item unread" onclick="handleNotificationClick(event, \${notifications.indexOf(n)})">
                            <div class="notification-icon" style="background:#e0f2fe;color:#0284c7;">\${n.icon}</div>
                            <div class="notification-content">`;

// Already uses \${n.icon}, but I want to make sure it doesn't default to empty.
// I will just let it be, since I added the icons in the previous replace.

fs.writeFileSync('admin-portal/admin.html', txt);
console.log('Fixes applied successfully!');
