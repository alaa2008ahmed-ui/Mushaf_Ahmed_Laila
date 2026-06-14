const fs = require('fs');
const content = fs.readFileSync('data/onThisDayEvents.ts', 'utf8');
const count = (content.match(/"text":/g) || []).length;
console.log(count);
