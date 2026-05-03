const fs = require('fs');
let txt = fs.readFileSync('admin-portal/admin.html', 'utf8');

const oldEvtIcon = `const evtIcon = ev => {
                            if (!ev) return '📝';
                            if (ev.includes('Login') || ev.includes('Logout')) return '🔐';
                            if (ev.includes('Borrow') || ev.includes('Equipment')) return '🪑';
                            if (ev.includes('Reservation') || ev.includes('Court') || ev.includes('Booking')) return '🏀';
                            if (ev.includes('Concern')) return '📣';
                            if (ev.includes('Event')) return '📅';
                            if (ev.includes('User') || ev.includes('Resident')) return '👤';
                            if (ev.includes('Delete') || ev.includes('Remove')) return '🗑️';
                            if (ev.includes('Update') || ev.includes('Edit')) return '✏️';
                            return '📋';
                        };`;

const newEvtIcon = `const evtIcon = ev => {
                            const b = c => \`<i class="bi \${c}" style="color:#10b981;"></i>\`;
                            if (!ev) return b('bi-pencil-square');
                            if (ev.includes('Login') || ev.includes('Logout')) return b('bi-lock-fill');
                            if (ev.includes('Borrow') || ev.includes('Equipment')) return b('bi-box-seam');
                            if (ev.includes('Reservation') || ev.includes('Court') || ev.includes('Booking')) return b('bi-calendar-check');
                            if (ev.includes('Concern')) return b('bi-chat-left-text');
                            if (ev.includes('Event')) return b('bi-calendar-event');
                            if (ev.includes('User') || ev.includes('Resident')) return b('bi-person-fill');
                            if (ev.includes('Delete') || ev.includes('Remove')) return b('bi-trash-fill');
                            if (ev.includes('Update') || ev.includes('Edit')) return b('bi-pencil-fill');
                            return b('bi-journal-text');
                        };`;

txt = txt.replace(oldEvtIcon, newEvtIcon);

fs.writeFileSync('admin-portal/admin.html', txt);
console.log('Done fixing admin recent activity feed icons!');
