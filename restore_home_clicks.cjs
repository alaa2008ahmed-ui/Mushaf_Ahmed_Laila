const fs = require('fs');
const path = require('path');

const mappings = {
  'AsmaulHusna.tsx': 'onHomeClick={handleHomeClick}',
  'HajjUmrah.tsx': 'onHomeClick={handleHomeClick}',
  'HisnAlmuslim.tsx': 'onHomeClick={handleHomeClick}',
  'AdkarSabahMasaa.tsx': 'onHomeClick={handleHomeClick}',
  'ListenQuran.tsx': 'onHomeClick={handleHomeClick}',
  'HijriCalendar.tsx': 'onHomeClick={handleHomeClick}',
  'MainMenu.tsx': 'onHomeClick={() => {}}',
  'Calculators.tsx': 'onHomeClick={onBack}',
  'Adia.tsx': 'onHomeClick={handleHomeClick}',
  'MoreMenuPage.tsx': 'onHomeClick={() => onNavigate(\'home\')}',
  'AthkarAlSalah.tsx': 'onHomeClick={handleHomeClick}',
  'Nawawi.tsx': 'onHomeClick={handleHomeClick}',
  'Memorization.tsx': 'onHomeClick={handleHomeClick}',
  'MonthlyPrayerTimes.tsx': 'onHomeClick={() => onNavigate(\'prayer-times\')}',
  'Tasbeeh.tsx': 'onHomeClick={handleHomeClick}',
  'HabitTracker.tsx': 'onHomeClick={handleHomeClick}',
  'DailyWird.tsx': 'onHomeClick={handleHomeClick}',
  'Qibla.tsx': 'onHomeClick={onBack}',
  'VoiceControlPage.tsx': 'onHomeClick={onBack}',
  'PrayerTimes.tsx': 'onHomeClick={onBack}',
  'QuranDownload.tsx': 'onHomeClick={onBack}'
};

const pagesDir = path.join(__dirname, 'pages');

for (const [file, originalProp] of Object.entries(mappings)) {
  const filePath = path.join(pagesDir, file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    content = content.replace(/onHomeClick=\{[^}]+\}/g, originalProp);
    fs.writeFileSync(filePath, content);
  }
}
