const fs = require('fs');

const appJsPath = 'js/app.js';
let content = fs.readFileSync(appJsPath, 'utf8');

// Fix borrowEquipment
const borrowStr1 = `await addNotification('admin', 'borrow', \`User requested to borrow \${quantity}x \${item.name}\`);
        return { success: true, message: 'Equipment request submitted' };`;
const borrowRep1 = `await addNotification('admin', 'borrow', \`User requested to borrow \${quantity}x \${item.name}\`);
        if (typeof broadcastSync === 'function') broadcastSync();
        return { success: true, message: 'Equipment request submitted' };`;

const borrowStr2 = `await addNotification('admin', 'borrow', \`Local User requested to borrow \${quantity}x \${item.name}\`);
        return { success: true, message: 'Equipment request submitted (offline mode)' };`;
const borrowRep2 = `await addNotification('admin', 'borrow', \`Local User requested to borrow \${quantity}x \${item.name}\`);
        if (typeof broadcastSync === 'function') broadcastSync();
        return { success: true, message: 'Equipment request submitted (offline mode)' };`;

// Fix submitConcern
const concernStr1 = `await addNotification('admin', 'concern', \`User submitted a concern: \${title}\`);
        return { success: true, message: 'Concern submitted successfully' };`;
const concernRep1 = `await addNotification('admin', 'concern', \`User submitted a concern: \${title}\`);
        if (typeof broadcastSync === 'function') broadcastSync();
        return { success: true, message: 'Concern submitted successfully' };`;

const concernStr2 = `await addNotification('admin', 'concern', \`Local User submitted a concern: \${title}\`);
        return { success: true, message: 'Concern submitted (offline mode)' };`;
const concernRep2 = `await addNotification('admin', 'concern', \`Local User submitted a concern: \${title}\`);
        if (typeof broadcastSync === 'function') broadcastSync();
        return { success: true, message: 'Concern submitted (offline mode)' };`;


let updated = false;

if (content.includes(borrowStr1)) { content = content.replace(borrowStr1, borrowRep1); updated = true; console.log("Fixed borrowEquipment (online)"); }
if (content.includes(borrowStr2)) { content = content.replace(borrowStr2, borrowRep2); updated = true; console.log("Fixed borrowEquipment (offline)"); }
if (content.includes(concernStr1)) { content = content.replace(concernStr1, concernRep1); updated = true; console.log("Fixed submitConcern (online)"); }
if (content.includes(concernStr2)) { content = content.replace(concernStr2, concernRep2); updated = true; console.log("Fixed submitConcern (offline)"); }

if (updated) {
    fs.writeFileSync(appJsPath, content, 'utf8');
    console.log("Successfully added broadcastSync to user actions.");
} else {
    console.log("Could not find the exact strings to replace.");
}
