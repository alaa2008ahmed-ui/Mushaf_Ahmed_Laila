const fs = require('fs');
let content = fs.readFileSync('pages/QuranReader.tsx', 'utf8'); 
content = content.replace(/localStorage\.setItem\(\`last_pos\$\{posSuffix\}\`, JSON\.stringify\(\{ s, a \}\)\);/g, 'localStorage.setItem(`last_pos${posSuffix}`, JSON.stringify({ s, a })); localStorage.setItem("last_read_ayah_global", JSON.stringify({ s, a, ts: Date.now() }));'); 
fs.writeFileSync('pages/QuranReader.tsx', content);

let content2 = fs.readFileSync('hooks/useQuranScrollAndJump.ts', 'utf8');
content2 = content2.replace(/localStorage\.setItem\(key, JSON\.stringify\(\{ s, a \}\)\);/g, 'localStorage.setItem(key, JSON.stringify({ s, a })); localStorage.setItem("last_read_ayah_global", JSON.stringify({ s, a, ts: Date.now() }));');
fs.writeFileSync('hooks/useQuranScrollAndJump.ts', content2);
console.log("Done");
