const fs = require('fs');

const html = fs.readFileSync('last version.html', 'utf8');

// Find all elements with class containing 'pg' which represents pages
const pageIds = new Set();
const matches = html.matchAll(/class="[^"]*\bpg\b[^"]*"[^>]*id="([^"]+)"/g);
for (const match of matches) {
    pageIds.add(match[1]);
}

// Or elements with id containing 'pg-'
const idMatches = html.matchAll(/id="(pg-[^"]+)"/g);
for (const match of idMatches) {
    pageIds.add(match[1]);
}

console.log("Pages found in last version.html:");
console.log(Array.from(pageIds));

// Find sidebar items
const sbItems = [];
const sbMatches = html.matchAll(/onclick="switchPage\('([^']+)'\)"[^>]*>([\s\S]*?)<\/button>/g);
for (const match of sbMatches) {
    const page = match[1];
    const text = match[2].replace(/<[^>]+>/g, '').trim();
    sbItems.push({ page, text });
}

console.log("\nSidebar items in last version.html:");
sbItems.forEach(item => console.log(`- ${item.page}: ${item.text}`));
