const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

html = html.replace(/<a href="login\.html\?role=resident" class="btn-nav-outline">[^<]*Resident Login<\/a>/g, '<a href="login.html?role=resident" class="btn-nav-outline">Resident Login</a>');
html = html.replace(/<a href="login\.html\?role=admin" class="btn-nav-admin">[^<]*Admin Login<\/a>/g, '<a href="login.html?role=admin" class="btn-nav-admin">Admin Login</a>');

html = html.replace(/<a href="login\.html\?role=resident" class="btn-hero-primary">[^<]*Resident Login<\/a>/g, '<a href="login.html?role=resident" class="btn-hero-primary">Resident Login</a>');
html = html.replace(/<a href="login\.html\?role=admin" class="btn-hero-secondary">[^<]*Admin Login<\/a>/g, '<a href="login.html?role=admin" class="btn-hero-secondary">Admin Login</a>');

fs.writeFileSync('index.html', html);
console.log('Cleaned index.html');
