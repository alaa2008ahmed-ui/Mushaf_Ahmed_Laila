import quranUthmani from '../data/quran-uthmani.json';

/**
 * Smart engine to normalize Quranic text and fix Arabic cursiveness / letter disconnection issues.
 * Across various web, Android, and iOS Arabic fonts (such as Scheherazade New, Amiri, Cairo, system fonts),
 * certain Uthmanic non-joining characters (primarily U+06E6 Arabic Small Yeh) placed inside words
 * cause the shaping engine to treat the character as isolated, breaking cursive connections with adjacent letters
 * (e.g. ٱلنَّبِيِّۦنَ, ٱلْأُمِّيِّۦنَ, رَبَّٰنِيِّۦنَ, إِبْرَٰهِۦمَ, ٱلْحَوَارِيِّۦنَ, etc.).
 *
 * This smart engine dynamically fixes:
 * 1. Small Yeh (U+06E6) inside words before following Arabic letters -> converted to connected Yeh (U+064A).
 * 2. Small Yeh with fatha after noon-kasra (e.g. ءَاتَىٰنِۦَ) -> converted to connected Yeh (U+064A).
 * 3. Specific Uthmanic ligatures (e.g., Ibrahim, An-Nabiyyeen, Al-Ummiyyeen, Rabbaniyyeen, Al-Hawariyyeen, etc.).
 */
export function normalizeQuranText(text: string): string {
  if (!text) return text;

  let result = text;

  // 1. Convert U+06E6 (Arabic Small Yeh) when followed by any Arabic letter (with optional intervening diacritics)
  // This solves words like: ٱلنَّبِيِّۦنَ -> ٱلنَّبِيِّينَ, ٱلْأُمِّيِّۦنَ -> ٱلْأُمِّيِّينَ, رَبَّٰنِيِّۦنَ -> رَبَّٰنِيِّينَ, ٱلْحَوَارِيِّۦنَ -> ٱلْحَوَارِيِّينَ, إِبْرَٰهِۦمَ -> إِبْرَٰهِيمَ
  result = result.replace(/\u06E6(?=[\u064B-\u065F\u0670]*[\u0621-\u064A\u0671-\u06D3])/g, '\u064A');

  // 2. Handle U+06E6 followed by fatha (e.g. ءَاتَىٰنِۦَ -> ءَاتَىٰنِيَ)
  result = result.replace(/\u0646\u0650\u06E6\u064E/g, '\u0646\u0650\u064A\u064E');

  // 3. Guarantee any residual pattern of yaa+shaddah+kasra followed by small yeh
  result = result.replace(/\u064A\u0651\u0650\u06E6/g, '\u064A\u0651\u0650\u064A');

  // 4. Guarantee Ibrahim pattern (haa+kasra followed by small yeh + meem)
  result = result.replace(/\u0647\u0650\u06E6\u0645/g, '\u0647\u0650\u064A\u0645');

  return result;
}

const correctedSurahs = quranUthmani.data.surahs.map((surah: any) => ({
  ...surah,
  ayahs: surah.ayahs.map((ayah: any) => ({
    ...ayah,
    text: normalizeQuranText(ayah.text)
  }))
}));

export const quranData = {
  surahs: correctedSurahs
};


