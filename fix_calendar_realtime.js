const fs = require('fs');

const files = ['court-scheduling.html', 'user-portal/court-scheduling.html'];

for (const file of files) {
    if (!fs.existsSync(file)) continue;
    let content = fs.readFileSync(file, 'utf8');

    // Fix with exact whitespace from file (uses \r\n)
    const OLD = `                // Check if date is in the past\r\n                const dateObj = new Date(currentYear, currentMonth, day);\r\n                if (dateObj < today) {\r\n                    dayElement.classList.add('bg-gray-200', 'text-gray-400', 'cursor-not-allowed');\r\n                } else if (hasEvent) {`;

    const NEW = `                // Check if date is in the past OR today but past 10 PM (facility closed)\r\n                const dateObj = new Date(currentYear, currentMonth, day);\r\n                const nowForCheck = new Date();\r\n                const isTodayClosed = dateObj.getTime() === today.getTime() && nowForCheck.getHours() >= 22;\r\n                if (dateObj < today || isTodayClosed) {\r\n                    dayElement.classList.add('bg-gray-200', 'text-gray-400', 'cursor-not-allowed');\r\n                    if (isTodayClosed) {\r\n                        dayElement.innerHTML += '<div class="text-xs" style="font-size:9px;color:#9ca3af;">Closed</div>';\r\n                        dayElement.title = 'Facility is closed for today (after 10 PM)';\r\n                        dayElement.onclick = () => showToast('Facility is closed for today. Opens again at 6 AM tomorrow.', 'error');\r\n                    }\r\n                } else if (hasEvent) {`;

    if (content.includes('// Check if date is in the past\r\n')) {
        content = content.replace(OLD, NEW);
        console.log('Applied 10PM cutoff in', file);
    } else {
        console.log('CRLF pattern not found in', file, '- trying LF');
        const OLD_LF = `                // Check if date is in the past\n                const dateObj = new Date(currentYear, currentMonth, day);\n                if (dateObj < today) {\n                    dayElement.classList.add('bg-gray-200', 'text-gray-400', 'cursor-not-allowed');\n                } else if (hasEvent) {`;
        const NEW_LF = `                // Check if date is in the past OR today but past 10 PM (facility closed)\n                const dateObj = new Date(currentYear, currentMonth, day);\n                const nowForCheck = new Date();\n                const isTodayClosed = dateObj.getTime() === today.getTime() && nowForCheck.getHours() >= 22;\n                if (dateObj < today || isTodayClosed) {\n                    dayElement.classList.add('bg-gray-200', 'text-gray-400', 'cursor-not-allowed');\n                    if (isTodayClosed) {\n                        dayElement.innerHTML += '<div class="text-xs" style="font-size:9px;color:#9ca3af;">Closed</div>';\n                        dayElement.title = 'Facility is closed for today (after 10 PM)';\n                        dayElement.onclick = () => showToast('Facility is closed for today. Opens again at 6 AM tomorrow.', 'error');\n                    }\n                } else if (hasEvent) {`;
        content = content.replace(OLD_LF, NEW_LF);
        console.log('Applied (LF) 10PM cutoff in', file);
    }

    fs.writeFileSync(file, content, 'utf8');
}
