const fs = require('fs');

// Patch app.js to handle image_url and icon in updateEquipment
let appJs = fs.readFileSync('js/app.js', 'utf8');
appJs = appJs.replace(
    /if \(updates\.isArchived !== undefined\) payload\.is_archived = updates\.isArchived;/,
    `if (updates.isArchived !== undefined) payload.is_archived = updates.isArchived;
        if (updates.icon !== undefined) payload.icon = updates.icon;
        if (updates.image_url !== undefined) payload.image_url = updates.image_url;`
);
appJs = appJs.replace(
    /if \(updates\.isArchived !== undefined\) item\.isArchived = updates\.isArchived;/,
    `if (updates.isArchived !== undefined) item.isArchived = updates.isArchived;
        if (updates.icon !== undefined) item.icon = updates.icon;
        if (updates.image_url !== undefined) item.image_url = updates.image_url;
        if (updates.category !== undefined) item.category = updates.category;`
);
fs.writeFileSync('js/app.js', appJs);


// Patch admin_clean.html logic
let html = fs.readFileSync('admin_clean.html', 'utf8');

const fileToBase64Fn = `
            function fileToBase64(file) {
                return new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.readAsDataURL(file);
                    reader.onload = () => resolve(reader.result);
                    reader.onerror = error => reject(error);
                });
            }
`;

// Inject helper function
if (!html.includes('fileToBase64(')) {
    html = html.replace('function openAddEquipmentModal()', fileToBase64Fn + '\n            function openAddEquipmentModal()');
}

// 1. Patch addEquipmentForm submit
const addFormMatch = /document\.getElementById\('addEquipmentForm'\)\.addEventListener\('submit', async function \(e\) \{[\s\S]*?is_archived: false\n                \}\);/;

const addFormReplace = `document.getElementById('addEquipmentForm').addEventListener('submit', async function (e) {
                e.preventDefault();
                const btn = this.querySelector('button[type="submit"]');
                const originalText = btn.innerHTML;
                btn.disabled = true;
                btn.innerHTML = 'Saving...';

                let image_url = null;
                const fileInput = document.getElementById('equipImage');
                if (fileInput.files.length > 0) {
                    try {
                        image_url = await fileToBase64(fileInput.files[0]);
                    } catch (err) {
                        console.error('Image upload failed', err);
                    }
                }

                const result = await addEquipment({
                    name: document.getElementById('equipName').value,
                    icon: document.getElementById('equipIcon').value,
                    category: document.getElementById('equipCategory').value,
                    description: document.getElementById('equipDesc').value,
                    quantity: parseInt(document.getElementById('equipQuantity').value),
                    available: parseInt(document.getElementById('equipQuantity').value),
                    broken: 0,
                    is_archived: false,
                    image_url: image_url
                });`;

html = html.replace(addFormMatch, addFormReplace);


// 2. Patch openEditEquipmentModal
const openEditMatch = /document\.getElementById\('editEquipArchived'\)\.checked = equipment\.isArchived \|\| false;/;
const openEditReplace = `document.getElementById('editEquipArchived').checked = equipment.isArchived || false;
                document.getElementById('editEquipCategory').value = equipment.category || 'General';
                
                const previewDiv = document.getElementById('editEquipImagePreview');
                const previewImg = previewDiv.querySelector('img');
                if (equipment.image_url) {
                    previewImg.src = equipment.image_url;
                    previewDiv.style.display = 'block';
                } else {
                    previewImg.src = '';
                    previewDiv.style.display = 'none';
                }
                document.getElementById('editEquipImage').value = '';`;
html = html.replace(openEditMatch, openEditReplace);


// 3. Patch editEquipmentForm submit
const editFormMatch = /const updates = \{[\s\S]*?isArchived: document\.getElementById\('editEquipArchived'\)\.checked\n                \};/;

const editFormReplace = `let image_url = undefined;
                const editFileInput = document.getElementById('editEquipImage');
                if (editFileInput.files.length > 0) {
                    try {
                        image_url = await fileToBase64(editFileInput.files[0]);
                    } catch (err) {
                        console.error('Image upload failed', err);
                    }
                }

                const updates = {
                    name: document.getElementById('editEquipName').value,
                    icon: document.getElementById('editEquipIcon').value,
                    category: document.getElementById('editEquipCategory').value,
                    description: document.getElementById('editEquipDesc').value,
                    quantity: parseInt(document.getElementById('editEquipQuantity').value),
                    broken: parseInt(document.getElementById('editEquipBroken').value),
                    isArchived: document.getElementById('editEquipArchived').checked
                };
                if (image_url !== undefined) {
                    updates.image_url = image_url;
                }`;
html = html.replace(editFormMatch, editFormReplace);

fs.writeFileSync('admin_clean.html', html);
console.log("admin_clean.html logic patched successfully.");
