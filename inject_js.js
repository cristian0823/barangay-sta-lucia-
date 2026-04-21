const fs = require('fs');
let text = fs.readFileSync('admin.html', 'utf8');

const s1 = 'title: document.getElementById(\'eventTitle\').value,\n                    date: document.getElementById(\'eventDate\').value,\n                    time: document.getElementById(\'eventTime\').value,\n                    end_time: document.getElementById(\'eventEndTime\').value,\n                    organizer: document.getElementById(\'eventOrganizer\').value,\n                    location: document.getElementById(\'eventLocation\').value';
const r1 = s1 + ',\n                    description: document.getElementById(\'eventDescription\').value,\n                    capacity: parseInt(document.getElementById(\'eventCapacity\').value || \'0\', 10)';
text = text.replace(s1, r1);

const s2 = 'title: document.getElementById(\'editEventTitle\').value,\n                    date: document.getElementById(\'editEventDate\').value,\n                    time: document.getElementById(\'editEventTime\').value,\n                    end_time: document.getElementById(\'editEventEndTime\').value,\n                    organizer: document.getElementById(\'editEventOrganizer\').value,\n                    location: document.getElementById(\'editEventLocation\').value';
const r2 = s2 + ',\n                    description: document.getElementById(\'editEventDescription\').value,\n                    capacity: parseInt(document.getElementById(\'editEventCapacity\').value || \'0\', 10)';
text = text.replace(s2, r2);

const s3 = 'const eventData = {\n                    title: title + (cleanupMins > 0 ? ` (+${cleanupMins}m cleanup)` : \'\'),\n                    date: dateStr,\n                    time: startTime,\n                    end_time: endT,\n                    organizer: document.getElementById(\'adsOrganizer\').value,\n                    location: venue === \'basketball\' ? \'Basketball Court\' : \'Multi-Purpose Hall\',\n                    status: \'approved\'\n                };';
const r3 = 'const eventData = {\n                    title: title + (cleanupMins > 0 ? ` (+${cleanupMins}m cleanup)` : \'\'),\n                    date: dateStr,\n                    time: startTime,\n                    end_time: endT,\n                    organizer: document.getElementById(\'adsOrganizer\').value,\n                    location: venue === \'basketball\' ? \'Basketball Court\' : \'Multi-Purpose Hall\',\n                    description: document.getElementById(\'adsEventDescription\') ? document.getElementById(\'adsEventDescription\').value : \'\',\n                    capacity: document.getElementById(\'adsEventCapacity\') ? parseInt(document.getElementById(\'adsEventCapacity\').value || \'0\', 10) : 0,\n                    status: \'approved\'\n                };';
text = text.replace(s3, r3);

const editSetup1 = 'document.getElementById(\'editEventLocation\').value = event.location;';
const editSetup2 = editSetup1 + '\n                    document.getElementById(\'editEventDescription\').value = event.description || \'\';\n                    document.getElementById(\'editEventCapacity\').value = event.capacity || \'\';';
text = text.replace(editSetup1, editSetup2);

fs.writeFileSync('admin.html', text);
