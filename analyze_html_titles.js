const fs = require('fs');

const html = fs.readFileSync('last version.html', 'utf8');

const missingIds = ['pg-automation', 'pg-team', 'pg-teamchat', 'pg-niche', 'pg-design', 'pg-growth'];

missingIds.forEach(id => {
    const regex = new RegExp(`id="${id}"[^>]*>[\\s\\S]*?<div[^>]*class="[^"]*pgt[^"]*"[^>]*>(.*?)</div>`, 'i');
    const match = html.match(regex);
    if (match) {
        console.log(`Page ID: ${id} | Title: ${match[1].replace(/<[^>]+>/g, '').trim()}`);
    } else {
        const regex2 = new RegExp(`id="${id}"[^>]*>[\\s\\S]*?<div[^>]*class="[^"]*pg-title[^"]*"[^>]*>(.*?)</div>`, 'i');
        const match2 = html.match(regex2);
        if (match2) {
            console.log(`Page ID: ${id} | Title: ${match2[1].replace(/<[^>]+>/g, '').trim()}`);
        } else {
            console.log(`Page ID: ${id} | Title not easily found via regex`);
        }
    }
});
