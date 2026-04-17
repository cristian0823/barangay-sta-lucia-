const fs = require('fs');

['admin.html', 'user-dashboard.html'].forEach(file => {
    if(fs.existsSync(file)) {
        let html = fs.readFileSync(file, 'utf8');

        // Safely replace native emojis with Bootstrap Icons for uniform UI across devices
        html = html.replace(/🪪/g, '<i class="bi bi-person-badge"></i>');
        html = html.replace(/🔐/g, '<i class="bi bi-shield-lock"></i>');
        html = html.replace(/✅/g, '<i class="bi bi-check-circle-fill"></i>');
        html = html.replace(/⚠️/g, '<i class="bi bi-exclamation-triangle-fill"></i>');
        html = html.replace(/📦/g, '<i class="bi bi-box-fill"></i>');
        html = html.replace(/📢/g, '<i class="bi bi-megaphone-fill"></i>');
        html = html.replace(/📅/g, '<i class="bi bi-calendar-check-fill"></i>');
        html = html.replace(/👥/g, '<i class="bi bi-people-fill"></i>');
        html = html.replace(/⚙️/g, '<i class="bi bi-gear-fill"></i>');
        html = html.replace(/❌/g, '<i class="bi bi-x-circle-fill"></i>');
        html = html.replace(/📝/g, '<i class="bi bi-pencil-square"></i>');
        html = html.replace(/🔧/g, '<i class="bi bi-tools"></i>');
        html = html.replace(/📊/g, '<i class="bi bi-file-earmark-bar-graph-fill"></i>');
        html = html.replace(/📈/g, '<i class="bi bi-graph-up"></i>');
        html = html.replace(/🏢/g, '<i class="bi bi-building-fill"></i>');
        html = html.replace(/🗑️/g, '<i class="bi bi-trash-fill"></i>');
        html = html.replace(/🚪/g, '<i class="bi bi-box-arrow-right"></i>');

        fs.writeFileSync(file, html, 'utf8');
        console.log('Mapped icons in ' + file);
    }
});
