export function parseMarkdown(mdText) {
  if (!mdText) return '';
  
  let html = String(mdText);

  // Escape basic HTML tags to prevent custom injected scripts, but preserve safe presentation
  html = html
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // 1. Table Parsing
  const lines = html.split('\n');
  let inTable = false;
  let tableRows = [];
  let finalLines = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith('|') && line.endsWith('|')) {
      if (!inTable) {
        inTable = true;
        tableRows = [];
      }
      tableRows.push(line);
    } else {
      if (inTable) {
        finalLines.push(renderHTMLTable(tableRows));
        inTable = false;
      }
      finalLines.push(lines[i]);
    }
  }
  if (inTable) {
    finalLines.push(renderHTMLTable(tableRows));
  }
  html = finalLines.join('\n');

  // Helper to render Markdown tables as clean HTML tables
  function renderHTMLTable(rows) {
    const parseRow = (row) => row.split('|').map(c => c.trim()).filter((c, idx, arr) => idx > 0 && idx < arr.length - 1);
    
    if (rows.length < 1) return '';
    const headerCols = parseRow(rows[0]);
    // If there's a separator row, skip it. If not, data rows are from index 1.
    const hasSeparator = rows[1] && rows[1].includes('-') && rows[1].includes('|');
    const dataRows = rows.slice(hasSeparator ? 2 : 1).map(parseRow);
    
    let tableHtml = '<div class="ai-table-wrap" style="overflow-x:auto; margin: 16px 0; border-radius: 10px; border: 1px solid var(--edge2);"><table style="width: 100%; border-collapse: collapse; font-size: 13px; text-align: start;">';
    
    // Render Header
    tableHtml += '<thead style="background: rgba(236, 92, 49, 0.08); border-bottom: 1px solid var(--edge2);">';
    tableHtml += '<tr>';
    headerCols.forEach(col => {
      tableHtml += `<th style="padding: 10px 12px; font-weight: 700; color: var(--t1); text-align: start;">${col}</th>`;
    });
    tableHtml += '</tr></thead>';
    
    // Render Body
    tableHtml += '<tbody>';
    dataRows.forEach((row, rIdx) => {
      const bg = rIdx % 2 === 1 ? 'rgba(67, 51, 103, 0.02)' : 'transparent';
      tableHtml += `<tr style="background: ${bg}; border-bottom: 1px solid var(--edge); transition: background 0.15s;">`;
      
      // Pad cells if row length doesn't match header length
      for (let c = 0; c < headerCols.length; c++) {
        const cell = row[c] || '';
        tableHtml += `<td style="padding: 10px 12px; color: var(--t2); text-align: start;">${cell}</td>`;
      }
      
      tableHtml += '</tr>';
    });
    tableHtml += '</tbody></table></div>';
    
    return tableHtml;
  }

  // 2. Headers
  html = html.replace(/^###### (.*?)$/gm, '<h6 style="font-family: var(--ff); font-size: 12px; font-weight: 800; color: var(--t2); margin-top: 10px; margin-bottom: 5px;">$1</h6>');
  html = html.replace(/^##### (.*?)$/gm, '<h5 style="font-family: var(--ff); font-size: 13px; font-weight: 800; color: var(--t1); margin-top: 12px; margin-bottom: 6px;">$1</h5>');
  html = html.replace(/^#### (.*?)$/gm, '<h4 style="font-family: var(--ff); font-size: 14px; font-weight: 800; color: var(--purple); margin-top: 14px; margin-bottom: 8px;">✦ $1</h4>');
  html = html.replace(/^### (.*?)$/gm, '<h3 style="font-family: var(--ff); font-size: 15px; font-weight: 800; color: var(--orange); margin-top: 18px; margin-bottom: 10px; display: flex; align-items: center; gap: 8px;">✦ $1</h3>');
  html = html.replace(/^## (.*?)$/gm, '<h2 style="font-family: var(--ff); font-size: 17px; font-weight: 900; color: var(--purple); margin-top: 22px; margin-bottom: 12px; border-bottom: 1px solid var(--edge2); padding-bottom: 6px;">$1</h2>');
  html = html.replace(/^# (.*?)$/gm, '<h1 style="font-family: var(--ff); font-size: 20px; font-weight: 900; color: var(--t1); margin-top: 26px; margin-bottom: 14px;">$1</h1>');

  // 3. Bold text -> premium HIGHLIGHT styling
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong style="color: var(--t1); background: rgba(236, 92, 49, 0.06); border: 1px dashed rgba(236, 92, 49, 0.18); padding: 2px 6px; border-radius: 6px; font-weight: 700; margin: 0 2px; font-size: 12.5px; display: inline-block;">$1</strong>');

  // 3.5 Italic text
  html = html.replace(/\*(.*?)\*/g, '<em style="color: var(--t2); font-style: italic; font-size: 13px; font-family: var(--fb);">$1</em>');
  html = html.replace(/_(.*?)_/g, '<em style="color: var(--t2); font-style: italic; font-size: 13px; font-family: var(--fb);">$1</em>');

  // 4. Bullet lists
  html = html.replace(/^\s*[\*\-]\s+(.*?)$/gm, '<div style="display: flex; gap: 8px; align-items: flex-start; margin-bottom: 6px; padding-right: 8px; padding-left: 8px;"><span style="color: var(--orange); font-size: 12px; margin-top: 2px;">•</span><span style="color: var(--t2); font-size: 13px;">$1</span></div>');

  // 5. Number lists
  html = html.replace(/^\s*(\d+)\.\s+(.*?)$/gm, '<div style="display: flex; gap: 8px; align-items: flex-start; margin-top: 10px; margin-bottom: 8px;"><span style="background: var(--purple-d); color: var(--purple); font-size: 11px; font-weight: 800; width: 18px; height: 18px; display: flex; align-items: center; justify-content: center; border-radius: 50%; flex-shrink: 0; margin-top: 1px;">$1</span><span style="color: var(--t1); font-size: 13.5px; font-weight: 600;">$2</span></div>');

  // 5.5 Horizontal Rules
  html = html.replace(/^\s*[-*_]{3,}\s*$/gm, '<hr style="border: none; border-top: 1px solid var(--edge2); margin: 18px 0;" />');

  // 6. Line breaks
  html = html.replace(/\n/g, '<br />');

  // Clean duplicate line breaks
  html = html.replace(/(<br \/>){3,}/g, '<br /><br />');

  return html;
}
