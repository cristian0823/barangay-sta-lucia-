const fs = require('fs');

// 1. Revert user-dashboard.html UI
let userHtml = fs.readFileSync('user-portal/user-dashboard.html', 'utf8');

userHtml = userHtml.replace(
    `const disposal = parseInt(item.category) || 0;
                const broken = item.broken || 0;
                let statusText = item.available + ' Available';
                
                let detailsArr = [];
                if (broken > 0) detailsArr.push(broken + ' Under Repair');
                if (disposal > 0) detailsArr.push(disposal + ' For Disposal');
                
                if (!ok) {
                    if (detailsArr.length > 0) {
                        statusText = '0 Available';
                    } else {
                        statusText = 'Out of Stock';
                    }
                    statusIcon = '<i class="bi bi-x-circle-fill"></i>';
                }
                
                let extraBadges = '';
                if (broken > 0) {
                    extraBadges += '<span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold shadow-md backdrop-blur-md bg-amber-500/90 text-white"><i class="bi bi-wrench"></i> ' + broken + ' Repair</span> ';
                }
                if (disposal > 0) {
                    extraBadges += '<span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold shadow-md backdrop-blur-md bg-red-600/90 text-white"><i class="bi bi-trash-fill"></i> ' + disposal + ' Disposal</span>';
                }`,
    `let statusText = item.available + ' Available';
                if (!ok) {
                    statusText = 'Out of Stock';
                    statusIcon = '<i class="bi bi-x-circle-fill"></i>';
                }`
);

userHtml = userHtml.replace(
    `<div class="absolute top-3 right-3 flex flex-col gap-2 items-end">
                            <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold shadow-md backdrop-blur-md \${ok ? 'bg-emerald-500/90 text-white' : 'bg-red-500/90 text-white'}">\${statusIcon} \${statusText}</span>
                            \${extraBadges}
                        </div>`,
    `<div class="absolute top-3 right-3">
                            <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold shadow-md backdrop-blur-md \${ok ? 'bg-emerald-500/90 text-white' : 'bg-red-500/90 text-white'}">\${statusIcon} \${statusText}</span>
                        </div>`
);

fs.writeFileSync('user-portal/user-dashboard.html', userHtml);


// 2. Add Notifications to app.js
let appJs = fs.readFileSync('admin-portal/js/app.js', 'utf8');

// Modify addNotification to support 'all_users'
appJs = appJs.replace(
    `if (userId === 'admin') {`,
    `if (userId === 'all_users') {
                const { data: users } = await supabase.from('users').select('id').eq('role', 'user');
                if (users && users.length > 0) {
                    const payloads = users.map(u => ({
                        user_id: u.id,
                        type,
                        message,
                        meta: referenceId ? { reference_id: referenceId } : {},
                        is_read: false,
                        created_at: timestamp
                    }));
                    await supabase.from('user_notifications').insert(payloads);
                }
            } else if (userId === 'admin') {`
);

// Fallback logic for 'all_users' in local storage
const findLocalNotif = `const notifs = JSON.parse(localStorage.getItem(LOCAL_NOTIFICATIONS_KEY)) || [];
    notifs.unshift({
        id: Date.now(),
        userId: String(userId),
        type,
        message,
        referenceId,
        isRead: false,
        createdAt: timestamp
    });
    localStorage.setItem(LOCAL_NOTIFICATIONS_KEY, JSON.stringify(notifs));`;

const replaceLocalNotif = `const notifs = JSON.parse(localStorage.getItem(LOCAL_NOTIFICATIONS_KEY)) || [];
    if (userId === 'all_users') {
        const users = JSON.parse(localStorage.getItem('registeredUsers')) || [];
        users.forEach(u => {
            if(u.role !== 'admin') {
                notifs.unshift({
                    id: Date.now() + Math.random(),
                    userId: String(u.id),
                    type,
                    message,
                    referenceId,
                    isRead: false,
                    createdAt: timestamp
                });
            }
        });
    } else {
        notifs.unshift({
            id: Date.now(),
            userId: String(userId),
            type,
            message,
            referenceId,
            isRead: false,
            createdAt: timestamp
        });
    }
    localStorage.setItem(LOCAL_NOTIFICATIONS_KEY, JSON.stringify(notifs));`;

appJs = appJs.replace(findLocalNotif, replaceLocalNotif);

// Inject notifications in updateEquipment
const updateInsert = `
        } else if (diffQty !== 0) {
            const actionVerb = diffQty > 0 ? 'added' : 'removed';
            await logActivity('Inventory Update', \`Admin \${actionVerb} \${Math.abs(diffQty)}x \${item.name} to total stock\`);
        }
        let notifMessages = [];
        if (diffBroken > 0) notifMessages.push(\`\${diffBroken} \${item.name} are under repair.\`);
        if (diffBroken < 0) notifMessages.push(\`\${Math.abs(diffBroken)} \${item.name} are now repaired and available.\`);
        if (diffDisposal > 0) notifMessages.push(\`\${diffDisposal} \${item.name} are now marked for disposal.\`);
        if (diffDisposal < 0) notifMessages.push(\`\${Math.abs(diffDisposal)} \${item.name} were recovered from disposal.\`);
        if (diffQty > 0) notifMessages.push(\`Added \${diffQty} new \${item.name} to inventory.\`);
        if (diffQty < 0) notifMessages.push(\`Removed \${Math.abs(diffQty)} \${item.name} from inventory.\`);
        
        for (let msg of notifMessages) {
            await addNotification('all_users', 'inventory', msg);
        }`;

appJs = appJs.replace(
    `} else if (diffQty !== 0) {
            const actionVerb = diffQty > 0 ? 'added' : 'removed';
            await logActivity('Inventory Update', \`Admin \${actionVerb} \${Math.abs(diffQty)}x \${item.name} to total stock\`);
        }`,
    updateInsert
);

// Do the same for local fallback in updateEquipment
const localUpdateInsert = `
        let localNotifMessages = [];
        if (diffBroken > 0) localNotifMessages.push(\`\${diffBroken} \${item.name} are under repair.\`);
        if (diffBroken < 0) localNotifMessages.push(\`\${Math.abs(diffBroken)} \${item.name} are now repaired and available.\`);
        if (diffDisposalLocal > 0) localNotifMessages.push(\`\${diffDisposalLocal} \${item.name} are now marked for disposal.\`);
        if (diffDisposalLocal < 0) localNotifMessages.push(\`\${Math.abs(diffDisposalLocal)} \${item.name} were recovered from disposal.\`);
        if (diffQty > 0) localNotifMessages.push(\`Added \${diffQty} new \${item.name} to inventory.\`);
        if (diffQty < 0) localNotifMessages.push(\`Removed \${Math.abs(diffQty)} \${item.name} from inventory.\`);
        
        for (let msg of localNotifMessages) {
            await addNotification('all_users', 'inventory', msg);
        }`;

appJs = appJs.replace(
    `item.broken = item.broken + diffBroken;
        const diffDisposalLocal = (updates.category !== undefined ? parseInt(updates.category) : (parseInt(item.category)||0)) - (parseInt(item.category)||0);
        item.available = item.available + diffQty - diffBroken - diffDisposalLocal;`,
    `item.broken = item.broken + diffBroken;
        const diffDisposalLocal = (updates.category !== undefined ? parseInt(updates.category) : (parseInt(item.category)||0)) - (parseInt(item.category)||0);
        item.available = item.available + diffQty - diffBroken - diffDisposalLocal;
        ` + localUpdateInsert
);

// Inject notification in addEquipment
appJs = appJs.replace(
    `await logActivity('Inventory Addition', \`Admin added new equipment: \${equipmentData.name}\`);`,
    `await logActivity('Inventory Addition', \`Admin added new equipment: \${equipmentData.name}\`);
        await addNotification('all_users', 'inventory', \`New equipment added to inventory: \${equipmentData.name}\`);`
);

appJs = appJs.replace(
    `await logActivity('Inventory Addition', \`Admin added new equipment (Local): \${equipmentData.name}\`);`,
    `await logActivity('Inventory Addition', \`Admin added new equipment (Local): \${equipmentData.name}\`);
        await addNotification('all_users', 'inventory', \`New equipment added to inventory: \${equipmentData.name}\`);`
);

fs.writeFileSync('admin-portal/js/app.js', appJs);
console.log("Successfully reverted UI badges and added notification broadcasts!");
