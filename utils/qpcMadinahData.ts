/// <reference types="vite/client" />

export interface QpcLineLayout {
    l: number;
    t: 's' | 'b' | 'a';
    c: 0 | 1;
    s?: number;
    fw?: number;
    lw?: number;
}

export interface QpcWordEntry {
    id: number;
    surah: number;
    ayah: number;
    word: number;
    text: string;
    isEnd: boolean;
}

export interface QpcMadinahStore {
    pages: QpcLineLayout[][];
    wordsById: Array<QpcWordEntry | undefined>;
    ayahWordCountArr: Uint16Array;
    surahStartPages: number[];
}

const TOTAL_PAGES = 604;

// Standard Madinah Mushaf Juz start pages (Juz 1..30)
const JUZ_START_PAGES = [
    1, 22, 42, 62, 82, 102, 121, 142, 162, 182,
    201, 222, 242, 262, 282, 302, 322, 342, 362, 382,
    402, 422, 442, 462, 482, 502, 522, 542, 562, 582,
];

// Eager Vite URL map for all 604 local Madinah Mushaf fonts (inlines static URLs, zero stub JS chunk fetches)
const fontUrls = import.meta.glob<string>('/data/fonts/*.woff2', {
    query: '?url',
    import: 'default',
    eager: true,
});

// Pre-index page -> URL map in O(1) lookup (handles both pN.woff2 and pN-1.woff2)
const pageFontUrlMap = new Map<number, string>();
for (const [key, url] of Object.entries(fontUrls)) {
    const exactMatch = key.match(/\/p(\d+)\.woff2$/);
    if (exactMatch) {
        const pageNum = Number(exactMatch[1]);
        if (pageNum >= 1 && pageNum <= TOTAL_PAGES) {
            pageFontUrlMap.set(pageNum, url);
        }
        continue;
    }
    const suffixedMatch = key.match(/\/p(\d+)-\d+\.woff2$/);
    if (suffixedMatch) {
        const pageNum = Number(suffixedMatch[1]);
        if (pageNum >= 1 && pageNum <= TOTAL_PAGES && !pageFontUrlMap.has(pageNum)) {
            pageFontUrlMap.set(pageNum, url);
        }
    }
}

export const getPageFontUrl = (pageNumber: number): string | undefined => {
    const safePage = Math.max(1, Math.min(TOTAL_PAGES, pageNumber));
    return pageFontUrlMap.get(safePage);
};

export const getPageFontLoader = (pageNumber: number): (() => Promise<string>) | undefined => {
    const url = getPageFontUrl(pageNumber);
    return url ? () => Promise.resolve(url) : undefined;
};

let cachedStore: QpcMadinahStore | null = null;
let storePromise: Promise<QpcMadinahStore> | null = null;

const loadedFonts = new Set<number>();
const fontLoadPromises = new Map<number, Promise<void>>();
let idlePreloadStarted = false;

const getDataBasePrefix = (): string => {
    if (typeof window !== 'undefined' && window.location.protocol === 'file:') {
        return '';
    }
    return '/';
};

export const getMadinahPageFontFamily = (pageNumber: number): string => {
    const safePage = Math.max(1, Math.min(TOTAL_PAGES, pageNumber));
    return `QPC_Page_${safePage}`;
};

export const isMadinahPageFontLoadedSync = (pageNumber: number): boolean => {
    const safePage = Math.max(1, Math.min(TOTAL_PAGES, pageNumber));
    return loadedFonts.has(safePage);
};

export const getAyahWordCount = (
    store: QpcMadinahStore | null | undefined,
    surah: number,
    ayah: number
): number => {
    if (!store || surah < 1 || surah > 114 || ayah < 1 || ayah >= 512) return 1;
    return store.ayahWordCountArr[(surah << 9) | ayah] || 1;
};

export const loadMadinahPageFont = (pageNumber: number): Promise<void> => {
    const safePage = Math.max(1, Math.min(TOTAL_PAGES, pageNumber));
    if (loadedFonts.has(safePage)) return Promise.resolve();

    const existingPromise = fontLoadPromises.get(safePage);
    if (existingPromise) return existingPromise;

    const p = (async () => {
        try {
            if (typeof document === 'undefined' || typeof FontFace === 'undefined') {
                return;
            }
            const fontUrl = getPageFontUrl(safePage);
            if (!fontUrl) {
                throw new Error(`No local QPC font found for page ${safePage}`);
            }
            const fontFamily = getMadinahPageFontFamily(safePage);
            const fontFace = new FontFace(fontFamily, `url("${fontUrl}")`);
            const loadedFace = await fontFace.load();
            document.fonts.add(loadedFace);
            loadedFonts.add(safePage);
        } catch (err) {
            console.error(`Failed to load QPC font for page ${safePage}:`, err);
        } finally {
            fontLoadPromises.delete(safePage);
        }
    })();

    fontLoadPromises.set(safePage, p);
    return p;
};

export const preloadAdjacentMadinahFonts = (centerPage: number): void => {
    const offsets = [-1, 1, -2, 2];
    for (const offset of offsets) {
        const target = centerPage + offset;
        if (target >= 1 && target <= TOTAL_PAGES) {
            void loadMadinahPageFont(target);
        }
    }
};

export const preloadMadinahPagesForInput = (inputDigits: string): void => {
    if (!inputDigits) return;
    const exact = parseInt(inputDigits, 10);
    if (!Number.isFinite(exact) || exact < 1) return;

    const toPreload = new Set<number>();
    if (exact <= TOTAL_PAGES) {
        toPreload.add(exact);
        if (exact > 1) toPreload.add(exact - 1);
        if (exact < TOTAL_PAGES) toPreload.add(exact + 1);
    }

    // Speculatively warm likely next-digit targets (e.g. typing "6" -> 60..69, "60" -> 600..604)
    if (inputDigits.length <= 2) {
        const tensBase = exact * 10;
        for (let d = 0; d <= 9; d++) {
            const candidate = tensBase + d;
            if (candidate >= 1 && candidate <= TOTAL_PAGES) {
                toPreload.add(candidate);
            }
        }
        if (inputDigits.length === 1 && exact <= 6) {
            const hundredsBase = exact * 100;
            if (hundredsBase <= TOTAL_PAGES) toPreload.add(hundredsBase);
            if (hundredsBase + 4 <= TOTAL_PAGES) toPreload.add(hundredsBase + 4);
        }
    }

    toPreload.forEach((p) => {
        if (!loadedFonts.has(p)) {
            void loadMadinahPageFont(p);
        }
    });
};

export const preloadMadinahPagesIdle = (pages: number[], batchSize = 6): void => {
    if (typeof window === 'undefined') return;
    const queue: number[] = [];
    const seen = new Set<number>();
    for (let i = 0; i < pages.length; i++) {
        const p = Math.max(1, Math.min(TOTAL_PAGES, pages[i]));
        if (!loadedFonts.has(p) && !seen.has(p)) {
            seen.add(p);
            queue.push(p);
        }
    }
    if (queue.length === 0) return;

    let idx = 0;
    const step = () => {
        if (idx >= queue.length) return;
        const end = Math.min(queue.length, idx + batchSize);
        const batch: Promise<void>[] = [];
        for (; idx < end; idx++) {
            const p = queue[idx];
            if (!loadedFonts.has(p)) {
                batch.push(loadMadinahPageFont(p));
            }
        }
        Promise.all(batch).finally(() => {
            if (idx < queue.length) {
                const ric = (window as any).requestIdleCallback;
                if (typeof ric === 'function') {
                    ric(() => step(), { timeout: 250 });
                } else {
                    window.setTimeout(step, 24);
                }
            }
        });
    };

    const ric = (window as any).requestIdleCallback;
    if (typeof ric === 'function') {
        ric(() => step(), { timeout: 250 });
    } else {
        window.setTimeout(step, 16);
    }
};

export const getQpcMadinahDataSync = (): QpcMadinahStore | null => cachedStore;

export const loadQpcMadinahData = (): Promise<QpcMadinahStore> => {
    if (cachedStore) return Promise.resolve(cachedStore);
    if (storePromise) return storePromise;

    const prefix = getDataBasePrefix();

    storePromise = (async () => {
        const [pagesRes, wbwRes] = await Promise.all([
            fetch(`${prefix}data/qpc-v1-15-lines.json`),
            fetch(`${prefix}data/qpc-v1-glyph-codes-wbw.json`),
        ]);

        if (!pagesRes.ok) {
            throw new Error(`Failed to load qpc-v1-15-lines.json (${pagesRes.status})`);
        }
        if (!wbwRes.ok) {
            throw new Error(`Failed to load qpc-v1-glyph-codes-wbw.json (${wbwRes.status})`);
        }

        const [pagesData, wbwRaw] = await Promise.all([
            pagesRes.json() as Promise<QpcLineLayout[][]>,
            wbwRes.json() as Promise<Record<string, any>>,
        ]);

        let maxId = 0;
        for (const key in wbwRaw) {
            const id = Number(wbwRaw[key].id);
            if (id > maxId) maxId = id;
        }

        const wordsById: Array<QpcWordEntry | undefined> = new Array(maxId + 1);
        for (const key in wbwRaw) {
            const item = wbwRaw[key];
            const id = Number(item.id);
            wordsById[id] = {
                id,
                surah: Number(item.surah),
                ayah: Number(item.ayah),
                word: Number(item.word),
                text: String(item.text ?? item.code_v1 ?? ''),
                isEnd: false,
            };
        }

        const ayahWordCountArr = new Uint16Array(115 * 512);
        for (let id = 1; id <= maxId; id++) {
            const curr = wordsById[id];
            if (!curr) continue;
            const next = id < maxId ? wordsById[id + 1] : undefined;
            const isEnd = !next || next.surah !== curr.surah || next.ayah !== curr.ayah;
            curr.isEnd = isEnd;
            if (!isEnd) {
                ayahWordCountArr[(curr.surah << 9) | curr.ayah]++;
            }
        }

        const surahStartPages: number[] = [];
        for (let pIdx = 0; pIdx < pagesData.length; pIdx++) {
            const lines = pagesData[pIdx];
            for (let lIdx = 0; lIdx < lines.length; lIdx++) {
                if (lines[lIdx].t === 's') {
                    surahStartPages.push(pIdx + 1);
                }
            }
        }

        cachedStore = {
            pages: pagesData,
            wordsById,
            ayahWordCountArr,
            surahStartPages,
        };
        return cachedStore;
    })().catch((err) => {
        storePromise = null;
        throw err;
    });

    return storePromise;
};

export const preloadQpcAndMadinahStartup = (priorityPages: number[] = []): void => {
    const immediatePages = [1, 2, 604, ...priorityPages];
    for (let i = 0; i < immediatePages.length; i++) {
        const p = immediatePages[i];
        if (p >= 1 && p <= TOTAL_PAGES) {
            void loadMadinahPageFont(p);
        }
    }

    const dataPromise = loadQpcMadinahData();
    if (idlePreloadStarted) return;
    idlePreloadStarted = true;

    dataPromise
        .then((store) => {
            const allPages = Array.from({ length: TOTAL_PAGES }, (_, i) => i + 1);
            // Warm up all 30 Juz start pages, 114 Surah start pages, and remaining pages in idle batches
            preloadMadinahPagesIdle([...JUZ_START_PAGES, ...store.surahStartPages, ...allPages], 6);
        })
        .catch(() => {
            idlePreloadStarted = false;
        });
};
