import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ChevronLeft, Search, BookOpen, Sun, Moon, Heart, Shield, Sparkles, UserCheck, Compass, Users, CheckCircle2, X } from 'lucide-react';
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
import { asmaulHusna } from '../data/asmaulHusnaData';
import { PROPHETIC_SEERAH_DATA, PROPHETIC_STANCES_DATA } from '../data/propheticSeerahData';
import { umrahVirtues, umrahSteps } from '../data/hajjUmrahData';
import { TEN_PROMISED_COMPANIONS } from '../data/tenPromisedData';
import { DIVINE_MIRACLES_DATA } from '../data/divineMiraclesData';
import { baseAthkar, fajrDhikr, fajrMaghribDhikr, specialZikr } from '../data/athkarAlSalahData';
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
import { getCalculator3DStyles } from '../utils/calculator3DStyles';
import './QuranReader.css';

// Helper to get reader theme
const getReaderTheme = (isLandscape = false) => {
    try {
        const suffix = isLandscape ? '_h' : '_v';
        const themeId = getQuranThemeIdForLayout(suffix);
        const quranSettings = getQuranSettingsForLayout(suffix) || {};
        const originalTheme = THEMES[themeId as keyof typeof THEMES] || THEMES.black;
        
        const isDeepBlack = themeId === 'deep_black';
        const bgColor = isDeepBlack ? '#000000' : (quranSettings.bgColor || originalTheme.bg);
        const textColor = isDeepBlack ? '#FFFFFF' : (quranSettings.textColor || originalTheme.text);
        const accent = isDeepBlack ? '#FFFFFF' : (quranSettings.highlightTextColor || originalTheme.accent);
        const isDark =
            textColor.toLowerCase() === '#ffffff' ||
            isDeepBlack ||
            themeId.startsWith('i_') ||
            ['#000000', '#0a0a0a', '#18181b', '#09090b', '#022c22', '#450a0a', '#1e3a8a', '#422006', '#78350f', '#4c1d95', '#280a1e', '#041e3a', '#1e1b4b', '#0f172a', '#064e3b', '#134e4a', '#334155'].includes(bgColor.toLowerCase());

        return {
            ...originalTheme,
            bgColor,
            textColor,
            text: textColor,
            bg: bgColor,
            accent,
            accentText: isDeepBlack ? '#000000' : (originalTheme.accentText || '#ffffff'),
            btnBg: isDeepBlack ? '#18181b' : originalTheme.btnBg,
            btnText: isDeepBlack ? '#FFFFFF' : originalTheme.btnText,
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

const getSectionsKey = (sections: string[]): string => {
    if (!sections || sections.length === 0 || sections.includes('all')) return 'all';
    return [...sections].sort().join(',');
};

export let searchCache = {
    query: '',
    activeTab: 'all' as string | string[],
    sectionsKey: 'all',
    language: '',
    scrollTop: 0,
    quranResults: [] as any[],
    athkarResults: [] as any[],
    salahAthkarResults: [] as any[],
    duaResults: [] as any[],
    ruqyahResults: [] as any[],
    hisnResults: [] as any[],
    nawawiResults: [] as any[],
    asmaulHusnaResults: [] as any[],
    seerahResults: [] as any[],
    hajjUmrahResults: [] as any[],
    tenPromisedResults: [] as any[],
    divineMiraclesResults: [] as any[],
};

export const clearSearchCache = () => {
    searchCache = {
        query: '',
        activeTab: 'all',
        sectionsKey: 'all',
        language: '',
        scrollTop: 0,
        quranResults: [],
        athkarResults: [],
        salahAthkarResults: [],
        duaResults: [],
        ruqyahResults: [],
        hisnResults: [],
        nawawiResults: [],
        asmaulHusnaResults: [],
        seerahResults: [],
        hajjUmrahResults: [],
        tenPromisedResults: [],
        divineMiraclesResults: [],
    };
};

interface GlobalSearchProps {
    onBack: () => void;
    onNavigate: (pageId: string, params?: any) => void;
    navParams?: any;
}

const GlobalSearch: React.FC<GlobalSearchProps> = ({ onBack, onNavigate, navParams }) => {
    const { theme: appTheme, themeKey, isNightMode, homeThemeVariant, setCurrentPage } = useTheme();
    const { language } = useLanguage();
    const isEn = language === 'en';
    const s3d = getCalculator3DStyles(appTheme, themeKey, isNightMode, homeThemeVariant);

    const isFromQuran = Boolean(
        navParams?.fromSidebar ||
        navParams?.from === 'quran' ||
        navParams?.from === 'quran-landscape' ||
        (typeof navParams?.from === 'string' && navParams.from.startsWith('quran'))
    );
    const isQuranLandscape = navParams?.from === 'quran-landscape';

    const [readerTheme, setReaderTheme] = useState(() => getReaderTheme(isQuranLandscape));

    // Pre-fetch English Quran translation data if in English mode
    useEffect(() => {
        loadQuranEnglishTranslation();
    }, []);

    const handleBack = useCallback(() => {
        onBack();
    }, [onBack]);

    const handleGoHome = useCallback(() => {
        onNavigate('home');
    }, [onNavigate]);

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

    const isAppBlackTheme = s3d.isBlackTheme;
    const appIsDark = s3d.isDark;
    const appAccent = s3d.primaryColor;
    const appBgColor = s3d.pageBgColor;
    const appTextColor = s3d.textColor;

    const appSearchTheme = {
        ...appTheme,
        bgColor: appBgColor,
        bg: appBgColor,
        textColor: appTextColor,
        text: appTextColor,
        accent: appAccent,
        accentText: s3d.btnTextColor,
        palette: [appAccent, ...(appTheme.palette || [appAccent])],
        btnBg: appIsDark ? (isAppBlackTheme ? '#18181b' : '#1E293B') : '#ffffff',
        btnText: appTextColor,
        isDark: appIsDark,
    };

    const theme = isFromQuran ? readerTheme : appSearchTheme;
    const accentBadgeText = (theme.accent || theme.palette?.[0] || '').toUpperCase() === '#FFFFFF' ? '#000000' : '#ffffff';

    const card3DClass = isFromQuran ? 'quran-raised-card' : `app-page-card ${s3d.surfaceCardClass}`;
    const btn3DClass = isFromQuran ? 'quran-raised-btn' : `app-page-card ${s3d.surfaceCardClass}`;
    const inner3DClass = isFromQuran ? 'quran-raised-card' : 'app-3d-badge';
    const badge3DStyle: React.CSSProperties = isFromQuran
        ? { backgroundColor: theme.accent || theme.palette[0], color: accentBadgeText, border: 'none' }
        : { backgroundColor: s3d.primaryColor, color: s3d.btnTextColor, border: 'none' };
    const itemCardStyle = (darkAlpha = 'rgba(255,255,255,0.05)'): React.CSSProperties =>
        isFromQuran
            ? { backgroundColor: theme.isDark ? darkAlpha : '#ffffff', color: theme.textColor, border: 'none' }
            : { color: s3d.textColor };
    const headerCardStyle = (darkAlpha = 'rgba(255,255,255,0.06)'): React.CSSProperties =>
        isFromQuran
            ? { backgroundColor: theme.isDark ? darkAlpha : (theme.btnBg || '#ffffff'), color: theme.textColor, border: 'none' }
            : { color: s3d.textColor };
    const sectionIconStyle: React.CSSProperties = isFromQuran
        ? { backgroundColor: `${theme.accent || theme.palette[0]}18`, color: theme.accent || theme.palette[0], border: 'none' }
        : { backgroundColor: s3d.softResultBg, color: s3d.noticeAccent, border: 'none' };
    
    const [query, setQuery] = useState(searchCache.query);
    const [selectedSections, setSelectedSections] = useState<string[]>(() => {
        if (Array.isArray(searchCache.activeTab)) {
            return searchCache.activeTab.length > 0 ? searchCache.activeTab : (isFromQuran ? ['quran'] : ['all']);
        }
        if (typeof searchCache.activeTab === 'string' && searchCache.activeTab) {
            if (searchCache.activeTab === 'all' && !searchCache.query && isFromQuran) {
                return ['quran'];
            }
            return [searchCache.activeTab];
        }
        return isFromQuran ? ['quran'] : ['all'];
    });

    const handleToggleSection = (sectionId: string) => {
        if (sectionId === 'all') {
            setSelectedSections(['all']);
            return;
        }

        setSelectedSections(prev => {
            const withoutAll = prev.filter(id => id !== 'all');
            let next: string[];
            if (withoutAll.includes(sectionId)) {
                next = withoutAll.filter(id => id !== sectionId);
            } else {
                next = [...withoutAll, sectionId];
            }
            if (next.length === 0) {
                return ['all'];
            }
            return next;
        });
    };
    
    const handleResultClick = useCallback((pageId: string, params?: any) => {
        searchCache.scrollTop = window.scrollY || document.documentElement.scrollTop || 0;
        onNavigate(pageId, params);
    }, [onNavigate]);

    useEffect(() => {
        if (searchCache.scrollTop > 0) {
            setTimeout(() => {
                window.scrollTo({ top: searchCache.scrollTop, behavior: 'instant' });
            }, 10);
        }
        const handleScroll = () => {
            const currentScroll = window.scrollY || document.documentElement.scrollTop || 0;
            if (currentScroll > 0) {
                searchCache.scrollTop = currentScroll;
            }
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const [quranResults, setQuranResults] = useState<any[]>(searchCache.quranResults);
    const [athkarResults, setAthkarResults] = useState<any[]>(searchCache.athkarResults);
    const [salahAthkarResults, setSalahAthkarResults] = useState<any[]>(searchCache.salahAthkarResults);
    const [duaResults, setDuaResults] = useState<any[]>(searchCache.duaResults);
    const [ruqyahResults, setRuqyahResults] = useState<any[]>(searchCache.ruqyahResults);
    const [hisnResults, setHisnResults] = useState<any[]>(searchCache.hisnResults);
    const [nawawiResults, setNawawiResults] = useState<any[]>(searchCache.nawawiResults);
    const [asmaulHusnaResults, setAsmaulHusnaResults] = useState<any[]>(searchCache.asmaulHusnaResults);
    const [seerahResults, setSeerahResults] = useState<any[]>(searchCache.seerahResults);
    const [hajjUmrahResults, setHajjUmrahResults] = useState<any[]>(searchCache.hajjUmrahResults);
    const [tenPromisedResults, setTenPromisedResults] = useState<any[]>(searchCache.tenPromisedResults);
    const [divineMiraclesResults, setDivineMiraclesResults] = useState<any[]>(searchCache.divineMiraclesResults);

    const [isSearching, setIsSearching] = useState(false);
    const [expandedSurahs, setExpandedSurahs] = useState<Record<number, boolean>>({});
    const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
        quran: false, 
        dua: false, 
        ruqyah: false,
        athkar: false, 
        salahAthkar: false,
        hisn: false, 
        nawawi: false,
        asmaulHusna: false,
        seerah: false,
        hajjUmrah: false,
        tenPromised: false,
        divineMiracles: false,
    });
    
    useEffect(() => {
        // جميع السور تكون مغلقة افتراضياً عند ظهور نتائج البحث
        setExpandedSurahs({});
    }, [quranResults]);

    const toggleSurah = (surahNum: number) => {
        setExpandedSurahs(prev => {
            const isCurrentlyOpen = Boolean(prev[surahNum]);
            // عند فتح سورة جديدة يتم إغلاق السورة السابقة تلقائياً (إظهار سورة واحدة فقط في كل مرة)
            if (isCurrentlyOpen) {
                return {};
            } else {
                return { [surahNum]: true };
            }
        });
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
            .replace(/[\u0610-\u061A\u064B-\u065F\u06D6-\u06ED\u0640]/g, "")
            .replace(/\u06E6/g, "ي")
            .replace(/\u06E5/g, "و")
            .replace(/[أإآٱ]/g, "ا")
            .replace(/ة/g, "ه")
            .replace(/[ىي]/g, "ي")
            .replace(/ذالِك/g, "ذلك")
            .replace(/\bذالك\b/g, "ذلك")
            .replace(/\bالرحمان\b/g, "الرحمن")
            .replace(/\bهاذا\b/g, "هذا")
            .replace(/\bإلااه\b/g, "إله")
            .replace(/\s+/g, " ")
            .trim();
    };

    const performSearch = useCallback(async (currentQuery: string, sectionsToSearch: string[]) => {
        const q = currentQuery.trim();
        const isAll = !sectionsToSearch || sectionsToSearch.length === 0 || sectionsToSearch.includes('all');
        const shouldSearch = (secId: string) => isAll || sectionsToSearch.includes(secId);
        const currentSectionsKey = getSectionsKey(sectionsToSearch);

        if (!q) {
            setQuranResults([]);
            setAthkarResults([]);
            setSalahAthkarResults([]);
            setDuaResults([]);
            setRuqyahResults([]);
            setHisnResults([]);
            setNawawiResults([]);
            setAsmaulHusnaResults([]);
            setSeerahResults([]);
            setHajjUmrahResults([]);
            setTenPromisedResults([]);
            setDivineMiraclesResults([]);
            setIsSearching(false);
            
            searchCache.query = '';
            searchCache.sectionsKey = currentSectionsKey;
            searchCache.language = language;
            searchCache.scrollTop = 0;
            searchCache.quranResults = [];
            searchCache.athkarResults = [];
            searchCache.salahAthkarResults = [];
            searchCache.duaResults = [];
            searchCache.ruqyahResults = [];
            searchCache.hisnResults = [];
            searchCache.nawawiResults = [];
            searchCache.asmaulHusnaResults = [];
            searchCache.seerahResults = [];
            searchCache.hajjUmrahResults = [];
            searchCache.tenPromisedResults = [];
            searchCache.divineMiraclesResults = [];
            return;
        }

        setIsSearching(true);

        const hasLatinChars = /[a-zA-Z]/.test(q);
        const hasArabicChars = /[\u0600-\u06FF]/.test(q);

        // Strict language enforcement:
        // - In Arabic mode (!isEn): searching with English/Latin text must result in NOTHING (0 results).
        // - In English mode (isEn): searching with Arabic text must result in NOTHING (0 results).
        if ((!isEn && hasLatinChars) || (isEn && hasArabicChars)) {
            setQuranResults([]);
            setAthkarResults([]);
            setSalahAthkarResults([]);
            setDuaResults([]);
            setRuqyahResults([]);
            setHisnResults([]);
            setNawawiResults([]);
            setAsmaulHusnaResults([]);
            setSeerahResults([]);
            setHajjUmrahResults([]);
            setTenPromisedResults([]);
            setDivineMiraclesResults([]);
            setIsSearching(false);

            searchCache.query = q;
            searchCache.sectionsKey = currentSectionsKey;
            searchCache.language = language;
            searchCache.quranResults = [];
            searchCache.athkarResults = [];
            searchCache.salahAthkarResults = [];
            searchCache.duaResults = [];
            searchCache.ruqyahResults = [];
            searchCache.hisnResults = [];
            searchCache.nawawiResults = [];
            searchCache.asmaulHusnaResults = [];
            searchCache.seerahResults = [];
            searchCache.hajjUmrahResults = [];
            searchCache.tenPromisedResults = [];
            searchCache.divineMiraclesResults = [];
            return;
        }

        // Ensure English Quran translation is loaded if needed
        let enQuranData = getCachedQuranEnglishTranslation();
        if (isEn && shouldSearch('quran') && !enQuranData) {
            enQuranData = await loadQuranEnglishTranslation();
        }

        const normQ = normalizeArabic(q);
        const normQNoSpaces = normQ.replace(/\s+/g, '');
        
        // Regex for Quran Arabic text with strict word boundary separation:
        // innerGap: diacritics/tashkeel/dagger-alif within a word (NO whitespace permitted)
        // wordGap: whitespace + diacritics between words
        const innerGap = '[\\u0610-\\u061A\\u064B-\\u065F\\u0670\\u06D6-\\u06ED\\u0640]*';
        const wordGap = '[\\s\\u0610-\\u061A\\u064B-\\u065F\\u0670\\u06D6-\\u06ED\\u0640]+';

        const wordsAr = normQ.split(/\s+/).filter(Boolean);
        const wordPatterns = wordsAr.map(w => {
            return w.split('').map(c => (
                c === 'ا' ? '[أإآٱا\\u0670]' : 
                (c === 'ه' ? '[هة]' : 
                (c === 'ي' ? '[يى]' : c.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')))
            )).join(innerGap);
        });

        const highlightPattern = wordPatterns.join(wordGap);
        
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

        // Helpers for matching Arabic / English
        const searchWordsAr = normQ.split(/\s+/).filter(Boolean);
        const matchArabic = (text: string) => {
            if (!text) return false;
            const normText = normalizeArabic(text);
            if (!normText) return false;

            // 1. Direct match on normalized text (preserves word boundaries and spaces)
            if (normText.includes(normQ)) return true;

            // 2. Exact word boundary regex match (handles Uthmani diacritics / dagger alif)
            if (arabicRegex) {
                const freshRegex = new RegExp(arabicRegex.source, 'gi');
                if (freshRegex.test(text)) return true;
            }

            // 3. Multi-word phrase search: ensure every query word exists in normalized target text
            if (searchWordsAr.length > 1) {
                return searchWordsAr.every(word => normText.includes(word));
            }

            return false;
        };

        const matchEnglish = (text: string) => {
            if (!text || englishWords.length === 0) return false;
            const lower = text.toLowerCase();
            return englishWords.every(word => lower.includes(word));
        };

        const matchItem = (arText: string, enText?: string, arExtra?: string, enExtra?: string) => {
            if (isEn) {
                return matchEnglish(enText || '') || matchEnglish(enExtra || '');
            }
            return matchArabic(arText) || (arExtra ? matchArabic(arExtra) : false);
        };

        const activeHighlightRegex = isEn ? englishRegex : arabicRegex;

        // 1. Search Quran
        const foundQuran: any[] = [];
        const seenAyahKeys = new Set<string>();

        if (shouldSearch('quran')) {
            if (isEn) {
                if (enQuranData && enQuranData.length > 0) {
                    const enResults = searchQuranEnglish(q, enQuranData, quranData);
                    enResults.forEach(item => {
                        const key = `${item.surah}:${item.ayah}`;
                        if (!seenAyahKeys.has(key)) {
                            seenAyahKeys.add(key);
                            foundQuran.push(item);
                        }
                    });
                }
                if (isNumberSearch) {
                    for (let sIdx = 0; sIdx < quranData.surahs.length; sIdx++) {
                        const surah = quranData.surahs[sIdx];
                        for (let aIdx = 0; aIdx < surah.ayahs.length; aIdx++) {
                            const ayah = surah.ayahs[aIdx];
                            const key = `${surah.number}:${ayah.numberInSurah}`;
                            if (ayah.numberInSurah === searchNum && !seenAyahKeys.has(key)) {
                                const enVerse = enQuranData?.[sIdx]?.verses?.[aIdx];
                                const enTransText = enVerse?.translation || '';
                                const surahNameEn = SURAH_NAMES_EN[surah.number - 1] || surah.name;
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
                            }
                        }
                    }
                }
            } else {
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
                            } else if (!isNumberSearch) {
                                const cleanText = stripTajweedTags(ayah.text);
                                if (matchArabic(cleanText) || (arabicRegex && arabicRegex.test(cleanText))) {
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
                                        highlightRegex: arabicRegex
                                    });
                                }
                            }
                        }
                    }
                }
            }
        }

        // 2. Search Morning & Evening Athkar
        const foundAthkar: any[] = [];
        if (shouldSearch('athkar')) {
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
        }

        // 3. Search Prayer Adhkar
        const foundSalahAthkar: any[] = [];
        if (shouldSearch('salahAthkar')) {
            const allSalahItems = [...baseAthkar, fajrDhikr, fajrMaghribDhikr, specialZikr];
            allSalahItems.forEach((item, idx) => {
                if (matchItem(item.text, item.textEn, item.title, item.titleEn)) {
                    foundSalahAthkar.push({
                        type: 'salahAthkar',
                        text: item.text,
                        textEn: item.textEn,
                        title: item.title,
                        titleEn: item.titleEn,
                        note: item.note,
                        noteEn: item.noteEn,
                        id: item.id || idx,
                        highlightRegex: activeHighlightRegex
                    });
                }
            });
        }

        // 4. Search Duas
        const foundDua: any[] = [];
        if (shouldSearch('dua')) {
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
        }

        // 5. Search Ruqyah Shariah
        const foundRuqyah: any[] = [];
        if (shouldSearch('ruqyah')) {
            RUQYAH_DATA.forEach((item) => {
                if (matchItem(item.text, item.textEn, item.source, item.sourceEn) || matchItem(item.title, item.titleEn)) {
                    foundRuqyah.push({
                        type: 'ruqyah',
                        title: item.title,
                        titleEn: item.titleEn,
                        text: item.text,
                        textEn: item.textEn,
                        source: item.source,
                        sourceEn: item.sourceEn,
                        id: item.id,
                        highlightRegex: activeHighlightRegex
                    });
                }
            });
        }

        // 6. Search Hisn Al-Muslim
        const foundHisn: any[] = [];
        if (shouldSearch('hisn')) {
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
                            categoryId: catId,
                            categoryTitle: category?.title || 'حصن المسلم',
                            categoryTitleEn: catEn?.title || 'Hisn Al-Muslim',
                            itemIndex: itemIdx,
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
        }

        // 7. Search Nawawi
        const foundNawawi: any[] = [];
        if (shouldSearch('nawawi') && !isEn) {
            NAWAWI_DATA.forEach((item) => {
                if (matchArabic(item.hadith) || matchArabic(item.title)) {
                    foundNawawi.push({ 
                        type: 'nawawi', 
                        hadith: item.hadith, 
                        title: item.title, 
                        id: item.id,
                        highlightRegex: arabicRegex
                    });
                }
            });
        }

        // 8. Search Asmaul Husna
        const foundAsmaulHusna: any[] = [];
        if (shouldSearch('asmaulHusna')) {
            asmaulHusna.forEach((item) => {
                if (matchItem(item.name, item.transliteration, item.meaning, item.meaningEn) || matchItem(item.evidence, item.evidenceEn)) {
                    foundAsmaulHusna.push({
                        type: 'asmaulHusna',
                        name: item.name,
                        transliteration: item.transliteration,
                        meaning: item.meaning,
                        meaningEn: item.meaningEn,
                        evidence: item.evidence,
                        evidenceEn: item.evidenceEn,
                        id: item.id,
                        highlightRegex: activeHighlightRegex
                    });
                }
            });
        }

        // 9. Search Prophetic Seerah
        const foundSeerah: any[] = [];
        if (shouldSearch('seerah') && !isEn) {
            PROPHETIC_SEERAH_DATA.forEach((item) => {
                if (matchArabic(item.title) || matchArabic(item.summary) || matchArabic(item.details) || (item.badge && matchArabic(item.badge))) {
                    foundSeerah.push({
                        type: 'seerah',
                        kind: 'milestone',
                        title: item.title,
                        eraLabel: item.eraLabel,
                        yearGregorian: item.yearGregorian,
                        summary: item.summary,
                        details: item.details,
                        id: item.id,
                        highlightRegex: activeHighlightRegex
                    });
                }
            });
            PROPHETIC_STANCES_DATA.forEach((item) => {
                if (matchArabic(item.title) || matchArabic(item.situation) || matchArabic(item.quote) || matchArabic(item.moralLesson)) {
                    foundSeerah.push({
                        type: 'seerah',
                        kind: 'stance',
                        title: item.title,
                        category: item.category,
                        situation: item.situation,
                        quote: item.quote,
                        id: item.id,
                        highlightRegex: activeHighlightRegex
                    });
                }
            });
        }

        // 10. Search Hajj & Umrah
        const foundHajjUmrah: any[] = [];
        if (shouldSearch('hajjUmrah') && !isEn) {
            umrahVirtues.forEach((v, idx) => {
                if (matchArabic(v.title) || matchArabic(v.text) || matchArabic(v.explanation)) {
                    foundHajjUmrah.push({
                        type: 'hajjUmrah',
                        kind: 'virtue',
                        title: v.title,
                        text: v.text,
                        explanation: v.explanation,
                        id: `v_${idx}`,
                        highlightRegex: activeHighlightRegex
                    });
                }
            });
            umrahSteps.forEach((s) => {
                if (matchArabic(s.title) || matchArabic(s.subtitle) || matchArabic(s.quranAyah) || matchArabic(s.hadith)) {
                    foundHajjUmrah.push({
                        type: 'hajjUmrah',
                        kind: 'step',
                        title: s.title,
                        subtitle: s.subtitle,
                        quranAyah: s.quranAyah,
                        hadith: s.hadith,
                        id: s.title,
                        highlightRegex: activeHighlightRegex
                    });
                }
            });
        }

        // 11. Search Ten Promised Paradise
        const foundTenPromised: any[] = [];
        if (shouldSearch('tenPromised')) {
            TEN_PROMISED_COMPANIONS.forEach((c) => {
                if (
                    matchItem(c.nameAr, c.nameEn, c.fullNameAr, c.fullNameEn) || 
                    matchItem(c.titleBadgeAr, c.titleBadgeEn, c.keyQuoteAr, c.keyQuoteEn) ||
                    matchItem(c.gladTidingsHadithAr, c.gladTidingsHadithEn)
                ) {
                    foundTenPromised.push({
                        type: 'tenPromised',
                        nameAr: c.nameAr,
                        nameEn: c.nameEn,
                        titleBadgeAr: c.titleBadgeAr,
                        titleBadgeEn: c.titleBadgeEn,
                        hadithAr: c.gladTidingsHadithAr,
                        hadithEn: c.gladTidingsHadithEn,
                        quoteAr: c.keyQuoteAr,
                        quoteEn: c.keyQuoteEn,
                        id: c.id,
                        highlightRegex: activeHighlightRegex
                    });
                }
            });
        }

        // 12. Search Divine Miracles (المعجزات الإلهية)
        const foundDivineMiracles: any[] = [];
        if (shouldSearch('divineMiracles')) {
            DIVINE_MIRACLES_DATA.forEach((item) => {
                if (
                    matchItem(item.titleAr, item.titleEn, item.summaryAr, item.summaryEn) ||
                    matchItem(item.descriptionAr, item.descriptionEn, item.badgeAr, item.badgeEn) ||
                    matchItem(item.scientificOrHistoricalFactAr || '', item.scientificOrHistoricalFactEn || '') ||
                    (item.quranEvidence && matchItem(item.quranEvidence.ayahAr, item.quranEvidence.ayahEn)) ||
                    (item.hadithEvidence && matchItem(item.hadithEvidence.matnAr, item.hadithEvidence.matnEn))
                ) {
                    foundDivineMiracles.push({
                        type: 'divineMiracles',
                        titleAr: item.titleAr,
                        titleEn: item.titleEn,
                        badgeAr: item.badgeAr,
                        badgeEn: item.badgeEn,
                        summaryAr: item.summaryAr,
                        summaryEn: item.summaryEn,
                        id: item.id,
                        highlightRegex: activeHighlightRegex
                    });
                }
            });
        }

        setQuranResults(foundQuran);
        setAthkarResults(foundAthkar);
        setSalahAthkarResults(foundSalahAthkar);
        setDuaResults(foundDua);
        setRuqyahResults(foundRuqyah);
        setHisnResults(foundHisn);
        setNawawiResults(foundNawawi);
        setAsmaulHusnaResults(foundAsmaulHusna);
        setSeerahResults(foundSeerah);
        setHajjUmrahResults(foundHajjUmrah);
        setTenPromisedResults(foundTenPromised);
        setDivineMiraclesResults(foundDivineMiracles);

        setIsSearching(false);
        
        searchCache.query = q;
        searchCache.sectionsKey = currentSectionsKey;
        searchCache.language = language;
        searchCache.quranResults = foundQuran;
        searchCache.athkarResults = foundAthkar;
        searchCache.salahAthkarResults = foundSalahAthkar;
        searchCache.duaResults = foundDua;
        searchCache.ruqyahResults = foundRuqyah;
        searchCache.hisnResults = foundHisn;
        searchCache.nawawiResults = foundNawawi;
        searchCache.asmaulHusnaResults = foundAsmaulHusna;
        searchCache.seerahResults = foundSeerah;
        searchCache.hajjUmrahResults = foundHajjUmrah;
        searchCache.tenPromisedResults = foundTenPromised;
        searchCache.divineMiraclesResults = foundDivineMiracles;
    }, [isEn, language]);

    useEffect(() => {
        searchCache.activeTab = selectedSections.includes('all') ? 'all' : (selectedSections.length === 1 ? selectedSections[0] : (selectedSections as any));
    }, [selectedSections]);

    useEffect(() => {
        const trimmed = query.trim();
        const currentSectionsKey = getSectionsKey(selectedSections);

        if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

        if (trimmed === '') {
            setQuranResults([]);
            setAthkarResults([]);
            setSalahAthkarResults([]);
            setDuaResults([]);
            setRuqyahResults([]);
            setHisnResults([]);
            setNawawiResults([]);
            setAsmaulHusnaResults([]);
            setSeerahResults([]);
            setHajjUmrahResults([]);
            setTenPromisedResults([]);
            setDivineMiraclesResults([]);
            setIsSearching(false);

            searchCache.query = '';
            searchCache.sectionsKey = currentSectionsKey;
            searchCache.language = language;
            searchCache.scrollTop = 0;
            searchCache.quranResults = [];
            searchCache.athkarResults = [];
            searchCache.salahAthkarResults = [];
            searchCache.duaResults = [];
            searchCache.ruqyahResults = [];
            searchCache.hisnResults = [];
            searchCache.nawawiResults = [];
            searchCache.asmaulHusnaResults = [];
            searchCache.seerahResults = [];
            searchCache.hajjUmrahResults = [];
            searchCache.tenPromisedResults = [];
            searchCache.divineMiraclesResults = [];
            return;
        }

        if (trimmed === searchCache.query && currentSectionsKey === searchCache.sectionsKey && language === searchCache.language) {
            return;
        }

        setIsSearching(true);
        searchTimeoutRef.current = setTimeout(() => {
            performSearch(query, selectedSections);
        }, 300);

        return () => {
            if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
        };
    }, [query, selectedSections, language, performSearch]);

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

    const totalResults = 
        quranResults.length + 
        athkarResults.length + 
        salahAthkarResults.length + 
        duaResults.length + 
        ruqyahResults.length + 
        hisnResults.length + 
        nawawiResults.length + 
        asmaulHusnaResults.length + 
        seerahResults.length + 
        hajjUmrahResults.length + 
        tenPromisedResults.length +
        divineMiraclesResults.length;

    const renderResults = () => {
        if (isSearching) {
            return (
                <div className="flex flex-col items-center justify-center py-20 opacity-60">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 mb-4" style={{ borderBottomColor: theme.accent || theme.palette[0] }}></div>
                    <p className="font-bold">{isEn ? "Searching..." : "جاري البحث الشامل..."}</p>
                </div>
            );
        }

        const isAllSelected = selectedSections.includes('all') || selectedSections.length === 0;

        if (query && totalResults === 0) {
            return (
                <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
                    <div 
                        className={`w-20 h-20 rounded-3xl flex items-center justify-center mb-5 ${card3DClass} border-0`}
                        style={headerCardStyle('rgba(255,255,255,0.06)')}
                    >
                        <Search className="w-10 h-10 quran-3d-icon opacity-60" style={{ color: isFromQuran ? (theme.accent || theme.palette[0]) : s3d.noticeAccent }} />
                    </div>
                    <p className="font-bold text-sm sm:text-base opacity-75" style={{ color: theme.textColor }}>
                        {isAllSelected
                            ? (isEn ? "No results found for your search" : "لا توجد نتائج لبحثك في جميع صفحات التطبيق")
                            : (isEn ? "No results found in the selected sections" : "لا توجد نتائج لبحثك في الأقسام المحددة")}
                    </p>
                </div>
            );
        }

        if (!query) {
            const activeSectionLabels = selectedSections
                .filter(id => id !== 'all')
                .map(id => sectionsList.find(s => s.id === id)?.label)
                .filter(Boolean)
                .join('، ');

            return (
                <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                    <p className="font-semibold text-xs sm:text-sm leading-relaxed opacity-35 max-w-md select-none" style={{ color: theme.textColor }}>
                        {isAllSelected ? (
                            isEn ? (
                                <>
                                    Search across all application sections:<br/>
                                    Quran, Adhkar, Prayers, Supplications, Ruqyah, Hisn Al-Muslim, Seerah, Asmaul Husna, Hajj & Umrah, Ten Promised Paradise, and Divine Miracles.
                                </>
                            ) : (
                                <>
                                    ابحث في جميع أقسام وصفحات التطبيق:<br/>
                                    القرآن الكريم، الأذكار، أذكار الصلاة، الأدعية والرقية الشرعية، حصن المسلم، أسماء الله الحسنى، السيرة النبوية، الحج والعمرة، العشرة المبشرون بالجنة، والمعجزات الإلهية.
                                </>
                            )
                        ) : (
                            isEn ? (
                                <>
                                    Search scope limited to: <span className="underline decoration-2" style={{ color: theme.accent || theme.palette[0] }}>{activeSectionLabels}</span>.<br/>
                                    Type any word or phrase to search within these sections, or select "All Sections" to search globally.
                                </>
                            ) : (
                                <>
                                    البحث مخصص في الأقسام: <span className="underline decoration-2" style={{ color: theme.accent || theme.palette[0] }}>{activeSectionLabels}</span>.<br/>
                                    اكتب أي كلمة أو عبارة للبحث داخل هذه الأقسام، أو اختر "كل الأقسام" للبحث الشامل.
                                </>
                            )
                        )}
                    </p>
                </div>
            );
        }

        const showQuran = isAllSelected || selectedSections.includes('quran');
        const showAthkar = isAllSelected || selectedSections.includes('athkar');
        const showSalahAthkar = isAllSelected || selectedSections.includes('salahAthkar');
        const showDua = isAllSelected || selectedSections.includes('dua');
        const showRuqyah = isAllSelected || selectedSections.includes('ruqyah');
        const showHisn = isAllSelected || selectedSections.includes('hisn');
        const showNawawi = isAllSelected || selectedSections.includes('nawawi');
        const showAsmaulHusna = isAllSelected || selectedSections.includes('asmaulHusna');
        const showSeerah = isAllSelected || selectedSections.includes('seerah');
        const showHajjUmrah = isAllSelected || selectedSections.includes('hajjUmrah');
        const showTenPromised = isAllSelected || selectedSections.includes('tenPromised');
        const showDivineMiracles = isAllSelected || selectedSections.includes('divineMiracles');
        
        const groupedQuran = quranResults.reduce((acc, r) => {
            if (!acc[r.surah]) acc[r.surah] = { surahName: r.surahName, surahNameEn: r.surahNameEn, ayahs: [] };
            acc[r.surah].ayahs.push(r);
            return acc;
        }, {} as Record<number, { surahName: string, surahNameEn?: string, ayahs: any[] }>);
        const sortedQuranSurahs = Object.keys(groupedQuran).map(Number).sort((a, b) => a - b);

        const normQ = normalizeArabic(query);
        const innerGap = '[\\u0610-\\u061A\\u064B-\\u065F\\u0670\\u06D6-\\u06ED\\u0640]*';
        const wordGap = '[\\s\\u0610-\\u061A\\u064B-\\u065F\\u0670\\u06D6-\\u06ED\\u0640]+';
        const wordsAr = normQ.split(/\s+/).filter(Boolean);
        const wordPatterns = wordsAr.map(w => {
            return w.split('').map(c => (
                c === 'ا' ? '[أإآٱا\\u0670]' : 
                (c === 'ه' ? '[هة]' : 
                (c === 'ي' ? '[يى]' : c.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')))
            )).join(innerGap);
        });
        const highlightPattern = wordPatterns.join(wordGap);
        let activeRegex: RegExp | null = null;
        try {
            if (isEn) {
                const englishWords = query.toLowerCase().split(/\s+/).map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).filter(Boolean);
                if (englishWords.length > 0) activeRegex = new RegExp(`(${englishWords.join('|')})`, 'gi');
            } else if (highlightPattern) {
                activeRegex = new RegExp(highlightPattern, 'gi');
            }
        } catch (e) {
            activeRegex = null;
        }

        const totalQuranWordOccurrences = quranResults.reduce((acc, item) => {
            if (item.text && activeRegex) {
                const matches = item.text.match(activeRegex);
                return acc + (matches ? matches.length : 1);
            }
            return acc + 1;
        }, 0);

        return (
            <div className="space-y-4">
                {/* 1. Quran Results */}
                {showQuran && quranResults.length > 0 && (
                    <div className="space-y-3">
                        {isAllSelected ? (
                            <div className={`mb-3 rounded-2xl ${card3DClass} overflow-hidden border-0`} style={headerCardStyle('rgba(255,255,255,0.03)')}>
                                <button 
                                    onClick={() => setExpandedCategories(p => ({ ...p, quran: !p.quran }))}
                                    className={`w-full flex justify-between items-center p-4 transition-all ${btn3DClass} border-0 rounded-2xl cursor-pointer`}
                                    style={headerCardStyle('rgba(255,255,255,0.06)')}
                                >
                                    <h4 className="font-bold text-base flex items-center gap-2.5" style={{ color: isFromQuran ? (theme.accent || theme.palette[0]) : s3d.noticeAccent }}>
                                        <BookOpen className="w-5 h-5 quran-3d-icon" /> 
                                        {isEn ? "The Holy Quran" : "القرآن الكريم"}
                                    </h4>
                                    <div className="flex items-center gap-2">
                                        <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${inner3DClass} border-0`} style={badge3DStyle}>
                                            {isEn ? (
                                                totalQuranWordOccurrences > quranResults.length
                                                    ? `${quranResults.length} Ayahs (${totalQuranWordOccurrences} matches)`
                                                    : `${quranResults.length} Ayahs`
                                            ) : (
                                                totalQuranWordOccurrences > quranResults.length
                                                    ? `${toArabic(quranResults.length)} آية (وردت ${toArabic(totalQuranWordOccurrences)} مرة)`
                                                    : `${toArabic(quranResults.length)} آية`
                                            )}
                                        </span>
                                        <ChevronLeft className={`w-5 h-5 transition-transform quran-3d-icon ${expandedCategories.quran ? (isEn ? 'rotate-90' : '-rotate-90') : (isEn ? 'rotate-180' : '')}`} />
                                    </div>
                                </button>
                                {expandedCategories.quran && (
                                    <div className="p-3 space-y-2.5" style={{ backgroundColor: theme.isDark ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.015)' }}>
                                        {sortedQuranSurahs.map(surahNum => {
                                            const group = groupedQuran[surahNum];
                                            const isExpanded = expandedSurahs[surahNum];
                                            const rawArSurahName = (group.surahName || '').trim();
                                            const surahDisplayName = isEn 
                                                ? `Surah ${group.surahNameEn || SURAH_NAMES_EN[surahNum - 1] || rawArSurahName}` 
                                                : (rawArSurahName.startsWith('سورة') || rawArSurahName.startsWith('سُورَة')
                                                    ? rawArSurahName
                                                    : `سورة ${rawArSurahName}`);
                                            const surahWordOccurrences = group.ayahs.reduce((acc: number, item: any) => {
                                                if (item.text && activeRegex) {
                                                    const matches = item.text.match(activeRegex);
                                                    return acc + (matches ? matches.length : 1);
                                                }
                                                return acc + 1;
                                            }, 0);
                                            return (
                                                <div key={surahNum} className={`rounded-2xl ${card3DClass} overflow-hidden border-0 mb-2`} style={itemCardStyle('rgba(255,255,255,0.04)')}>
                                                    <button 
                                                        onClick={() => toggleSurah(surahNum)}
                                                        className={`w-full flex justify-between items-center p-3.5 transition-all ${btn3DClass} border-0 rounded-2xl cursor-pointer`}
                                                        style={itemCardStyle('rgba(255,255,255,0.06)')}
                                                    >
                                                        <h4 className={`${isEn ? 'font-bold' : 'font-amiri-quran'} text-base font-bold`} style={{ color: isFromQuran ? (theme.accent || theme.palette[0]) : s3d.noticeAccent }}>
                                                            {surahDisplayName}
                                                        </h4>
                                                        <div className="flex items-center gap-2">
                                                            <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${inner3DClass} border-0`} style={badge3DStyle}>
                                                                {isEn ? (
                                                                    surahWordOccurrences > group.ayahs.length
                                                                        ? `${group.ayahs.length} Ayahs (${surahWordOccurrences} matches)`
                                                                        : `${group.ayahs.length} Ayahs`
                                                                ) : (
                                                                    surahWordOccurrences > group.ayahs.length
                                                                        ? `${toArabic(group.ayahs.length)} آية (وردت ${toArabic(surahWordOccurrences)} مرة)`
                                                                        : `${toArabic(group.ayahs.length)} آية`
                                                                )}
                                                            </span>
                                                            <ChevronLeft className={`w-4 h-4 transition-transform quran-3d-icon ${isExpanded ? (isEn ? 'rotate-90' : '-rotate-90') : (isEn ? 'rotate-180' : '')}`} />
                                                        </div>
                                                    </button>
                                                    
                                                    {isExpanded && (
                                                        <div className="p-2.5 space-y-2.5" style={{ backgroundColor: theme.isDark ? 'rgba(0,0,0,0.15)' : 'rgba(0,0,0,0.01)' }}>
                                                            {group.ayahs.map((r, idx) => (
                                                                <button 
                                                                    key={`quran-${surahNum}-${idx}`} 
                                                                    className={`w-full ${isEn ? 'text-left' : 'text-right'} p-3.5 rounded-2xl ${card3DClass} border-0 transition-all cursor-pointer`}
                                                                    style={itemCardStyle('rgba(255,255,255,0.05)')}
                                                                    onClick={() => handleResultClick(isQuranLandscape ? 'quran-landscape' : 'quran', { surah: r.surah, ayah: r.ayah, readingMode: isEn ? 'translation' : undefined })}
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
                                <div className="flex items-center gap-2.5 mb-2 px-1">
                                    <span className={`p-2 rounded-xl ${inner3DClass} border-0`} style={sectionIconStyle}>
                                        <BookOpen className="w-4 h-4 quran-3d-icon" />
                                    </span>
                                    <h3 className="font-bold text-sm opacity-90" style={{ color: theme.textColor }}>
                                        {isEn ? (
                                            totalQuranWordOccurrences > quranResults.length
                                                ? `The Holy Quran (${quranResults.length} Ayahs - ${totalQuranWordOccurrences} matches)`
                                                : `The Holy Quran (${quranResults.length} Ayahs)`
                                        ) : (
                                            totalQuranWordOccurrences > quranResults.length
                                                ? `القرآن الكريم (${toArabic(quranResults.length)} آية - وردت ${toArabic(totalQuranWordOccurrences)} مرة)`
                                                : `القرآن الكريم (${toArabic(quranResults.length)} آية)`
                                        )}
                                    </h3>
                                </div>
                                {sortedQuranSurahs.map(surahNum => {
                                    const group = groupedQuran[surahNum];
                                    const isExpanded = expandedSurahs[surahNum];
                                    const rawArSurahName = (group.surahName || '').trim();
                                    const surahDisplayName = isEn 
                                        ? `Surah ${group.surahNameEn || SURAH_NAMES_EN[surahNum - 1] || rawArSurahName}` 
                                        : (rawArSurahName.startsWith('سورة') || rawArSurahName.startsWith('سُورَة')
                                            ? rawArSurahName
                                            : `سورة ${rawArSurahName}`);
                                    const surahWordOccurrences = group.ayahs.reduce((acc: number, item: any) => {
                                        if (item.text && activeRegex) {
                                            const matches = item.text.match(activeRegex);
                                            return acc + (matches ? matches.length : 1);
                                        }
                                        return acc + 1;
                                    }, 0);
                                    return (
                                        <div key={surahNum} className={`mb-2.5 rounded-2xl ${card3DClass} overflow-hidden border-0`} style={itemCardStyle('rgba(255,255,255,0.04)')}>
                                            <button 
                                                onClick={() => toggleSurah(surahNum)}
                                                className={`w-full flex justify-between items-center p-3.5 transition-all ${btn3DClass} border-0 rounded-2xl cursor-pointer`}
                                                style={itemCardStyle('rgba(255,255,255,0.06)')}
                                            >
                                                <h4 className={`${isEn ? 'font-bold' : 'font-amiri-quran'} text-base font-bold`} style={{ color: isFromQuran ? (theme.accent || theme.palette[0]) : s3d.noticeAccent }}>
                                                    {surahDisplayName}
                                                </h4>
                                                <div className="flex items-center gap-2">
                                                    <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${inner3DClass} border-0`} style={badge3DStyle}>
                                                        {isEn ? (
                                                            surahWordOccurrences > group.ayahs.length
                                                                ? `${group.ayahs.length} Ayahs (${surahWordOccurrences} matches)`
                                                                : `${group.ayahs.length} Ayahs`
                                                        ) : (
                                                            surahWordOccurrences > group.ayahs.length
                                                                ? `${toArabic(group.ayahs.length)} آية (وردت ${toArabic(surahWordOccurrences)} مرة)`
                                                                : `${toArabic(group.ayahs.length)} آية`
                                                        )}
                                                    </span>
                                                    <ChevronLeft className={`w-4 h-4 transition-transform quran-3d-icon ${isExpanded ? (isEn ? 'rotate-90' : '-rotate-90') : (isEn ? 'rotate-180' : '')}`} />
                                                </div>
                                            </button>
                                            
                                            {isExpanded && (
                                                <div className="p-2.5 space-y-2.5" style={{ backgroundColor: theme.isDark ? 'rgba(0,0,0,0.15)' : 'rgba(0,0,0,0.015)' }}>
                                                    {group.ayahs.map((r, idx) => (
                                                        <button 
                                                            key={`quran-${surahNum}-${idx}`} 
                                                            className={`w-full ${isEn ? 'text-left' : 'text-right'} p-3.5 rounded-2xl ${card3DClass} border-0 transition-all cursor-pointer`}
                                                            style={itemCardStyle('rgba(255,255,255,0.05)')}
                                                            onClick={() => handleResultClick(isQuranLandscape ? 'quran-landscape' : 'quran', { surah: r.surah, ayah: r.ayah, readingMode: isEn ? 'translation' : undefined })}
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

                {/* 2. Morning/Evening Athkar */}
                {showAthkar && athkarResults.length > 0 && (
                    <div className="space-y-3 mt-4">
                        {isAllSelected ? (
                            <div className={`mb-3 rounded-2xl ${card3DClass} overflow-hidden border-0`} style={headerCardStyle('rgba(255,255,255,0.03)')}>
                                <button 
                                    onClick={() => setExpandedCategories(p => ({ ...p, athkar: !p.athkar }))}
                                    className={`w-full flex justify-between items-center p-4 transition-all ${btn3DClass} border-0 rounded-2xl cursor-pointer`}
                                    style={headerCardStyle('rgba(255,255,255,0.06)')}
                                >
                                    <h4 className="font-bold text-base flex items-center gap-2.5" style={{ color: isFromQuran ? (theme.accent || theme.palette[0]) : s3d.noticeAccent }}>
                                        <Sun className="w-5 h-5 quran-3d-icon" /> 
                                        {isEn ? "Daily Adhkar (Morning & Evening)" : "أذكار الصباح والمساء"}
                                    </h4>
                                    <div className="flex items-center gap-2">
                                        <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${inner3DClass} border-0`} style={badge3DStyle}>
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
                                                className={`w-full ${isEn ? 'text-left' : 'text-right'} p-3.5 rounded-2xl ${card3DClass} border-0 transition-all cursor-pointer`}
                                                onClick={() => handleResultClick('sabah-masaa', { kind: r.kind, id: r.id, text: r.text })}
                                                style={itemCardStyle('rgba(255,255,255,0.05)')}
                                            >
                                                <div className="text-[10px] opacity-60 mb-1 font-bold flex items-center gap-1.5">
                                                    {r.kind === 'morning' ? <Sun className="w-3.5 h-3.5 quran-3d-icon" style={{ color: isFromQuran ? (theme.accent || theme.palette[0]) : s3d.noticeAccent }} /> : <Moon className="w-3.5 h-3.5 quran-3d-icon" style={{ color: isFromQuran ? (theme.accent || theme.palette[0]) : s3d.noticeAccent }} />}
                                                    <span>{r.kind === 'morning' ? (isEn ? 'Morning Adhkar' : 'أذكار الصباح') : (isEn ? 'Evening Adhkar' : 'أذكار المساء')}</span>
                                                </div>
                                                <div className={`${isEn ? 'text-sm font-medium' : 'font-qalam text-base'} leading-relaxed line-clamp-2`} style={{ color: isFromQuran ? (theme.accent || theme.palette[0]) : s3d.noticeAccent }}>
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
                                <div className="flex items-center gap-2.5 mb-2 px-1">
                                    <span className={`p-2 rounded-xl ${inner3DClass} border-0`} style={sectionIconStyle}>
                                        <Sun className="w-4 h-4 quran-3d-icon" />
                                    </span>
                                    <h3 className="font-bold text-sm opacity-90" style={{ color: theme.textColor }}>
                                        {isEn ? `Daily Adhkar (${athkarResults.length})` : `أذكار الصباح والمساء (${toArabic(athkarResults.length)})`}
                                    </h3>
                                </div>
                                {athkarResults.map((r, idx) => (
                                    <button 
                                        key={`athkar-${idx}`} 
                                        className={`w-full ${isEn ? 'text-left' : 'text-right'} p-4 rounded-2xl ${card3DClass} border-0 transition-all cursor-pointer mb-2.5`}
                                        style={itemCardStyle('rgba(255,255,255,0.05)')}
                                        onClick={() => handleResultClick('sabah-masaa', { kind: r.kind, id: r.id, text: r.text })}
                                    >
                                        <div className="text-[10px] opacity-60 mb-2 font-bold flex items-center gap-1.5">
                                            {r.kind === 'morning' ? <Sun className="w-3.5 h-3.5 quran-3d-icon" style={{ color: isFromQuran ? (theme.accent || theme.palette[0]) : s3d.noticeAccent }} /> : <Moon className="w-3.5 h-3.5 quran-3d-icon" style={{ color: isFromQuran ? (theme.accent || theme.palette[0]) : s3d.noticeAccent }} />}
                                            <span>{r.kind === 'morning' ? (isEn ? 'Morning Adhkar' : 'أذكار الصباح') : (isEn ? 'Evening Adhkar' : 'أذكار المساء')}</span>
                                        </div>
                                        <div className={`${isEn ? 'text-sm font-medium' : 'font-qalam text-base'} leading-relaxed mb-1`} style={{ color: isFromQuran ? (theme.accent || theme.palette[0]) : s3d.noticeAccent }}>
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

                {/* 3. Prayer Adhkar */}
                {showSalahAthkar && salahAthkarResults.length > 0 && (
                    <div className="space-y-3 mt-4">
                        {isAllSelected ? (
                            <div className={`mb-3 rounded-2xl ${card3DClass} overflow-hidden border-0`} style={headerCardStyle('rgba(255,255,255,0.03)')}>
                                <button 
                                    onClick={() => setExpandedCategories(p => ({ ...p, salahAthkar: !p.salahAthkar }))}
                                    className={`w-full flex justify-between items-center p-4 transition-all ${btn3DClass} border-0 rounded-2xl cursor-pointer`}
                                    style={headerCardStyle('rgba(255,255,255,0.06)')}
                                >
                                    <h4 className="font-bold text-base flex items-center gap-2.5" style={{ color: isFromQuran ? (theme.accent || theme.palette[0]) : s3d.noticeAccent }}>
                                        <CheckCircle2 className="w-5 h-5 quran-3d-icon" /> 
                                        {isEn ? "Prayer Adhkar" : "أذكار الصلاة"}
                                    </h4>
                                    <div className="flex items-center gap-2">
                                        <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${inner3DClass} border-0`} style={badge3DStyle}>
                                            {isEn ? salahAthkarResults.length : toArabic(salahAthkarResults.length)}
                                        </span>
                                        <ChevronLeft className={`w-5 h-5 transition-transform quran-3d-icon ${expandedCategories.salahAthkar ? (isEn ? 'rotate-90' : '-rotate-90') : (isEn ? 'rotate-180' : '')}`} />
                                    </div>
                                </button>
                                {expandedCategories.salahAthkar && (
                                    <div className="p-3 space-y-2.5" style={{ backgroundColor: theme.isDark ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.015)' }}>
                                        {salahAthkarResults.map((r, idx) => (
                                            <button 
                                                key={`salahAthkar-${idx}`} 
                                                className={`w-full ${isEn ? 'text-left' : 'text-right'} p-3.5 rounded-2xl ${card3DClass} border-0 transition-all cursor-pointer`}
                                                onClick={() => handleResultClick('athkar-salah', { id: r.id, title: r.title, text: r.text })}
                                                style={itemCardStyle('rgba(255,255,255,0.05)')}
                                            >
                                                {r.title && (
                                                    <div className="text-[11px] font-bold opacity-75 mb-1" style={{ color: theme.textColor }}>
                                                        {isEn ? (r.titleEn || r.title) : r.title}
                                                    </div>
                                                )}
                                                <div className={`${isEn ? 'text-sm font-medium' : 'font-qalam text-base'} leading-relaxed line-clamp-2`} style={{ color: isFromQuran ? (theme.accent || theme.palette[0]) : s3d.noticeAccent }}>
                                                    {highlightText(isEn ? (r.textEn || r.text) : r.text, r.highlightRegex)}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <>
                                <div className="flex items-center gap-2.5 mb-2 px-1">
                                    <span className={`p-2 rounded-xl ${inner3DClass} border-0`} style={sectionIconStyle}>
                                        <CheckCircle2 className="w-4 h-4 quran-3d-icon" />
                                    </span>
                                    <h3 className="font-bold text-sm opacity-90" style={{ color: theme.textColor }}>
                                        {isEn ? `Prayer Adhkar (${salahAthkarResults.length})` : `أذكار الصلاة (${toArabic(salahAthkarResults.length)})`}
                                    </h3>
                                </div>
                                {salahAthkarResults.map((r, idx) => (
                                    <button 
                                        key={`salahAthkar-${idx}`} 
                                        className={`w-full ${isEn ? 'text-left' : 'text-right'} p-4 rounded-2xl ${card3DClass} border-0 transition-all cursor-pointer mb-2.5`}
                                        style={itemCardStyle('rgba(255,255,255,0.05)')}
                                        onClick={() => handleResultClick('athkar-salah', { id: r.id, title: r.title, text: r.text })}
                                    >
                                        {r.title && (
                                            <div className="text-xs font-bold opacity-75 mb-1.5" style={{ color: theme.textColor }}>
                                                {isEn ? (r.titleEn || r.title) : r.title}
                                            </div>
                                        )}
                                        <div className={`${isEn ? 'text-sm font-medium' : 'font-qalam text-base'} leading-relaxed mb-1`} style={{ color: isFromQuran ? (theme.accent || theme.palette[0]) : s3d.noticeAccent }}>
                                            {highlightText(isEn ? (r.textEn || r.text) : r.text, r.highlightRegex)}
                                        </div>
                                    </button>
                                ))}
                            </>
                        )}
                    </div>
                )}

                {/* 4. Duas */}
                {showDua && duaResults.length > 0 && (
                    <div className="space-y-3 mt-4">
                        {isAllSelected ? (
                            <div className={`mb-3 rounded-2xl ${card3DClass} overflow-hidden border-0`} style={headerCardStyle('rgba(255,255,255,0.03)')}>
                                <button 
                                    onClick={() => setExpandedCategories(p => ({ ...p, dua: !p.dua }))}
                                    className={`w-full flex justify-between items-center p-4 transition-all ${btn3DClass} border-0 rounded-2xl cursor-pointer`}
                                    style={headerCardStyle('rgba(255,255,255,0.06)')}
                                >
                                    <h4 className="font-bold text-base flex items-center gap-2.5" style={{ color: isFromQuran ? (theme.accent || theme.palette[0]) : s3d.noticeAccent }}>
                                        <Heart className="w-5 h-5 quran-3d-icon" /> 
                                        {isEn ? "Supplications (Duas)" : "الأدعية"}
                                    </h4>
                                    <div className="flex items-center gap-2">
                                        <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${inner3DClass} border-0`} style={badge3DStyle}>
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
                                                className={`w-full ${isEn ? 'text-left' : 'text-right'} p-3.5 rounded-2xl ${card3DClass} border-0 transition-all cursor-pointer`}
                                                onClick={() => handleResultClick('adia', { id: r.id, category: r.category, text: r.text })}
                                                style={itemCardStyle('rgba(255,255,255,0.05)')}
                                            >
                                                <div className={`${isEn ? 'text-sm font-medium' : 'font-qalam text-base'} leading-relaxed mb-1 line-clamp-2`} style={{ color: isFromQuran ? (theme.accent || theme.palette[0]) : s3d.noticeAccent }}>
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
                                <div className="flex items-center gap-2.5 mb-2 px-1">
                                    <span className={`p-2 rounded-xl ${inner3DClass} border-0`} style={sectionIconStyle}>
                                        <Heart className="w-4 h-4 quran-3d-icon" />
                                    </span>
                                    <h3 className="font-bold text-sm opacity-90" style={{ color: theme.textColor }}>
                                        {isEn ? `Supplications (${duaResults.length})` : `الأدعية (${toArabic(duaResults.length)})`}
                                    </h3>
                                </div>
                                {duaResults.map((r, idx) => (
                                    <button 
                                        key={`dua-${idx}`} 
                                        className={`w-full ${isEn ? 'text-left' : 'text-right'} p-4 rounded-2xl ${card3DClass} border-0 transition-all cursor-pointer mb-2.5`}
                                        style={itemCardStyle('rgba(255,255,255,0.05)')}
                                        onClick={() => handleResultClick('adia', { id: r.id, category: r.category, text: r.text })}
                                    >
                                        <div className={`${isEn ? 'text-sm font-medium' : 'font-qalam text-base'} leading-relaxed mb-2`} style={{ color: isFromQuran ? (theme.accent || theme.palette[0]) : s3d.noticeAccent }}>
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

                {/* 5. Ruqyah Shariah */}
                {showRuqyah && ruqyahResults.length > 0 && (
                    <div className="space-y-3 mt-4">
                        {isAllSelected ? (
                            <div className={`mb-3 rounded-2xl ${card3DClass} overflow-hidden border-0`} style={headerCardStyle('rgba(255,255,255,0.03)')}>
                                <button 
                                    onClick={() => setExpandedCategories(p => ({ ...p, ruqyah: !p.ruqyah }))}
                                    className={`w-full flex justify-between items-center p-4 transition-all ${btn3DClass} border-0 rounded-2xl cursor-pointer`}
                                    style={headerCardStyle('rgba(255,255,255,0.06)')}
                                >
                                    <h4 className="font-bold text-base flex items-center gap-2.5" style={{ color: isFromQuran ? (theme.accent || theme.palette[0]) : s3d.noticeAccent }}>
                                        <Shield className="w-5 h-5 quran-3d-icon" /> 
                                        {isEn ? "Ruqyah Shariah" : "الرقية الشرعية"}
                                    </h4>
                                    <div className="flex items-center gap-2">
                                        <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${inner3DClass} border-0`} style={badge3DStyle}>
                                            {isEn ? ruqyahResults.length : toArabic(ruqyahResults.length)}
                                        </span>
                                        <ChevronLeft className={`w-5 h-5 transition-transform quran-3d-icon ${expandedCategories.ruqyah ? (isEn ? 'rotate-90' : '-rotate-90') : (isEn ? 'rotate-180' : '')}`} />
                                    </div>
                                </button>
                                {expandedCategories.ruqyah && (
                                    <div className="p-3 space-y-2.5" style={{ backgroundColor: theme.isDark ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.015)' }}>
                                        {ruqyahResults.map((r, idx) => (
                                            <button 
                                                key={`ruqyah-${idx}`} 
                                                className={`w-full ${isEn ? 'text-left' : 'text-right'} p-3.5 rounded-2xl ${card3DClass} border-0 transition-all cursor-pointer`}
                                                onClick={() => handleResultClick('others', { section: 'ruqyah', highlightId: r.id, itemId: r.id })}
                                                style={itemCardStyle('rgba(255,255,255,0.05)')}
                                            >
                                                <div className="text-[11px] font-bold opacity-80 mb-1" style={{ color: theme.textColor }}>
                                                    {isEn ? (r.titleEn || r.title) : r.title}
                                                </div>
                                                <div className={`${isEn ? 'text-sm font-medium' : 'font-qalam text-base'} leading-relaxed line-clamp-2`} style={{ color: isFromQuran ? (theme.accent || theme.palette[0]) : s3d.noticeAccent }}>
                                                    {highlightText(isEn ? (r.textEn || r.text) : r.text, r.highlightRegex)}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <>
                                <div className="flex items-center gap-2.5 mb-2 px-1">
                                    <span className={`p-2 rounded-xl ${inner3DClass} border-0`} style={sectionIconStyle}>
                                        <Shield className="w-4 h-4 quran-3d-icon" />
                                    </span>
                                    <h3 className="font-bold text-sm opacity-90" style={{ color: theme.textColor }}>
                                        {isEn ? `Ruqyah Shariah (${ruqyahResults.length})` : `الرقية الشرعية (${toArabic(ruqyahResults.length)})`}
                                    </h3>
                                </div>
                                {ruqyahResults.map((r, idx) => (
                                    <button 
                                        key={`ruqyah-${idx}`} 
                                        className={`w-full ${isEn ? 'text-left' : 'text-right'} p-4 rounded-2xl ${card3DClass} border-0 transition-all cursor-pointer mb-2.5`}
                                        style={itemCardStyle('rgba(255,255,255,0.05)')}
                                        onClick={() => handleResultClick('others', { section: 'ruqyah', highlightId: r.id, itemId: r.id })}
                                    >
                                        <div className="text-xs font-bold opacity-80 mb-2" style={{ color: theme.textColor }}>
                                            {isEn ? (r.titleEn || r.title) : r.title}
                                        </div>
                                        <div className={`${isEn ? 'text-sm font-medium' : 'font-qalam text-base'} leading-relaxed mb-1`} style={{ color: isFromQuran ? (theme.accent || theme.palette[0]) : s3d.noticeAccent }}>
                                            {highlightText(isEn ? (r.textEn || r.text) : r.text, r.highlightRegex)}
                                        </div>
                                    </button>
                                ))}
                            </>
                        )}
                    </div>
                )}

                {/* 6. Hisn Al-Muslim */}
                {showHisn && hisnResults.length > 0 && (
                    <div className="space-y-3 mt-4">
                        {isAllSelected ? (
                            <div className={`mb-3 rounded-2xl ${card3DClass} overflow-hidden border-0`} style={headerCardStyle('rgba(255,255,255,0.03)')}>
                                <button 
                                    onClick={() => setExpandedCategories(p => ({ ...p, hisn: !p.hisn }))}
                                    className={`w-full flex justify-between items-center p-4 transition-all ${btn3DClass} border-0 rounded-2xl cursor-pointer`}
                                    style={headerCardStyle('rgba(255,255,255,0.06)')}
                                >
                                    <h4 className="font-bold text-base flex items-center gap-2.5" style={{ color: isFromQuran ? (theme.accent || theme.palette[0]) : s3d.noticeAccent }}>
                                        <BookOpen className="w-5 h-5 quran-3d-icon" /> 
                                        {isEn ? "Hisn Al-Muslim" : "حصن المسلم"}
                                    </h4>
                                    <div className="flex items-center gap-2">
                                        <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${inner3DClass} border-0`} style={badge3DStyle}>
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
                                                className={`w-full ${isEn ? 'text-left' : 'text-right'} p-3.5 rounded-2xl ${card3DClass} border-0 transition-all cursor-pointer`}
                                                onClick={() => handleResultClick('hisn-muslim', { categoryId: r.categoryId, categoryTitle: r.categoryTitle, itemIndex: r.itemIndex, id: r.id, text: r.text })}
                                                style={itemCardStyle('rgba(255,255,255,0.05)')}
                                            >
                                                <div className={`${isEn ? 'text-sm font-medium' : 'font-qalam text-base'} leading-relaxed mb-1 line-clamp-2`} style={{ color: isFromQuran ? (theme.accent || theme.palette[0]) : s3d.noticeAccent }}>
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
                                <div className="flex items-center gap-2.5 mb-2 px-1">
                                    <span className={`p-2 rounded-xl ${inner3DClass} border-0`} style={sectionIconStyle}>
                                        <BookOpen className="w-4 h-4 quran-3d-icon" />
                                    </span>
                                    <h3 className="font-bold text-sm opacity-90" style={{ color: theme.textColor }}>
                                        {isEn ? `Hisn Al-Muslim (${hisnResults.length})` : `حصن المسلم (${toArabic(hisnResults.length)})`}
                                    </h3>
                                </div>
                                {hisnResults.map((r, idx) => (
                                    <button 
                                        key={`hisn-${idx}`} 
                                        className={`w-full ${isEn ? 'text-left' : 'text-right'} p-4 rounded-2xl ${card3DClass} border-0 transition-all cursor-pointer mb-2.5`}
                                        style={itemCardStyle('rgba(255,255,255,0.05)')}
                                        onClick={() => handleResultClick('hisn-muslim', { categoryId: r.categoryId, categoryTitle: r.categoryTitle, itemIndex: r.itemIndex, id: r.id, text: r.text })}
                                    >
                                        <div className={`${isEn ? 'text-sm font-medium' : 'font-qalam text-base'} leading-relaxed mb-2`} style={{ color: isFromQuran ? (theme.accent || theme.palette[0]) : s3d.noticeAccent }}>
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

                {/* 7. An-Nawawi 40 Hadiths */}
                {showNawawi && nawawiResults.length > 0 && (
                    <div className="space-y-3 mt-4">
                        {isAllSelected ? (
                            <div className={`mb-3 rounded-2xl ${card3DClass} overflow-hidden border-0`} style={headerCardStyle('rgba(255,255,255,0.03)')}>
                                <button 
                                    onClick={() => setExpandedCategories(p => ({ ...p, nawawi: !p.nawawi }))}
                                    className={`w-full flex justify-between items-center p-4 transition-all ${btn3DClass} border-0 rounded-2xl cursor-pointer`}
                                    style={headerCardStyle('rgba(255,255,255,0.06)')}
                                >
                                    <h4 className="font-bold text-base flex items-center gap-2.5" style={{ color: isFromQuran ? (theme.accent || theme.palette[0]) : s3d.noticeAccent }}>
                                        <BookOpen className="w-5 h-5 quran-3d-icon" /> 
                                        {isEn ? "An-Nawawi's 40 Hadiths" : "الأربعون النووية"}
                                    </h4>
                                    <div className="flex items-center gap-2">
                                        <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${inner3DClass} border-0`} style={badge3DStyle}>
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
                                                className={`w-full ${isEn ? 'text-left' : 'text-right'} p-3.5 rounded-2xl ${card3DClass} border-0 transition-all cursor-pointer`}
                                                onClick={() => handleResultClick('nawawi', { hadithId: r.id })}
                                                style={itemCardStyle('rgba(255,255,255,0.05)')}
                                            >
                                                <div className="text-[11px] opacity-80 mb-1 font-bold" style={{ color: theme.textColor }}>
                                                    {r.title}
                                                </div>
                                                <div className="font-qalam text-base leading-relaxed line-clamp-2" style={{ color: isFromQuran ? (theme.accent || theme.palette[0]) : s3d.noticeAccent }}>
                                                    {r.hadith}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <>
                                <div className="flex items-center gap-2.5 mb-2 px-1">
                                    <span className={`p-2 rounded-xl ${inner3DClass} border-0`} style={sectionIconStyle}>
                                        <BookOpen className="w-4 h-4 quran-3d-icon" />
                                    </span>
                                    <h3 className="font-bold text-sm opacity-90" style={{ color: theme.textColor }}>
                                        {isEn ? `An-Nawawi's 40 Hadiths (${nawawiResults.length})` : `الأربعون النووية (${toArabic(nawawiResults.length)})`}
                                    </h3>
                                </div>
                                {nawawiResults.map((r, idx) => (
                                    <button 
                                        key={`nawawi-${idx}`} 
                                        className={`w-full ${isEn ? 'text-left' : 'text-right'} p-4 rounded-2xl ${card3DClass} border-0 transition-all cursor-pointer mb-2.5`}
                                        style={itemCardStyle('rgba(255,255,255,0.05)')}
                                        onClick={() => handleResultClick('nawawi', { hadithId: r.id })}
                                    >
                                        <div className="text-xs opacity-80 mb-2 font-bold" style={{ color: theme.textColor }}>
                                            {r.title}
                                        </div>
                                        <div className="font-qalam text-base leading-relaxed" style={{ color: isFromQuran ? (theme.accent || theme.palette[0]) : s3d.noticeAccent }}>
                                            {r.hadith}
                                        </div>
                                    </button>
                                ))}
                            </>
                        )}
                    </div>
                )}

                {/* 8. Asmaul Husna */}
                {showAsmaulHusna && asmaulHusnaResults.length > 0 && (
                    <div className="space-y-3 mt-4">
                        {isAllSelected ? (
                            <div className={`mb-3 rounded-2xl ${card3DClass} overflow-hidden border-0`} style={headerCardStyle('rgba(255,255,255,0.03)')}>
                                <button 
                                    onClick={() => setExpandedCategories(p => ({ ...p, asmaulHusna: !p.asmaulHusna }))}
                                    className={`w-full flex justify-between items-center p-4 transition-all ${btn3DClass} border-0 rounded-2xl cursor-pointer`}
                                    style={headerCardStyle('rgba(255,255,255,0.06)')}
                                >
                                    <h4 className="font-bold text-base flex items-center gap-2.5" style={{ color: isFromQuran ? (theme.accent || theme.palette[0]) : s3d.noticeAccent }}>
                                        <Sparkles className="w-5 h-5 quran-3d-icon" /> 
                                        {isEn ? "Names of Allah (Asmaul Husna)" : "أسماء الله الحسنى"}
                                    </h4>
                                    <div className="flex items-center gap-2">
                                        <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${inner3DClass} border-0`} style={badge3DStyle}>
                                            {isEn ? asmaulHusnaResults.length : toArabic(asmaulHusnaResults.length)}
                                        </span>
                                        <ChevronLeft className={`w-5 h-5 transition-transform quran-3d-icon ${expandedCategories.asmaulHusna ? (isEn ? 'rotate-90' : '-rotate-90') : (isEn ? 'rotate-180' : '')}`} />
                                    </div>
                                </button>
                                {expandedCategories.asmaulHusna && (
                                    <div className="p-3 space-y-2.5" style={{ backgroundColor: theme.isDark ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.015)' }}>
                                        {asmaulHusnaResults.map((r, idx) => (
                                            <button 
                                                key={`asmaulHusna-${idx}`} 
                                                className={`w-full ${isEn ? 'text-left' : 'text-right'} p-3.5 rounded-2xl ${card3DClass} border-0 transition-all cursor-pointer`}
                                                onClick={() => handleResultClick('asma-allah', { nameId: r.id })}
                                                style={itemCardStyle('rgba(255,255,255,0.05)')}
                                            >
                                                <div className="font-bold text-base mb-1" style={{ color: isFromQuran ? (theme.accent || theme.palette[0]) : s3d.noticeAccent }}>
                                                    {r.name} {isEn && `(${r.transliteration})`}
                                                </div>
                                                <div className="text-xs leading-relaxed opacity-80 line-clamp-2" style={{ color: theme.textColor }}>
                                                    {highlightText(isEn ? r.meaningEn : r.meaning, r.highlightRegex)}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <>
                                <div className="flex items-center gap-2.5 mb-2 px-1">
                                    <span className={`p-2 rounded-xl ${inner3DClass} border-0`} style={sectionIconStyle}>
                                        <Sparkles className="w-4 h-4 quran-3d-icon" />
                                    </span>
                                    <h3 className="font-bold text-sm opacity-90" style={{ color: theme.textColor }}>
                                        {isEn ? `Names of Allah (${asmaulHusnaResults.length})` : `أسماء الله الحسنى (${toArabic(asmaulHusnaResults.length)})`}
                                    </h3>
                                </div>
                                {asmaulHusnaResults.map((r, idx) => (
                                    <button 
                                        key={`asmaulHusna-${idx}`} 
                                        className={`w-full ${isEn ? 'text-left' : 'text-right'} p-4 rounded-2xl ${card3DClass} border-0 transition-all cursor-pointer mb-2.5`}
                                        style={itemCardStyle('rgba(255,255,255,0.05)')}
                                        onClick={() => handleResultClick('asma-allah', { nameId: r.id })}
                                    >
                                        <div className="font-bold text-lg mb-1.5" style={{ color: isFromQuran ? (theme.accent || theme.palette[0]) : s3d.noticeAccent }}>
                                            {r.name} {isEn && `(${r.transliteration})`}
                                        </div>
                                        <div className="text-sm leading-relaxed opacity-80 mb-2" style={{ color: theme.textColor }}>
                                            {highlightText(isEn ? r.meaningEn : r.meaning, r.highlightRegex)}
                                        </div>
                                        {r.evidence && (
                                            <div className="text-xs opacity-60 font-bold border-t pt-2 mt-2 border-black/10 dark:border-white/10">
                                                {isEn ? (r.evidenceEn || r.evidence) : r.evidence}
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </>
                        )}
                    </div>
                )}

                {/* 9. Prophetic Seerah */}
                {showSeerah && seerahResults.length > 0 && (
                    <div className="space-y-3 mt-4">
                        {isAllSelected ? (
                            <div className={`mb-3 rounded-2xl ${card3DClass} overflow-hidden border-0`} style={headerCardStyle('rgba(255,255,255,0.03)')}>
                                <button 
                                    onClick={() => setExpandedCategories(p => ({ ...p, seerah: !p.seerah }))}
                                    className={`w-full flex justify-between items-center p-4 transition-all ${btn3DClass} border-0 rounded-2xl cursor-pointer`}
                                    style={headerCardStyle('rgba(255,255,255,0.06)')}
                                >
                                    <h4 className="font-bold text-base flex items-center gap-2.5" style={{ color: isFromQuran ? (theme.accent || theme.palette[0]) : s3d.noticeAccent }}>
                                        <UserCheck className="w-5 h-5 quran-3d-icon" /> 
                                        {isEn ? "Prophetic Seerah" : "السيرة النبوية الشريفة"}
                                    </h4>
                                    <div className="flex items-center gap-2">
                                        <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${inner3DClass} border-0`} style={badge3DStyle}>
                                            {isEn ? seerahResults.length : toArabic(seerahResults.length)}
                                        </span>
                                        <ChevronLeft className={`w-5 h-5 transition-transform quran-3d-icon ${expandedCategories.seerah ? (isEn ? 'rotate-90' : '-rotate-90') : (isEn ? 'rotate-180' : '')}`} />
                                    </div>
                                </button>
                                {expandedCategories.seerah && (
                                    <div className="p-3 space-y-2.5" style={{ backgroundColor: theme.isDark ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.015)' }}>
                                        {seerahResults.map((r, idx) => (
                                            <button 
                                                key={`seerah-${idx}`} 
                                                className={`w-full ${isEn ? 'text-left' : 'text-right'} p-3.5 rounded-2xl ${card3DClass} border-0 transition-all cursor-pointer`}
                                                onClick={() => handleResultClick('prophetic-seerah', { eventId: r.id })}
                                                style={itemCardStyle('rgba(255,255,255,0.05)')}
                                            >
                                                <div className="text-[11px] font-bold opacity-75 mb-1" style={{ color: theme.textColor }}>
                                                    {r.title}
                                                </div>
                                                <div className="text-xs leading-relaxed opacity-80 line-clamp-2" style={{ color: isFromQuran ? (theme.accent || theme.palette[0]) : s3d.noticeAccent }}>
                                                    {highlightText(r.summary || r.situation || r.details, r.highlightRegex)}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <>
                                <div className="flex items-center gap-2.5 mb-2 px-1">
                                    <span className={`p-2 rounded-xl ${inner3DClass} border-0`} style={sectionIconStyle}>
                                        <UserCheck className="w-4 h-4 quran-3d-icon" />
                                    </span>
                                    <h3 className="font-bold text-sm opacity-90" style={{ color: theme.textColor }}>
                                        {isEn ? `Prophetic Seerah (${seerahResults.length})` : `السيرة النبوية (${toArabic(seerahResults.length)})`}
                                    </h3>
                                </div>
                                {seerahResults.map((r, idx) => (
                                    <button 
                                        key={`seerah-${idx}`} 
                                        className={`w-full ${isEn ? 'text-left' : 'text-right'} p-4 rounded-2xl ${card3DClass} border-0 transition-all cursor-pointer mb-2.5`}
                                        style={itemCardStyle('rgba(255,255,255,0.05)')}
                                        onClick={() => handleResultClick('prophetic-seerah', { eventId: r.id })}
                                    >
                                        <div className="text-sm font-bold opacity-90 mb-1.5" style={{ color: theme.textColor }}>
                                            {r.title}
                                        </div>
                                        <div className="text-xs leading-relaxed opacity-80" style={{ color: isFromQuran ? (theme.accent || theme.palette[0]) : s3d.noticeAccent }}>
                                            {highlightText(r.summary || r.situation || r.details, r.highlightRegex)}
                                        </div>
                                    </button>
                                ))}
                            </>
                        )}
                    </div>
                )}

                {/* 10. Hajj & Umrah */}
                {showHajjUmrah && hajjUmrahResults.length > 0 && (
                    <div className="space-y-3 mt-4">
                        {isAllSelected ? (
                            <div className={`mb-3 rounded-2xl ${card3DClass} overflow-hidden border-0`} style={headerCardStyle('rgba(255,255,255,0.03)')}>
                                <button 
                                    onClick={() => setExpandedCategories(p => ({ ...p, hajjUmrah: !p.hajjUmrah }))}
                                    className={`w-full flex justify-between items-center p-4 transition-all ${btn3DClass} border-0 rounded-2xl cursor-pointer`}
                                    style={headerCardStyle('rgba(255,255,255,0.06)')}
                                >
                                    <h4 className="font-bold text-base flex items-center gap-2.5" style={{ color: isFromQuran ? (theme.accent || theme.palette[0]) : s3d.noticeAccent }}>
                                        <Compass className="w-5 h-5 quran-3d-icon" /> 
                                        {isEn ? "Hajj & Umrah" : "الحج والعمرة"}
                                    </h4>
                                    <div className="flex items-center gap-2">
                                        <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${inner3DClass} border-0`} style={badge3DStyle}>
                                            {isEn ? hajjUmrahResults.length : toArabic(hajjUmrahResults.length)}
                                        </span>
                                        <ChevronLeft className={`w-5 h-5 transition-transform quran-3d-icon ${expandedCategories.hajjUmrah ? (isEn ? 'rotate-90' : '-rotate-90') : (isEn ? 'rotate-180' : '')}`} />
                                    </div>
                                </button>
                                {expandedCategories.hajjUmrah && (
                                    <div className="p-3 space-y-2.5" style={{ backgroundColor: theme.isDark ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.015)' }}>
                                        {hajjUmrahResults.map((r, idx) => (
                                            <button 
                                                key={`hajjUmrah-${idx}`} 
                                                className={`w-full ${isEn ? 'text-left' : 'text-right'} p-3.5 rounded-2xl ${card3DClass} border-0 transition-all cursor-pointer`}
                                                onClick={() => handleResultClick('hajj-umrah', { screen: r.section || 'umrah', title: r.title })}
                                                style={itemCardStyle('rgba(255,255,255,0.05)')}
                                            >
                                                <div className="text-[11px] font-bold opacity-80 mb-1" style={{ color: theme.textColor }}>
                                                    {r.title}
                                                </div>
                                                <div className="text-xs leading-relaxed opacity-80 line-clamp-2" style={{ color: isFromQuran ? (theme.accent || theme.palette[0]) : s3d.noticeAccent }}>
                                                    {highlightText(r.text || r.subtitle || r.explanation, r.highlightRegex)}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <>
                                <div className="flex items-center gap-2.5 mb-2 px-1">
                                    <span className={`p-2 rounded-xl ${inner3DClass} border-0`} style={sectionIconStyle}>
                                        <Compass className="w-4 h-4 quran-3d-icon" />
                                    </span>
                                    <h3 className="font-bold text-sm opacity-90" style={{ color: theme.textColor }}>
                                        {isEn ? `Hajj & Umrah (${hajjUmrahResults.length})` : `الحج والعمرة (${toArabic(hajjUmrahResults.length)})`}
                                    </h3>
                                </div>
                                {hajjUmrahResults.map((r, idx) => (
                                    <button 
                                        key={`hajjUmrah-${idx}`} 
                                        className={`w-full ${isEn ? 'text-left' : 'text-right'} p-4 rounded-2xl ${card3DClass} border-0 transition-all cursor-pointer mb-2.5`}
                                        style={itemCardStyle('rgba(255,255,255,0.05)')}
                                        onClick={() => handleResultClick('hajj-umrah', { screen: r.section || 'umrah', title: r.title })}
                                    >
                                        <div className="text-xs font-bold opacity-80 mb-2" style={{ color: theme.textColor }}>
                                            {r.title}
                                        </div>
                                        <div className="text-xs leading-relaxed opacity-80" style={{ color: isFromQuran ? (theme.accent || theme.palette[0]) : s3d.noticeAccent }}>
                                            {highlightText(r.text || r.subtitle || r.explanation, r.highlightRegex)}
                                        </div>
                                    </button>
                                ))}
                            </>
                        )}
                    </div>
                )}

                {/* 11. Ten Promised Paradise */}
                {showTenPromised && tenPromisedResults.length > 0 && (
                    <div className="space-y-3 mt-4">
                        {isAllSelected ? (
                            <div className={`mb-3 rounded-2xl ${card3DClass} overflow-hidden border-0`} style={headerCardStyle('rgba(255,255,255,0.03)')}>
                                <button 
                                    onClick={() => setExpandedCategories(p => ({ ...p, tenPromised: !p.tenPromised }))}
                                    className={`w-full flex justify-between items-center p-4 transition-all ${btn3DClass} border-0 rounded-2xl cursor-pointer`}
                                    style={headerCardStyle('rgba(255,255,255,0.06)')}
                                >
                                    <h4 className="font-bold text-base flex items-center gap-2.5" style={{ color: isFromQuran ? (theme.accent || theme.palette[0]) : s3d.noticeAccent }}>
                                        <Users className="w-5 h-5 quran-3d-icon" /> 
                                        {isEn ? "Ten Promised Paradise" : "العشرة المبشرون بالجنة"}
                                    </h4>
                                    <div className="flex items-center gap-2">
                                        <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${inner3DClass} border-0`} style={badge3DStyle}>
                                            {isEn ? tenPromisedResults.length : toArabic(tenPromisedResults.length)}
                                        </span>
                                        <ChevronLeft className={`w-5 h-5 transition-transform quran-3d-icon ${expandedCategories.tenPromised ? (isEn ? 'rotate-90' : '-rotate-90') : (isEn ? 'rotate-180' : '')}`} />
                                    </div>
                                </button>
                                {expandedCategories.tenPromised && (
                                    <div className="p-3 space-y-2.5" style={{ backgroundColor: theme.isDark ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.015)' }}>
                                        {tenPromisedResults.map((r, idx) => (
                                            <button 
                                                key={`tenPromised-${idx}`} 
                                                className={`w-full ${isEn ? 'text-left' : 'text-right'} p-3.5 rounded-2xl ${card3DClass} border-0 transition-all cursor-pointer`}
                                                onClick={() => handleResultClick('ten-promised', { companionId: r.id })}
                                                style={itemCardStyle('rgba(255,255,255,0.05)')}
                                            >
                                                <div className="font-bold text-sm mb-1" style={{ color: isFromQuran ? (theme.accent || theme.palette[0]) : s3d.noticeAccent }}>
                                                    {isEn ? r.nameEn : r.nameAr}
                                                </div>
                                                <div className="text-xs leading-relaxed opacity-80 line-clamp-2" style={{ color: theme.textColor }}>
                                                    {highlightText(isEn ? (r.titleBadgeEn || r.hadithEn) : (r.titleBadgeAr || r.hadithAr), r.highlightRegex)}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <>
                                <div className="flex items-center gap-2.5 mb-2 px-1">
                                    <span className={`p-2 rounded-xl ${inner3DClass} border-0`} style={sectionIconStyle}>
                                        <Users className="w-4 h-4 quran-3d-icon" />
                                    </span>
                                    <h3 className="font-bold text-sm opacity-90" style={{ color: theme.textColor }}>
                                        {isEn ? `Ten Promised Paradise (${tenPromisedResults.length})` : `العشرة المبشرون بالجنة (${toArabic(tenPromisedResults.length)})`}
                                    </h3>
                                </div>
                                {tenPromisedResults.map((r, idx) => (
                                    <button 
                                        key={`tenPromised-${idx}`} 
                                        className={`w-full ${isEn ? 'text-left' : 'text-right'} p-4 rounded-2xl ${card3DClass} border-0 transition-all cursor-pointer mb-2.5`}
                                        style={itemCardStyle('rgba(255,255,255,0.05)')}
                                        onClick={() => handleResultClick('ten-promised', { companionId: r.id })}
                                    >
                                        <div className="font-bold text-base mb-1.5" style={{ color: isFromQuran ? (theme.accent || theme.palette[0]) : s3d.noticeAccent }}>
                                            {isEn ? r.nameEn : r.nameAr}
                                        </div>
                                        <div className="text-xs leading-relaxed opacity-80 mb-2" style={{ color: theme.textColor }}>
                                            {highlightText(isEn ? r.titleBadgeEn : r.titleBadgeAr, r.highlightRegex)}
                                        </div>
                                        {(r.hadithAr || r.hadithEn) && (
                                            <div className="text-xs opacity-70 font-semibold border-t pt-2 mt-2 border-black/10 dark:border-white/10">
                                                {highlightText(isEn ? r.hadithEn : r.hadithAr, r.highlightRegex)}
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </>
                        )}
                    </div>
                )}
                {/* 12. Divine Miracles */}
                {showDivineMiracles && divineMiraclesResults.length > 0 && (
                    <div className="space-y-3 mt-4">
                        {isAllSelected ? (
                            <div className={`mb-3 rounded-2xl ${card3DClass} overflow-hidden border-0`} style={headerCardStyle('rgba(255,255,255,0.03)')}>
                                <button 
                                    onClick={() => setExpandedCategories(p => ({ ...p, divineMiracles: !p.divineMiracles }))}
                                    className={`w-full flex justify-between items-center p-4 transition-all ${btn3DClass} border-0 rounded-2xl cursor-pointer`}
                                    style={headerCardStyle('rgba(255,255,255,0.06)')}
                                >
                                    <h4 className="font-bold text-base flex items-center gap-2.5" style={{ color: isFromQuran ? (theme.accent || theme.palette[0]) : s3d.noticeAccent }}>
                                        <Sparkles className="w-5 h-5 quran-3d-icon" /> 
                                        {isEn ? "Divine Miracles" : "المعجزات الإلهية"}
                                    </h4>
                                    <div className="flex items-center gap-2">
                                        <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${inner3DClass} border-0`} style={badge3DStyle}>
                                            {isEn ? divineMiraclesResults.length : toArabic(divineMiraclesResults.length)}
                                        </span>
                                        <ChevronLeft className={`w-5 h-5 transition-transform quran-3d-icon ${expandedCategories.divineMiracles ? (isEn ? 'rotate-90' : '-rotate-90') : (isEn ? 'rotate-180' : '')}`} />
                                    </div>
                                </button>
                                {expandedCategories.divineMiracles && (
                                    <div className="p-3 space-y-2.5" style={{ backgroundColor: theme.isDark ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.015)' }}>
                                        {divineMiraclesResults.map((r, idx) => (
                                            <button 
                                                key={`divineMiracles-${idx}`} 
                                                className={`w-full ${isEn ? 'text-left' : 'text-right'} p-3.5 rounded-2xl ${card3DClass} border-0 transition-all cursor-pointer`}
                                                onClick={() => handleResultClick('divine-miracles', { highlightId: r.id, itemId: r.id })}
                                                style={itemCardStyle('rgba(255,255,255,0.05)')}
                                            >
                                                <div className="font-bold text-sm mb-1" style={{ color: isFromQuran ? (theme.accent || theme.palette[0]) : s3d.noticeAccent }}>
                                                    {isEn ? r.titleEn : r.titleAr}
                                                </div>
                                                <div className="text-xs leading-relaxed opacity-80 line-clamp-2" style={{ color: theme.textColor }}>
                                                    {highlightText(isEn ? (r.summaryEn || r.badgeEn) : (r.summaryAr || r.badgeAr), r.highlightRegex)}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <>
                                <div className="flex items-center gap-2.5 mb-2 px-1">
                                    <span className={`p-2 rounded-xl ${inner3DClass} border-0`} style={sectionIconStyle}>
                                        <Sparkles className="w-4 h-4 quran-3d-icon" />
                                    </span>
                                    <h3 className="font-bold text-sm opacity-90" style={{ color: theme.textColor }}>
                                        {isEn ? `Divine Miracles (${divineMiraclesResults.length})` : `المعجزات الإلهية (${toArabic(divineMiraclesResults.length)})`}
                                    </h3>
                                </div>
                                {divineMiraclesResults.map((r, idx) => (
                                    <button 
                                        key={`divineMiracles-${idx}`} 
                                        className={`w-full ${isEn ? 'text-left' : 'text-right'} p-4 rounded-2xl ${card3DClass} border-0 transition-all cursor-pointer mb-2.5`}
                                        style={itemCardStyle('rgba(255,255,255,0.05)')}
                                        onClick={() => handleResultClick('divine-miracles', { highlightId: r.id, itemId: r.id })}
                                    >
                                        <div className="font-bold text-base mb-1.5" style={{ color: isFromQuran ? (theme.accent || theme.palette[0]) : s3d.noticeAccent }}>
                                            {isEn ? r.titleEn : r.titleAr}
                                        </div>
                                        <div className="text-xs leading-relaxed opacity-80 mb-2" style={{ color: theme.textColor }}>
                                            {highlightText(isEn ? r.summaryEn : r.summaryAr, r.highlightRegex)}
                                        </div>
                                        {(r.badgeAr || r.badgeEn) && (
                                            <div className="text-xs opacity-70 font-semibold border-t pt-2 mt-2 border-black/10 dark:border-white/10">
                                                {isEn ? r.badgeEn : r.badgeAr}
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </>
                        )}
                    </div>
                )}
            </div>
        );
    };

    const sectionsList = [
        { id: 'all', label: isEn ? 'All Sections' : 'كل الأقسام' },
        { id: 'quran', label: isEn ? 'Quran' : 'القرآن الكريم' },
        { id: 'athkar', label: isEn ? 'Adhkar' : 'أذكار اليوم' },
        { id: 'salahAthkar', label: isEn ? 'Prayer Adhkar' : 'أذكار الصلاة' },
        { id: 'dua', label: isEn ? 'Supplications' : 'الأدعية' },
        { id: 'ruqyah', label: isEn ? 'Ruqyah' : 'الرقية الشرعية' },
        { id: 'hisn', label: isEn ? 'Hisn Al-Muslim' : 'حصن المسلم' },
        { id: 'nawawi', label: isEn ? 'An-Nawawi 40' : 'الأربعون النووية' },
        { id: 'asmaulHusna', label: isEn ? 'Asmaul Husna' : 'أسماء الله الحسنى' },
        { id: 'seerah', label: isEn ? 'Seerah' : 'السيرة النبوية' },
        { id: 'hajjUmrah', label: isEn ? 'Hajj & Umrah' : 'الحج والعمرة' },
        { id: 'tenPromised', label: isEn ? 'Ten Promised' : 'العشرة المبشرون' },
        { id: 'divineMiracles', label: isEn ? 'Divine Miracles' : 'المعجزات الإلهية' },
    ];
    const otherSections = sectionsList.filter(s => s.id !== 'all');
    const isAllSelected = selectedSections.includes('all') || selectedSections.length === 0;

    const pageTitle = isEn ? 'Advanced Search' : 'البحث المتقدم';

    return (
        <div
            className={`h-[100dvh] w-full flex flex-col relative overflow-hidden transition-colors ${isQuranLandscape ? 'global-search-landscape' : ''} ${theme.isDark ? 'dark' : ''}`}
            dir={isEn ? "ltr" : "rtl"}
            style={{
                backgroundColor: theme.bgColor
            }}
        >
            <header className="app-top-bar shrink-0" dir={isEn ? 'ltr' : 'rtl'}>
                <div className="app-top-bar__inner">
                    <div className="relative flex items-center justify-center w-full min-h-[44px]">
                        {/* Back button */}
                        <div className={`absolute ${isEn ? 'left-0' : 'right-0'} flex items-center`}>
                            <button
                                onClick={handleBack}
                                className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:bg-black/10 dark:hover:bg-white/10 active:scale-90 cursor-pointer"
                                title={isEn ? "Go Back" : "رجوع للخلف"}
                                aria-label={isEn ? "Go Back" : "رجوع للخلف"}
                            >
                                <i className={`fa-solid ${isEn ? 'fa-arrow-left' : 'fa-arrow-right'} text-xl`}></i>
                            </button>
                        </div>

                        {/* Title in center */}
                        <div className="text-center px-12 min-w-0">
                            <h1 className="app-top-bar__title text-lg sm:text-xl font-cairo truncate">
                                {pageTitle}
                            </h1>
                        </div>

                        {/* Home button */}
                        <div className={`absolute ${isEn ? 'right-0' : 'left-0'} flex items-center gap-1`}>
                            <button
                                onClick={handleGoHome}
                                className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:bg-black/10 dark:hover:bg-white/10 active:scale-90 cursor-pointer"
                                title={isEn ? "Home" : "الصفحة الرئيسية"}
                                aria-label={isEn ? "Home" : "الصفحة الرئيسية"}
                            >
                                <i className="fa-solid fa-house text-xl"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Sub-header with Search Input */}
            <div
                className={`w-full mx-auto shrink-0 z-10 border-0 overflow-visible ${isQuranLandscape ? 'global-search-subheader max-w-none pt-2 pb-1' : 'max-w-lg md:max-w-2xl px-4 pt-3 pb-2'}`}
                style={{ backgroundColor: theme.bgColor }}
            >
                <div className="relative overflow-visible mb-1 flex items-center">
                        <input 
                            type="text" 
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder={
                                isAllSelected 
                                    ? (isEn ? "Search across all sections..." : "ابحث في جميع أقسام التطبيق...")
                                    : (isEn 
                                        ? "Search in selected sections..." 
                                        : "ابحث في الأقسام المحددة...")
                            } 
                            className={`w-full py-3 px-3 rounded-2xl focus:outline-none text-xs sm:text-sm font-bold ${card3DClass} border-0 transition-all ${isEn ? 'pl-12 pr-11 text-left' : 'pr-12 pl-11 text-right'}`}
                            dir={isEn ? "ltr" : "rtl"}
                            style={isFromQuran ? {
                                backgroundColor: theme.isDark ? 'rgba(255,255,255,0.07)' : (theme.btnBg || '#ffffff'), 
                                color: theme.textColor,
                                border: 'none',
                                outline: 'none'
                            } : {
                                color: s3d.textColor,
                                outline: 'none'
                            }}
                        />
                        <span
                            className={`absolute ${isEn ? 'left-2.5' : 'right-2.5'} top-1/2 -translate-y-1/2 w-7 h-7 rounded-full ${isFromQuran ? 'quran-3d-badge' : 'app-3d-badge'} border-0 pointer-events-none flex items-center justify-center`}
                            style={sectionIconStyle}
                            aria-hidden="true"
                        >
                            <Search className="w-3.5 h-3.5 quran-3d-icon" style={{ color: isFromQuran ? (theme.accent || theme.palette[0]) : s3d.noticeAccent }} />
                        </span>
                        {query && (
                            <button 
                                onClick={() => { setQuery(''); setTimeout(() => (document.querySelector('input') as HTMLElement)?.focus(), 10); }} 
                                className={`absolute ${isEn ? 'right-2.5' : 'left-2.5'} top-1/2 transform -translate-y-1/2 w-7 h-7 rounded-full ${isFromQuran ? 'quran-raised-card' : `app-page-card ${s3d.surfaceCardClass}`} border-0 cursor-pointer flex items-center justify-center`}
                                style={isFromQuran ? { backgroundColor: theme.isDark ? 'rgba(255,255,255,0.08)' : '#f3f4f6', border: 'none' } : undefined}
                                title={isEn ? "Clear" : "مسح"}
                            >
                                <X className="w-3.5 h-3.5 quran-3d-icon" style={{ color: isFromQuran ? (theme.accent || theme.palette[0]) : s3d.noticeAccent }} />
                            </button>
                        )}
                    </div>

                    {/* Pages & Sections Selector Bar */}
                    {(() => {
                        const hasTypedText = query.trim().length > 0;
                        const showOnlySelectedSections = !isAllSelected && hasTypedText;
                        const visibleOtherSections = showOnlySelectedSections
                            ? otherSections.filter(sec => selectedSections.includes(sec.id))
                            : otherSections;

                        return (
                            <div className="mt-2.5 flex items-center gap-2 pb-1.5 overflow-visible">
                                {/* Fixed "All Sections" Button */}
                                {!showOnlySelectedSections && (
                                    <button 
                                        key="all"
                                        onClick={() => handleToggleSection('all')}
                                        className={`px-3 py-1.5 rounded-xl whitespace-nowrap text-[11px] font-bold transition-all border-0 cursor-pointer shrink-0 flex items-center gap-1.5 ${
                                            isAllSelected 
                                                ? (isFromQuran ? 'quran-raised-btn-selected shadow-md scale-[1.02]' : 'app-page-card')
                                                : (isFromQuran ? 'quran-raised-btn opacity-85 hover:opacity-100' : `${btn3DClass}`)
                                        }`}
                                        style={isAllSelected ? badge3DStyle : headerCardStyle('rgba(255,255,255,0.06)')}
                                    >
                                        <span>{isEn ? "All Sections" : "كل الأقسام"}</span>
                                        {query && totalResults > 0 && (
                                            <span 
                                                className={`${isFromQuran ? 'quran-3d-badge' : 'app-3d-badge'} border-0 text-[10px] px-1.5 py-0.2 rounded-full font-extrabold`}
                                                style={{ 
                                                    backgroundColor: isAllSelected ? 'rgba(0,0,0,0.2)' : (theme.isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.07)'),
                                                    color: isAllSelected ? (isFromQuran ? accentBadgeText : s3d.btnTextColor) : theme.textColor
                                                }}
                                            >
                                                {isEn ? totalResults : toArabic(totalResults)}
                                            </span>
                                        )}
                                    </button>
                                )}

                                {/* Scrollable Remaining Section Buttons */}
                                <div className="flex-1 flex overflow-x-auto gap-2 py-2 px-0.5 hide-scrollbar">
                                    {visibleOtherSections.map(sec => {
                                        const isSelected = !isAllSelected && selectedSections.includes(sec.id);

                                        let count = 0;
                                        if (sec.id === 'quran') count = quranResults.length;
                                        else if (sec.id === 'athkar') count = athkarResults.length;
                                        else if (sec.id === 'salahAthkar') count = salahAthkarResults.length;
                                        else if (sec.id === 'dua') count = duaResults.length;
                                        else if (sec.id === 'ruqyah') count = ruqyahResults.length;
                                        else if (sec.id === 'hisn') count = hisnResults.length;
                                        else if (sec.id === 'nawawi') count = nawawiResults.length;
                                        else if (sec.id === 'asmaulHusna') count = asmaulHusnaResults.length;
                                        else if (sec.id === 'seerah') count = seerahResults.length;
                                        else if (sec.id === 'hajjUmrah') count = hajjUmrahResults.length;
                                        else if (sec.id === 'tenPromised') count = tenPromisedResults.length;
                                        else if (sec.id === 'divineMiracles') count = divineMiraclesResults.length;

                                        return (
                                            <button 
                                                key={sec.id}
                                                onClick={() => handleToggleSection(sec.id)}
                                                className={`px-3 py-1.5 rounded-xl whitespace-nowrap text-[11px] font-bold transition-all border-0 cursor-pointer flex items-center gap-1.5 shrink-0 ${
                                                    isSelected 
                                                        ? (isFromQuran ? 'quran-raised-btn-selected shadow-md scale-[1.02]' : 'app-page-card')
                                                        : (isFromQuran ? 'quran-raised-btn opacity-85 hover:opacity-100' : `${btn3DClass}`)
                                                }`}
                                                style={isSelected ? badge3DStyle : headerCardStyle('rgba(255,255,255,0.06)')}
                                            >
                                                <span>{sec.label}</span>
                                                {query && totalResults > 0 && count > 0 && (
                                                    <span 
                                                        className={`${isFromQuran ? 'quran-3d-badge' : 'app-3d-badge'} border-0 text-[10px] px-1.5 py-0.2 rounded-full font-extrabold`}
                                                        style={{ 
                                                            backgroundColor: isSelected ? 'rgba(0,0,0,0.2)' : (theme.isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.07)'),
                                                            color: isSelected ? (isFromQuran ? accentBadgeText : s3d.btnTextColor) : theme.textColor
                                                        }}
                                                    >
                                                        {isEn ? count : toArabic(count)}
                                                    </span>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })()}
                </div>

            {/* Content */}
            <div 
                className="flex-1 min-h-0 overflow-y-auto app-scroll-safe w-full" 
                dir={isEn ? "ltr" : "rtl"} 
                style={{ 
                    backgroundColor: theme.bgColor
                }}
            >
                <div className={`mx-auto py-2 w-full ${isQuranLandscape ? 'global-search-results-inner max-w-none' : 'max-w-lg md:max-w-2xl px-4'}`}>
                    {renderResults()}
                </div>
            </div>
        </div>
    );
};

export default GlobalSearch;
