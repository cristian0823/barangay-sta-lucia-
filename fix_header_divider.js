const fs = require('fs');
const files = ['user-portal/user-dashboard.html', 'user-dashboard.html'];

for (const file of files) {
    if (!fs.existsSync(file)) continue;
    let content = fs.readFileSync(file, 'utf8');
    let changed = false;

    // ── FIX 1: Remove the vertical divider line between dark mode btn and profile ──
    const OLD_DIVIDER = `<div class="h-8 w-px bg-gray-200 dark:bg-slate-700 mx-1"></div>`;
    if (content.includes(OLD_DIVIDER)) {
        content = content.replace(OLD_DIVIDER, '');
        console.log('Removed divider line in', file);
        changed = true;
    } else {
        console.log('Divider not found in', file);
    }

    // ── FIX 2: Add padding-bottom to the right column so submit button isn't cut off ──
    const OLD_RIGHT_COL = `class="w-full lg:w-1/2 p-4 lg:p-6 flex flex-col lg:overflow-y-auto" style="overflow-x:hidden;"`;
    const NEW_RIGHT_COL = `class="w-full lg:w-1/2 p-4 lg:p-6 flex flex-col lg:overflow-y-auto" style="overflow-x:hidden; padding-bottom: 24px;"`;
    if (content.includes(OLD_RIGHT_COL)) {
        content = content.replace(OLD_RIGHT_COL, NEW_RIGHT_COL);
        console.log('Added padding-bottom to right column in', file);
        changed = true;
    } else {
        console.log('Right column pattern not found in', file);
    }

    // ── FIX 3: Also add padding to the submit button wrapper ──
    const OLD_SUBMIT = `<button type="submit" id="submitBorrowBtn" disabled class="w-full mt-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5 border-none cursor-pointer">`;
    const NEW_SUBMIT = `<button type="submit" id="submitBorrowBtn" disabled class="w-full mt-2 mb-4 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5 border-none cursor-pointer">`;
    if (content.includes(OLD_SUBMIT)) {
        content = content.replace(OLD_SUBMIT, NEW_SUBMIT);
        console.log('Added mb-4 to submit button in', file);
        changed = true;
    }

    if (changed) fs.writeFileSync(file, content, 'utf8');
}
