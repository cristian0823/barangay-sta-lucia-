const fs = require('fs');
let txt = fs.readFileSync('user-portal/user-dashboard.html', 'utf8');

// Add required attribute
txt = txt.replace(/id="concernImage"\s*accept="image\/\*"/g, 'id="concernImage" required accept="image/*"');

// Add js validation fallback
const target = "const imageInput = document.getElementById('concernImage');\n            \n            let imageFile = null;\n\n            if (imageInput.files.length > 0) {\n                imageFile = imageInput.files[0];\n            }";

const replacement = `const imageInput = document.getElementById('concernImage');
            
            let imageFile = null;

            if (imageInput.files.length > 0) {
                imageFile = imageInput.files[0];
            } else {
                showToast('Please attach a photo to support your concern.', 'error');
                btn.disabled = false;
                btn.innerHTML = 'Submit Report <i class="bi bi-arrow-right"></i>';
                return;
            }`;

txt = txt.replace(target, replacement);

fs.writeFileSync('user-portal/user-dashboard.html', txt);
console.log('Replaced');
