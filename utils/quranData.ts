import quranUthmani from '../data/quran-uthmani.json';

// Normalize Ibrahim text globally to prevent disconnection (cursiveness break) caused by small yeh (U+06E6) across various fonts.
// We replace the U+06E6 (small yeh) with U+064A (regular yeh) specifically when it occurs inside Ibrahim (between haa-kasra and meem).
const correctedSurahs = quranUthmani.data.surahs.map((surah: any) => ({
  ...surah,
  ayahs: surah.ayahs.map((ayah: any) => ({
    ...ayah,
    text: ayah.text.replace(/\u0647\u0650\u06E6\u0645/g, '\u0647\u0650\u064A\u0645')
  }))
}));

export const quranData = {
  surahs: correctedSurahs
};

