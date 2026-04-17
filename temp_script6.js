function openAdminImageLightbox(url) {
                const lb = document.getElementById('adminImageLightbox');
                const img = document.getElementById('adminImageLightboxImg');
                img.src = url;
                lb.style.display = 'flex';
            }