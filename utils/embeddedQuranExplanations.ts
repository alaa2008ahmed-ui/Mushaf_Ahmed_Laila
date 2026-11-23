// Shared instantaneous in-memory store & preloader for the 3 embedded Quran explanation datasets:
// 1. /assets/data/ar.jalalayn.json  (Embedded Tafseer)
// 2. /tafseer.json                   (Embedded Quran Word Meanings)
// 3. /en.json                        (Embedded English Translation)

type SurahEntriesMap = Record<number, string>;

const embeddedTafseerBySurah = new Map<number, SurahEntriesMap>();
const embeddedMeaningsBySurah = new Map<number, SurahEntriesMap>();
const embeddedTranslationBySurah = new Map<number, SurahEntriesMap>();

let tafseerRawSurahs: any[] | null = null;
let meaningsRawArray: any[] | null = null;
let translationRawArray: any[] | null = null;

let tafseerLoadPromise: Promise<void> | null = null;
let meaningsLoadPromise: Promise<void> | null = null;
let translationLoadPromise: Promise<void> | null = null;
let preloadStarted = false;

export const ensureEmbeddedTafseerLoaded = (): Promise<void> => {
    if (embeddedTafseerBySurah.size >= 114) {
        return Promise.resolve();
    }
    if (tafseerLoadPromise) {
        return tafseerLoadPromise;
    }

    tafseerLoadPromise = (async () => {
        try {
            const res = await fetch('/assets/data/ar.jalalayn.json');
            const data = await res.json();
            if (data?.code === 200 && Array.isArray(data?.data?.surahs)) {
                tafseerRawSurahs = data.data.surahs;
                for (let sIdx = 0; sIdx < data.data.surahs.length; sIdx++) {
                    const surahObj = data.data.surahs[sIdx];
                    const sNum = Number(surahObj?.number || sIdx + 1);
                    const map: SurahEntriesMap = {};
                    const ayahs = surahObj?.ayahs || [];
                    for (let aIdx = 0; aIdx < ayahs.length; aIdx++) {
                        const a = ayahs[aIdx];
                        const aNum = Number(a?.numberInSurah || aIdx + 1);
                        map[aNum] = a?.text || '';
                    }
                    embeddedTafseerBySurah.set(sNum, map);
                }
            }
        } catch (err) {
            tafseerLoadPromise = null;
            throw err;
        }
    })();

    return tafseerLoadPromise;
};

export const ensureEmbeddedMeaningsLoaded = (): Promise<void> => {
    if (embeddedMeaningsBySurah.size > 0) {
        return Promise.resolve();
    }
    if (meaningsLoadPromise) {
        return meaningsLoadPromise;
    }

    meaningsLoadPromise = (async () => {
        try {
            const res = await fetch('/tafseer.json');
            const data = await res.json();
            if (Array.isArray(data)) {
                meaningsRawArray = data;
                for (let i = 0; i < data.length; i++) {
                    const item = data[i];
                    const sNum = Number(item?.number);
                    const aNum = Number(item?.aya);
                    if (!sNum || !aNum) continue;
                    let surahMap = embeddedMeaningsBySurah.get(sNum);
                    if (!surahMap) {
                        surahMap = {};
                        embeddedMeaningsBySurah.set(sNum, surahMap);
                    }
                    surahMap[aNum] = item?.text || '';
                }
            }
        } catch (err) {
            meaningsLoadPromise = null;
            throw err;
        }
    })();

    return meaningsLoadPromise;
};

export const ensureEmbeddedTranslationLoaded = (): Promise<void> => {
    if (embeddedTranslationBySurah.size >= 114) {
        return Promise.resolve();
    }
    if (translationLoadPromise) {
        return translationLoadPromise;
    }

    translationLoadPromise = (async () => {
        try {
            const res = await fetch('/en.json');
            const data = await res.json();
            if (Array.isArray(data)) {
                translationRawArray = data;
                for (let sIdx = 0; sIdx < data.length; sIdx++) {
                    const surahObj = data[sIdx];
                    const sNum = Number(surahObj?.id || sIdx + 1);
                    const map: SurahEntriesMap = {};
                    const verses = surahObj?.verses || [];
                    for (let vIdx = 0; vIdx < verses.length; vIdx++) {
                        const v = verses[vIdx];
                        const aNum = Number(v?.id || v?.verse_number || vIdx + 1);
                        map[aNum] = v?.translation || '';
                    }
                    embeddedTranslationBySurah.set(sNum, map);
                }
            }
        } catch (err) {
            translationLoadPromise = null;
            throw err;
        }
    })();

    return translationLoadPromise;
};

export const preloadEmbeddedQuranExplanations = (): void => {
    if (preloadStarted) return;
    preloadStarted = true;
    void ensureEmbeddedTafseerLoaded().catch(() => {});
    void ensureEmbeddedMeaningsLoaded().catch(() => {});
    void ensureEmbeddedTranslationLoaded().catch(() => {});
};

let cachedOfflineRaw: string | null = null;
const offlineTafseerByKey = new Map<string, SurahEntriesMap>();

const ensureOfflineTafseerIndexed = (): void => {
    try {
        const raw = localStorage.getItem('downloaded_tafsir_files');
        if (raw === cachedOfflineRaw) return;
        cachedOfflineRaw = raw;
        offlineTafseerByKey.clear();
        if (!raw) return;
        const files = JSON.parse(raw);
        if (!Array.isArray(files)) return;
        for (let fIdx = 0; fIdx < files.length; fIdx++) {
            const file = files[fIdx];
            const fileName: string = file?.fileName || '';
            const ayahs = file?.data?.ayahs;
            if (!fileName || !Array.isArray(ayahs) || ayahs.length === 0) continue;
            const map: SurahEntriesMap = {};
            for (let i = 0; i < ayahs.length; i++) {
                const a = ayahs[i];
                map[Number(a?.numberInSurah || i + 1)] = a?.text || '';
            }
            offlineTafseerByKey.set(fileName, map);
        }
    } catch {
        // Ignore storage errors
    }
};

export const getOfflineDownloadedTafseerSurahSync = (
    surahNumber: number,
    tafseerId: string
): SurahEntriesMap | null => {
    ensureOfflineTafseerIndexed();
    return offlineTafseerByKey.get(`${tafseerId}_${surahNumber}_tafsir.json`) || null;
};

export const getEmbeddedTafseerSurahSync = (
    surahNumber: number,
    tafseerId = 'ar.jalalayn',
    externalCache?: Record<string, any[]>
): SurahEntriesMap | null => {
    const cacheKey = `${surahNumber}_${tafseerId}`;
    const ext = externalCache?.[cacheKey];
    if (Array.isArray(ext) && ext.length > 0) {
        const map: SurahEntriesMap = {};
        for (let i = 0; i < ext.length; i++) {
            const a = ext[i];
            map[Number(a?.numberInSurah || i + 1)] = a?.text || '';
        }
        return map;
    }

    if (tafseerId === 'ar.jalalayn') {
        return embeddedTafseerBySurah.get(surahNumber) || null;
    }

    return getOfflineDownloadedTafseerSurahSync(surahNumber, tafseerId);
};

export const getEmbeddedJalalaynSurahSync = (surahNumber: number): SurahEntriesMap | null => {
    return embeddedTafseerBySurah.get(surahNumber) || null;
};

export const getEmbeddedMeaningsSurahSync = (surahNumber: number): SurahEntriesMap | null => {
    return embeddedMeaningsBySurah.get(surahNumber) || null;
};

export const getEmbeddedTranslationSurahSync = (surahNumber: number): SurahEntriesMap | null => {
    return embeddedTranslationBySurah.get(surahNumber) || null;
};

export const hasEmbeddedDataReadySync = (mode: 'tafseer' | 'meanings' | 'translation'): boolean => {
    if (mode === 'tafseer') return embeddedTafseerBySurah.size >= 114;
    if (mode === 'meanings') return embeddedMeaningsBySurah.size > 0;
    return embeddedTranslationBySurah.size >= 114;
};

export const getExplanationEntrySync = (
    mode: 'tafseer' | 'meanings' | 'translation',
    surahNumber: number,
    ayahNumber: number,
    tafseerId = 'ar.jalalayn',
    externalCache?: Record<string, any[]>
): string => {
    if (mode === 'tafseer') {
        if (tafseerId !== 'ar.jalalayn') {
            const cacheKey = `${surahNumber}_${tafseerId}`;
            const ext = externalCache?.[cacheKey];
            if (Array.isArray(ext) && ext[ayahNumber - 1]?.text) {
                return ext[ayahNumber - 1].text;
            }
            const offlineMap = getOfflineDownloadedTafseerSurahSync(surahNumber, tafseerId);
            if (offlineMap?.[ayahNumber]) {
                return offlineMap[ayahNumber];
            }
        }
        return embeddedTafseerBySurah.get(surahNumber)?.[ayahNumber] || '';
    }
    if (mode === 'meanings') {
        return embeddedMeaningsBySurah.get(surahNumber)?.[ayahNumber] || '';
    }
    return embeddedTranslationBySurah.get(surahNumber)?.[ayahNumber] || '';
};

export const getEmbeddedTafseerRawSurahs = () => tafseerRawSurahs;
export const getEmbeddedMeaningsRawArray = () => meaningsRawArray;
export const getEmbeddedTranslationRawArray = () => translationRawArray;
