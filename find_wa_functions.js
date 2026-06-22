const fs = require('fs');
const content = fs.readFileSync('remixed-95111e27.html', 'utf-8');

const targets = ['waAgentAI', 'waTemplateAI'];

targets.forEach(name => {
  const regex = new RegExp(`function\\s+${name}\\s*\\([\\s\\S]*?\\)\\s*\\{`, 'g');
  let match;
  while ((match = regex.exec(content)) !== null) {
    const startIndex = match.index;
    let braceCount = 1;
    let endIndex = startIndex + match[0].length;
    while (braceCount > 0 && endIndex < content.length) {
      if (content[endIndex] === '{') braceCount++;
      else if (content[endIndex] === '}') braceCount--;
      endIndex++;
    }
    console.log(`\n// --- ${name} ---`);
    console.log(content.substring(startIndex, endIndex));
  }
});
