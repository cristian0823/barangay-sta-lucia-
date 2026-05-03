const fs = require('fs');
const filePath = 'user-portal/user-dashboard.html';
let html = fs.readFileSync(filePath, 'utf8');

const replacements = {
    "A_A?1": "&#10133;", // Add
    "A A3": "&#8987;", // Pending
    "AAA_A,A?": "&#9888;&#65039;", // Warning
    "A,??": "-", // Hyphen
    "A,?o": "to", // Hyphen/to (e.g. 1 PM to 2 PM)
    "A\"?": "&#10004;&#65039;", // Check
    "A\"A?A_A,A?": "&#9999;&#65039;", // Edit
    "A??,": "-", // Comment separator
    "A???": "&#128100;", // User
    "AA?'": "&#10060;", // Cross/Reject
    "AA?A": "&#128338;", // Clock
    "AA?A3": "&#8987;", // Pending/Hourglass
    "A,A": "&#10060;", // Cancel
    "A,,A": "&#9898;", // White circle
    "A,??A''": "&#128309;", // Blue circle
    "A,???~": "&#128274;", // Lock
    "A,???z": "&#128260;", // Refresh
    "A,??A ": "&#128296;", // Tool/In Progress
    "A,?AA_A,A?": "&#128241;", // Mobile
    "A,?oA": "&#128230;", // Box/Equipment
    "A,?o?": "&#128197;", // Calendar/Reservation
    "A,?oA?": "&#128205;", // Location pin
    "A,A?,": "&#127936;", // Basketball
    "A,A?A": "&#127963;", // Building
    "A,A??A_A,A?": "&#128172;", // Chat bubble
    "A,?": "&#127881;" // Event/Party popper
};

for (const [badStr, goodStr] of Object.entries(replacements)) {
    // Escape special regex characters in the bad string
    const escapedBadStr = badStr.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
    const regex = new RegExp(escapedBadStr, 'g');
    html = html.replace(regex, goodStr);
}

// Ensure the arrow right from earlier (which might have been matched weirdly) is clean
html = html.replace(/Ã°Å¸â€œâ€¦/g, '&#128197;'); 
html = html.replace(/Ã¢Â Â³/g, '&#8987;');

fs.writeFileSync(filePath, html);
console.log('Successfully cleaned corrupted emojis in user-dashboard.html');
