import quranMetadata from '../data/quran-metadata.json';
import { quranData as quranJsonData } from './quranData';

export interface AyahPointer {
  s: number; // Surah number (1-114)
  a: number; // Ayah number in Surah
}

export interface RangeBoundary {
  start: AyahPointer;
  end: AyahPointer;
}

// Map of Page (1 - 604) to Ayah Boundaries
const pageMap: Record<number, RangeBoundary> = {};
// Map of Hizb Quarter (1 - 240) to Ayah Boundaries
const quarterMap: Record<number, RangeBoundary> = {};
// Map of Juz (1 - 30) to Ayah Boundaries
const juzMap: Record<number, RangeBoundary> = {};

// Initialize maps from quranMetadata
quranMetadata.surahs.forEach((surah: any) => {
  surah.ayahs.forEach((ayah: any) => {
    const s = surah.number;
    const a = ayah.numberInSurah;

    // Page
    const p = ayah.page;
    if (p) {
      if (!pageMap[p]) {
        pageMap[p] = { start: { s, a }, end: { s, a } };
      }
      pageMap[p].end = { s, a };
    }

    // Hizb Quarter
    const q = ayah.hizbQuarter;
    if (q) {
      if (!quarterMap[q]) {
        quarterMap[q] = { start: { s, a }, end: { s, a } };
      }
      quarterMap[q].end = { s, a };
    }

    // Juz
    const j = ayah.juz;
    if (j) {
      if (!juzMap[j]) {
        juzMap[j] = { start: { s, a }, end: { s, a } };
      }
      juzMap[j].end = { s, a };
    }
  });
});

export function getPageRange(pageNum: number): RangeBoundary {
  const p = Math.max(1, Math.min(604, pageNum));
  return pageMap[p] || { start: { s: 1, a: 1 }, end: { s: 1, a: 7 } };
}

export function getQuarterRange(quarterNum: number): RangeBoundary {
  const q = Math.max(1, Math.min(240, quarterNum));
  return quarterMap[q] || { start: { s: 1, a: 1 }, end: { s: 2, a: 25 } };
}

export function getJuzRange(juzNum: number): RangeBoundary {
  const j = Math.max(1, Math.min(30, juzNum));
  return juzMap[j] || { start: { s: 1, a: 1 }, end: { s: 2, a: 141 } };
}

export function getAyahPage(surahNum: number, ayahNum: number): number {
  const surah = quranMetadata.surahs[surahNum - 1];
  const ayah = surah?.ayahs[ayahNum - 1];
  return ayah?.page || 1;
}

export function getAyahJuz(surahNum: number, ayahNum: number): number {
  const surah = quranMetadata.surahs[surahNum - 1];
  const ayah = surah?.ayahs[ayahNum - 1];
  return ayah?.juz || 1;
}

export function getAyahsInRange(fromSurah: number, fromAyah: number, toSurah: number, toAyah: number): Array<{
  surahNumber: number;
  ayahNumber: number;
  text: string;
  page: number;
  juz: number;
}> {
  const result: Array<{
    surahNumber: number;
    ayahNumber: number;
    text: string;
    page: number;
    juz: number;
  }> = [];

  for (let s = fromSurah; s <= toSurah; s++) {
    const surah = quranJsonData.surahs[s - 1];
    if (!surah) continue;
    const startA = s === fromSurah ? fromAyah : 1;
    const endA = s === toSurah ? toAyah : surah.ayahs.length;

    for (let a = startA; a <= endA; a++) {
      const ayah = surah.ayahs[a - 1];
      if (ayah) {
        result.push({
          surahNumber: s,
          ayahNumber: a,
          text: ayah.text,
          page: getAyahPage(s, a),
          juz: getAyahJuz(s, a)
        });
      }
    }
  }

  return result;
}

/**
 * Normalizes Arabic text for speech recognition / quiz comparison:
 * Strips tashkeel, standardizes alif forms, fixes taa marbuta, strips punctuation.
 */
export function normalizeForSpeechMatch(text: string): string {
  if (!text) return '';
  return text
    // Remove all tashkeel / diacritics
    .replace(/[\u064B-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E8\u06EA-\u06ED]/g, '')
    // Standardize Alef
    .replace(/[إأآٱ]/g, 'ا')
    // Standardize Yaa
    .replace(/[ىيئ]/g, 'ي')
    // Standardize Taa Marbuta
    .replace(/ة/g, 'ه')
    // Remove Quranic pauses and punctuation marks
    .replace(/[\u06D6-\u06ED\uFD3E\uFD3F\(\)\[\]«».,;:؟!]/g, '')
    // Normalize spaces
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Calculates speech similarity score between recognized text and ayah text.
 * Returns percentage (0 to 100) and matched words count.
 */
export function calculateAyahMatchScore(ayahText: string, spokenText: string): {
  score: number;
  matchedWords: boolean[];
  ayahWords: string[];
} {
  const normAyah = normalizeForSpeechMatch(ayahText);
  const normSpoken = normalizeForSpeechMatch(spokenText);

  const ayahWords = normAyah.split(' ').filter(Boolean);
  const spokenWords = normSpoken.split(' ').filter(Boolean);

  if (ayahWords.length === 0) return { score: 100, matchedWords: [], ayahWords: [] };
  if (spokenWords.length === 0) return { score: 0, matchedWords: ayahWords.map(() => false), ayahWords };

  const matchedWords: boolean[] = [];
  let matchCount = 0;

  ayahWords.forEach(w => {
    // Check if spoken text contains this word or a very close variant
    const found = spokenWords.some(sw => sw === w || (w.length > 3 && (sw.includes(w) || w.includes(sw))));
    if (found) {
      matchCount++;
      matchedWords.push(true);
    } else {
      matchedWords.push(false);
    }
  });

  const score = Math.round((matchCount / ayahWords.length) * 100);
  return { score, matchedWords, ayahWords };
}

export interface MemorizationPlanItem {
  id: string;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  totalDays: number;
  category: 'juz' | 'surah' | 'daily' | 'custom';
  icon: string;
  fromSurah: number;
  fromAyah: number;
  toSurah: number;
  toAyah: number;
}

export const PRESET_MEMORIZATION_PLANS: MemorizationPlanItem[] = [
  {
    id: 'plan_juz_amma',
    titleAr: 'حفظ جزء عم كاملاً',
    titleEn: 'Memorize Juz Amma',
    descriptionAr: 'من سورة النبأ إلى سورة الناس مقسمة على 30 يوماً بتدرج سهل وثابت',
    descriptionEn: 'From Surah An-Naba to An-Nas divided across 30 days',
    totalDays: 30,
    category: 'juz',
    icon: 'fa-book-quran',
    fromSurah: 78,
    fromAyah: 1,
    toSurah: 114,
    toAyah: 6
  },
  {
    id: 'plan_surah_kahf',
    titleAr: 'حفظ سورة الكهف',
    titleEn: 'Memorize Surah Al-Kahf',
    descriptionAr: '110 آيات من سورة الكهف مقسمة على أسبوع واحد بواقع 15 آية يومياً',
    descriptionEn: '110 verses of Surah Al-Kahf over 7 days (15 verses/day)',
    totalDays: 7,
    category: 'surah',
    icon: 'fa-shield-halved',
    fromSurah: 18,
    fromAyah: 1,
    toSurah: 18,
    toAyah: 110
  },
  {
    id: 'plan_surah_mulk',
    titleAr: 'حفظ سورة الملك (المنجية)',
    titleEn: 'Memorize Surah Al-Mulk',
    descriptionAr: '30 آية شريفة تشفع لصاحبها، مقسمة على 5 أيام بواقع 6 آيات يومياً',
    descriptionEn: '30 blessed verses divided over 5 days (6 verses/day)',
    totalDays: 5,
    category: 'surah',
    icon: 'fa-crown',
    fromSurah: 67,
    fromAyah: 1,
    toSurah: 67,
    toAyah: 30
  },
  {
    id: 'plan_surah_yasin',
    titleAr: 'حفظ سورة يس',
    titleEn: 'Memorize Surah Ya-Sin',
    descriptionAr: '83 آية من قلب القرآن مقسمة على 10 أيام مع مراجعة ختامية',
    descriptionEn: '83 verses of Surah Ya-Sin over 10 days',
    totalDays: 10,
    category: 'surah',
    icon: 'fa-heart',
    fromSurah: 36,
    fromAyah: 1,
    toSurah: 36,
    toAyah: 83
  },
  {
    id: 'plan_surah_waqiah',
    titleAr: 'حفظ سورة الواقعة',
    titleEn: 'Memorize Surah Al-Waqi\'ah',
    descriptionAr: '96 آية مقسمة على 8 أيام لتثبيت الحفظ ونيل بركتها',
    descriptionEn: '96 verses divided over 8 days',
    totalDays: 8,
    category: 'surah',
    icon: 'fa-gem',
    fromSurah: 56,
    fromAyah: 1,
    toSurah: 56,
    toAyah: 96
  },
  {
    id: 'plan_ten_kahf',
    titleAr: 'العشر الأوائل من الكهف',
    titleEn: 'First 10 of Al-Kahf',
    descriptionAr: 'عصمة من فتنة المسيح الدجال، حفظ متقن خلال يومين',
    descriptionEn: 'Protection from trials, mastered in 2 days',
    totalDays: 2,
    category: 'daily',
    icon: 'fa-star',
    fromSurah: 18,
    fromAyah: 1,
    toSurah: 18,
    toAyah: 10
  }
];
