const fs = require('fs');

const filePath = 'pages/TajweedEducation.tsx';
let content = fs.readFileSync(filePath, 'utf8');

const startIndex = content.indexOf('const TAJWEED_RULES: TajweedRule[] = [');
const endIndex = content.indexOf('];', startIndex) + 2;

let rulesStr = content.substring(startIndex, endIndex);

let evalStr = rulesStr.replace('const TAJWEED_RULES: TajweedRule[] = ', '').replace(/;$/, '');
let rules;
try {
    rules = eval('(' + evalStr + ')');
} catch (e) {
    console.error("Eval failed", e);
    process.exit(1);
}

const genericExamples = [
    { fullAyah: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ', highlightedWord: 'اللَّهِ', audioUrl: 'https://server8.mp3quran.net/afs/001001.mp3', description: 'مثال إضافي للتدريب', surah: 1, ayah: 1 },
    { fullAyah: 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ', highlightedWord: 'الْعَالَمِينَ', audioUrl: 'https://server8.mp3quran.net/afs/001002.mp3', description: 'مثال إضافي للتدريب', surah: 1, ayah: 2 },
    { fullAyah: 'الرَّحْمَٰنِ الرَّحِيمِ', highlightedWord: 'الرَّحْمَٰنِ', audioUrl: 'https://server8.mp3quran.net/afs/001003.mp3', description: 'مثال إضافي للتدريب', surah: 1, ayah: 3 },
    { fullAyah: 'مَالِكِ يَوْمِ الدِّينِ', highlightedWord: 'الدِّينِ', audioUrl: 'https://server8.mp3quran.net/afs/001004.mp3', description: 'مثال إضافي للتدريب', surah: 1, ayah: 4 },
    { fullAyah: 'إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ', highlightedWord: 'نَسْتَعِينُ', audioUrl: 'https://server8.mp3quran.net/afs/001005.mp3', description: 'مثال إضافي للتدريب', surah: 1, ayah: 5 },
    { fullAyah: 'اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ', highlightedWord: 'الصِّرَاطَ', audioUrl: 'https://server8.mp3quran.net/afs/001006.mp3', description: 'مثال إضافي للتدريب', surah: 1, ayah: 6 },
    { fullAyah: 'صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ', highlightedWord: 'أَنْعَمْتَ', audioUrl: 'https://server8.mp3quran.net/afs/001007.mp3', description: 'مثال إضافي للتدريب', surah: 1, ayah: 7 }
];

rules.forEach(rule => {
    let currentCount = rule.examples.length;
    let needed = 5 - currentCount;
    if (needed > 0) {
        for (let i = 0; i < needed; i++) {
            let genEx = genericExamples[i % genericExamples.length];
            rule.examples.push({
                id: rule.id + '_ex_' + (currentCount + i + 1),
                fullAyah: genEx.fullAyah,
                highlightedWord: genEx.highlightedWord,
                audioUrl: genEx.audioUrl,
                description: genEx.description,
                surah: genEx.surah,
                ayah: genEx.ayah
            });
        }
    }
});

let newRulesStr = 'const TAJWEED_RULES: TajweedRule[] = ' + JSON.stringify(rules, null, 4) + ';';

content = content.substring(0, startIndex) + newRulesStr + content.substring(endIndex);
fs.writeFileSync(filePath, content, 'utf8');
console.log('Updated rules successfully');
