/**
 * Helper to fetch, cache, and search Quran English translation data (from /en.json)
 */
import { SURAH_NAMES_EN } from '../components/QuranReader/constants';

export interface QuranEnglishVerse {
    id: number; // Ayah number in surah
    text: string; // Arabic text
    translation: string; // English translation
}

export interface QuranEnglishSurah {
    id: number; // Surah number 1-114
    name: string; // Arabic name
    transliteration: string; // Transliterated name e.g. "Al-Fatihah"
    translation: string; // English title e.g. "The Opening"
    type: string;
    total_verses: number;
    verses: QuranEnglishVerse[];
}

export interface QuranSearchResultItem {
    type: 'quran';
    surah: number;
    ayah: number;
    surahName: string;
    surahNameEn: string;
    text: string;
    textEn: string;
    page: number;
    juz: number;
    highlightRegex: RegExp | null;
}

let cachedTranslationData: QuranEnglishSurah[] | null = null;
let pendingFetchPromise: Promise<QuranEnglishSurah[]> | null = null;

export const loadQuranEnglishTranslation = async (): Promise<QuranEnglishSurah[]> => {
    if (cachedTranslationData) {
        return cachedTranslationData;
    }
    if (pendingFetchPromise) {
        return pendingFetchPromise;
    }

    pendingFetchPromise = (async () => {
        try {
            const res = await fetch('/en.json');
            const data = await res.json();
            cachedTranslationData = data;
            return data;
        } catch (error) {
            console.error('Failed to load /en.json translation:', error);
            return [];
        } finally {
            pendingFetchPromise = null;
        }
    })();

    return pendingFetchPromise;
};

export const getCachedQuranEnglishTranslation = (): QuranEnglishSurah[] | null => {
    return cachedTranslationData;
};

/**
 * Perform English translation search across all surahs
 */
export const searchQuranEnglish = (
    query: string,
    enData: QuranEnglishSurah[],
    quranDataAr?: any
): QuranSearchResultItem[] => {
    const q = query.trim();
    if (!q || !enData || enData.length === 0) return [];

    const isNumberSearch = /^[0-9]+$/.test(q);
    const searchNum = isNumberSearch ? parseInt(q, 10) : -1;

    // Build regex for word/phrase matching
    // Escape special regex chars
    const escapedWords = q
        .split(/\s+/)
        .map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
        .filter(w => w.length > 0);

    let regex: RegExp | null = null;
    if (escapedWords.length > 0 && !isNumberSearch) {
        try {
            regex = new RegExp(`(${escapedWords.join('|')})`, 'gi');
        } catch (e) {
            regex = null;
        }
    }

    const results: QuranSearchResultItem[] = [];

    // Helper to get page & juz from Arabic quranData
    const getPageAndJuz = (surahNum: number, ayahNum: number): { page: number; juz: number; arabicText: string } => {
        if (quranDataAr && quranDataAr.surahs) {
            const s = quranDataAr.surahs[surahNum - 1];
            if (s && s.ayahs) {
                const a = s.ayahs[ayahNum - 1];
                if (a) {
                    return {
                        page: a.page || 1,
                        juz: a.juz || 1,
                        arabicText: a.text || ''
                    };
                }
            }
        }
        return { page: 1, juz: 1, arabicText: '' };
    };

    const lowerQ = q.toLowerCase();

    for (let sIdx = 0; sIdx < enData.length; sIdx++) {
        const surah = enData[sIdx];
        const surahNameEn = SURAH_NAMES_EN[surah.id - 1] || surah.transliteration || surah.name;
        const surahMatches = !isNumberSearch && (
            surah.transliteration.toLowerCase().includes(lowerQ) ||
            surah.translation.toLowerCase().includes(lowerQ)
        );

        for (let aIdx = 0; aIdx < surah.verses.length; aIdx++) {
            const verse = surah.verses[aIdx];
            const meta = getPageAndJuz(surah.id, verse.id);
            const translationText = verse.translation || '';

            if (isNumberSearch && verse.id === searchNum) {
                results.push({
                    type: 'quran',
                    surah: surah.id,
                    ayah: verse.id,
                    surahName: surah.name,
                    surahNameEn,
                    text: meta.arabicText || verse.text,
                    textEn: translationText,
                    page: meta.page,
                    juz: meta.juz,
                    highlightRegex: null
                });
            } else if (!isNumberSearch) {
                const translationLower = translationText.toLowerCase();
                const matchedAllWords = escapedWords.every(w => translationLower.includes(w.toLowerCase()));

                if (matchedAllWords || (surahMatches && aIdx === 0)) {
                    results.push({
                        type: 'quran',
                        surah: surah.id,
                        ayah: verse.id,
                        surahName: surah.name,
                        surahNameEn,
                        text: meta.arabicText || verse.text,
                        textEn: translationText,
                        page: meta.page,
                        juz: meta.juz,
                        highlightRegex: regex
                    });
                }
            }
        }
    }

    return results;
};
