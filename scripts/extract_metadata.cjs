const fs = require('fs');
const tajweed = JSON.parse(fs.readFileSync('data/quran-tajweed.json', 'utf8'));
const metadata = {
  surahs: tajweed.data.surahs.map(s => ({
    number: s.number,
    name: s.name,
    englishName: s.englishName,
    englishNameTranslation: s.englishNameTranslation,
    revelationType: s.revelationType,
    ayahs: s.ayahs.map(a => ({
      number: a.number,
      numberInSurah: a.numberInSurah,
      juz: a.juz,
      manzil: a.manzil,
      page: a.page,
      ruku: a.ruku,
      hizbQuarter: a.hizbQuarter,
      sajda: a.sajda
    }))
  }))
};
fs.writeFileSync('data/quran-metadata.json', JSON.stringify(metadata));
