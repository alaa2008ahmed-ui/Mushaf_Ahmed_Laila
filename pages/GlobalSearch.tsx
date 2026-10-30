import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ChevronLeft, Search, BookOpen, Sun, Moon, Heart, X } from 'lucide-react';
import { Keyboard } from '@capacitor/keyboard';
import { Capacitor } from '@capacitor/core';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { quranData } from '../utils/quranData';
import { THEMES, toArabic, SURAH_NAMES_EN } from '../components/QuranReader/constants';
import { HISN_ALMUSLIM_CATEGORIES, HISN_ALMUSLIM_DATA } from '../data/hisnAlmuslimData';
import { HISN_CATEGORIES_EN, HISN_ITEMS_EN } from '../data/hisnAlmuslimTranslationsEn';
import { NAWAWI_DATA } from '../data/nawawiData';
import { ALL_DUAA } from '../data/adiaData';
import { ADIA_EN_MAP } from '../data/adiaTranslationsEn';
import { BASE_ADHKAR_MORNING, BASE_ADHKAR_EVENING } from '../data/adkarSabahMasaaData';
import { ADKAR_EN_MAP } from '../data/adkarTranslationsEn';
import { RUQYAH_DATA } from '../data/ruqyahData';
import { registerBackInterceptor } from '../hooks/useBackButton';
import { 
    loadQuranEnglishTranslation, 
    searchQuranEnglish, 
    getCachedQuranEnglishTranslation 
} from '../utils/quranTranslationHelper';
import { 
    getQuranThemeIdForLayout, 
    getQuranSettingsForLayout 
} from '../utils/quranThemeHelper';
import './QuranReader.css';

// Helper to get reader theme
const getReaderTheme = (isLandscape = false) => {
    try {
        const suffix = isLandscape ? '_h' : '_v';
        const themeId = getQuranThemeIdForLayout(suffix);
        const quranSettings = getQuranSettingsForLayout(suffix) || {};
        const originalTheme = THEMES[themeId as keyof typeof THEMES] || THEMES.black;
        
        const bgColor = quranSettings.bgColor || originalTheme.bg;
        const textColor = quranSettings.textColor || originalTheme.text;
        const accent = quranSettings.highlightTextColor || originalTheme.accent;
        const isDark =
            textColor.toLowerCase() === '#ffffff' ||
            themeId === 'deep_black' ||
            themeId.startsWith('i_') ||
            ['#000000', '#0a0a0a', '#18181b', '#09090b', '#022c22', '#450a0a', '#1e3a8a', '#422006', '#78350f', '#4c1d95', '#280a1e', '#041e3a', '#1e1b4b', '#0f172a', '#064e3b', '#134e4a', '#334155'].includes(bgColor.toLowerCase());

        return {
            ...originalTheme,
            bgColor,
            textColor,
            text: textColor,
            bg: bgColor,
            accent,
            palette: [accent, originalTheme.barText, originalTheme.btnBg],
            font: quranSettings.fontFamily || originalTheme.font,
            isDark
        };
    } catch (e) {
        const defaultTheme = THEMES.black;
        return {
            ...defaultTheme,
            bgColor: '#ffffff',
            textColor: '#000000',
            text: '#000000',
            bg: '#ffffff',
            barBg: '#ffffff',
            barText: '#3b82f6',
            barBorder: '#3b82f6',
            accent: '#3b82f6',
            palette: ['#3b82f6', '#3b82f6', '#ffffff'],
            font: 'var(--font-amiri)',
            isDark: false
        };
    }
};

export let searchCache = {
    query: '',
    activeTab: 'all' as 'all' | 'quran' | 'athkar' | 'dua' | 'nawawi' | 'hisn',
    quranResults: [] as any[],
    athkarResults: [] as any[],
    duaResults: [] as any[],
    hisnResults: [] as any[],
    nawawiResults: [] as any[],
};

export const clearSearchCache = () => {
    searchCache = {
        query: '',
        activeTab: 'all',
        quranResults: [],
        athkarResults: [],
        duaResults: [],
        hisnResults: [],
        nawawiResults: [],
    };
};

interface GlobalSearchProps {
    onBack: () => void;
    onNavigate: (pageId: string, params?: any) => void;
    navParams?: any;
}

const GlobalSearch: React.FC<GlobalSearchProps> = ({ onBack, onNavigate, navParams }) => {
    const { theme: appTheme, themeKey, setCurrentPage } = useTheme();
    const { language } = useLanguage();
    const isEn = language === 'en';

    const isFromQuran = Boolean(
        navParams?.fromSidebar ||
        navParams?.from === 'quran' ||
        navParams?.from === 'quran-landscape' ||
        (typeof navParams?.from === 'string' && navParams.from.startsWith('quran'))
    );
    const isQuranLandscape = navParams?.from === 'quran-landscape';

    const [readerTheme, setReaderTheme] = useState(() => getReaderTheme(isQuranLandscape));
    const [initialHeight] = useState(() => typeof window !== 'undefined' ? window.innerHeight : 800);

    // Pre-fetch English Quran translation data if in English mode
    useEffect(() => {
        loadQuranEnglishTranslation();
    }, []);

    const handleBack = useCallback(() => {
        if (navParams?.fromSidebar) {
            onNavigate(navParams?.from || 'quran', { 
                openSidebar: true, 
                isWird: navParams?.isWird 
            });
        } else {
            onBack();
        }
    }, [navParams, onNavigate, onBack]);

    useEffect(() => {
        const interceptor = () => {
            handleBack();
            return true;
        };
        const unregister = registerBackInterceptor(interceptor);
        return unregister;
    }, [handleBack]);

    useEffect(() => {
        if (Capacitor.isNativePlatform()) {
            Keyboard.setScroll({ isDisabled: true });
        }
    }, []);
    
    useEffect(() => {
        setCurrentPage(isFromQuran ? (isQuranLandscape ? 'quran_search_landscape' : 'quran_search') : 'search');
        setReaderTheme(getReaderTheme(isQuranLandscape));
        
        const handleThemeChange = () => {
            setReaderTheme(getReaderTheme(isQuranLandscape));
        };
        
        window.addEventListener('theme-change', handleThemeChange);
        window.addEventListener('settings-change', handleThemeChange);
        return () => {
            window.removeEventListener('theme-change', handleThemeChange);
            window.removeEventListener('settings-change', handleThemeChange);
        };
    }, [setCurrentPage, isFromQuran, isQuranLandscape]);

    const isAppBlackTheme = themeKey === 'deep_black' || appTheme.bgColor === '#000000' || appTheme.name === 'اسود' || appTheme.name === 'أبيض وأسود';
    const appIsDark = Boolean(isAppBlackTheme || appTheme.isDark);
    const appAccent = isAppBlackTheme ? '#FFFFFF' : (appTheme.accent || appTheme.palette?.[0] || '#D97706');
    const appBgColor = isAppBlackTheme ? '#000000' : (appTheme.bgColor || '#FEF9C3');
    const appTextColor = isAppBlackTheme ? '#FFFFFF' : (appTheme.textColor || '#000000');

    const appSearchTheme = {
        ...appTheme,
        bgColor: appBgColor,
        bg: appBgColor,
        textColor: appTextColor,
        text: appTextColor,
        accent: appAccent,
        accentText: isAppBlackTheme ? '#000000' : '#ffffff',
        palette: [appAccent, ...(appTheme.palette || [appAccent])],
        btnBg: appIsDark ? (isAppBlackTheme ? '#18181b' : 'rgba(255,255,255,0.08)') : '#ffffff',
        btnText: appTextColor,
        isDark: appIsDark,
    };

    const theme = isFromQuran ? readerTheme : appSearchTheme;
    const accentBadgeText = (theme.accent || theme.palette?.[0] || '').toUpperCase() === '#FFFFFF' ? '#000000' : '#ffffff';
    const [query, setQuery] = useState(searchCache.query);
    const [activeTab, setActiveTab] = useState(searchCache.activeTab);
    
    const [quranResults, setQuranResults] = useState<any[]>(searchCache.quranResults);
    const [athkarResults, setAthkarResults] = useState<any[]>(searchCache.athkarResults);
    const [duaResults, setDuaResults] = useState<any[]>(searchCache.duaResults);
    const [hisnResults, setHisnResults] = useState<any[]>(searchCache.hisnResults);
    const [nawawiResults, setNawawiResults] = useState<any[]>(searchCache.nawawiResults);
    const [isSearching, setIsSearching] = useState(false);
    const [expandedSurahs, setExpandedSurahs] = useState<Record<number, boolean>>({});
    const [expandedCategories, setExpandedCategories] = useState<{quran: boolean, dua: boolean, athkar: boolean, hisn: boolean, nawawi: boolean}>({quran: false, dua: false, athkar: false, hisn: false, nawawi: false});
    
    useEffect(() => {
        const numSurahs = new Set(quranResults.map(r => r.surah)).size;
        if (numSurahs > 0 && numSurahs <= 5) {
            const initialExpanded: Record<number, boolean> = {};
            new Set(quranResults.map(r => r.surah)).forEach(sNum => initialExpanded[sNum as number] = true);
            setExpandedSurahs(initialExpanded);
        } else if (numSurahs > 0) {
            const initialExpanded: Record<number, boolean> = {};
            const firstSurah = Array.from(new Set(quranResults.map(r => r.surah)))[0] as number;
            initialExpanded[firstSurah] = true;
            setExpandedSurahs(initialExpanded);
        } else {
            setExpandedSurahs({});
        }
    }, [quranResults]);

    const toggleSurah = (surahNum: number) => {
        setExpandedSurahs(prev => ({ ...prev, [surahNum]: !prev[surahNum] }));
    };
    
    const searchTimeoutRef = useRef<any>(null);

    const stripTajweedTags = (text: string) => {
        return text;
    };

    const fixQuranText = (text: string) => {
        if (!text) return "";
        return text.replace(/۞/g, '');
    };

    const normalizeArabic = (text: string) => {
        if (!text) return '';
        let normalized = stripTajweedTags(text);
        return normalized
            .replace(/\u0670/g, "ا")
            .replace(/\u06E6/g, "ي")
            .replace(/\u06E5/g, "و")
            .replace(/[\u0610-\u061A\u064B-\u065F\u06D6-\u06ED]/g, "")
            .replace(/\u0640/g, "")
            .replace(/[أإآٱ]/g, "ا")
            .replace(/ة/g, "ه")
            .replace(/[ىي]/g, "ي");
    };

    const performSearch = useCallback(async (currentQuery: string) => {
        const q = currentQuery.trim();
        if (!q) {
            setQuranResults([]);
            setAthkarResults([]);
            setDuaResults([]);
            setHisnResults([]);
            setNawawiResults([]);
            setIsSearching(false);
            
            searchCache.query = '';
            searchCache.quranResults = [];
            searchCache.athkarResults = [];
            searchCache.duaResults = [];
            searchCache.hisnResults = [];
            searchCache.nawawiResults = [];
            return;
        }

        setIsSearching(true);

        const hasLatinChars = /[a-zA-Z]/.test(q);
        const isEnglishSearch = isEn || hasLatinChars;

        // Ensure English Quran translation is loaded if needed
        let enQuranData = getCachedQuranEnglishTranslation();
        if (!enQuranData) {
            enQuranData = await loadQuranEnglishTranslation();
        }

        const normQ = normalizeArabic(q);
        
        // Regex for Quran Arabic text
        const gap = '[\\u0610-\\u061A\\u064B-\\u065F\\u0670\\u06D6-\\u06ED\\u0640]*';
        const highlightPattern = normQ.split('').map(c => (
            c === 'ا' ? '[أإآٱا]' : 
            (c === 'ه' ? '[هة]' : 
            (c === 'ي' ? '[يى]' : c.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')))
        )).join(gap);
        
        let arabicRegex: RegExp | null = null;
        try {
            arabicRegex = new RegExp(highlightPattern, 'gi');
        } catch (e) {
            arabicRegex = null;
        }

        // Regex for English text
        const englishWords = q
            .toLowerCase()
            .split(/\s+/)
            .map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
            .filter(Boolean);
        
        let englishRegex: RegExp | null = null;
        if (englishWords.length > 0) {
            try {
                englishRegex = new RegExp(`(${englishWords.join('|')})`, 'gi');
            } catch (e) {
                englishRegex = null;
            }
        }

        const isNumberSearch = /^[0-9\u0660-\u0669]+$/.test(q);
        const searchNum = isNumberSearch ? parseInt(q.replace(/[٠-٩]/g, d => '0123456789'['٠١٢٣٤٥٦٧٨٩'.indexOf(d)]), 10) : -1;

        // 1. Search Quran (English Translation or Arabic Quran)
        const foundQuran: any[] = [];
        const seenAyahKeys = new Set<string>();

        if (hasLatinChars && enQuranData && enQuranData.length > 0) {
            // Search English Translation in en.json
            const enResults = searchQuranEnglish(q, enQuranData, quranData);
            enResults.forEach(item => {
                const key = `${item.surah}:${item.ayah}`;
                if (!seenAyahKeys.has(key)) {
                    seenAyahKeys.add(key);
                    foundQuran.push(item);
                }
            });
        } else {
            // Search Arabic Quran or Ayah number
            if (arabicRegex || isNumberSearch) {
                for (let sIdx = 0; sIdx < quranData.surahs.length; sIdx++) {
                    const surah = quranData.surahs[sIdx];
                    for (let aIdx = 0; aIdx < surah.ayahs.length; aIdx++) {
                        const ayah = surah.ayahs[aIdx];
                        const key = `${surah.number}:${ayah.numberInSurah}`;
                        const enVerse = enQuranData?.[sIdx]?.verses?.[aIdx];
                        const enTransText = enVerse?.translation || '';
                        const surahNameEn = SURAH_NAMES_EN[surah.number - 1] || surah.name;

                        if (isNumberSearch && ayah.numberInSurah === searchNum) {
                            seenAyahKeys.add(key);
                            foundQuran.push({ 
                                type: 'quran',
                                text: fixQuranText(ayah.text), 
                                textEn: enTransText,
                                surah: surah.number, 
                                surahName: surah.name, 
                                surahNameEn,
                                ayah: ayah.numberInSurah, 
                                page: ayah.page,
                                juz: ayah.juz,
                                highlightRegex: null
                            });
                        } else if (!isNumberSearch && arabicRegex) {
                            const cleanText = stripTajweedTags(ayah.text);
                            if (arabicRegex.test(cleanText)) {
                                seenAyahKeys.add(key);
                                foundQuran.push({ 
                                    type: 'quran',
                                    text: fixQuranText(ayah.text), 
                                    textEn: enTransText,
                                    surah: surah.number, 
                                    surahName: surah.name, 
                                    surahNameEn,
                                    ayah: ayah.numberInSurah, 
                                    page: ayah.page,
                                    juz: ayah.juz,
                                    highlightRegex: isEnglishSearch && enTransText ? englishRegex : arabicRegex
                                });
                            }
                        }
                    }
                }
            }

            // If in English UI and query also matched any translation terms
            if (isEn && !isNumberSearch && enQuranData && enQuranData.length > 0) {
                const enExtra = searchQuranEnglish(q, enQuranData, quranData);
                enExtra.forEach(item => {
                    const key = `${item.surah}:${item.ayah}`;
                    if (!seenAyahKeys.has(key)) {
                        seenAyahKeys.add(key);
                        foundQuran.push(item);
                    }
                });
            }
        }

        // Helpers for matching other texts
        const searchWordsAr = normQ.split(/\s+/).filter(Boolean);
        const matchArabic = (text: string) => {
            if (!text) return false;
            const normText = normalizeArabic(text);
            return searchWordsAr.every(word => normText.includes(word));
        };

        const matchEnglish = (text: string) => {
            if (!text || englishWords.length === 0) return false;
            const lower = text.toLowerCase();
            return englishWords.every(word => lower.includes(word));
        };

        const matchItem = (arText: string, enText?: string, arExtra?: string, enExtra?: string) => {
            if (hasLatinChars) {
                return matchEnglish(enText || '') || matchEnglish(enExtra || '');
            }
            if (isEn) {
                return (
                    matchEnglish(enText || '') || 
                    matchEnglish(enExtra || '') || 
                    matchArabic(arText) || 
                    (arExtra ? matchArabic(arExtra) : false)
                );
            }
            return matchArabic(arText) || (arExtra ? matchArabic(arExtra) : false);
        };

        const activeHighlightRegex = hasLatinChars || isEn ? englishRegex : arabicRegex;

        // 2. Search Athkar
        const foundAthkar: any[] = [];
        BASE_ADHKAR_MORNING.forEach((item, idx) => {
            const enTrans = ADKAR_EN_MAP[item.text] || ADKAR_EN_MAP[item.text.trim()];
            const enText = enTrans?.text || '';
            const enSource = enTrans?.source || '';
            if (matchItem(item.text, enText, '', enSource)) {
                foundAthkar.push({ 
                    type: 'athkar', 
                    kind: 'morning', 
                    text: item.text, 
                    textEn: enText,
                    source: item.source || '',
                    sourceEn: enSource,
                    id: idx,
                    highlightRegex: activeHighlightRegex 
                });
            }
        });
        BASE_ADHKAR_EVENING.forEach((item, idx) => {
            const enTrans = ADKAR_EN_MAP[item.text] || ADKAR_EN_MAP[item.text.trim()];
            const enText = enTrans?.text || '';
            const enSource = enTrans?.source || '';
            if (matchItem(item.text, enText, '', enSource)) {
                foundAthkar.push({ 
                    type: 'athkar', 
                    kind: 'evening', 
                    text: item.text, 
                    textEn: enText,
                    source: item.source || '',
                    sourceEn: enSource,
                    id: idx,
                    highlightRegex: activeHighlightRegex 
                });
            }
        });

        // 3. Search Dua (Adia and Ruqyah supplications)
        const foundDua: any[] = [];
        ALL_DUAA.forEach((item, idx) => {
            const enDua = ADIA_EN_MAP[item.id];
            const enText = enDua?.text || item.textEn || '';
            const enSource = enDua?.source || item.sourceEn || '';
            if (matchItem(item.text, enText, item.source, enSource)) {
                foundDua.push({ 
                    type: 'dua', 
                    text: item.text, 
                    textEn: enText,
                    source: item.source, 
                    sourceEn: enSource,
                    id: idx,
                    highlightRegex: activeHighlightRegex 
                });
            }
        });

        // Also search Ruqyah items under supplications
        RUQYAH_DATA.forEach((item) => {
            if (matchItem(item.text, item.textEn, item.source, item.sourceEn) || matchItem(item.title, item.titleEn)) {
                foundDua.push({
                    type: 'dua',
                    text: item.text,
                    textEn: item.textEn,
                    source: item.source,
                    sourceEn: item.sourceEn,
                    id: item.id,
                    targetPage: 'others',
                    highlightRegex: activeHighlightRegex
                });
            }
        });

        // 4. Search Hisn Al-Muslim
        const foundHisn: any[] = [];
        Object.keys(HISN_ALMUSLIM_DATA).forEach((catId) => {
            const category = HISN_ALMUSLIM_CATEGORIES.find(c => c.id === catId);
            const catEn = HISN_CATEGORIES_EN[catId];
            HISN_ALMUSLIM_DATA[catId as keyof typeof HISN_ALMUSLIM_DATA].forEach((item: any, itemIdx: number) => {
                const enKey = `${catId}_${itemIdx}`;
                const enItem = HISN_ITEMS_EN[enKey];
                const enText = enItem?.text || '';
                const enTitle = enItem?.title || catEn?.title || '';
                const enSource = enItem?.source || '';
                if (matchItem(item.text, enText, category?.title, enTitle) || (catEn && matchItem('', catEn.subtitle))) {
                    foundHisn.push({ 
                        type: 'hisn', 
                        text: item.text, 
                        textEn: enText,
                        title: category?.title || 'حصن المسلم', 
                        titleEn: catEn?.title || 'Hisn Al-Muslim',
                        source: item.source || '',
                        sourceEn: enSource,
                        id: item.id || enKey,
                        highlightRegex: activeHighlightRegex 
                    });
                }
            });
        });

        // 5. Search Nawawi
        const foundNawawi: any[] = [];
        NAWAWI_DATA.forEach((item) => {
            if (matchArabic(item.hadith) || matchArabic(item.title) || (hasLatinChars && matchEnglish(item.title))) {
                foundNawawi.push({ 
                    type: 'nawawi', 
                    hadith: item.hadith, 
                    title: item.title, 
                    id: item.id,
                    highlightRegex: arabicRegex
                });
            }
        });

        setQuranResults(foundQuran);
        setAthkarResults(foundAthkar);
        setDuaResults(foundDua);
        setHisnResults(foundHisn);
        setNawawiResults(foundNawawi);
        setIsSearching(false);
        
        searchCache.query = q;
        searchCache.quranResults = foundQuran;
        searchCache.athkarResults = foundAthkar;
        searchCache.duaResults = foundDua;
        searchCache.hisnResults = foundHisn;
        searchCache.nawawiResults = foundNawawi;
    }, [isEn]);

    useEffect(() => {
        searchCache.activeTab = activeTab;
    }, [activeTab]);

    useEffect(() => {
        if (query === searchCache.query && searchCache.quranResults.length > 0) {
            return;
        }

        if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
        if (query.trim() === '') {
            setQuranResults([]);
            setAthkarResults([]);
            setDuaResults([]);
            setHisnResults([]);
            setNawawiResults([]);
            setIsSearching(false);
            
            searchCache.query = '';
            searchCache.quranResults = [];
            searchCache.athkarResults = [];
            searchCache.duaResults = [];
            searchCache.hisnResults = [];
            searchCache.nawawiResults = [];
            return;
        }
        setIsSearching(true);
        searchTimeoutRef.current = setTimeout(() => {
            performSearch(query);
        }, 350);
    }, [query, performSearch]);

    const highlightText = (text: string, regex: RegExp | null) => {
        if (!text) return null;
        if (!regex) return <span>{text}</span>;
        try {
            const parts: React.ReactNode[] = [];
            let lastIndex = 0;
            const globalRegex = new RegExp(regex.source, regex.flags.includes('g') ? regex.flags : regex.flags + 'g');
            let match: RegExpExecArray | null;
            let safety = 0;
            while ((match = globalRegex.exec(text)) !== null && safety < 100) {
                safety++;
                if (match.index > lastIndex) {
                    parts.push(text.substring(lastIndex, match.index));
                }
                parts.push(
                    <span 
                        key={`${match.index}-${safety}`} 
                        style={{ color: theme.accent || theme.palette[0] }} 
                        className="font-bold underline decoration-2 bg-yellow-400/20 px-0.5 rounded"
                    >
                        {match[0]}
                    </span>
                );
                lastIndex = globalRegex.lastIndex;
                if (match[0].length === 0) {
                    globalRegex.lastIndex++;
                }
            }
            if (lastIndex < text.length) {
                parts.push(text.substring(lastIndex));
            }
            return <>{parts.length > 0 ? parts : text}</>;
        } catch(e) {
            return <span>{text}</span>;
        }
    };

    const totalResults = quranResults.length + athkarResults.length + duaResults.length + hisnResults.length + nawawiResults.length;

    const renderResults = () => {
        if (isSearching) {
            return (
                <div className="flex flex-col items-center justify-center py-20 opacity-60">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 mb-4" style={{ borderBottomColor: theme.accent || theme.palette[0] }}></div>
                    <p className="font-bold">{isEn ? "Searching..." : "جاري البحث..."}</p>
                </div>
            );
        }

        if (query && totalResults === 0) {
            return (
                <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
                    <div 
                        className="w-20 h-20 rounded-3xl flex items-center justify-center mb-5 quran-raised-card border-0" 
                        style={{ backgroundColor: theme.isDark ? 'rgba(255,255,255,0.06)' : (theme.btnBg || '#ffffff'), border: 'none' }}
                    >
                        <Search className="w-10 h-10 quran-3d-icon opacity-50" style={{ color: theme.accent || theme.palette[0] }} />
                    </div>
                    <p className="font-bold text-sm sm:text-base opacity-75" style={{ color: theme.textColor }}>
                        {isEn ? "No results found for your search" : "لا توجد نتائج لبحثك"}
                    </p>
                </div>
            );
        }

        if (!query) {
            return (
                <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
                    <div 
                        className="w-20 h-20 rounded-3xl flex items-center justify-center mb-5 quran-raised-card border-0" 
                        style={{ backgroundColor: theme.isDark ? 'rgba(255,255,255,0.06)' : (theme.btnBg || '#ffffff'), border: 'none' }}
                    >
                        <Search className="w-10 h-10 quran-3d-icon opacity-75" style={{ color: theme.accent || theme.palette[0] }} />
                    </div>
                    <p className="font-bold text-sm sm:text-base leading-relaxed opacity-75 max-w-sm" style={{ color: theme.textColor }}>
                        {isEn ? (
                            <>
                                Search for a verse, English translation, or ayah number<br/>
                                or search across adhkar, supplications, and Hisn Al-Muslim
                            </>
                        ) : (
                            <>
                                ابحث عن آية أو رقمها أو ترجمتها<br/>
                                أو ابحث في الأذكار والأدعية وحصن المسلم
                            </>
                        )}
                    </p>
                </div>
            );
        }

        const showQuran = activeTab === 'all' || activeTab === 'quran';
        const showAthkar = activeTab === 'all' || activeTab === 'athkar';
        const showDua = activeTab === 'all' || activeTab === 'dua';
        const showHisn = activeTab === 'all' || activeTab === 'hisn';
        const showNawawi = activeTab === 'all' || activeTab === 'nawawi';
        
        const groupedQuran = quranResults.reduce((acc, r) => {
            if (!acc[r.surah]) acc[r.surah] = { surahName: r.surahName, surahNameEn: r.surahNameEn, ayahs: [] };
            acc[r.surah].ayahs.push(r);
            return acc;
        }, {} as Record<number, { surahName: string, surahNameEn?: string, ayahs: any[] }>);
        const sortedQuranSurahs = Object.keys(groupedQuran).map(Number).sort((a, b) => a - b);

        return (
            <div className="space-y-4 pb-20">
                {showQuran && quranResults.length > 0 && (
                    <div className="space-y-3">
                        {activeTab === 'all' ? (
                            <div className="mb-3 rounded-2xl quran-raised-card overflow-hidden border-0" style={{ backgroundColor: theme.isDark ? 'rgba(255,255,255,0.03)' : (theme.btnBg || '#ffffff'), border: 'none' }}>
                                <button 
                                    onClick={() => setExpandedCategories(p => ({ ...p, quran: !p.quran }))}
                                    className="w-full flex justify-between items-center p-4 transition-all quran-raised-btn border-0 rounded-2xl cursor-pointer"
                                    style={{ backgroundColor: theme.isDark ? 'rgba(255,255,255,0.06)' : (theme.btnBg || '#ffffff'), color: theme.textColor, border: 'none' }}
                                >
                                    <h4 className="font-bold text-base flex items-center gap-2.5" style={{ color: theme.accent || theme.palette[0] }}>
                                        <BookOpen className="w-5 h-5 quran-3d-icon" /> 
                                        {isEn ? "The Holy Quran" : "القرآن الكريم"}
                                    </h4>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-bold px-2.5 py-0.5 rounded-full quran-raised-card border-0" style={{ backgroundColor: theme.accent || theme.palette[0], color: accentBadgeText, border: 'none' }}>
                                            {isEn ? quranResults.length : toArabic(quranResults.length)}
                                        </span>
                                        <ChevronLeft className={`w-5 h-5 transition-transform quran-3d-icon ${expandedCategories.quran ? (isEn ? 'rotate-90' : '-rotate-90') : (isEn ? 'rotate-180' : '')}`} />
                                    </div>
                                </button>
                                {expandedCategories.quran && (
                                    <div className="p-3 space-y-2.5" style={{ backgroundColor: theme.isDark ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.015)' }}>
                                        {sortedQuranSurahs.map(surahNum => {
                                            const group = groupedQuran[surahNum];
                                            const isExpanded = expandedSurahs[surahNum];
                                            const surahDisplayName = isEn 
                                                ? `Surah ${group.surahNameEn || SURAH_NAMES_EN[surahNum - 1] || group.surahName}` 
                                                : `سورة ${group.surahName}`;
                                            return (
                                                <div key={surahNum} className="rounded-2xl quran-raised-card overflow-hidden border-0 mb-2" style={{ backgroundColor: theme.isDark ? 'rgba(255,255,255,0.04)' : '#ffffff', border: 'none' }}>
                                                    <button 
                                                        onClick={() => toggleSurah(surahNum)}
                                                        className="w-full flex justify-between items-center p-3.5 transition-all quran-raised-btn border-0 rounded-2xl cursor-pointer"
                                                        style={{ backgroundColor: theme.isDark ? 'rgba(255,255,255,0.06)' : '#ffffff', color: theme.textColor, border: 'none' }}
                                                    >
                                                        <h4 className={`${isEn ? 'font-bold' : 'font-amiri-quran'} text-base font-bold`} style={{ color: theme.accent || theme.palette[0] }}>
                                                            {surahDisplayName}
                                                        </h4>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xs font-bold px-2 py-0.5 rounded-full quran-raised-card border-0" style={{ backgroundColor: theme.accent || theme.palette[0], color: accentBadgeText, border: 'none' }}>
                                                                {isEn ? group.ayahs.length : toArabic(group.ayahs.length)}
                                                            </span>
                                                            <ChevronLeft className={`w-4 h-4 transition-transform quran-3d-icon ${isExpanded ? (isEn ? 'rotate-90' : '-rotate-90') : (isEn ? 'rotate-180' : '')}`} />
                                                        </div>
                                                    </button>
                                                    
                                                    {isExpanded && (
                                                        <div className="p-2 space-y-2" style={{ backgroundColor: theme.isDark ? 'rgba(0,0,0,0.15)' : 'rgba(0,0,0,0.01)' }}>
                                                            {group.ayahs.map((r, idx) => (
                                                                <button 
                                                                    key={`quran-${surahNum}-${idx}`} 
                                                                    className={`w-full ${isEn ? 'text-left' : 'text-right'} p-3.5 rounded-2xl quran-raised-card border-0 transition-all active:scale-[0.98] cursor-pointer`}
                                                                    style={{ backgroundColor: theme.isDark ? 'rgba(255,255,255,0.05)' : '#ffffff', color: theme.textColor, border: 'none' }}
                                                                    onClick={() => onNavigate('quran', { surah: r.surah, ayah: r.ayah, readingMode: isEn ? 'translation' : undefined })}
                                                                >
                                                                    <div className="text-[11px] opacity-60 mb-1.5 flex items-center gap-1.5 font-bold">
                                                                        <span>{isEn ? `Verse ${r.ayah}` : `آية ${toArabic(r.ayah)}`}</span>
                                                                        <span>•</span>
                                                                        <span>{isEn ? `Juz ${r.juz}` : `جزء ${toArabic(r.juz)}`}</span>
                                                                        <span>•</span>
                                                                        <span>{isEn ? `Page ${r.page}` : `صفحة ${toArabic(r.page)}`}</span>
                                                                    </div>
                                                                    {isEn ? (
                                                                        <div className="space-y-1.5">
                                                                            <div className="text-sm font-medium leading-relaxed" style={{ color: theme.textColor }}>
                                                                                {highlightText(r.textEn || r.text, r.highlightRegex)}
                                                                            </div>
                                                                            <div className="font-amiri-quran text-sm opacity-70 leading-loose text-right" dir="rtl">
                                                                                {r.text}
                                                                            </div>
                                                                        </div>
                                                                    ) : (
                                                                        <div className="font-amiri-quran text-base leading-loose" dir="rtl">
                                                                            {highlightText(r.text, r.highlightRegex)}
                                                                        </div>
                                                                    )}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <>
                                <div className="flex items-center gap-2 mb-2 px-1">
                                    <span className="p-2 rounded-xl quran-raised-card border-0" style={{ backgroundColor: `${theme.accent || theme.palette[0]}18`, color: theme.accent || theme.palette[0], border: 'none' }}>
                                        <BookOpen className="w-4 h-4 quran-3d-icon" />
                                    </span>
                                    <h3 className="font-bold text-sm opacity-90" style={{ color: theme.textColor }}>
                                        {isEn ? `The Holy Quran (${quranResults.length})` : `القرآن الكريم (${toArabic(quranResults.length)})`}
                                    </h3>
                                </div>
                                {sortedQuranSurahs.map(surahNum => {
                                    const group = groupedQuran[surahNum];
                                    const isExpanded = expandedSurahs[surahNum];
                                    const surahDisplayName = isEn 
                                        ? `Surah ${group.surahNameEn || SURAH_NAMES_EN[surahNum - 1] || group.surahName}` 
                                        : `سورة ${group.surahName}`;
                                    return (
                                        <div key={surahNum} className="mb-2.5 rounded-2xl quran-raised-card overflow-hidden border-0" style={{ backgroundColor: theme.isDark ? 'rgba(255,255,255,0.04)' : '#ffffff', border: 'none' }}>
                                            <button 
                                                onClick={() => toggleSurah(surahNum)}
                                                className="w-full flex justify-between items-center p-3.5 transition-all quran-raised-btn border-0 rounded-2xl cursor-pointer"
                                                style={{ backgroundColor: theme.isDark ? 'rgba(255,255,255,0.06)' : '#ffffff', color: theme.textColor, border: 'none' }}
                                            >
                                                <h4 className={`${isEn ? 'font-bold' : 'font-amiri-quran'} text-base font-bold`} style={{ color: theme.accent || theme.palette[0] }}>
                                                    {surahDisplayName}
                                                </h4>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full quran-raised-card border-0" style={{ backgroundColor: theme.accent || theme.palette[0], color: accentBadgeText, border: 'none' }}>
                                                        {isEn ? group.ayahs.length : toArabic(group.ayahs.length)}
                                                    </span>
                                                    <ChevronLeft className={`w-4 h-4 transition-transform quran-3d-icon ${isExpanded ? (isEn ? 'rotate-90' : '-rotate-90') : (isEn ? 'rotate-180' : '')}`} />
                                                </div>
                                            </button>
                                            
                                            {isExpanded && (
                                                <div className="p-2.5 space-y-2" style={{ backgroundColor: theme.isDark ? 'rgba(0,0,0,0.15)' : 'rgba(0,0,0,0.015)' }}>
                                                    {group.ayahs.map((r, idx) => (
                                                        <button 
                                                            key={`quran-${surahNum}-${idx}`} 
                                                            className={`w-full ${isEn ? 'text-left' : 'text-right'} p-3.5 rounded-2xl quran-raised-card border-0 transition-all active:scale-[0.98] cursor-pointer`}
                                                            style={{ backgroundColor: theme.isDark ? 'rgba(255,255,255,0.05)' : '#ffffff', color: theme.textColor, border: 'none' }}
                                                            onClick={() => onNavigate('quran', { surah: r.surah, ayah: r.ayah, readingMode: isEn ? 'translation' : undefined })}
                                                        >
                                                            <div className="text-[11px] opacity-60 mb-1.5 flex items-center gap-1.5 font-bold">
                                                                <span>{isEn ? `Verse ${r.ayah}` : `آية ${toArabic(r.ayah)}`}</span>
                                                                <span>•</span>
                                                                <span>{isEn ? `Juz ${r.juz}` : `جزء ${toArabic(r.juz)}`}</span>
                                                                <span>•</span>
                                                                <span>{isEn ? `Page ${r.page}` : `صفحة ${toArabic(r.page)}`}</span>
                                                            </div>
                                                            {isEn ? (
                                                                <div className="space-y-1.5">
                                                                    <div className="text-sm font-medium leading-relaxed" style={{ color: theme.textColor }}>
                                                                        {highlightText(r.textEn || r.text, r.highlightRegex)}
                                                                    </div>
                                                                    <div className="font-amiri-quran text-sm opacity-70 leading-loose text-right" dir="rtl">
                                                                        {r.text}
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <div className="font-amiri-quran text-base leading-loose" dir="rtl">
                                                                    {highlightText(r.text, r.highlightRegex)}
                                                                </div>
                                                            )}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </>
                        )}
                    </div>
                )}

                {showDua && duaResults.length > 0 && (
                    <div className="space-y-3 mt-4">
                        {activeTab === 'all' ? (
                            <div className="mb-3 rounded-2xl quran-raised-card overflow-hidden border-0" style={{ backgroundColor: theme.isDark ? 'rgba(255,255,255,0.03)' : (theme.btnBg || '#ffffff'), border: 'none' }}>
                                <button 
                                    onClick={() => setExpandedCategories(p => ({ ...p, dua: !p.dua }))}
                                    className="w-full flex justify-between items-center p-4 transition-all quran-raised-btn border-0 rounded-2xl cursor-pointer"
                                    style={{ backgroundColor: theme.isDark ? 'rgba(255,255,255,0.06)' : (theme.btnBg || '#ffffff'), color: theme.textColor, border: 'none' }}
                                >
                                    <h4 className="font-bold text-base flex items-center gap-2.5" style={{ color: theme.accent || theme.palette[0] }}>
                                        <Heart className="w-5 h-5 quran-3d-icon" /> 
                                        {isEn ? "Supplications (Duas)" : "الأدعية"}
                                    </h4>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-bold px-2.5 py-0.5 rounded-full quran-raised-card border-0" style={{ backgroundColor: theme.accent || theme.palette[0], color: accentBadgeText, border: 'none' }}>
                                            {isEn ? duaResults.length : toArabic(duaResults.length)}
                                        </span>
                                        <ChevronLeft className={`w-5 h-5 transition-transform quran-3d-icon ${expandedCategories.dua ? (isEn ? 'rotate-90' : '-rotate-90') : (isEn ? 'rotate-180' : '')}`} />
                                    </div>
                                </button>
                                {expandedCategories.dua && (
                                    <div className="p-3 space-y-2.5" style={{ backgroundColor: theme.isDark ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.015)' }}>
                                        {duaResults.map((r, idx) => (
                                            <button 
                                                key={`dua-${idx}`} 
                                                className={`w-full ${isEn ? 'text-left' : 'text-right'} p-3.5 rounded-2xl quran-raised-card border-0 transition-all active:scale-[0.98] cursor-pointer`}
                                                onClick={() => onNavigate(r.targetPage || 'adia')}
                                                style={{ backgroundColor: theme.isDark ? 'rgba(255,255,255,0.05)' : '#ffffff', color: theme.textColor, border: 'none' }}
                                            >
                                                <div className={`${isEn ? 'text-sm font-medium' : 'font-qalam text-base'} leading-relaxed mb-1 line-clamp-2`} style={{ color: theme.accent || theme.palette[0] }}>
                                                    {highlightText(isEn ? (r.textEn || r.text) : r.text, r.highlightRegex)}
                                                </div>
                                                <div className="text-[10px] opacity-60 font-bold">
                                                    {isEn ? (r.sourceEn || r.source) : r.source}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <>
                                <div className="flex items-center gap-2 mb-2 px-1">
                                    <span className="p-2 rounded-xl quran-raised-card border-0" style={{ backgroundColor: `${theme.accent || theme.palette[0]}18`, color: theme.accent || theme.palette[0], border: 'none' }}>
                                        <Heart className="w-4 h-4 quran-3d-icon" />
                                    </span>
                                    <h3 className="font-bold text-sm opacity-90" style={{ color: theme.textColor }}>
                                        {isEn ? `Supplications (${duaResults.length})` : `الأدعية (${toArabic(duaResults.length)})`}
                                    </h3>
                                </div>
                                {duaResults.map((r, idx) => (
                                    <button 
                                        key={`dua-${idx}`} 
                                        className={`w-full ${isEn ? 'text-left' : 'text-right'} p-4 rounded-2xl quran-raised-card border-0 transition-all active:scale-[0.98] cursor-pointer mb-2.5`}
                                        style={{ backgroundColor: theme.isDark ? 'rgba(255,255,255,0.05)' : '#ffffff', color: theme.textColor, border: 'none' }}
                                        onClick={() => onNavigate(r.targetPage || 'adia')}
                                    >
                                        <div className={`${isEn ? 'text-sm font-medium' : 'font-qalam text-base'} leading-relaxed mb-2`} style={{ color: theme.accent || theme.palette[0] }}>
                                            {highlightText(isEn ? (r.textEn || r.text) : r.text, r.highlightRegex)}
                                        </div>
                                        <div className="text-xs opacity-60 font-bold">
                                            {isEn ? (r.sourceEn || r.source) : r.source}
                                        </div>
                                    </button>
                                ))}
                            </>
                        )}
                    </div>
                )}

                {showAthkar && athkarResults.length > 0 && (
                    <div className="space-y-3 mt-4">
                        {activeTab === 'all' ? (
                            <div className="mb-3 rounded-2xl quran-raised-card overflow-hidden border-0" style={{ backgroundColor: theme.isDark ? 'rgba(255,255,255,0.03)' : (theme.btnBg || '#ffffff'), border: 'none' }}>
                                <button 
                                    onClick={() => setExpandedCategories(p => ({ ...p, athkar: !p.athkar }))}
                                    className="w-full flex justify-between items-center p-4 transition-all quran-raised-btn border-0 rounded-2xl cursor-pointer"
                                    style={{ backgroundColor: theme.isDark ? 'rgba(255,255,255,0.06)' : (theme.btnBg || '#ffffff'), color: theme.textColor, border: 'none' }}
                                >
                                    <h4 className="font-bold text-base flex items-center gap-2.5" style={{ color: theme.accent || theme.palette[0] }}>
                                        <Sun className="w-5 h-5 quran-3d-icon" /> 
                                        {isEn ? "Adhkar (Remembrances)" : "الأذكار"}
                                    </h4>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-bold px-2.5 py-0.5 rounded-full quran-raised-card border-0" style={{ backgroundColor: theme.accent || theme.palette[0], color: accentBadgeText, border: 'none' }}>
                                            {isEn ? athkarResults.length : toArabic(athkarResults.length)}
                                        </span>
                                        <ChevronLeft className={`w-5 h-5 transition-transform quran-3d-icon ${expandedCategories.athkar ? (isEn ? 'rotate-90' : '-rotate-90') : (isEn ? 'rotate-180' : '')}`} />
                                    </div>
                                </button>
                                {expandedCategories.athkar && (
                                    <div className="p-3 space-y-2.5" style={{ backgroundColor: theme.isDark ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.015)' }}>
                                        {athkarResults.map((r, idx) => (
                                            <button 
                                                key={`athkar-${idx}`} 
                                                className={`w-full ${isEn ? 'text-left' : 'text-right'} p-3.5 rounded-2xl quran-raised-card border-0 transition-all active:scale-[0.98] cursor-pointer`}
                                                onClick={() => onNavigate('sabah-masaa')}
                                                style={{ backgroundColor: theme.isDark ? 'rgba(255,255,255,0.05)' : '#ffffff', color: theme.textColor, border: 'none' }}
                                            >
                                                <div className="text-[10px] opacity-60 mb-1 font-bold flex items-center gap-1.5">
                                                    {r.kind === 'morning' ? <Sun className="w-3.5 h-3.5 quran-3d-icon" style={{ color: theme.accent || theme.palette[0] }} /> : <Moon className="w-3.5 h-3.5 quran-3d-icon" style={{ color: theme.accent || theme.palette[0] }} />}
                                                    <span>{r.kind === 'morning' ? (isEn ? 'Morning Adhkar' : 'أذكار الصباح') : (isEn ? 'Evening Adhkar' : 'أذكار المساء')}</span>
                                                </div>
                                                <div className={`${isEn ? 'text-sm font-medium' : 'font-qalam text-base'} leading-relaxed line-clamp-2`} style={{ color: theme.accent || theme.palette[0] }}>
                                                    {highlightText(isEn ? (r.textEn || r.text) : r.text, r.highlightRegex)}
                                                </div>
                                                {(r.sourceEn || r.source) && (
                                                    <div className="text-[10px] opacity-60 font-bold mt-1">
                                                        {isEn ? (r.sourceEn || r.source) : r.source}
                                                    </div>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <>
                                <div className="flex items-center gap-2 mb-2 px-1">
                                    <span className="p-2 rounded-xl quran-raised-card border-0" style={{ backgroundColor: `${theme.accent || theme.palette[0]}18`, color: theme.accent || theme.palette[0], border: 'none' }}>
                                        <Sun className="w-4 h-4 quran-3d-icon" />
                                    </span>
                                    <h3 className="font-bold text-sm opacity-90" style={{ color: theme.textColor }}>
                                        {isEn ? `Adhkar (${athkarResults.length})` : `الأذكار (${toArabic(athkarResults.length)})`}
                                    </h3>
                                </div>
                                {athkarResults.map((r, idx) => (
                                    <button 
                                        key={`athkar-${idx}`} 
                                        className={`w-full ${isEn ? 'text-left' : 'text-right'} p-4 rounded-2xl quran-raised-card border-0 transition-all active:scale-[0.98] cursor-pointer mb-2.5`}
                                        style={{ backgroundColor: theme.isDark ? 'rgba(255,255,255,0.05)' : '#ffffff', color: theme.textColor, border: 'none' }}
                                        onClick={() => onNavigate('sabah-masaa')}
                                    >
                                        <div className="text-[10px] opacity-60 mb-2 font-bold flex items-center gap-1.5">
                                            {r.kind === 'morning' ? <Sun className="w-3.5 h-3.5 quran-3d-icon" style={{ color: theme.accent || theme.palette[0] }} /> : <Moon className="w-3.5 h-3.5 quran-3d-icon" style={{ color: theme.accent || theme.palette[0] }} />}
                                            <span>{r.kind === 'morning' ? (isEn ? 'Morning Adhkar' : 'أذكار الصباح') : (isEn ? 'Evening Adhkar' : 'أذكار المساء')}</span>
                                        </div>
                                        <div className={`${isEn ? 'text-sm font-medium' : 'font-qalam text-base'} leading-relaxed mb-1`} style={{ color: theme.accent || theme.palette[0] }}>
                                            {highlightText(isEn ? (r.textEn || r.text) : r.text, r.highlightRegex)}
                                        </div>
                                        {(r.sourceEn || r.source) && (
                                            <div className="text-xs opacity-60 font-bold mt-1">
                                                {isEn ? (r.sourceEn || r.source) : r.source}
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </>
                        )}
                    </div>
                )}

                {showHisn && hisnResults.length > 0 && (
                    <div className="space-y-3 mt-4">
                        {activeTab === 'all' ? (
                            <div className="mb-3 rounded-2xl quran-raised-card overflow-hidden border-0" style={{ backgroundColor: theme.isDark ? 'rgba(255,255,255,0.03)' : (theme.btnBg || '#ffffff'), border: 'none' }}>
                                <button 
                                    onClick={() => setExpandedCategories(p => ({ ...p, hisn: !p.hisn }))}
                                    className="w-full flex justify-between items-center p-4 transition-all quran-raised-btn border-0 rounded-2xl cursor-pointer"
                                    style={{ backgroundColor: theme.isDark ? 'rgba(255,255,255,0.06)' : (theme.btnBg || '#ffffff'), color: theme.textColor, border: 'none' }}
                                >
                                    <h4 className="font-bold text-base flex items-center gap-2.5" style={{ color: theme.accent || theme.palette[0] }}>
                                        <BookOpen className="w-5 h-5 quran-3d-icon" /> 
                                        {isEn ? "Hisn Al-Muslim" : "حصن المسلم"}
                                    </h4>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-bold px-2.5 py-0.5 rounded-full quran-raised-card border-0" style={{ backgroundColor: theme.accent || theme.palette[0], color: accentBadgeText, border: 'none' }}>
                                            {isEn ? hisnResults.length : toArabic(hisnResults.length)}
                                        </span>
                                        <ChevronLeft className={`w-5 h-5 transition-transform quran-3d-icon ${expandedCategories.hisn ? (isEn ? 'rotate-90' : '-rotate-90') : (isEn ? 'rotate-180' : '')}`} />
                                    </div>
                                </button>
                                {expandedCategories.hisn && (
                                    <div className="p-3 space-y-2.5" style={{ backgroundColor: theme.isDark ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.015)' }}>
                                        {hisnResults.map((r, idx) => (
                                            <button 
                                                key={`hisn-${idx}`} 
                                                className={`w-full ${isEn ? 'text-left' : 'text-right'} p-3.5 rounded-2xl quran-raised-card border-0 transition-all active:scale-[0.98] cursor-pointer`}
                                                onClick={() => onNavigate('hisn-muslim')}
                                                style={{ backgroundColor: theme.isDark ? 'rgba(255,255,255,0.05)' : '#ffffff', color: theme.textColor, border: 'none' }}
                                            >
                                                <div className={`${isEn ? 'text-sm font-medium' : 'font-qalam text-base'} leading-relaxed mb-1 line-clamp-2`} style={{ color: theme.accent || theme.palette[0] }}>
                                                    {highlightText(isEn ? (r.textEn || r.text) : r.text, r.highlightRegex)}
                                                </div>
                                                <div className="text-[10px] opacity-60 font-bold">
                                                    {isEn ? (r.titleEn || r.title) : r.title}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <>
                                <div className="flex items-center gap-2 mb-2 px-1">
                                    <span className="p-2 rounded-xl quran-raised-card border-0" style={{ backgroundColor: `${theme.accent || theme.palette[0]}18`, color: theme.accent || theme.palette[0], border: 'none' }}>
                                        <BookOpen className="w-4 h-4 quran-3d-icon" />
                                    </span>
                                    <h3 className="font-bold text-sm opacity-90" style={{ color: theme.textColor }}>
                                        {isEn ? `Hisn Al-Muslim (${hisnResults.length})` : `حصن المسلم (${toArabic(hisnResults.length)})`}
                                    </h3>
                                </div>
                                {hisnResults.map((r, idx) => (
                                    <button 
                                        key={`hisn-${idx}`} 
                                        className={`w-full ${isEn ? 'text-left' : 'text-right'} p-4 rounded-2xl quran-raised-card border-0 transition-all active:scale-[0.98] cursor-pointer mb-2.5`}
                                        style={{ backgroundColor: theme.isDark ? 'rgba(255,255,255,0.05)' : '#ffffff', color: theme.textColor, border: 'none' }}
                                        onClick={() => onNavigate('hisn-muslim')}
                                    >
                                        <div className={`${isEn ? 'text-sm font-medium' : 'font-qalam text-base'} leading-relaxed mb-2`} style={{ color: theme.accent || theme.palette[0] }}>
                                            {highlightText(isEn ? (r.textEn || r.text) : r.text, r.highlightRegex)}
                                        </div>
                                        <div className="text-xs opacity-60 font-bold">
                                            {isEn ? (r.titleEn || r.title) : r.title}
                                        </div>
                                    </button>
                                ))}
                            </>
                        )}
                    </div>
                )}

                {showNawawi && nawawiResults.length > 0 && (
                    <div className="space-y-3 mt-4">
                        {activeTab === 'all' ? (
                            <div className="mb-3 rounded-2xl quran-raised-card overflow-hidden border-0" style={{ backgroundColor: theme.isDark ? 'rgba(255,255,255,0.03)' : (theme.btnBg || '#ffffff'), border: 'none' }}>
                                <button 
                                    onClick={() => setExpandedCategories(p => ({ ...p, nawawi: !p.nawawi }))}
                                    className="w-full flex justify-between items-center p-4 transition-all quran-raised-btn border-0 rounded-2xl cursor-pointer"
                                    style={{ backgroundColor: theme.isDark ? 'rgba(255,255,255,0.06)' : (theme.btnBg || '#ffffff'), color: theme.textColor, border: 'none' }}
                                >
                                    <h4 className="font-bold text-base flex items-center gap-2.5" style={{ color: theme.accent || theme.palette[0] }}>
                                        <BookOpen className="w-5 h-5 quran-3d-icon" /> 
                                        {isEn ? "An-Nawawi's 40 Hadiths" : "الأربعون النووية"}
                                    </h4>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-bold px-2.5 py-0.5 rounded-full quran-raised-card border-0" style={{ backgroundColor: theme.accent || theme.palette[0], color: accentBadgeText, border: 'none' }}>
                                            {isEn ? nawawiResults.length : toArabic(nawawiResults.length)}
                                        </span>
                                        <ChevronLeft className={`w-5 h-5 transition-transform quran-3d-icon ${expandedCategories.nawawi ? (isEn ? 'rotate-90' : '-rotate-90') : (isEn ? 'rotate-180' : '')}`} />
                                    </div>
                                </button>
                                {expandedCategories.nawawi && (
                                    <div className="p-3 space-y-2.5" style={{ backgroundColor: theme.isDark ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.015)' }}>
                                        {nawawiResults.map((r, idx) => (
                                            <button 
                                                key={`nawawi-${idx}`} 
                                                className={`w-full ${isEn ? 'text-left' : 'text-right'} p-3.5 rounded-2xl quran-raised-card border-0 transition-all active:scale-[0.98] cursor-pointer`}
                                                onClick={() => onNavigate('nawawi')}
                                                style={{ backgroundColor: theme.isDark ? 'rgba(255,255,255,0.05)' : '#ffffff', color: theme.textColor, border: 'none' }}
                                            >
                                                <div className="text-[11px] opacity-80 mb-1 font-bold" style={{ color: theme.textColor }}>
                                                    {r.title}
                                                </div>
                                                <div className="font-qalam text-base leading-relaxed line-clamp-2" style={{ color: theme.accent || theme.palette[0] }}>
                                                    {r.hadith}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <>
                                <div className="flex items-center gap-2 mb-2 px-1">
                                    <span className="p-2 rounded-xl quran-raised-card border-0" style={{ backgroundColor: `${theme.accent || theme.palette[0]}18`, color: theme.accent || theme.palette[0], border: 'none' }}>
                                        <BookOpen className="w-4 h-4 quran-3d-icon" />
                                    </span>
                                    <h3 className="font-bold text-sm opacity-90" style={{ color: theme.textColor }}>
                                        {isEn ? `An-Nawawi's 40 Hadiths (${nawawiResults.length})` : `الأربعون النووية (${toArabic(nawawiResults.length)})`}
                                    </h3>
                                </div>
                                {nawawiResults.map((r, idx) => (
                                    <button 
                                        key={`nawawi-${idx}`} 
                                        className={`w-full ${isEn ? 'text-left' : 'text-right'} p-4 rounded-2xl quran-raised-card border-0 transition-all active:scale-[0.98] cursor-pointer mb-2.5`}
                                        style={{ backgroundColor: theme.isDark ? 'rgba(255,255,255,0.05)' : '#ffffff', color: theme.textColor, border: 'none' }}
                                        onClick={() => onNavigate('nawawi')}
                                    >
                                        <div className="text-xs opacity-80 mb-2 font-bold" style={{ color: theme.textColor }}>
                                            {r.title}
                                        </div>
                                        <div className="font-qalam text-base leading-relaxed" style={{ color: theme.accent || theme.palette[0] }}>
                                            {r.hadith}
                                        </div>
                                    </button>
                                ))}
                            </>
                        )}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className={`fixed top-0 left-0 right-0 z-[1500] flex items-center justify-center overflow-hidden bg-black/40 backdrop-blur-sm ${theme.isDark ? 'dark' : ''}`} dir={isEn ? "ltr" : "rtl"} onClick={handleBack} style={{ height: `${initialHeight}px` }}>
            <div 
                className="w-full h-full max-w-lg md:max-w-2xl overflow-hidden shadow-2xl relative flex flex-col pointer-events-auto border-0" 
                dir={isEn ? "ltr" : "rtl"} 
                style={{ 
                    backgroundColor: theme.bgColor, 
                    border: 'none', 
                    outline: 'none' 
                }} 
                onClick={e => e.stopPropagation()}
            >
                
                {/* Full Screen Modal Header - Exactly matching SettingsModal */}
                <div className="p-3.5 flex items-center justify-center shrink-0 border-0" style={{ backgroundColor: theme.bgColor, paddingTop: 'calc(0.75rem + env(safe-area-inset-top))' }}>
                    <h3 
                        className="text-sm font-extrabold px-6 py-2 rounded-2xl quran-raised-card inline-flex items-center justify-center gap-2 tracking-wide border-0" 
                        style={{ 
                            backgroundColor: theme.isDark ? 'rgba(255,255,255,0.06)' : (theme.btnBg || '#ffffff'), 
                            color: theme.textColor, 
                            border: 'none' 
                        }}
                    >
                        <Search className="w-4 h-4 quran-3d-icon" style={{ color: theme.accent || theme.palette[0] }} />
                        <span>{isEn ? "Advanced Search" : "البحث المتقدم"}</span>
                    </h3>
                </div>

                {/* Sub-header with Search Input - Borderless & Sculpted */}
                <div className="p-4 shrink-0 z-10 border-0" style={{ backgroundColor: theme.bgColor }}>
                    <div className="relative">
                        <input 
                            type="text" 
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder={isEn ? "Search verse, translation, dhikr, dua, or Hisn al-Muslim..." : "ابحث عن آية، كلمة، ترجمة، ذكر، دعاء، أو حصن المسلم..."} 
                            className={`w-full p-3.5 rounded-2xl focus:outline-none font-bold quran-raised-card border-0 transition-all ${isEn ? 'pl-11 pr-11 text-left' : 'pr-11 pl-11 text-right'}`}
                            dir={isEn ? "ltr" : "rtl"}
                            style={{ 
                                backgroundColor: theme.isDark ? 'rgba(255,255,255,0.07)' : (theme.btnBg || '#ffffff'), 
                                color: theme.textColor,
                                border: 'none',
                                outline: 'none'
                            }}
                        />
                        <Search className={`absolute ${isEn ? 'left-4' : 'right-4'} top-1/2 transform -translate-y-1/2 opacity-70 quran-3d-icon`} style={{ color: theme.accent || theme.palette[0] }} />
                        {query && (
                            <button 
                                onClick={() => { setQuery(''); setTimeout(() => (document.querySelector('input') as HTMLElement)?.focus(), 10); }} 
                                className={`absolute ${isEn ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 p-2 rounded-xl quran-raised-btn border-0 cursor-pointer flex items-center justify-center`}
                                style={{ backgroundColor: theme.isDark ? 'rgba(255,255,255,0.08)' : '#f3f4f6', border: 'none' }}
                                title={isEn ? "Clear" : "مسح"}
                            >
                                <X className="w-3.5 h-3.5 quran-3d-icon" style={{ color: theme.accent || theme.palette[0] }} />
                            </button>
                        )}
                    </div>

                    {query && totalResults > 0 && (
                        <div className="flex overflow-x-auto gap-2.5 mt-3.5 pb-1 hide-scrollbar">
                            {[
                                { id: 'all', label: isEn ? `All (${totalResults})` : `الكل (${toArabic(totalResults)})` },
                                { id: 'quran', label: isEn ? `Quran (${quranResults.length})` : `القرآن (${toArabic(quranResults.length)})` },
                                { id: 'dua', label: isEn ? `Duas (${duaResults.length})` : `الأدعية (${toArabic(duaResults.length)})` },
                                { id: 'athkar', label: isEn ? `Adhkar (${athkarResults.length})` : `الأذكار (${toArabic(athkarResults.length)})` },
                                { id: 'hisn', label: isEn ? `Hisn (${hisnResults.length})` : `حصن (${toArabic(hisnResults.length)})` },
                            ].map(tab => {
                                const isSelected = activeTab === tab.id;
                                return (
                                    <button 
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id as any)}
                                        className={`px-4 py-2.5 rounded-2xl whitespace-nowrap text-xs font-bold transition-all border-0 cursor-pointer ${
                                            isSelected 
                                                ? 'quran-raised-btn-selected shadow-md' 
                                                : 'quran-raised-btn'
                                        }`}
                                        style={{ 
                                            backgroundColor: isSelected ? (theme.accent || theme.palette[0]) : (theme.isDark ? 'rgba(255,255,255,0.06)' : (theme.btnBg || '#ffffff')), 
                                            color: isSelected ? accentBadgeText : theme.textColor,
                                            border: 'none',
                                            outline: 'none'
                                        }}
                                    >
                                        {tab.label}
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Content */}
                <div 
                    className="flex-1 overflow-y-auto px-4 py-2" 
                    dir={isEn ? "ltr" : "rtl"} 
                    style={{ 
                        backgroundColor: theme.bgColor,
                        paddingBottom: '1rem'
                    }}
                >
                    {renderResults()}
                </div>

                {/* Footer - Matching SettingsModal */}
                <div 
                    className="p-3.5 flex gap-2 shrink-0 z-10 border-0" 
                    style={{ 
                        backgroundColor: theme.bgColor,
                        paddingBottom: 'calc(max(env(safe-area-inset-bottom, 0px), 56px) + 0.75rem)'
                    }}
                >
                    <button 
                        onClick={handleBack} 
                        className="flex-1 py-3.5 rounded-2xl text-xs font-bold w-full transition-all quran-raised-btn border-0 active:scale-[0.98] cursor-pointer"
                        style={{ 
                            backgroundColor: theme.btnBg || (theme.isDark ? 'rgba(255,255,255,0.08)' : '#ffffff'), 
                            color: theme.btnText || theme.textColor, 
                            border: 'none',
                            outline: 'none'
                        }}
                    >
                        {isEn ? "Back" : "رجوع"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default GlobalSearch;
