import partialRecitersData from '../data/partialRecitersSurahs.json';
import { JUZ_MAP } from '../components/QuranReader/constants';

export const CACHE_KEY = 'mp3quran_surahs_cache_v6';

export const normalizeUrl = (url: string): string => {
    if (!url) return '';
    return url.toLowerCase()
        .replace(/^https?:\/\//, '')
        .replace(/www\./, '')
        .replace(/\/+/g, '/')
        .replace(/\/$/, '')
        .trim();
};

export const simplifyName = (name: string): string => {
    if (!name) return '';
    return name
        .toLowerCase()
        .replace(/^(ال)/, '')
        .replace(/\s(ال)/g, ' ')
        .replace(/[أإآا]/g, 'ا')
        .replace(/ة/g, 'ه')
        .replace(/ى/g, 'ي')
        .replace(/ئ/g, 'ي')
        .replace(/ؤ/g, 'و')
        .replace(/[\u064B-\u065F]/g, '')
        .replace(/[^ا-ي0-9]/g, '')
        .trim();
};

/**
 * Returns all surah numbers that belong to a specific Juz (1-30).
 */
export const getSurahsForJuz = (juzNumber: number): number[] => {
    if (juzNumber < 1 || juzNumber > 30) return [];
    const startS = JUZ_MAP[juzNumber - 1]?.s || 1;
    const endS = juzNumber < 30 
        ? (JUZ_MAP[juzNumber]?.a === 1 ? JUZ_MAP[juzNumber].s - 1 : JUZ_MAP[juzNumber].s) 
        : 114;
    const surahs: number[] = [];
    for (let s = startS; s <= endS; s++) {
        surahs.push(s);
    }
    return surahs;
};

/**
 * Returns available surahs for a given reader ID (url) and optional reader name.
 */
export const getAvailableSurahsForReader = (
    readerId: string, 
    readerName?: string, 
    dynamicMapping?: Record<string, number[]>
): number[] => {
    const fullList = Array.from({ length: 114 }, (_, i) => i + 1);
    if (!readerId) return fullList;

    let mapping = dynamicMapping;
    if (!mapping) {
        try {
            const cached = localStorage.getItem(CACHE_KEY);
            if (cached) {
                const parsed = JSON.parse(cached);
                mapping = parsed.data || parsed;
            }
        } catch (e) {
            // ignore
        }
    }

    const currentUrlKey = normalizeUrl(readerId);
    const simplifiedNameCurrent = readerName ? simplifyName(readerName) : '';

    // 1. Search in dynamic/cached mapping
    if (mapping && Object.keys(mapping).length > 0) {
        if (mapping[currentUrlKey]) return mapping[currentUrlKey];
        if (simplifiedNameCurrent) {
            const nameKey = `name:${simplifiedNameCurrent}`;
            if (mapping[nameKey]) return mapping[nameKey];

            const matchedNameKey = Object.keys(mapping).find(key => 
                key.startsWith('name:') && (key.includes(simplifiedNameCurrent) || simplifiedNameCurrent.includes(key.replace('name:', '')))
            );
            if (matchedNameKey) return mapping[matchedNameKey];
        }

        const matchedUrlKey = Object.keys(mapping).find(key => 
            !key.startsWith('name:') && (currentUrlKey.includes(key) || key.includes(currentUrlKey))
        );
        if (matchedUrlKey) return mapping[matchedUrlKey];
    }

    // 2. Check bundled static partial mapping
    const staticMap = partialRecitersData as Record<string, number[]>;
    if (staticMap[currentUrlKey]) return staticMap[currentUrlKey];
    if (simplifiedNameCurrent) {
        const nameKey = `name:${simplifiedNameCurrent}`;
        if (staticMap[nameKey]) return staticMap[nameKey];

        const matchedNameKey = Object.keys(staticMap).find(key => 
            key.startsWith('name:') && (key.includes(simplifiedNameCurrent) || simplifiedNameCurrent.includes(key.replace('name:', '')))
        );
        if (matchedNameKey) return staticMap[matchedNameKey];
    }

    const matchedUrlKey = Object.keys(staticMap).find(key => 
        !key.startsWith('name:') && (currentUrlKey.includes(key) || key.includes(currentUrlKey))
    );
    if (matchedUrlKey) return staticMap[matchedUrlKey];

    // Default to full 114 surahs
    return fullList;
};
