const fs = require('fs');
const path = require('path');

const pagesDir = path.join(__dirname, 'pages');
const files = fs.readdirSync(pagesDir).filter(f => f.endsWith('.tsx'));

for (const file of files) {
  const filePath = path.join(pagesDir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Change <BottomBar onHomeClick={handleHomeClick} ... /> 
  // or <BottomBar onHomeClick={onBack} ... />
  // to <BottomBar onHomeClick={() => onNavigate('home')} ... />
  
  if (content.includes('<BottomBar')) {
    if (!content.includes("onHomeClick={() => onNavigate('home')}")) {
      content = content.replace(/onHomeClick=\{[^}]+\}/g, "onHomeClick={() => onNavigate('home')}");
      
      // Ensure onNavigate is in the component arguments
      if (!content.includes("onNavigate") && content.includes("onBack")) {
        content = content.replace(/(?<=({|,\s*))onBack/, "onBack, onNavigate");
        content = content.replace(/({ onBack: \(\) => void })/, "{ onBack: () => void, onNavigate: (id: string) => void }");
      }
      
      fs.writeFileSync(filePath, content);
      console.log('Updated BottomBar in', file);
    }
  }
}
