const fs = require('fs');
let html = fs.readFileSync('public/landing-page.html', 'utf8');
html = html.replace(/href="upklick-login\.html"/g, 'href="/login"');
html = html.replace(/href='upklick-login\.html'/g, "href='/login'");
fs.writeFileSync('public/landing-page.html', html);
console.log('Done - fixed login links');
