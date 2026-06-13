const fs = require('fs');
const html = fs.readFileSync('last version.html', 'utf8');

const pages = [
  'pg-automation', 'pg-team', 'pg-teamchat', 'pg-niche', 'pg-design'
];

pages.forEach(id => {
    const startIdx = html.indexOf(`id="${id}"`);
    if (startIdx !== -1) {
        let endIdx = html.indexOf('id="pg-', startIdx + 10);
        if (endIdx === -1) endIdx = html.indexOf('id="cm-page-', startIdx + 10);
        if (endIdx === -1) endIdx = html.length;

        const sectionHtml = html.substring(startIdx, endIdx);
        // Find buttons/tools in this section
        const tools = Array.from(sectionHtml.matchAll(/class="[^"]*card[^"]*"[^>]*>[\s\S]*?<div[^>]*class="[^"]*(?:title|rn|prdt)[^"]*"[^>]*>(.*?)<\/div>/g));
        console.log(`\nFeatures in ${id}:`);
        tools.slice(0, 5).forEach(m => console.log(' - ' + m[1].replace(/<[^>]+>/g, '').trim()));
    }
});
