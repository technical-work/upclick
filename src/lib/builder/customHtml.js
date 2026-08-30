export function htmlLooksFullscreen(html = '') {
  const text = String(html);
  return /position\s*:\s*fixed/i.test(text)
    || /100vw/i.test(text)
    || /100vh/i.test(text)
    || /z-index\s*:\s*\d{3,}/i.test(text)
    || /<iframe/i.test(text);
}

export function sanitizeCustomHtmlForBuilder(html = '') {
  return String(html)
    .replace(/position\s*:\s*fixed/gi, 'position:absolute')
    .replace(/z-index\s*:\s*-?\d+/gi, 'z-index:1')
    .replace(/100vw/gi, '100%')
    .replace(/100vh/gi, '100%')
    .replace(/inset\s*:\s*0/gi, 'top:0;left:0;right:0;bottom:0');
}
