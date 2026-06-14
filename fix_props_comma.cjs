const fs = require('fs');
const path = require('path');

const pagesDir = path.join(__dirname, 'pages');
const pages = [
  'Adia.tsx', 'AsmaulHusna.tsx', 'Calculators.tsx', 'HabitTracker.tsx',
  'HajjUmrah.tsx', 'HijriCalendar.tsx', 'HisnAlmuslim.tsx', 'ListenQuran.tsx',
  'Nawawi.tsx', 'Tasbeeh.tsx'
];

for (const file of pages) {
  const filePath = path.join(pagesDir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  content = content.replace(/onBack:\s*\(\)\s*=>\s*void\s*onNavigate:/g, "onBack: () => void, onNavigate:");

  fs.writeFileSync(filePath, content);
}
