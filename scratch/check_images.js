const fs = require('fs');
const path = require('path');

const publicDir = 'c:/Users/moham/React/upclick/public';
const files = fs.readdirSync(publicDir).filter(f => f.startsWith('media__'));

console.log('Found media files in public:');
files.forEach(f => {
  const filePath = path.join(publicDir, f);
  const stat = fs.statSync(filePath);
  console.log(`File: ${f}, Size: ${stat.size} bytes`);
});
