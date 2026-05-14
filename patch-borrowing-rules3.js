const fs = require('fs');
let h = fs.readFileSync('user-portal/home.html', 'utf8').replace(/\r\n/g, '\n');

function rep(old, neu) {
    const idx = h.indexOf(old);
    if (idx === -1) { console.log('MISS:', JSON.stringify(old.substring(0, 70))); return; }
    h = h.substring(0, idx) + neu + h.substring(idx + old.length);
}

// Dark mode toggle
rep('>🌙</button>', '><i class="bi bi-moon-fill"></i></button>');

// Settings button
rep('>⚙️ <span>Settings</span></button>', '><i class="bi bi-gear-fill"></i><span>Settings</span></button>');

// Empty state for court reservations
rep(
    "'<div class=\"empty-state\"><span>🏟️</span><p>No court reservations yet.</p></div>'",
    "'<div class=\"empty-state\"><span><i class=\"bi bi-dribbble\" style=\"font-size:24px;\"></i></span><p>No court reservations yet.</p></div>'"
);

// venue name in JS template - basketball icon before venue name
h = h.replace(/🏀 \$\{venueName\}/g, '${venueName}');
h = h.replace(/\ud83d[\ude00-\ude4f]/g, ''); // remove surrogate emoji sequences leftover

fs.writeFileSync('user-portal/home.html', h);
console.log('Done.');
