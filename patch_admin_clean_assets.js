const fs = require('fs');
let html = fs.readFileSync('admin_clean.html', 'utf8');

// 1. Add Category and Image to Add Equipment Form
html = html.replace(
    /<div class="form-group">\s*<label for="equipIcon">Icon \(Emoji\)<\/label>/,
    `<div class="form-row">
        <div class="form-group">
            <label for="equipCategory">Category</label>
            <select id="equipCategory" required>
                <option value="General">General</option>
                <option value="Furniture">Furniture</option>
                <option value="Electronics">Electronics</option>
                <option value="Tools">Tools</option>
                <option value="Others">Others</option>
            </select>
        </div>
        <div class="form-group">
            <label for="equipIcon">Icon (Emoji)</label>`
);

html = html.replace(
    /<div class="form-group">\s*<label for="equipDesc">Description<\/label>/,
    `</div>
    <div class="form-group">
        <label for="equipImage">Item Photo</label>
        <input type="file" id="equipImage" accept="image/*">
        <small style="color:var(--muted);font-size:11px;">Max size 2MB. Optional.</small>
    </div>
    <div class="form-group">
        <label for="equipDesc">Description</label>`
);

// 2. Add Category and Image to Edit Equipment Form
html = html.replace(
    /<div class="form-group">\s*<label for="editEquipIcon">Icon \(Emoji\)<\/label>/,
    `<div class="form-row">
        <div class="form-group">
            <label for="editEquipCategory">Category</label>
            <select id="editEquipCategory" required>
                <option value="General">General</option>
                <option value="Furniture">Furniture</option>
                <option value="Electronics">Electronics</option>
                <option value="Tools">Tools</option>
                <option value="Others">Others</option>
            </select>
        </div>
        <div class="form-group">
            <label for="editEquipIcon">Icon (Emoji)</label>`
);

html = html.replace(
    /<div class="form-group">\s*<label for="editEquipDesc">Description<\/label>/,
    `</div>
    <div class="form-group">
        <label for="editEquipImage">Update Item Photo</label>
        <input type="file" id="editEquipImage" accept="image/*">
        <div id="editEquipImagePreview" style="margin-top:10px;display:none;">
            <img src="" alt="Preview" style="max-width:100%; height:120px; object-fit:cover; border-radius:8px; border:1px solid var(--border);">
        </div>
        <small style="color:var(--muted);font-size:11px;">Leave empty to keep current photo.</small>
    </div>
    <div class="form-group">
        <label for="editEquipDesc">Description</label>`
);

// Also we need to modify the display items in the list/grid view for users to show the photo.
// Where is loadEquipment rendering?
// In `admin_clean.html` inside `loadEquipment()`
html = html.replace(
    /const eqIcon = `<div class="eq-icon eq-\$\{e\.icon \? e\.name\.split\(' '\)\[0\] : 'Default'\} eq-icon-lg">\$\{e\.icon \|\| '📦'\}<\/div>`;/g,
    `const eqIcon = e.image_url 
        ? \`<img src="\${e.image_url}" alt="\${e.name}" style="width:44px;height:44px;border-radius:14px;object-fit:cover;border:1px solid var(--border);">\`
        : \`<div class="eq-icon eq-\${e.icon ? e.name.split(' ')[0] : 'Default'} eq-icon-lg">\${e.icon || '📦'}</div>\`;`
);

// And also replace in the other places if there are any
html = html.replace(
    /<td><div class="eq-icon eq-\$\{e.name.split\(' '\)\[0\]\}">\$\{e.icon \|\| '📦'\}<\/div><\/td>/g,
    `<td>\${e.image_url ? \`<img src="\${e.image_url}" alt="\${e.name}" style="width:40px;height:40px;border-radius:12px;object-fit:cover;border:1px solid var(--border);">\` : \`<div class="eq-icon eq-\${e.name.split(' ')[0]}">\${e.icon || '📦'}</div>\`}</td>`
);

fs.writeFileSync('admin_clean.html', html);
console.log("admin_clean.html forms patched");
