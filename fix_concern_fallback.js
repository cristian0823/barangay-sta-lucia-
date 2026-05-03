const fs = require('fs');
let txt = fs.readFileSync('user-portal/user-dashboard.html', 'utf8');

const targetStr1 = `if (imageInput.files.length > 0) {
                imageFile = imageInput.files[0];
            }`;

const targetStr2 = `if (imageInput.files.length > 0) {\r\n                imageFile = imageInput.files[0];\r\n            }`;

const replacement = `if (imageInput.files.length > 0) {
                imageFile = imageInput.files[0];
            } else {
                showToast('Please attach a photo to support your concern.', 'error');
                btn.disabled = false;
                btn.innerHTML = 'Submit Report <i class="bi bi-arrow-right"></i>';
                return;
            }`;

if (txt.includes(targetStr1)) {
    txt = txt.replace(targetStr1, replacement);
} else if (txt.includes(targetStr2)) {
    txt = txt.replace(targetStr2, replacement);
} else {
    console.log("Could not find target string");
}

fs.writeFileSync('user-portal/user-dashboard.html', txt);
console.log('Replaced');
