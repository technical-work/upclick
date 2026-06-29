const fs = require('fs');
const content = fs.readFileSync('remixed-95111e27.html', 'utf-8');

console.log("File length:", content.length);
const lines = content.split('\n');
let count = 0;
lines.forEach((line, idx) => {
  if (line.toLowerCase().includes('telegram')) {
    count++;
    if (count < 40) {
      console.log(`Line ${idx + 1}: ${line.trim().substring(0, 150)}`);
    }
  }
});
console.log(`Total occurrences found: ${count}`);
