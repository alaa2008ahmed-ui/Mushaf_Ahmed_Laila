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

  // We need to add `onNavigate` to the component props type definition.
  // And it must correctly accept it.
  
  // Find where `onBack` is defined in the props interface or inline type.
  // For example: `const Component: React.FC<{ onBack: () => void }>`
  // Or: `interface ComponentProps { onBack: any }`
  
  // Let's just simply append it to any `{ onBack` or `onBack:` we find in the top.
  content = content.replace(/({[^}]*onBack:\s*[^;,}]+[;,]?)([^}]*})/, (match, p1, p2) => {
    if (match.includes('onNavigate')) return match;
    return p1 + " onNavigate: (id: string, params?: any) => void; " + p2;
  });
  
  // Also we need to make sure the component signature destructs `onNavigate`
  // `const Component = ({ onBack, ... }) =>`
  content = content.replace(/(const\s+\w+\s*:\s*React\.FC<[^>]+>\s*=\s*\(\{\s*)([^}]*)(\}\))/, (match, p1, p2, p3) => {
    if (p2.includes('onNavigate')) return match;
    return p1 + p2 + ", onNavigate " + p3;
  });
  
  // Handle case where it doesn't use React.FC and just direct args:
  // `export default function Component({ onBack }: { onBack: () => void })`
  content = content.replace(/(function\s+\w+\s*\(\{)([^\}]+)(\}\s*:\s*\{[^}]+\})/, (match, p1, p2, p3) => {
    if (p2.includes('onNavigate')) return match;
    // We already added onNavigate to the type in the previous replace ideally, but let's be careful.
    return p1 + p2 + ", onNavigate " + p3;
  });

  // some files just export default function ({ onBack }) 
  content = content.replace(/(export\s+default\s+function\s+\w+\(\{)([^}]+)(\}\))/, (match, p1, p2, p3) => {
      if (p2.includes('onNavigate')) return match;
      return p1 + p2 + ", onNavigate " + p3;
  });
  
  // One more pass for specifically `{ onBack }` directly 
  content = content.replace(/ \(\{ (onBack[^}]*) \}\) /, " ({ $1, onNavigate }) ");

  fs.writeFileSync(filePath, content);
}
