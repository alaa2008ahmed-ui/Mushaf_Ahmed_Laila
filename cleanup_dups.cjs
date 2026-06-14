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

  content = content.replace(/,\s*onNavigate\s*,\s*onNavigate/g, ", onNavigate");
  content = content.replace(/onNavigate:\s*\([^)]*\)\s*=>\s*void;\s*onNavigate:\s*\([^)]*\)\s*=>\s*void;/g, "onNavigate: (id: string, params?: any) => void;");

  fs.writeFileSync(filePath, content);
}
