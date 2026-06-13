const fs = require('fs');

const html = fs.readFileSync('last version.html', 'utf8');

const pagesToExtract = ['pg-automation', 'pg-team', 'pg-teamchat', 'pg-niche', 'pg-design'];

// Create scratch directory if it doesn't exist
const scratchDir = 'C:/Users/sheri/.gemini/antigravity-ide/brain/7ed3a7ff-5e87-41ce-885e-99c6a4ee6d35/scratch';
if (!fs.existsSync(scratchDir)){
    fs.mkdirSync(scratchDir, { recursive: true });
}

pagesToExtract.forEach(id => {
    const startIdx = html.indexOf(`id="${id}"`);
    if (startIdx !== -1) {
        let endIdx = html.indexOf('id="pg-', startIdx + 10);
        if (endIdx === -1) endIdx = html.indexOf('id="cm-page-', startIdx + 10);
        if (endIdx === -1) endIdx = html.length;

        // Try to backtrack to the opening div of this pg-
        const openDivIdx = html.lastIndexOf('<div', startIdx);
        let actualStart = openDivIdx !== -1 && (startIdx - openDivIdx < 100) ? openDivIdx : startIdx - 10;
        
        const sectionHtml = html.substring(actualStart, endIdx);
        
        fs.writeFileSync(`${scratchDir}/${id}.html`, sectionHtml);
        console.log(`Extracted ${id}.html`);
    } else {
        console.log(`Could not find ${id}`);
    }
});
