import React, { useState, useEffect, useRef, useCallback } from 'react';
import { toArabic, isDarkQuranTheme, SURAH_NAMES_EN } from './constants';
import { X, ChevronLeft } from 'lucide-react';
import { Keyboard } from '@capacitor/keyboard';
import { Capacitor } from '@capacitor/core';
import { renderTajweedTextHtml } from './MushafPage';
import { useLanguage } from '../../context/LanguageContext';
import { 
    loadQuranEnglishTranslation, 
    searchQuranEnglish, 
    getCachedQuranEnglishTranslation 
} from '../../utils/quranTranslationHelper';

interface SearchModalProps {
    quranData: any;
    onSelect: (surah: number, ayah: number) => void;
    onClose: () => void;
    isLandscape?: boolean;
    initialQuery?: string;
    readingMode?: string;
    currentTheme?: any;
}

const SearchModal: React.FC<SearchModalProps> = ({ quranData, onSelect, onClose, isLandscape, initialQuery, readingMode = 'mushaf', currentTheme }) => {
    const { language, isRTL } = useLanguage();
    const isEn = language === 'en';
    const isDarkTheme = isDarkQuranTheme(currentTheme);
    const modeSuffix = readingMode === 'mushaf' ? (isLandscape ? '_h' : '_v') : `_${readingMode}_${isLandscape ? 'h' : 'v'}`;
    const [initialHeight] = useState(() => typeof window !== 'undefined' ? window.innerHeight : 800);

    useEffect(() => {
        if (Capacitor.isNativePlatform()) {
            Keyboard.setScroll({ isDisabled: true });
            try {
                Keyboard.setResizeMode({ mode: 'none' as any });
            } catch (e) {
                console.error("Error setting keyboard resize mode:", e);
            }
        }
        
        return () => {
            if (Capacitor.isNativePlatform()) {
                try {
                    Keyboard.setResizeMode({ mode: 'native' as any });
                } catch (e) {}
            }
        };
    }, []);

    const [query, setQuery] = useState(() => initialQuery || localStorage.getItem('search_query' + modeSuffix) || '');
    const [results, setResults] = useState<any[]>(() => {
        const saved = localStorage.getItem('search_results' + modeSuffix);
        return saved ? JSON.parse(saved) : [];
    });
    const [visibleCount, setVisibleCount] = useState(10000); // Set to a very high number to show all
    const [isSearching, setIsSearching] = useState(false);
    const [searchStats, setSearchStats] = useState('');
    const [expandedSurahs, setExpandedSurahs] = useState<Record<number, boolean>>({});
    const searchJobIdRef = useRef(0);
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
        
        // Normalize common variations for search matching
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

    const executeSearchOptimized = useCallback(async (q: string, jobId: number) => {
        const hasLatinChars = /[a-zA-Z]/.test(q);

        if (hasLatinChars || isEn || readingMode === 'translation' || readingMode === 'bilingual') {
            const enData = await loadQuranEnglishTranslation();
            if (enData && enData.length > 0) {
                const enResults = searchQuranEnglish(q, enData, quranData);
                if (searchJobIdRef.current === jobId) {
                    setResults(enResults);
                    localStorage.setItem('search_results' + modeSuffix, JSON.stringify(enResults));
                    setSearchStats(isEn || readingMode === 'translation' || readingMode === 'bilingual' ? `Results: ${enResults.length}` : `النتائج: ${toArabic(enResults.length)}`);
                    setIsSearching(false);
                }
                return;
            }
        }

        const normQ = normalizeArabic(q);
        const gap = '[\\u0610-\\u061A\\u064B-\\u065F\\u0670\\u06D6-\\u06ED\\u0640]*';
        const highlightPattern = normQ.split('').map(c => (
            c === 'ا' ? '[أإآٱا]' : 
            (c === 'ه' ? '[هة]' : 
            (c === 'ي' ? '[يى]' : c.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')))
        )).join(gap);
        
        const regex = new RegExp(highlightPattern, 'gi');
        const isNumberSearch = /^[0-9\u0660-\u0669]+$/.test(q);
        const searchNum = isNumberSearch ? parseInt(q.replace(/[٠-٩]/g, (d:any) => '0123456789'['٠١٢٣٤٥٦٧٨٩'.indexOf(d)])) : -1;
        const cachedEn = getCachedQuranEnglishTranslation();
        
        const foundResults: any[] = [];
        let sIdx = 0;
        let aIdx = 0;

        const processChunk = () => {
            if (searchJobIdRef.current > jobId) return; 
            
            const start = performance.now();
            while (sIdx < quranData.surahs.length) {
                const surah = quranData.surahs[sIdx];
                while (aIdx < surah.ayahs.length) {
                    const ayah = surah.ayahs[aIdx];
                    const rawText = ayah.text;
                    const cleanText = stripTajweedTags(rawText);
                    const textEn = cachedEn?.[sIdx]?.verses?.[aIdx]?.translation || '';
                    
                    if (isNumberSearch && ayah.numberInSurah === searchNum) {
                        foundResults.push({ 
                            text: fixQuranText(cleanText), 
                            rawText: fixQuranText(rawText),
                            textEn,
                            surah: surah.number, 
                            surahName: surah.name, 
                            ayah: ayah.numberInSurah, 
                            page: ayah.page,
                            highlightRegex: null
                        });
                    } else if (!isNumberSearch && regex.test(cleanText)) {
                        foundResults.push({ 
                            text: fixQuranText(cleanText), 
                            rawText: fixQuranText(rawText),
                            textEn,
                            surah: surah.number, 
                            surahName: surah.name, 
                            ayah: ayah.numberInSurah, 
                            page: ayah.page,
                            highlightRegex: regex
                        });
                    }
                    aIdx++;
                    if (performance.now() - start > 20) {
                        setResults([...foundResults]);
                        setSearchStats(isEn ? `Searching... (${foundResults.length})` : `جاري البحث... (${toArabic(foundResults.length)})`);
                        setTimeout(processChunk, 0);
                        return;
                    }
                }
                aIdx = 0;
                sIdx++;
            }
            
            if (searchJobIdRef.current === jobId) {
                setResults([...foundResults]);
                localStorage.setItem('search_results' + modeSuffix, JSON.stringify(foundResults));
                setSearchStats(isEn ? `Results: ${foundResults.length}` : `النتائج: ${toArabic(foundResults.length)}`);
                setIsSearching(false);
            }
        };

        processChunk();
    }, [quranData, modeSuffix, isEn, readingMode]);

    const performSearch = useCallback((q: string) => {
        if (!quranData) return;
        
        searchJobIdRef.current += 1;
        const newJobId = searchJobIdRef.current;
        
        q = q.trim();
        if (q === '') {
            setResults([]);
            setVisibleCount(10000);
            setSearchStats('');
            setIsSearching(false);
            return;
        }

        setIsSearching(true);
        setSearchStats('...');
        setVisibleCount(10000);
        
        setTimeout(() => {
            executeSearchOptimized(q, newJobId);
        }, 10);
    }, [quranData, executeSearchOptimized]);

    const handleSearchInput = useCallback((q: string) => {
        setQuery(q);
        localStorage.setItem('search_query' + modeSuffix, q);
        
        if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
        
        if (q.trim() === '') {
            setSearchStats('');
            setResults([]);
            localStorage.removeItem('search_results' + modeSuffix);
            setVisibleCount(10000);
            setIsSearching(false);
            return;
        }

        setSearchStats(isEn ? 'Typing...' : 'جاري الكتابة...');
        searchTimeoutRef.current = setTimeout(() => performSearch(q), 500);
    }, [modeSuffix, performSearch, isEn]);

    useEffect(() => {
        const handleVoiceCommand = (e: any) => {
            const { action, text } = e.detail;
            if (action === 'execute_search') {
                handleSearchInput(text);
            } else if (action === 'clear_search') {
                handleSearchInput('');
            } else if (action === 'close_search') {
                onClose();
            }
        };

        window.addEventListener('voice-command', handleVoiceCommand);
        return () => window.removeEventListener('voice-command', handleVoiceCommand);
    }, [handleSearchInput, onClose]);

    useEffect(() => {
        if (query.trim() !== '' && results.length === 0) {
            performSearch(query);
        }
    }, [performSearch, query, results.length]);

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
                    <span key={`${match.index}-${safety}`} className="highlighted-search-term font-bold underline bg-yellow-400/20 px-0.5 rounded">
                        {match[0]}
                    </span>
                );
                lastIndex = globalRegex.lastIndex;
                if (match[0].length === 0) globalRegex.lastIndex++;
            }
            if (lastIndex < text.length) {
                parts.push(text.substring(lastIndex));
            }
            return <>{parts.length > 0 ? parts : text}</>;
        } catch (e) {
            return <span>{text}</span>;
        }
    };

    const visibleResults = results.slice(0, visibleCount);
    const groupedResults = visibleResults.reduce((acc, r) => {
        if (!acc[r.surah]) {
            acc[r.surah] = { surahName: r.surahName, ayahs: [] };
        }
        acc[r.surah].ayahs.push(r);
        return acc;
    }, {} as Record<number, { surahName: string, ayahs: any[] }>);
    const sortedSurahKeys = Object.keys(groupedResults).map(Number).sort((a, b) => a - b);

    const toggleSurah = (surahNum: number) => {
        setExpandedSurahs(prev => ({
            ...prev,
            [surahNum]: !prev[surahNum]
        }));
    };

    return (
        <div className="fixed top-0 left-0 right-0 z-[1200] flex items-center justify-center overflow-hidden" style={{ top: 0, left: 0, right: 0, height: `${initialHeight}px`, backgroundColor: 'rgba(0,0,0,0.5)' }} dir={isRTL ? "rtl" : "ltr"} onClick={onClose}>
            <div className="w-full h-full flex flex-col overflow-hidden shadow-2xl border-0" style={{ backgroundColor: currentTheme?.bg || '#ffffff', border: 'none', outline: 'none' }} onClick={e => e.stopPropagation()}>
                <div className="flex-1 w-full flex flex-col overflow-hidden" style={{ color: currentTheme?.text || '#000000' }}>
                    
                    {/* Full Screen Modal Header without top back button */}
                    <div className="p-3 flex items-center justify-center shrink-0 relative" style={{ backgroundColor: currentTheme?.bg || '#ffffff', paddingTop: 'calc(0.75rem + env(safe-area-inset-top))' }}>
                        <h3 className="text-sm font-extrabold px-6 py-2 rounded-xl quran-raised-card inline-flex items-center justify-center gap-2 tracking-wide" style={{ backgroundColor: isDarkTheme ? (currentTheme?.btnBg || 'rgba(255,255,255,0.06)') : '#ffffff', color: currentTheme?.text }}>
                            <svg className="w-4 h-4 quran-3d-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: currentTheme?.accent || '#10b981' }}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                            <span>{isEn ? "Advanced Search in Quran" : "البحث المتقدم"}</span>
                        </h3>
                    </div>

                    {/* Search Input Section */}
                    <div className="px-4 py-3 shrink-0 z-10" style={{ backgroundColor: currentTheme?.bg || '#ffffff' }}>
                        <div className="relative">
                            <input 
                                type="text" 
                                value={query}
                                onChange={(e) => handleSearchInput(e.target.value)}
                                placeholder={isEn ? "Search for an ayah, word, or in Hisn Al-Muslim..." : "ابحث عن آية، أو كلمة، أو في حصن المسلم..."} 
                                className={`w-full p-3.5 ${isRTL ? "pl-12 pr-12" : "pr-12 pl-12"} rounded-2xl quran-raised-card font-bold border-none outline-none transition-all`}
                                style={{ 
                                    backgroundColor: isDarkTheme ? (currentTheme?.btnBg || 'rgba(255,255,255,0.06)') : '#ffffff',
                                    color: currentTheme?.text || '#000000',
                                    border: 'none',
                                    outline: 'none',
                                }}
                            />
                            {query && (
                                <button 
                                    onClick={() => handleSearchInput('')}
                                    className={`absolute ${isRTL ? "right-3" : "left-3"} top-1/2 transform -translate-y-1/2 w-7 h-7 rounded-lg quran-raised-btn flex items-center justify-center transition-all`}
                                    style={{ 
                                        backgroundColor: isDarkTheme ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                                        color: currentTheme?.text 
                                    }}
                                    title={isEn ? "Clear Search" : "مسح البحث"}
                                >
                                    <X className="w-4 h-4 quran-3d-icon" />
                                </button>
                            )}
                            <button 
                                onClick={() => performSearch(query)} 
                                className={`absolute ${isRTL ? "left-2.5" : "right-2.5"} top-1/2 transform -translate-y-1/2 p-2 rounded-xl quran-raised-btn-selected flex items-center justify-center transition`}
                                style={{ backgroundColor: currentTheme?.accent || '#10b981', color: '#ffffff' }}
                            >
                                <svg className="w-4 h-4 quran-3d-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                            </button>
                        </div>
                        <div className="text-xs text-center mt-2 font-bold opacity-60" style={{ color: currentTheme?.text }}>{searchStats}</div>
                    </div>

                    <div 
                        className={`flex-1 overflow-y-auto p-4 relative space-y-3 scrollbar-hide`} 
                        style={{ 
                            backgroundColor: currentTheme?.bg || '#ffffff',
                            paddingBottom: '1rem'
                        }}
                    >
                    {isSearching && (
                        <div className="text-center mt-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto"></div>
                            <p className="mt-2 opacity-60 font-bold">{isEn ? "Searching..." : "جاري البحث..."}</p>
                        </div>
                    )}
                    
                    {!isSearching && results.length === 0 && query.trim() !== '' && (
                        <div className="text-center opacity-40 mt-10">
                            <svg className="w-16 h-16 mx-auto mb-4 opacity-50 quran-3d-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                            <p className="font-bold">{isEn ? "No results found for your search" : "لا توجد نتائج لبحثك"}</p>
                        </div>
                    )}

                    {!isSearching && results.length === 0 && query.trim() === '' && (
                        <div className="text-center opacity-40 mt-10">
                            <svg className="w-16 h-16 mx-auto mb-4 opacity-50 quran-3d-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                            <p className="font-bold">{isEn ? "Start searching for an ayah, word, or in Hisn Al-Muslim" : "ابدأ البحث عن آية، أو كلمة، أو في حصن المسلم"}</p>
                        </div>
                    )}

                    {sortedSurahKeys.map(surahNum => {
                        const group = groupedResults[surahNum];
                        const isExpanded = expandedSurahs[surahNum];
                        const surahDisplayName = isEn ? (SURAH_NAMES_EN[surahNum - 1] || group.surahName) : group.surahName;
                        return (
                            <div key={surahNum} className="mb-3 rounded-2xl overflow-hidden border-0">
                                <button 
                                    onClick={() => toggleSurah(surahNum)}
                                    className="w-full flex justify-between items-center p-3.5 quran-raised-btn rounded-2xl transition-all"
                                    style={{ 
                                        backgroundColor: isDarkTheme ? (currentTheme?.btnBg || 'rgba(255,255,255,0.06)') : '#ffffff',
                                        color: currentTheme?.text,
                                        border: 'none',
                                    }}
                                >
                                    <h4 className="font-amiri-quran text-xl font-bold" style={{ color: currentTheme?.accent || '#10b981' }}>
                                        {surahDisplayName}
                                    </h4>
                                    <div className="flex items-center gap-2">
                                        <span className="text-white text-[11px] px-2.5 py-0.5 rounded-full font-bold quran-raised-card" style={{ backgroundColor: currentTheme?.accent || '#10b981', border: 'none' }}>
                                            {isEn ? group.ayahs.length : toArabic(group.ayahs.length)}
                                        </span>
                                        <svg 
                                            className={`w-4 h-4 transition-transform duration-300 quran-3d-icon ${isExpanded ? 'rotate-180' : ''}`} 
                                            fill="none" stroke="currentColor" viewBox="0 0 24 24"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7"/>
                                        </svg>
                                    </div>
                                </button>
                                
                                {isExpanded && (
                                    <div className={`p-2.5 mt-2 rounded-2xl ${isLandscape ? 'grid grid-cols-2 gap-2.5' : 'space-y-2.5'}`} style={{ backgroundColor: isDarkTheme ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.015)' }}>
                                        {group.ayahs.map((r, idx) => (
                                            <div key={idx} className="search-context-block search-main-ayah !mb-0 p-3.5 rounded-2xl quran-raised-card cursor-pointer transition-all active:scale-[0.98]" 
                                                style={{ 
                                                    backgroundColor: isDarkTheme ? (currentTheme?.cardBg || 'rgba(255,255,255,0.05)') : '#ffffff',
                                                    border: 'none',
                                                }}
                                                onClick={() => { onSelect(r.surah, r.ayah); onClose(); }}>
                                                <div className="search-context-label !text-[10px] !mb-1.5 font-bold opacity-60" style={{ color: currentTheme?.text }}>
                                                    {isEn ? `Ayah ${r.ayah} - Page ${r.page}` : `آية ${toArabic(r.ayah)} - صفحة ${toArabic(r.page)}`}
                                                </div>
                                                {(isEn || readingMode === 'translation' || readingMode === 'bilingual') && r.textEn ? (
                                                    <div className="space-y-1.5 text-left mb-2" dir="ltr">
                                                        <div className="text-sm font-medium leading-relaxed" style={{ color: currentTheme?.text }}>
                                                            {highlightText(r.textEn, r.highlightRegex)}
                                                        </div>
                                                        <div className="search-context-ayah !text-sm font-amiri-quran text-right opacity-70" dir="rtl" style={{ color: currentTheme?.text }}>
                                                            {r.text}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="search-context-ayah !text-base font-amiri-quran" style={{ color: currentTheme?.text, letterSpacing: 0, fontFeatureSettings: '"kern", "liga", "clig", "calt", "ccmp"', textRendering: 'optimizeLegibility' }}>
                                                        {highlightText(r.text, r.highlightRegex)}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                    
                    {!isSearching && results.length > visibleCount && (
                        <button 
                            onClick={() => setVisibleCount(prev => prev + 100)}
                            className="w-full py-3.5 mt-4 rounded-2xl font-bold transition quran-raised-btn-selected"
                            style={{ backgroundColor: currentTheme?.accent || '#10b981', color: '#ffffff', border: 'none' }}
                        >
                            {isEn ? `Show more results (${results.length - visibleCount} remaining)` : `عرض المزيد من النتائج (${toArabic(results.length - visibleCount)} متبقية)`}
                        </button>
                    )}
                </div>
                <div 
                    className="p-3.5 flex gap-2 shrink-0 z-10" 
                    style={{ 
                        backgroundColor: currentTheme?.bg || '#ffffff',
                        paddingBottom: 'calc(max(env(safe-area-inset-bottom, 0px), 56px) + 0.75rem)'
                    }}
                >
                    <button 
                        onClick={onClose} 
                        className="flex-1 py-3.5 rounded-2xl text-xs font-bold w-full transition-all quran-raised-btn"
                        style={{ 
                            backgroundColor: currentTheme?.btnBg || (currentTheme?.text === '#ffffff' ? 'rgba(255,255,255,0.08)' : '#ffffff'), 
                            color: currentTheme?.btnText || currentTheme?.text, 
                            border: 'none',
                        }}
                    >
                        {isEn ? "Back" : "رجوع"}
                    </button>
                </div>
            </div>
        </div>
    </div>
    );
};

export default SearchModal;
