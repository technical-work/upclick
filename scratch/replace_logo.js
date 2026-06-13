const fs = require('fs');

let html = fs.readFileSync('public/landing-page.html', 'utf8');

// Replace the logo inside the header anchor tag
html = html.replace(
  /<a href="#" class="logo">[\s\S]*?<\/a>/,
  '<a href="#" class="logo"><img src="/upklick-logo.png" alt="UpKlick" style="height:36px;width:auto;object-fit:contain;"></a>'
);

// Also replace the footer logo area
html = html.replace(
  /<div class="footer-brand">([\s\S]*?)<\/div>/,
  (match, inner) => {
    return `<div class="footer-brand"><a href="#" class="logo" style="margin-bottom:12px;display:inline-flex"><img src="/upklick-logo.png" alt="UpKlick" style="height:32px;width:auto;object-fit:contain;"></a>${inner.replace(/<a[^>]*class="logo"[^>]*>[\s\S]*?<\/a>/, '').replace(/<div[^>]*class="logo"[^>]*>[\s\S]*?<\/div>/, '')}</div>`;
  }
);

// Also replace any reference inside the screenshot preview sidebar that shows "✦ UpKlick"
html = html.replace(
  /<div style="font-size:11px;font-weight:700;color:var\(--or\);padding:4px 10px;margin-bottom:4px">✦ UpKlick<\/div>/,
  '<div style="padding:4px 6px;margin-bottom:4px"><img src="/upklick-logo.png" alt="UpKlick" style="height:20px;width:auto;object-fit:contain;"></div>'
);

fs.writeFileSync('public/landing-page.html', html);
console.log('Done');

// Verify
const newHtml = fs.readFileSync('public/landing-page.html', 'utf8');
const count = (newHtml.match(/upklick-logo\.png/g) || []).length;
console.log('Logo instances found:', count);
