const fs = require('fs');
const filePath = 'user-portal/user-dashboard.html';
let html = fs.readFileSync(filePath, 'utf8');

// The file is littered with corrupted UTF-8 sequences that start with Ã
// Example: Ã°Å¸â€œâ€¦ (Calendar), Ã¢Â Â³ (Hourglass), Ã¢Å¾â€¢ (Plus)

// Map known corrupted sequences to their proper HTML entities
const knownReplacements = [
    { bad: 'Ã°Å¸â€œâ€¦', good: '&#128197;' }, // Calendar
    { bad: 'Ã¢Â Â³', good: '&#8987;' },    // Hourglass
    { bad: 'Ã¢Å¡Â Ã¯Â¸Â ', good: '&#9888;&#65039;' }, // Warning
    { bad: 'Ã°Å¸â€œÂ¦', good: '&#128230;' }, // Box
    { bad: 'Ã°Å¸â€œÂ', good: '&#128205;' }, // Location pin
    { bad: 'Ã°Å¸â€œâ€¢', good: '&#128213;' }, // Book/Log
    { bad: 'Ã¢Å¾â€¢', good: '&#10133;' },   // Plus
    { bad: 'Ã¢ÂÅ’', good: '&#10060;' },   // Cross/Reject
    { bad: 'Ã¢Å“â€œ', good: '&#10004;&#65039;' }, // Check
    { bad: 'Ã¢â€žâ€¢', good: '-' },          // Bullet/Dash
    { bad: 'Ã¢â‚¬â€œ', good: '-' },          // En-dash
    { bad: 'Ã¢Â â‚¬', good: ' ' },          // Space
    { bad: 'Ã°Å¸â€â€ž', good: '&#128260;' }, // Refresh
    { bad: 'Ã°Å¸â€Â§', good: '&#128296;' }, // Wrench/In progress
    { bad: 'Ã°Å¸â€™Â¬', good: '&#128172;' }, // Chat bubble
    { bad: 'Ã°Å¸Ââ‚¬', good: '&#127936;' }, // Basketball
    { bad: 'Ã°Å¸ÂÂ¢', good: '&#127970;' }, // Building
    { bad: 'Ã°Å¸Å½â€°', good: '&#127881;' }  // Party popper
];

for (const {bad, good} of knownReplacements) {
    // Global replace without regex to handle special characters safely
    html = html.split(bad).join(good);
}

// Fallback: Remove any remaining standalone 'Ã' and its immediate corrupted followers
// This regex matches Ã followed by 1 to 8 non-ASCII characters
html = html.replace(/Ã[^\x00-\x7F]{1,8}/g, '');

fs.writeFileSync(filePath, html);
console.log('Successfully cleaned corrupted emojis via fallback in user-dashboard.html');
