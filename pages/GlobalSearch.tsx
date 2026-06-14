import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ChevronLeft, Search, BookOpen, Sun, Moon, Heart, X } from 'lucide-react';
import { Keyboard } from '@capacitor/keyboard';
import { Capacitor } from '@capacitor/core';
import { useTheme } from '../context/ThemeContext';
import { quranData } from '../utils/quranData';
import { THEMES, toArabic } from '../components/QuranReader/constants';
import { HISN_ALMUSLIM_CATEGORIES, HISN_ALMUSLIM_DATA } from '../data/hisnAlmuslimData';
import { NAWAWI_DATA } from '../data/nawawiData';
import { ALL_DUAA } from '../data/adiaData';
import { BASE_ADHKAR_MORNING, BASE_ADHKAR_EVENING } from '../data/adkarSabahMasaaData';

// Help helper to get reader theme
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
            text: textColor, // Alias for compatibility with button styles
            bg: bgColor,     // Alias
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
}

const GlobalSearch: React.FC<GlobalSearchProps> = ({ onBack, onNavigate }) => {
    const { setCurrentPage } = useTheme();
    const [readerTheme, setReaderTheme] = useState(getReaderTheme());
    const [initialHeight] = useState(() => typeof window !== 'undefined' ? window.innerHeight : 800);

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
    const [visibleCount, setVisibleCount] = useState(100);
    
    useEffect(() => {
        // Group logic helper to auto-expand
        const numSurahs = new Set(quranResults.map(r => r.surah)).size;
        if (numSurahs > 0 && numSurahs <= 5) {
            const initialExpanded: Record<number, boolean> = {};
            new Set(quranResults.map(r => r.surah)).forEach(sNum => initialExpanded[sNum as number] = true);
            setExpandedSurahs(initialExpanded);
        } else if (numSurahs > 0) {
            const initialExpanded: Record<number, boolean> = {};
            // maybe expand just the first one?
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
        
        setTimeout(() => {
            const normQ = normalizeArabic(q);
            
            // Regex for Quran (flexible)
            const gap = '[\\u0610-\\u061A\\u064B-\\u065F\\u0670\\u06D6-\\u06ED\\u0640]*';
            const highlightPattern = normQ.split('').map(c => (
                c === 'ا' ? '[أإآٱا]' : 
                (c === 'ه' ? '[هة]' : 
                (c === 'ي' ? '[يى]' : c.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')))
            )).join(gap);
            
            let regex: RegExp | null = null;
            try {
                 regex = new RegExp(highlightPattern, 'gi');
            } catch (e) {
                 // Ignore invalid regex
            }
            
            // 1. Search Quran (word or Ayah number)
            const foundQuran: any[] = [];
            const isNumberSearch = /^[0-9\u0660-\u0669]+$/.test(q);
            const searchNum = isNumberSearch ? parseInt(q.replace(/[٠-٩]/g, d => '0123456789'['٠١٢٣٤٥٦٧٨٩'.indexOf(d)])) : -1;

            if (regex || isNumberSearch) {
                for (let sIdx = 0; sIdx < quranData.surahs.length; sIdx++) {
                    const surah = quranData.surahs[sIdx];
                    for (let aIdx = 0; aIdx < surah.ayahs.length; aIdx++) {
                        const ayah = surah.ayahs[aIdx];
                        if (isNumberSearch && ayah.numberInSurah === searchNum) {
                            foundQuran.push({ 
                                type: 'quran',
                                text: fixQuranText(ayah.text), 
                                surah: surah.number, 
                                surahName: surah.name, 
                                ayah: ayah.numberInSurah, 
                                page: ayah.page,
                                juz: ayah.juz,
                                highlightRegex: null
                            });
                        } else if (!isNumberSearch && regex) {
                            const cleanText = stripTajweedTags(ayah.text);
                            if (regex.test(cleanText)) {
                                foundQuran.push({ 
                                    type: 'quran',
                                    text: fixQuranText(ayah.text), 
                                    surah: surah.number, 
                                    surahName: surah.name, 
                                    ayah: ayah.numberInSurah, 
                                    page: ayah.page,
                                    juz: ayah.juz,
                                    highlightRegex: regex
                                });
                            }
                        }
                    }
                }
            }

            // Simple text search for others
            const searchWords = normQ.split(/\s+/);
            const matchSimple = (text: string) => {
                const normText = normalizeArabic(text);
                return searchWords.every(word => normText.includes(word));
            };

            // 2. Search Athkar
            const foundAthkar: any[] = [];
            BASE_ADHKAR_MORNING.forEach((item, idx) => {
                if (matchSimple(item.text)) {
                    foundAthkar.push({ type: 'athkar', kind: 'morning', text: item.text, id: idx });
                }
            });
            BASE_ADHKAR_EVENING.forEach((item, idx) => {
                if (matchSimple(item.text)) {
                    foundAthkar.push({ type: 'athkar', kind: 'evening', text: item.text, id: idx });
                }
            });

            // 3. Search dua
            const foundDua: any[] = [];
            ALL_DUAA.forEach((item, idx) => {
                if (matchSimple(item.text)) {
                    foundDua.push({ type: 'dua', text: item.text, source: item.source, id: idx });
                }
            });

            // 4. Search Hisn
            const foundHisn: any[] = [];
            Object.keys(HISN_ALMUSLIM_DATA).forEach((catId) => {
                const category = HISN_ALMUSLIM_CATEGORIES.find(c => c.id === catId);
                HISN_ALMUSLIM_DATA[catId as keyof typeof HISN_ALMUSLIM_DATA].forEach((item: any) => {
                    if (matchSimple(item.text) || (category && matchSimple(category.title))) {
                        foundHisn.push({ type: 'hisn', text: item.text, title: category?.title || 'حصن المسلم', id: item.id || Math.random().toString() });
                    }
                });
            });

            // 5. Search Nawawi
            const foundNawawi: any[] = [];
            NAWAWI_DATA.forEach((item) => {
                if (matchSimple(item.hadith) || matchSimple(item.title)) {
                    foundNawawi.push({ type: 'nawawi', hadith: item.hadith, title: item.title, id: item.id });
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
        }, 50);

    }, []);

    useEffect(() => {
        searchCache.activeTab = activeTab;
    }, [activeTab]);

    useEffect(() => {
        if (query === searchCache.query) {
            return; // Cache hit or initial mount, skip search
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
        }, 500);
    }, [query, performSearch]);

    const highlightText = (text: string, regex: RegExp | null) => {
        if (!regex) return <span>{text}</span>;
        try {
            const parts = text.split(regex);
            const matches = text.match(regex) || [];
            return (
                <>
                    {parts.map((part, i) => (
                        <React.Fragment key={i}>
                            {part}
                            {matches[i] && <span style={{ color: theme.accent || theme.palette[0] }} className="font-bold">{matches[i]}</span>}
                        </React.Fragment>
                    ))}
                </>
            );
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
                    <p className="font-bold">جاري البحث...</p>
                </div>
            );
        }

        if (query && totalResults === 0) {
            return (
                <div className="flex flex-col items-center justify-center py-20 opacity-60">
                    <Search className="w-16 h-16 mb-4 opacity-50" />
                    <p className="font-bold">لا توجد نتائج لبحثك</p>
                </div>
            );
        }

        if (!query) {
            return (
                <div className="flex flex-col items-center justify-center py-20 opacity-60">
                    <Search className="w-16 h-16 mb-4 opacity-50" />
                    <p className="font-bold text-center">
                        ابحث عن آية أو رقمها<br/>
                        أو ابحث في الأذكار والأدعية وحصن المسلم
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
            if (!acc[r.surah]) acc[r.surah] = { surahName: r.surahName, ayahs: [] };
            acc[r.surah].ayahs.push(r);
            return acc;
        }, {} as Record<number, { surahName: string, ayahs: any[] }>);
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
                                        القرآن الكريم
                                    </h4>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-bold px-2 py-1 rounded-full" style={{ backgroundColor: `${theme.accent || theme.palette[0]}33`, color: theme.accent || theme.palette[0] }}>
                                            {toArabic(quranResults.length)}
                                        </span>
                                        <ChevronLeft className={`w-5 h-5 transition-transform ${expandedCategories.quran ? '-rotate-90' : ''}`} />
                                    </div>
                                </button>
                                {expandedCategories.quran && (
                                    <div className="p-2 space-y-2" style={{ backgroundColor: `${theme.barBg}22` }}>
                                        {sortedQuranSurahs.map(surahNum => {
                                            const group = groupedQuran[surahNum];
                                            const isExpanded = expandedSurahs[surahNum];
                                            return (
                                                <div key={surahNum} className="mb-2 border rounded-xl overflow-hidden shadow-sm" style={{ borderColor: `${theme.accent || theme.palette[0]}33` }}>
                                                    <button 
                                                        onClick={() => toggleSurah(surahNum)}
                                                        className="w-full flex justify-between items-center p-4 transition-colors"
                                                        style={{ backgroundColor: `${theme.barBg}33` }}
                                                    >
                                                        <h4 className="font-amiri-quran text-lg font-bold" style={{ color: theme.accent || theme.palette[0] }}>
                                                            سورة {group.surahName}
                                                        </h4>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xs font-bold px-2 py-1 rounded-full" style={{ backgroundColor: `${theme.accent || theme.palette[0]}33`, color: theme.accent || theme.palette[0] }}>
                                                                {toArabic(group.ayahs.length)}
                                                            </span>
                                                            <ChevronLeft className={`w-5 h-5 transition-transform ${isExpanded ? '-rotate-90' : ''}`} />
                                                        </div>
                                                    </button>
                                                    
                                                    {isExpanded && (
                                                        <div className="divide-y" style={{ backgroundColor: `${theme.barBg}11`, borderColor: `${theme.accent || theme.palette[0]}22` }}>
                                                            {group.ayahs.map((r, idx) => (
                                                                <button 
                                                                    key={`quran-${surahNum}-${idx}`} 
                                                                    className="w-full text-right p-4 transition-colors"
                                                                    style={{ color: theme.textColor }}
                                                                    onClick={() => onNavigate('quran', { surah: r.surah, ayah: r.ayah })}
                                                                >
                                                                    <div className="text-xs opacity-60 mb-2 flex items-center gap-1 font-bold">
                                                                        <span>آية {toArabic(r.ayah)}</span>
                                                                        <span>•</span>
                                                                        <span>جزء {toArabic(r.juz)}</span>
                                                                        <span>•</span>
                                                                        <span>صفحة {toArabic(r.page)}</span>
                                                                    </div>
                                                                    <div className="font-amiri-quran text-lg leading-loose" dir="rtl">
                                                                        {highlightText(r.text, r.highlightRegex)}
                                                                    </div>
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
                                    القرآن الكريم ({toArabic(quranResults.length)})
                                </h3>
                                {sortedQuranSurahs.map(surahNum => {
                                    const group = groupedQuran[surahNum];
                                    const isExpanded = expandedSurahs[surahNum];
                                    return (
                                        <div key={surahNum} className="mb-2 border rounded-xl overflow-hidden shadow-sm" style={{ borderColor: `${theme.accent || theme.palette[0]}33` }}>
                                            <button 
                                                onClick={() => toggleSurah(surahNum)}
                                                className="w-full flex justify-between items-center p-4 transition-colors"
                                                style={{ backgroundColor: `${theme.barBg}33` }}
                                            >
                                                <h4 className="font-amiri-quran text-lg font-bold" style={{ color: theme.accent || theme.palette[0] }}>
                                                    سورة {group.surahName}
                                                </h4>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-bold px-2 py-1 rounded-full" style={{ backgroundColor: `${theme.accent || theme.palette[0]}33`, color: theme.accent || theme.palette[0] }}>
                                                        {toArabic(group.ayahs.length)}
                                                    </span>
                                                    <ChevronLeft className={`w-5 h-5 transition-transform ${isExpanded ? '-rotate-90' : ''}`} />
                                                </div>
                                            </button>
                                            
                                            {isExpanded && (
                                                <div className="divide-y" style={{ backgroundColor: `${theme.barBg}11`, borderColor: `${theme.accent || theme.palette[0]}22` }}>
                                                    {group.ayahs.map((r, idx) => (
                                                        <button 
                                                            key={`quran-${surahNum}-${idx}`} 
                                                            className="w-full text-right p-4 transition-colors"
                                                            style={{ color: theme.textColor }}
                                                            onClick={() => onNavigate('quran', { surah: r.surah, ayah: r.ayah })}
                                                        >
                                                            <div className="text-xs opacity-60 mb-2 flex items-center gap-1 font-bold">
                                                                <span>آية {toArabic(r.ayah)}</span>
                                                                <span>•</span>
                                                                <span>جزء {toArabic(r.juz)}</span>
                                                                <span>•</span>
                                                                <span>صفحة {toArabic(r.page)}</span>
                                                            </div>
                                                            <div className="font-amiri-quran text-lg leading-loose" dir="rtl">
                                                                {highlightText(r.text, r.highlightRegex)}
                                                            </div>
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
                                        الأدعية
                                    </h4>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-bold px-2 py-1 rounded-full" style={{ backgroundColor: `${theme.accent || theme.palette[0]}33`, color: theme.accent || theme.palette[0] }}>
                                            {toArabic(duaResults.length)}
                                        </span>
                                        <ChevronLeft className={`w-5 h-5 transition-transform ${expandedCategories.dua ? '-rotate-90' : ''}`} />
                                    </div>
                                </button>
                                {expandedCategories.dua && (
                                    <div className="divide-y p-2 space-y-2" style={{ backgroundColor: `${theme.barBg}22`, borderColor: `${theme.accent || theme.palette[0]}22` }}>
                                        {duaResults.map((r, idx) => (
                                            <button 
                                                key={`dua-${idx}`} 
                                                className="w-full text-right p-3 rounded-lg transition-colors"
                                                onClick={() => onNavigate('adia')}
                                                style={{ color: theme.textColor }}
                                            >
                                                <div className="font-qalam text-lg leading-relaxed mb-1 line-clamp-2" style={{ color: theme.accent || theme.palette[0] }}>
                                                    {r.text}
                                                </div>
                                                <div className="text-[10px] opacity-60 font-bold">
                                                    {r.source}
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
                                    الأدعية ({toArabic(duaResults.length)})
                                </h3>
                                {duaResults.map((r, idx) => (
                                    <button 
                                        key={`dua-${idx}`} 
                                        className="w-full text-right p-4 rounded-xl border shadow-sm transition-all"
                                        style={{ backgroundColor: `${theme.barBg}33`, borderColor: theme.barBorder, color: theme.textColor }}
                                        onClick={() => onNavigate('adia')}
                                    >
                                        <div className="font-qalam text-lg leading-relaxed mb-2" style={{ color: theme.accent || theme.palette[0] }}>
                                            {r.text}
                                        </div>
                                        <div className="text-[10px] opacity-60 font-bold">
                                            {r.source}
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
                                        الأذكار
                                    </h4>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-bold px-2 py-1 rounded-full" style={{ backgroundColor: `${theme.accent || theme.palette[0]}33`, color: theme.accent || theme.palette[0] }}>
                                            {toArabic(athkarResults.length)}
                                        </span>
                                        <ChevronLeft className={`w-5 h-5 transition-transform ${expandedCategories.athkar ? '-rotate-90' : ''}`} />
                                    </div>
                                </button>
                                {expandedCategories.athkar && (
                                    <div className="divide-y p-2 space-y-2" style={{ backgroundColor: `${theme.barBg}22`, borderColor: `${theme.accent || theme.palette[0]}22` }}>
                                        {athkarResults.map((r, idx) => (
                                            <button 
                                                key={`athkar-${idx}`} 
                                                className="w-full text-right p-3 rounded-lg transition-colors"
                                                onClick={() => onNavigate('sabah-masaa')}
                                                style={{ color: theme.textColor }}
                                            >
                                                <div className="text-[10px] opacity-60 mb-1 font-bold flex items-center gap-1">
                                                    {r.kind === 'morning' ? <Sun className="w-3 h-3" style={{ color: theme.accent || theme.palette[0] }} /> : <Moon className="w-3 h-3" style={{ color: theme.accent || theme.palette[0] }} />}
                                                    {r.kind === 'morning' ? 'أذكار الصباح' : 'أذكار المساء'}
                                                </div>
                                                <div className="font-qalam text-lg leading-relaxed line-clamp-2" style={{ color: theme.accent || theme.palette[0] }}>
                                                    {r.text}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <>
                                <h3 className="font-bold text-lg opacity-80 border-b pb-2 flex items-center gap-2" style={{ borderColor: theme.barBorder }}>
                                    <Sun className="w-5 h-5" /> 
                                    الأذكار ({toArabic(athkarResults.length)})
                                </h3>
                                {athkarResults.map((r, idx) => (
                                    <button 
                                        key={`athkar-${idx}`} 
                                        className="w-full text-right p-4 rounded-xl border shadow-sm transition-all"
                                        style={{ backgroundColor: `${theme.barBg}33`, borderColor: theme.barBorder, color: theme.textColor }}
                                        onClick={() => onNavigate('sabah-masaa')}
                                    >
                                        <div className="text-[10px] opacity-60 mb-2 font-bold flex items-center gap-1">
                                            {r.kind === 'morning' ? <Sun className="w-3 h-3" style={{ color: theme.accent || theme.palette[0] }} /> : <Moon className="w-3 h-3" style={{ color: theme.accent || theme.palette[0] }} />}
                                            {r.kind === 'morning' ? 'أذكار الصباح' : 'أذكار المساء'}
                                        </div>
                                        <div className="font-qalam text-lg leading-relaxed" style={{ color: theme.accent || theme.palette[0] }}>
                                            {r.text}
                                        </div>
                                    </button>
                                ))}
                            </>
                        )}
                    </div>
                )} { /* ATHKAR END */ }

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
                                        حصن المسلم
                                    </h4>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-bold px-2 py-1 rounded-full" style={{ backgroundColor: `${theme.accent || theme.palette[0]}33`, color: theme.accent || theme.palette[0] }}>
                                            {toArabic(hisnResults.length)}
                                        </span>
                                        <ChevronLeft className={`w-5 h-5 transition-transform ${expandedCategories.hisn ? '-rotate-90' : ''}`} />
                                    </div>
                                </button>
                                {expandedCategories.hisn && (
                                    <div className="divide-y p-2 space-y-2" style={{ backgroundColor: `${theme.barBg}22`, borderColor: `${theme.accent || theme.palette[0]}22` }}>
                                        {hisnResults.map((r, idx) => (
                                            <button 
                                                key={`hisn-${idx}`} 
                                                className="w-full text-right p-3 rounded-lg transition-colors"
                                                onClick={() => onNavigate('hisn-muslim')}
                                                style={{ color: theme.textColor }}
                                            >
                                                <div className="font-qalam text-lg leading-relaxed mb-1 line-clamp-2" style={{ color: theme.accent || theme.palette[0] }}>
                                                    {r.text}
                                                </div>
                                                <div className="text-[10px] opacity-60 font-bold">
                                                    {r.title}
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
                                    حصن المسلم ({toArabic(hisnResults.length)})
                                </h3>
                                {hisnResults.map((r, idx) => (
                                    <button 
                                        key={`hisn-${idx}`} 
                                        className="w-full text-right p-4 rounded-xl border shadow-sm transition-all"
                                        style={{ backgroundColor: `${theme.barBg}33`, borderColor: theme.barBorder, color: theme.textColor }}
                                        onClick={() => onNavigate('hisn-muslim')}
                                    >
                                        <div className="font-qalam text-lg leading-relaxed mb-2" style={{ color: theme.accent || theme.palette[0] }}>
                                            {r.text}
                                        </div>
                                        <div className="text-[10px] opacity-60 font-bold">
                                            {r.title}
                                        </div>
                                    </button>
                                ))}
                            </>
                        )}
                    </div>
                )} { /* HISN END */ }

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
                                        الأربعون النووية
                                    </h4>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-bold px-2 py-1 rounded-full" style={{ backgroundColor: `${theme.accent || theme.palette[0]}33`, color: theme.accent || theme.palette[0] }}>
                                            {toArabic(nawawiResults.length)}
                                        </span>
                                        <ChevronLeft className={`w-5 h-5 transition-transform ${expandedCategories.nawawi ? '-rotate-90' : ''}`} />
                                    </div>
                                </button>
                                {expandedCategories.nawawi && (
                                    <div className="divide-y p-2 space-y-2" style={{ backgroundColor: `${theme.barBg}22`, borderColor: `${theme.accent || theme.palette[0]}22` }}>
                                        {nawawiResults.map((r, idx) => (
                                            <button 
                                                key={`nawawi-${idx}`} 
                                                className="w-full text-right p-3 rounded-lg transition-colors"
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
                                    الأربعون النووية ({toArabic(nawawiResults.length)})
                                </h3>
                                {nawawiResults.map((r, idx) => (
                                    <button 
                                        key={`nawawi-${idx}`} 
                                        className="w-full text-right p-4 rounded-xl border shadow-sm transition-all"
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
        <div className="fixed top-0 left-0 right-0 z-[1500] flex items-center justify-center overflow-hidden" dir="rtl" onClick={onBack} style={{ backgroundColor: 'rgba(0,0,0,0.5)', height: `${initialHeight}px` }}>
            <div className="w-full h-full max-w-lg overflow-hidden shadow-none relative flex flex-col pointer-events-auto border-[4px]" dir="rtl" style={{ backgroundColor: theme.bgColor, borderColor: theme.accent || theme.palette[0] }} onClick={e => e.stopPropagation()}>
                
                {/* Header */}
                <div className="p-3 border-b flex items-center justify-center shrink-0" style={{ backgroundColor: theme.bgColor, borderColor: theme.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)', paddingTop: 'calc(0.75rem + env(safe-area-inset-top))' }}>
                    <h3 className="text-sm font-bold" style={{ color: theme.textColor }}>البحث المتقدم</h3>
                </div>

                {/* Sub-header with Search Input */}
                <div className="p-4 border-b shrink-0 z-10" style={{ backgroundColor: `${theme.barBg}33`, borderColor: theme.barBorder }}>
                    <div className="relative">
                        <input 
                            type="text" 
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="ابحث عن آية، كلمة، ذكر، دعاء، أو حصن المسلم..." 
                            className="w-full p-3 pl-12 pr-12 rounded-2xl focus:outline-none font-bold"
                            style={{ 
                                borderWidth: '2px',
                                borderStyle: 'solid',
                                borderColor: theme.accent || theme.palette[0],
                                backgroundColor: theme.barBg, 
                                color: theme.textColor 
                            }}
                        />
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 opacity-50" style={{ color: theme.accent || theme.palette[0] }} />
                        {query && (
                            <button 
                                onClick={() => { setQuery(''); setTimeout(() => (document.querySelector('input') as HTMLElement)?.focus(), 10); }} 
                                className="absolute right-4 top-1/2 transform -translate-y-1/2 opacity-80 hover:opacity-100 p-2 rounded-full bg-black/5 dark:bg-white/10"
                            >
                                <X className="w-4 h-4" style={{ color: theme.accent || theme.palette[0] }} />
                            </button>
                        )}
                    </div>

                    {query && totalResults > 0 && (
                        <div className="flex overflow-x-auto gap-2 mt-4 hide-scrollbar">
                            <button 
                                onClick={() => setActiveTab('all')}
                                className={`px-4 py-2 rounded-xl whitespace-nowrap text-xs font-bold transition-all border-[2px] ${activeTab === 'all' ? 'text-white' : ''}`}
                                style={{ 
                                    backgroundColor: activeTab === 'all' ? (theme.accent || theme.palette[0]) : `${theme.barBg}`, 
                                    borderColor: theme.accent || theme.palette[0],
                                    color: activeTab === 'all' ? '#fff' : theme.textColor 
                                }}
                            >
                                الكل ({toArabic(totalResults)})
                            </button>
                            <button 
                                onClick={() => setActiveTab('quran')}
                                className={`px-4 py-2 rounded-xl whitespace-nowrap text-xs font-bold transition-all border-[2px] ${activeTab === 'quran' ? 'text-white' : ''}`}
                                style={{ 
                                    backgroundColor: activeTab === 'quran' ? (theme.accent || theme.palette[0]) : `${theme.barBg}`, 
                                    borderColor: theme.accent || theme.palette[0],
                                    color: activeTab === 'quran' ? '#fff' : theme.textColor 
                                }}
                            >
                                القرآن ({toArabic(quranResults.length)})
                            </button>
                            <button 
                                onClick={() => setActiveTab('dua')}
                                className={`px-4 py-2 rounded-xl whitespace-nowrap text-xs font-bold transition-all border-[2px] ${activeTab === 'dua' ? 'text-white' : ''}`}
                                style={{ 
                                    backgroundColor: activeTab === 'dua' ? (theme.accent || theme.palette[0]) : `${theme.barBg}`, 
                                    borderColor: theme.accent || theme.palette[0],
                                    color: activeTab === 'dua' ? '#fff' : theme.textColor 
                                }}
                            >
                                الأدعية ({toArabic(duaResults.length)})
                            </button>
                            <button 
                                onClick={() => setActiveTab('athkar')}
                                className={`px-4 py-2 rounded-xl whitespace-nowrap text-xs font-bold transition-all border-[2px] ${activeTab === 'athkar' ? 'text-white' : ''}`}
                                style={{ 
                                    backgroundColor: activeTab === 'athkar' ? (theme.accent || theme.palette[0]) : `${theme.barBg}`, 
                                    borderColor: theme.accent || theme.palette[0],
                                    color: activeTab === 'athkar' ? '#fff' : theme.textColor 
                                }}
                            >
                                الأذكار ({toArabic(athkarResults.length)})
                            </button>
                            <button 
                                onClick={() => setActiveTab('hisn')}
                                className={`px-4 py-2 rounded-xl whitespace-nowrap text-xs font-bold transition-all border-[2px] ${activeTab === 'hisn' ? 'text-white' : ''}`}
                                style={{ 
                                    backgroundColor: activeTab === 'hisn' ? (theme.accent || theme.palette[0]) : `${theme.barBg}`, 
                                    borderColor: theme.accent || theme.palette[0],
                                    color: activeTab === 'hisn' ? '#fff' : theme.textColor 
                                }}
                            >
                                حصن ({toArabic(hisnResults.length)})
                            </button>
                        </div>
                    )}
                </div>

                {/* Content */}
                <div 
                    className="flex-1 overflow-y-auto px-4 py-4" 
                    dir="rtl" 
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
                        onClick={onBack} 
                        className="flex-1 py-4 rounded-xl text-xs font-bold w-full transition-all shadow-md active:scale-95 border-[2px]"
                        style={{ backgroundColor: theme.btnBg || (theme.text === '#ffffff' ? 'rgba(255,255,255,0.05)' : '#ffffff'), color: theme.btnText || theme.text, borderColor: theme.accent || theme.palette?.[0] || '#000' }}
                    >
                        رجوع
                    </button>
                </div>
            </div>
        </div>
    );
};

export default GlobalSearch;
