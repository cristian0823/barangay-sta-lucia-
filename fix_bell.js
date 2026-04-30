const fs = require('fs');
let html = fs.readFileSync('user-dashboard.html', 'utf8');

// 1. Revert desktopBellDropdownContainer back to bellDropdownContainer
html = html.replace('id="desktopBellDropdownContainer"', 'id="bellDropdownContainer"');

// 2. Extract the bellDropdownContainer block
const startIndex = html.indexOf('<!-- Dropdown UI -->');
let endIndex = html.indexOf('</div>\r\n            </div>\r\n\r\n            <button onclick="toggleDarkMode()"', startIndex);
if (endIndex === -1) endIndex = html.indexOf('</div>\n            </div>\n\n            <button onclick="toggleDarkMode()"', startIndex);

if (startIndex !== -1 && endIndex !== -1) {
    const blockToMove = html.substring(startIndex, endIndex);
    // Remove it from current location
    html = html.substring(0, startIndex) + html.substring(endIndex);
    
    // 3. Inject it before </header>
    const headerEndIndex = html.indexOf('</header>');
    
    // Modify classes for the block to fit the new position
    let modifiedBlock = blockToMove.replace('top-[52px] right-[-100px] md:right-0', 'top-[65px] right-[16px] md:right-[24px]');
    
    html = html.substring(0, headerEndIndex) + modifiedBlock + '\n    ' + html.substring(headerEndIndex);
    
    fs.writeFileSync('user-dashboard.html', html);
    console.log('Successfully moved bellDropdownContainer!');
} else {
    console.log('Could not find indices!');
    console.log(startIndex, endIndex);
}
