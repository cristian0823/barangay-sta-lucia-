const fs = require('fs');

const dashPaths = ['user-dashboard.html', 'user-portal/user-dashboard.html'];

for (const path of dashPaths) {
    if (!fs.existsSync(path)) continue;
    let content = fs.readFileSync(path, 'utf8');

    const oldIcons = `                if (n.type === 'booking_approved') iconHtml = '\u2705';
                if (n.type === 'booking_rejected') iconHtml = '\u274C';
                if (n.type === 'concern_resolved') iconHtml = '\uD83D\uDEE0\uFE0F';
                if (n.type === 'equipment_approved') iconHtml = '\uD83D\uDCE6';
                if (n.type === 'booking_cancelled' || n.type === 'event_conflict') iconHtml = '\u26A0\uFE0F';

                if (n.type === 'event_added') iconHtml = '\uD83D\uDCC5';`;

    const newIcons = `                if (n.type === 'booking_approved') iconHtml = '\u2705';
                if (n.type === 'booking_rejected' || n.type === 'equipment_rejected') iconHtml = '\u274C';
                if (n.type === 'concern_resolved') iconHtml = '\u2705';
                if (n.type === 'concern_in_progress') iconHtml = '\uD83D\uDD27';
                if (n.type === 'equipment_approved') iconHtml = '\uD83D\uDCE6';
                if (n.type === 'booking_cancelled' || n.type === 'event_conflict') iconHtml = '\u26A0\uFE0F';
                if (n.type === 'event_added') iconHtml = '\uD83D\uDCC5';`;

    if (content.includes("if (n.type === 'booking_approved') iconHtml =")) {
        content = content.replace(/if \(n\.type === 'booking_approved'\)[\s\S]*?if \(n\.type === 'event_added'\)[^\n]*\n/, newIcons + '\n');
        fs.writeFileSync(path, content, 'utf8');
        console.log("Updated icons in", path);
    }
}
