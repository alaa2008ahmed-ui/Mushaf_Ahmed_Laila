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

// Helper to get reader theme
const getReaderTheme = () => {
    try {
        const themeId = localStorage.getItem('current_theme_id_v') || 'black';
        const quranSettings = JSON.parse(localStorage.getItem('quran_settings_v') || '{}');
        const originalTheme = THEMES[themeId as keyof typeof THEMES] || THEMES.black;
        
        const bgColor = quranSettings.bgColor || originalTheme.bg;
        const textColor = quranSettings.textColor || originalTheme.text;
        const accent = quranSettings.highlightTextColor || originalTheme.accent;

        return {
            ...originalTheme,
            bgColor,
            textColor,
            text: textColor,
            bg: bgColor,
            accent,
            palette: [accent, originalTheme.barText, originalTheme.btnBg],
            font: quranSettings.fontFamily || originalTheme.font,
            isDark: ['#000000', '#0a0a0a', '#18181b', '#09090b', '#022c22', '#450a0a', '#1e3a8a', '#422006', '#78350f', '#4c1d95', '#0f172a', '#134e4a', '#334155'].includes(bgColor.toUpperCase())
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
    const { setCurrentPage } = useTheme();
    const { language, isRTL } = useLanguage();
    const isEn = language === 'en';
    const [readerTheme, setReaderTheme] = useState(getReaderTheme());
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
        setCurrentPage('quran_search');
        
        const handleThemeChange = () => {
            setReaderTheme(getReaderTheme());
        };
        
        window.addEventListener('theme-change', handleThemeChange);
        window.addEventListener('settings-change', handleThemeChange);
        return () => {
            window.removeEventListener('theme-change', handleThemeChange);
            window.removeEventListener('settings-change', handleThemeChange);
        };
    }, [setCurrentPage]);

    const theme = readerTheme;
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
                <div className="flex flex-col items-center justify-center py-20 opacity-60">
                    <Search className="w-16 h-16 mb-4 opacity-50" />
                    <p className="font-bold">{isEn ? "No results found for your search" : "لا توجد نتائج لبحثك"}</p>
                </div>
            );
        }

        if (!query) {
            return (
                <div className="flex flex-col items-center justify-center py-20 opacity-60">
                    <Search className="w-16 h-16 mb-4 opacity-50" />
                    <p className="font-bold text-center">
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
                            <div className="mb-2 border rounded-xl overflow-hidden shadow-sm" style={{ borderColor: `${theme.accent || theme.palette[0]}33` }}>
                                <button 
                                    onClick={() => setExpandedCategories(p => ({ ...p, quran: !p.quran }))}
                                    className="w-full flex justify-between items-center p-4 transition-colors"
                                    style={{ backgroundColor: `${theme.barBg}33` }}
                                >
                                    <h4 className="font-bold text-lg flex items-center gap-2" style={{ color: theme.accent || theme.palette[0] }}>
                                        <BookOpen className="w-5 h-5" /> 
                                        {isEn ? "The Holy Quran" : "القرآن الكريم"}
                                    </h4>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-bold px-2 py-1 rounded-full" style={{ backgroundColor: `${theme.accent || theme.palette[0]}33`, color: theme.accent || theme.palette[0] }}>
                                            {isEn ? quranResults.length : toArabic(quranResults.length)}
                                        </span>
                                        <ChevronLeft className={`w-5 h-5 transition-transform ${expandedCategories.quran ? (isEn ? 'rotate-90' : '-rotate-90') : (isEn ? 'rotate-180' : '')}`} />
                                    </div>
                                </button>
                                {expandedCategories.quran && (
                                    <div className="p-2 space-y-2" style={{ backgroundColor: `${theme.barBg}22` }}>
                                        {sortedQuranSurahs.map(surahNum => {
                                            const group = groupedQuran[surahNum];
                                            const isExpanded = expandedSurahs[surahNum];
                                            const surahDisplayName = isEn 
                                                ? `Surah ${group.surahNameEn || SURAH_NAMES_EN[surahNum - 1] || group.surahName}` 
                                                : `سورة ${group.surahName}`;
                                            return (
                                                <div key={surahNum} className="mb-2 border rounded-xl overflow-hidden shadow-sm" style={{ borderColor: `${theme.accent || theme.palette[0]}33` }}>
                                                    <button 
                                                        onClick={() => toggleSurah(surahNum)}
                                                        className="w-full flex justify-between items-center p-4 transition-colors"
                                                        style={{ backgroundColor: `${theme.barBg}33` }}
                                                    >
                                                        <h4 className={`${isEn ? 'font-bold' : 'font-amiri-quran'} text-lg font-bold`} style={{ color: theme.accent || theme.palette[0] }}>
                                                            {surahDisplayName}
                                                        </h4>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xs font-bold px-2 py-1 rounded-full" style={{ backgroundColor: `${theme.accent || theme.palette[0]}33`, color: theme.accent || theme.palette[0] }}>
                                                                {isEn ? group.ayahs.length : toArabic(group.ayahs.length)}
                                                            </span>
                                                            <ChevronLeft className={`w-5 h-5 transition-transform ${isExpanded ? (isEn ? 'rotate-90' : '-rotate-90') : (isEn ? 'rotate-180' : '')}`} />
                                                        </div>
                                                    </button>
                                                    
                                                    {isExpanded && (
                                                        <div className="divide-y" style={{ backgroundColor: `${theme.barBg}11`, borderColor: `${theme.accent || theme.palette[0]}22` }}>
                                                            {group.ayahs.map((r, idx) => (
                                                                <button 
                                                                    key={`quran-${surahNum}-${idx}`} 
                                                                    className={`w-full ${isEn ? 'text-left' : 'text-right'} p-4 transition-colors hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer`}
                                                                    style={{ color: theme.textColor }}
                                                                    onClick={() => onNavigate('quran', { surah: r.surah, ayah: r.ayah, readingMode: isEn ? 'translation' : undefined })}
                                                                >
                                                                    <div className="text-xs opacity-60 mb-2 flex items-center gap-1 font-bold">
                                                                        <span>{isEn ? `Verse ${r.ayah}` : `آية ${toArabic(r.ayah)}`}</span>
                                                                        <span>•</span>
                                                                        <span>{isEn ? `Juz ${r.juz}` : `جزء ${toArabic(r.juz)}`}</span>
                                                                        <span>•</span>
                                                                        <span>{isEn ? `Page ${r.page}` : `صفحة ${toArabic(r.page)}`}</span>
                                                                    </div>
                                                                    {isEn ? (
                                                                        <div className="space-y-2">
                                                                            <div className="text-base font-medium leading-relaxed" style={{ color: theme.textColor }}>
                                                                                {highlightText(r.textEn || r.text, r.highlightRegex)}
                                                                            </div>
                                                                            <div className="font-amiri-quran text-sm opacity-70 leading-loose text-right" dir="rtl">
                                                                                {r.text}
                                                                            </div>
                                                                        </div>
                                                                    ) : (
                                                                        <div className="font-amiri-quran text-lg leading-loose" dir="rtl">
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
                                <h3 className="font-bold text-lg opacity-80 border-b pb-2 flex items-center gap-2" style={{ borderColor: theme.barBorder }}>
                                    <BookOpen className="w-5 h-5" /> 
                                    {isEn ? `The Holy Quran (${quranResults.length})` : `القرآن الكريم (${toArabic(quranResults.length)})`}
                                </h3>
                                {sortedQuranSurahs.map(surahNum => {
                                    const group = groupedQuran[surahNum];
                                    const isExpanded = expandedSurahs[surahNum];
                                    const surahDisplayName = isEn 
                                        ? `Surah ${group.surahNameEn || SURAH_NAMES_EN[surahNum - 1] || group.surahName}` 
                                        : `سورة ${group.surahName}`;
                                    return (
                                        <div key={surahNum} className="mb-2 border rounded-xl overflow-hidden shadow-sm" style={{ borderColor: `${theme.accent || theme.palette[0]}33` }}>
                                            <button 
                                                onClick={() => toggleSurah(surahNum)}
                                                className="w-full flex justify-between items-center p-4 transition-colors"
                                                style={{ backgroundColor: `${theme.barBg}33` }}
                                            >
                                                <h4 className={`${isEn ? 'font-bold' : 'font-amiri-quran'} text-lg font-bold`} style={{ color: theme.accent || theme.palette[0] }}>
                                                    {surahDisplayName}
                                                </h4>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-bold px-2 py-1 rounded-full" style={{ backgroundColor: `${theme.accent || theme.palette[0]}33`, color: theme.accent || theme.palette[0] }}>
                                                        {isEn ? group.ayahs.length : toArabic(group.ayahs.length)}
                                                    </span>
                                                    <ChevronLeft className={`w-5 h-5 transition-transform ${isExpanded ? (isEn ? 'rotate-90' : '-rotate-90') : (isEn ? 'rotate-180' : '')}`} />
                                                </div>
                                            </button>
                                            
                                            {isExpanded && (
                                                <div className="divide-y" style={{ backgroundColor: `${theme.barBg}11`, borderColor: `${theme.accent || theme.palette[0]}22` }}>
                                                    {group.ayahs.map((r, idx) => (
                                                        <button 
                                                            key={`quran-${surahNum}-${idx}`} 
                                                            className={`w-full ${isEn ? 'text-left' : 'text-right'} p-4 transition-colors hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer`}
                                                            style={{ color: theme.textColor }}
                                                            onClick={() => onNavigate('quran', { surah: r.surah, ayah: r.ayah, readingMode: isEn ? 'translation' : undefined })}
                                                        >
                                                            <div className="text-xs opacity-60 mb-2 flex items-center gap-1 font-bold">
                                                                <span>{isEn ? `Verse ${r.ayah}` : `آية ${toArabic(r.ayah)}`}</span>
                                                                <span>•</span>
                                                                <span>{isEn ? `Juz ${r.juz}` : `جزء ${toArabic(r.juz)}`}</span>
                                                                <span>•</span>
                                                                <span>{isEn ? `Page ${r.page}` : `صفحة ${toArabic(r.page)}`}</span>
                                                            </div>
                                                            {isEn ? (
                                                                <div className="space-y-2">
                                                                    <div className="text-base font-medium leading-relaxed" style={{ color: theme.textColor }}>
                                                                        {highlightText(r.textEn || r.text, r.highlightRegex)}
                                                                    </div>
                                                                    <div className="font-amiri-quran text-sm opacity-70 leading-loose text-right" dir="rtl">
                                                                        {r.text}
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <div className="font-amiri-quran text-lg leading-loose" dir="rtl">
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
                    <div className="space-y-3 mt-6">
                        {activeTab === 'all' ? (
                            <div className="mb-2 border rounded-xl overflow-hidden shadow-sm" style={{ borderColor: `${theme.accent || theme.palette[0]}33` }}>
                                <button 
                                    onClick={() => setExpandedCategories(p => ({ ...p, dua: !p.dua }))}
                                    className="w-full flex justify-between items-center p-4 transition-colors"
                                    style={{ backgroundColor: `${theme.barBg}33` }}
                                >
                                    <h4 className="font-bold text-lg flex items-center gap-2" style={{ color: theme.accent || theme.palette[0] }}>
                                        <Heart className="w-5 h-5" /> 
                                        {isEn ? "Supplications (Duas)" : "الأدعية"}
                                    </h4>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-bold px-2 py-1 rounded-full" style={{ backgroundColor: `${theme.accent || theme.palette[0]}33`, color: theme.accent || theme.palette[0] }}>
                                            {isEn ? duaResults.length : toArabic(duaResults.length)}
                                        </span>
                                        <ChevronLeft className={`w-5 h-5 transition-transform ${expandedCategories.dua ? (isEn ? 'rotate-90' : '-rotate-90') : (isEn ? 'rotate-180' : '')}`} />
                                    </div>
                                </button>
                                {expandedCategories.dua && (
                                    <div className="divide-y p-2 space-y-2" style={{ backgroundColor: `${theme.barBg}22`, borderColor: `${theme.accent || theme.palette[0]}22` }}>
                                        {duaResults.map((r, idx) => (
                                            <button 
                                                key={`dua-${idx}`} 
                                                className={`w-full ${isEn ? 'text-left' : 'text-right'} p-3 rounded-lg transition-colors hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer`}
                                                onClick={() => onNavigate(r.targetPage || 'adia')}
                                                style={{ color: theme.textColor }}
                                            >
                                                <div className={`${isEn ? 'text-base font-medium' : 'font-qalam text-lg'} leading-relaxed mb-1 line-clamp-2`} style={{ color: theme.accent || theme.palette[0] }}>
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
                                <h3 className="font-bold text-lg opacity-80 border-b pb-2 flex items-center gap-2" style={{ borderColor: theme.barBorder }}>
                                    <Heart className="w-5 h-5" /> 
                                    {isEn ? `Supplications (${duaResults.length})` : `الأدعية (${toArabic(duaResults.length)})`}
                                </h3>
                                {duaResults.map((r, idx) => (
                                    <button 
                                        key={`dua-${idx}`} 
                                        className={`w-full ${isEn ? 'text-left' : 'text-right'} p-4 rounded-xl border shadow-sm transition-all hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer`}
                                        style={{ backgroundColor: `${theme.barBg}33`, borderColor: theme.barBorder, color: theme.textColor }}
                                        onClick={() => onNavigate(r.targetPage || 'adia')}
                                    >
                                        <div className={`${isEn ? 'text-base font-medium' : 'font-qalam text-lg'} leading-relaxed mb-2`} style={{ color: theme.accent || theme.palette[0] }}>
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
                    <div className="space-y-3 mt-6">
                        {activeTab === 'all' ? (
                            <div className="mb-2 border rounded-xl overflow-hidden shadow-sm" style={{ borderColor: `${theme.accent || theme.palette[0]}33` }}>
                                <button 
                                    onClick={() => setExpandedCategories(p => ({ ...p, athkar: !p.athkar }))}
                                    className="w-full flex justify-between items-center p-4 transition-colors"
                                    style={{ backgroundColor: `${theme.barBg}33` }}
                                >
                                    <h4 className="font-bold text-lg flex items-center gap-2" style={{ color: theme.accent || theme.palette[0] }}>
                                        <Sun className="w-5 h-5" /> 
                                        {isEn ? "Adhkar (Remembrances)" : "الأذكار"}
                                    </h4>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-bold px-2 py-1 rounded-full" style={{ backgroundColor: `${theme.accent || theme.palette[0]}33`, color: theme.accent || theme.palette[0] }}>
                                            {isEn ? athkarResults.length : toArabic(athkarResults.length)}
                                        </span>
                                        <ChevronLeft className={`w-5 h-5 transition-transform ${expandedCategories.athkar ? (isEn ? 'rotate-90' : '-rotate-90') : (isEn ? 'rotate-180' : '')}`} />
                                    </div>
                                </button>
                                {expandedCategories.athkar && (
                                    <div className="divide-y p-2 space-y-2" style={{ backgroundColor: `${theme.barBg}22`, borderColor: `${theme.accent || theme.palette[0]}22` }}>
                                        {athkarResults.map((r, idx) => (
                                            <button 
                                                key={`athkar-${idx}`} 
                                                className={`w-full ${isEn ? 'text-left' : 'text-right'} p-3 rounded-lg transition-colors hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer`}
                                                onClick={() => onNavigate('sabah-masaa')}
                                                style={{ color: theme.textColor }}
                                            >
                                                <div className="text-[10px] opacity-60 mb-1 font-bold flex items-center gap-1">
                                                    {r.kind === 'morning' ? <Sun className="w-3 h-3" style={{ color: theme.accent || theme.palette[0] }} /> : <Moon className="w-3 h-3" style={{ color: theme.accent || theme.palette[0] }} />}
                                                    <span>{r.kind === 'morning' ? (isEn ? 'Morning Adhkar' : 'أذكار الصباح') : (isEn ? 'Evening Adhkar' : 'أذكار المساء')}</span>
                                                </div>
                                                <div className={`${isEn ? 'text-base font-medium' : 'font-qalam text-lg'} leading-relaxed line-clamp-2`} style={{ color: theme.accent || theme.palette[0] }}>
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
                                <h3 className="font-bold text-lg opacity-80 border-b pb-2 flex items-center gap-2" style={{ borderColor: theme.barBorder }}>
                                    <Sun className="w-5 h-5" /> 
                                    {isEn ? `Adhkar (${athkarResults.length})` : `الأذكار (${toArabic(athkarResults.length)})`}
                                </h3>
                                {athkarResults.map((r, idx) => (
                                    <button 
                                        key={`athkar-${idx}`} 
                                        className={`w-full ${isEn ? 'text-left' : 'text-right'} p-4 rounded-xl border shadow-sm transition-all hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer`}
                                        style={{ backgroundColor: `${theme.barBg}33`, borderColor: theme.barBorder, color: theme.textColor }}
                                        onClick={() => onNavigate('sabah-masaa')}
                                    >
                                        <div className="text-[10px] opacity-60 mb-2 font-bold flex items-center gap-1">
                                            {r.kind === 'morning' ? <Sun className="w-3 h-3" style={{ color: theme.accent || theme.palette[0] }} /> : <Moon className="w-3 h-3" style={{ color: theme.accent || theme.palette[0] }} />}
                                            <span>{r.kind === 'morning' ? (isEn ? 'Morning Adhkar' : 'أذكار الصباح') : (isEn ? 'Evening Adhkar' : 'أذكار المساء')}</span>
                                        </div>
                                        <div className={`${isEn ? 'text-base font-medium' : 'font-qalam text-lg'} leading-relaxed mb-1`} style={{ color: theme.accent || theme.palette[0] }}>
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
                    <div className="space-y-3 mt-6">
                        {activeTab === 'all' ? (
                            <div className="mb-2 border rounded-xl overflow-hidden shadow-sm" style={{ borderColor: `${theme.accent || theme.palette[0]}33` }}>
                                <button 
                                    onClick={() => setExpandedCategories(p => ({ ...p, hisn: !p.hisn }))}
                                    className="w-full flex justify-between items-center p-4 transition-colors"
                                    style={{ backgroundColor: `${theme.barBg}33` }}
                                >
                                    <h4 className="font-bold text-lg flex items-center gap-2" style={{ color: theme.accent || theme.palette[0] }}>
                                        <BookOpen className="w-5 h-5" /> 
                                        {isEn ? "Hisn Al-Muslim" : "حصن المسلم"}
                                    </h4>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-bold px-2 py-1 rounded-full" style={{ backgroundColor: `${theme.accent || theme.palette[0]}33`, color: theme.accent || theme.palette[0] }}>
                                            {isEn ? hisnResults.length : toArabic(hisnResults.length)}
                                        </span>
                                        <ChevronLeft className={`w-5 h-5 transition-transform ${expandedCategories.hisn ? (isEn ? 'rotate-90' : '-rotate-90') : (isEn ? 'rotate-180' : '')}`} />
                                    </div>
                                </button>
                                {expandedCategories.hisn && (
                                    <div className="divide-y p-2 space-y-2" style={{ backgroundColor: `${theme.barBg}22`, borderColor: `${theme.accent || theme.palette[0]}22` }}>
                                        {hisnResults.map((r, idx) => (
                                            <button 
                                                key={`hisn-${idx}`} 
                                                className={`w-full ${isEn ? 'text-left' : 'text-right'} p-3 rounded-lg transition-colors hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer`}
                                                onClick={() => onNavigate('hisn-muslim')}
                                                style={{ color: theme.textColor }}
                                            >
                                                <div className={`${isEn ? 'text-base font-medium' : 'font-qalam text-lg'} leading-relaxed mb-1 line-clamp-2`} style={{ color: theme.accent || theme.palette[0] }}>
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
                                <h3 className="font-bold text-lg opacity-80 border-b pb-2 flex items-center gap-2" style={{ borderColor: theme.barBorder }}>
                                    <BookOpen className="w-5 h-5" /> 
                                    {isEn ? `Hisn Al-Muslim (${hisnResults.length})` : `حصن المسلم (${toArabic(hisnResults.length)})`}
                                </h3>
                                {hisnResults.map((r, idx) => (
                                    <button 
                                        key={`hisn-${idx}`} 
                                        className={`w-full ${isEn ? 'text-left' : 'text-right'} p-4 rounded-xl border shadow-sm transition-all hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer`}
                                        style={{ backgroundColor: `${theme.barBg}33`, borderColor: theme.barBorder, color: theme.textColor }}
                                        onClick={() => onNavigate('hisn-muslim')}
                                    >
                                        <div className={`${isEn ? 'text-base font-medium' : 'font-qalam text-lg'} leading-relaxed mb-2`} style={{ color: theme.accent || theme.palette[0] }}>
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
                    <div className="space-y-3 mt-6">
                        {activeTab === 'all' ? (
                            <div className="mb-2 border rounded-xl overflow-hidden shadow-sm" style={{ borderColor: `${theme.accent || theme.palette[0]}33` }}>
                                <button 
                                    onClick={() => setExpandedCategories(p => ({ ...p, nawawi: !p.nawawi }))}
                                    className="w-full flex justify-between items-center p-4 transition-colors"
                                    style={{ backgroundColor: `${theme.barBg}33` }}
                                >
                                    <h4 className="font-bold text-lg flex items-center gap-2" style={{ color: theme.accent || theme.palette[0] }}>
                                        <BookOpen className="w-5 h-5" /> 
                                        {isEn ? "An-Nawawi's 40 Hadiths" : "الأربعون النووية"}
                                    </h4>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-bold px-2 py-1 rounded-full" style={{ backgroundColor: `${theme.accent || theme.palette[0]}33`, color: theme.accent || theme.palette[0] }}>
                                            {isEn ? nawawiResults.length : toArabic(nawawiResults.length)}
                                        </span>
                                        <ChevronLeft className={`w-5 h-5 transition-transform ${expandedCategories.nawawi ? (isEn ? 'rotate-90' : '-rotate-90') : (isEn ? 'rotate-180' : '')}`} />
                                    </div>
                                </button>
                                {expandedCategories.nawawi && (
                                    <div className="divide-y p-2 space-y-2" style={{ backgroundColor: `${theme.barBg}22`, borderColor: `${theme.accent || theme.palette[0]}22` }}>
                                        {nawawiResults.map((r, idx) => (
                                            <button 
                                                key={`nawawi-${idx}`} 
                                                className={`w-full ${isEn ? 'text-left' : 'text-right'} p-3 rounded-lg transition-colors hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer`}
                                                onClick={() => onNavigate('nawawi')}
                                                style={{ color: theme.textColor }}
                                            >
                                                <div className="text-[12px] opacity-80 mb-1 font-bold" style={{ color: theme.textColor }}>
                                                    {r.title}
                                                </div>
                                                <div className="font-qalam text-lg leading-relaxed line-clamp-2" style={{ color: theme.accent || theme.palette[0] }}>
                                                    {r.hadith}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <>
                                <h3 className="font-bold text-lg opacity-80 border-b pb-2 flex items-center gap-2" style={{ borderColor: theme.barBorder }}>
                                    <BookOpen className="w-5 h-5" /> 
                                    {isEn ? `An-Nawawi's 40 Hadiths (${nawawiResults.length})` : `الأربعون النووية (${toArabic(nawawiResults.length)})`}
                                </h3>
                                {nawawiResults.map((r, idx) => (
                                    <button 
                                        key={`nawawi-${idx}`} 
                                        className={`w-full ${isEn ? 'text-left' : 'text-right'} p-4 rounded-xl border shadow-sm transition-all hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer`}
                                        style={{ backgroundColor: `${theme.barBg}33`, borderColor: theme.barBorder, color: theme.textColor }}
                                        onClick={() => onNavigate('nawawi')}
                                    >
                                        <div className="text-sm opacity-80 mb-2 font-bold" style={{ color: theme.textColor }}>
                                            {r.title}
                                        </div>
                                        <div className="font-qalam text-lg leading-relaxed" style={{ color: theme.accent || theme.palette[0] }}>
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
        <div className="fixed top-0 left-0 right-0 z-[1500] flex items-center justify-center overflow-hidden" dir={isEn ? "ltr" : "rtl"} onClick={handleBack} style={{ backgroundColor: 'rgba(0,0,0,0.5)', height: `${initialHeight}px` }}>
            <div className="w-full h-full max-w-lg overflow-hidden shadow-none relative flex flex-col pointer-events-auto border-[4px]" dir={isEn ? "ltr" : "rtl"} style={{ backgroundColor: theme.bgColor, borderColor: theme.accent || theme.palette[0] }} onClick={e => e.stopPropagation()}>
                
                {/* Header */}
                <div className="p-3 border-b flex items-center justify-center shrink-0 relative" style={{ backgroundColor: theme.bgColor, borderColor: theme.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)', paddingTop: 'calc(0.75rem + env(safe-area-inset-top))' }}>
                    <h3 className="text-sm font-bold text-center" style={{ color: theme.textColor }}>
                        {isEn ? "Advanced Search" : "البحث المتقدم"}
                    </h3>
                </div>

                {/* Sub-header with Search Input */}
                <div className="p-4 border-b shrink-0 z-10" style={{ backgroundColor: `${theme.barBg}33`, borderColor: theme.barBorder }}>
                    <div className="relative">
                        <input 
                            type="text" 
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder={isEn ? "Search verse, translation, dhikr, dua, or Hisn al-Muslim..." : "ابحث عن آية، كلمة، ترجمة، ذكر، دعاء، أو حصن المسلم..."} 
                            className={`w-full p-3 rounded-2xl focus:outline-none font-bold ${isEn ? 'pl-11 pr-11 text-left' : 'pr-11 pl-11 text-right'}`}
                            dir={isEn ? "ltr" : "rtl"}
                            style={{ 
                                borderWidth: '2px',
                                borderStyle: 'solid',
                                borderColor: theme.accent || theme.palette[0],
                                backgroundColor: theme.barBg, 
                                color: theme.textColor 
                            }}
                        />
                        <Search className={`absolute ${isEn ? 'left-4' : 'right-4'} top-1/2 transform -translate-y-1/2 opacity-50`} style={{ color: theme.accent || theme.palette[0] }} />
                        {query && (
                            <button 
                                onClick={() => { setQuery(''); setTimeout(() => (document.querySelector('input') as HTMLElement)?.focus(), 10); }} 
                                className={`absolute ${isEn ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 opacity-80 hover:opacity-100 p-2 rounded-full bg-black/5 dark:bg-white/10 cursor-pointer`}
                                title={isEn ? "Clear" : "مسح"}
                            >
                                <X className="w-4 h-4" style={{ color: theme.accent || theme.palette[0] }} />
                            </button>
                        )}
                    </div>

                    {query && totalResults > 0 && (
                        <div className="flex overflow-x-auto gap-2 mt-4 hide-scrollbar">
                            <button 
                                onClick={() => setActiveTab('all')}
                                className={`px-4 py-2 rounded-xl whitespace-nowrap text-xs font-bold transition-all border-[2px] cursor-pointer ${activeTab === 'all' ? 'text-white' : ''}`}
                                style={{ 
                                    backgroundColor: activeTab === 'all' ? (theme.accent || theme.palette[0]) : `${theme.barBg}`, 
                                    borderColor: theme.accent || theme.palette[0],
                                    color: activeTab === 'all' ? '#fff' : theme.textColor 
                                }}
                            >
                                {isEn ? `All (${totalResults})` : `الكل (${toArabic(totalResults)})`}
                            </button>
                            <button 
                                onClick={() => setActiveTab('quran')}
                                className={`px-4 py-2 rounded-xl whitespace-nowrap text-xs font-bold transition-all border-[2px] cursor-pointer ${activeTab === 'quran' ? 'text-white' : ''}`}
                                style={{ 
                                    backgroundColor: activeTab === 'quran' ? (theme.accent || theme.palette[0]) : `${theme.barBg}`, 
                                    borderColor: theme.accent || theme.palette[0],
                                    color: activeTab === 'quran' ? '#fff' : theme.textColor 
                                }}
                            >
                                {isEn ? `Quran (${quranResults.length})` : `القرآن (${toArabic(quranResults.length)})`}
                            </button>
                            <button 
                                onClick={() => setActiveTab('dua')}
                                className={`px-4 py-2 rounded-xl whitespace-nowrap text-xs font-bold transition-all border-[2px] cursor-pointer ${activeTab === 'dua' ? 'text-white' : ''}`}
                                style={{ 
                                    backgroundColor: activeTab === 'dua' ? (theme.accent || theme.palette[0]) : `${theme.barBg}`, 
                                    borderColor: theme.accent || theme.palette[0],
                                    color: activeTab === 'dua' ? '#fff' : theme.textColor 
                                }}
                            >
                                {isEn ? `Duas (${duaResults.length})` : `الأدعية (${toArabic(duaResults.length)})`}
                            </button>
                            <button 
                                onClick={() => setActiveTab('athkar')}
                                className={`px-4 py-2 rounded-xl whitespace-nowrap text-xs font-bold transition-all border-[2px] cursor-pointer ${activeTab === 'athkar' ? 'text-white' : ''}`}
                                style={{ 
                                    backgroundColor: activeTab === 'athkar' ? (theme.accent || theme.palette[0]) : `${theme.barBg}`, 
                                    borderColor: theme.accent || theme.palette[0],
                                    color: activeTab === 'athkar' ? '#fff' : theme.textColor 
                                }}
                            >
                                {isEn ? `Adhkar (${athkarResults.length})` : `الأذكار (${toArabic(athkarResults.length)})`}
                            </button>
                            <button 
                                onClick={() => setActiveTab('hisn')}
                                className={`px-4 py-2 rounded-xl whitespace-nowrap text-xs font-bold transition-all border-[2px] cursor-pointer ${activeTab === 'hisn' ? 'text-white' : ''}`}
                                style={{ 
                                    backgroundColor: activeTab === 'hisn' ? (theme.accent || theme.palette[0]) : `${theme.barBg}`, 
                                    borderColor: theme.accent || theme.palette[0],
                                    color: activeTab === 'hisn' ? '#fff' : theme.textColor 
                                }}
                            >
                                {isEn ? `Hisn (${hisnResults.length})` : `حصن (${toArabic(hisnResults.length)})`}
                            </button>
                        </div>
                    )}
                </div>

                {/* Content */}
                <div 
                    className="flex-1 overflow-y-auto px-4 py-4" 
                    dir={isEn ? "ltr" : "rtl"} 
                    style={{ 
                        backgroundColor: theme.bgColor,
                        paddingBottom: '1rem'
                    }}
                >
                    {renderResults()}
                </div>

                {/* Footer */}
                <div className="p-3 border-t flex gap-2 shrink-0 z-10" style={{ backgroundColor: theme.bgColor, borderColor: theme.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }}>
                    <button 
                        onClick={handleBack} 
                        className="flex-1 py-4 rounded-xl text-xs font-bold w-full transition-all shadow-md active:scale-95 border-[2px] cursor-pointer"
                        style={{ backgroundColor: theme.btnBg || (theme.text === '#ffffff' ? 'rgba(255,255,255,0.05)' : '#ffffff'), color: theme.btnText || theme.text, borderColor: theme.accent || theme.palette?.[0] || '#000' }}
                    >
                        {isEn ? "Back" : "رجوع"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default GlobalSearch;
