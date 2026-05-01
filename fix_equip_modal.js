const fs = require('fs');

const dashFiles = [
    'user-portal/user-dashboard.html',
    'user-dashboard.html'
];

for (const file of dashFiles) {
    if (!fs.existsSync(file)) continue;
    let content = fs.readFileSync(file, 'utf8');

    // ── FIX 1: Remove number input spinner on Quantity Needed ──
    // Change type="number" on borrowQty to text with numeric validation
    content = content.replace(
        `<input type="number" id="borrowQty" min="1" required class="form-input">`,
        `<input type="text" inputmode="numeric" pattern="[0-9]*" id="borrowQty" min="1" required class="form-input" style="-moz-appearance:textfield;">`
    );
    console.log('Removed spinner on', file);

    // ── FIX 2: Modal outer container — remove overflow-y-auto and fit the content ──
    // Change the main body wrapper that causes left-right scroll and vertical scroll
    const OLD_MODAL_BODY = `class="flex flex-col lg:flex-row flex-1 overflow-y-auto lg:overflow-hidden"`;
    const NEW_MODAL_BODY = `class="flex flex-col lg:flex-row flex-1 lg:overflow-hidden" style="min-height:0;"`;
    content = content.replace(OLD_MODAL_BODY, NEW_MODAL_BODY);

    // ── FIX 3: Left column (calendar) — ensure it fits without scroll ──
    const OLD_LEFT_COL = `class="w-full lg:w-1/2 p-4 lg:p-6 border-b lg:border-b-0 lg:border-r border-gray-100 bg-gray-50/30 lg:overflow-y-auto" style="background: var(--dm-cal-bg, inherit);"`;
    const NEW_LEFT_COL = `class="w-full lg:w-1/2 p-4 lg:p-6 border-b lg:border-b-0 lg:border-r border-gray-100 bg-gray-50/30 lg:overflow-y-hidden flex flex-col" style="background: var(--dm-cal-bg, inherit);"`;
    content = content.replace(OLD_LEFT_COL, NEW_LEFT_COL);

    // ── FIX 4: Modal outer dialog — reduce max-height to prevent overflow ──
    const OLD_DIALOG = `class="w-full max-w-5xl bg-white dark:bg-gray-800 rounded-3xl overflow-hidden shadow-2xl relative max-h-[90vh] flex flex-col mx-4 animate-[fadeIn_0.3s_ease]"`;
    const NEW_DIALOG = `class="w-full max-w-5xl bg-white dark:bg-gray-800 rounded-3xl overflow-hidden shadow-2xl relative flex flex-col mx-4 animate-[fadeIn_0.3s_ease]" style="height:90vh;max-height:90vh;"`;
    content = content.replace(OLD_DIALOG, NEW_DIALOG);

    // ── FIX 5: Right column — make it scroll internally only ──
    const OLD_RIGHT_COL = `class="w-full lg:w-1/2 p-4 lg:p-6 flex flex-col lg:overflow-y-auto"`;
    const NEW_RIGHT_COL = `class="w-full lg:w-1/2 p-4 lg:p-6 flex flex-col lg:overflow-y-auto" style="overflow-x:hidden;"`;
    content = content.replace(OLD_RIGHT_COL, NEW_RIGHT_COL);

    // ── FIX 6: Calendar grid — make it fill the available space properly ──
    const OLD_CAL_GRID = `<div id="borrowCalendarGrid" class="grid grid-cols-7 gap-1.5"></div>`;
    const NEW_CAL_GRID = `<div id="borrowCalendarGrid" class="grid grid-cols-7 gap-1.5" style="flex:1;"></div>`;
    content = content.replace(OLD_CAL_GRID, NEW_CAL_GRID);

    fs.writeFileSync(file, content, 'utf8');
    console.log('Done patching modal layout in', file);
}

// ── FIX 7: Hide spinner globally via CSS in user-dashboard.html ──
for (const file of dashFiles) {
    if (!fs.existsSync(file)) continue;
    let content = fs.readFileSync(file, 'utf8');
    const NO_SPINNER_CSS = `
    /* Hide number input spinners globally */
    input[type=number]::-webkit-inner-spin-button,
    input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
    input[type=number] { -moz-appearance: textfield; }`;

    if (!content.includes('Hide number input spinners')) {
        // Inject before </style> near the top
        const styleEnd = content.indexOf('</style>');
        if (styleEnd !== -1) {
            content = content.substring(0, styleEnd) + NO_SPINNER_CSS + '\n' + content.substring(styleEnd);
            fs.writeFileSync(file, content, 'utf8');
            console.log('Injected no-spinner CSS in', file);
        }
    }
}
