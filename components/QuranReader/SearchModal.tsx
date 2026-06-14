import React, { useState, useEffect, useRef, useCallback } from 'react';
import { toArabic } from './constants';
import { X } from 'lucide-react';
import { Keyboard } from '@capacitor/keyboard';
import { Capacitor } from '@capacitor/core';
import { renderTajweedTextHtml } from './MushafPage';

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

    const executeSearchOptimized = useCallback((q: string, jobId: number) => {
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
                    
                    if (isNumberSearch && ayah.numberInSurah === searchNum) {
                        foundResults.push({ 
                            text: fixQuranText(cleanText), 
                            rawText: fixQuranText(rawText),
                            surah: surah.number, 
                            surahName: surah.name, 
                            ayah: ayah.numberInSurah, 
                            page: ayah.page,
                            highlightRegex: null // No highlight for pure numbers unless we want to
                        });
                    } else if (!isNumberSearch && regex.test(cleanText)) {
                        foundResults.push({ 
                            text: fixQuranText(cleanText), 
                            rawText: fixQuranText(rawText),
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
                        setSearchStats(`جاري البحث... (${toArabic(foundResults.length)})`);
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
                setSearchStats(`النتائج: ${toArabic(foundResults.length)}`);
                setIsSearching(false);
            }
        };

        processChunk();
    }, [quranData, modeSuffix]);

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

        setSearchStats('جاري الكتابة...');
        searchTimeoutRef.current = setTimeout(() => performSearch(q), 500);
    }, [modeSuffix, performSearch]);

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

    const highlightText = (text: string, regex: RegExp) => {
        const parts = text.split(regex);
        const matches = text.match(regex) || [];
        return (
            <>
                {parts.map((part, i) => (
                    <React.Fragment key={i}>
                        {part}
                        {matches[i] && <span className="highlighted-search-term">{matches[i]}</span>}
                    </React.Fragment>
                ))}
            </>
        );
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
        <div className="fixed top-0 left-0 right-0 z-[1200] flex items-center justify-center overflow-hidden" style={{ top: 0, left: 0, right: 0, height: `${initialHeight}px`, backgroundColor: 'rgba(0,0,0,0.5)' }} dir="rtl" onClick={onClose}>
            <div className="w-full h-full flex flex-col overflow-hidden shadow-none border-[4px]" style={{ backgroundColor: currentTheme?.bg || '#ffffff', borderColor: currentTheme?.accent || '#3b82f6' }} onClick={e => e.stopPropagation()}>
                <div className="flex-1 w-full flex flex-col overflow-hidden" style={{ color: currentTheme?.text || '#000000' }}>
                    
                    {/* Full Screen Modal Header */}
                    <div className="p-3 border-b flex items-center justify-center shrink-0" style={{ backgroundColor: currentTheme?.bg || '#ffffff', borderColor: currentTheme?.id === 'night' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)', paddingTop: 'calc(0.75rem + env(safe-area-inset-top))' }}>
                        <h3 className="text-sm font-bold" style={{ color: currentTheme?.text }}>البحث المتقدم</h3>
                    </div>

                    {/* Search Input Section */}
                    <div className="p-4 border-b shrink-0 z-10" style={{ backgroundColor: currentTheme?.bg || '#ffffff', borderColor: currentTheme?.id === 'night' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }}>
                        <div className="relative">
                            <input 
                                type="text" 
                                value={query}
                                onChange={(e) => handleSearchInput(e.target.value)}
                                placeholder="ابحث عن آية، أو كلمة، أو في حصن المسلم..." 
                                className="w-full p-3 pl-10 pr-10 rounded-xl border focus:outline-none font-bold"
                                style={{ 
                                    backgroundColor: currentTheme?.id === 'night' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                                    borderColor: currentTheme?.accent || '#3b82f6',
                                    color: currentTheme?.text || '#000000'
                                }}
                            />
                            {query && (
                                <button 
                                    onClick={() => handleSearchInput('')}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 transition-colors"
                                    style={{ color: currentTheme?.text, opacity: 0.5 }}
                                    title="مسح البحث"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            )}
                            <button 
                                onClick={() => performSearch(query)} 
                                className="absolute left-2 top-1/2 transform -translate-y-1/2 p-1.5 rounded-lg transition"
                                style={{ backgroundColor: currentTheme?.accent || '#10b981', color: '#ffffff' }}
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                            </button>
                        </div>
                        <div className="text-xs text-center mt-2 font-bold opacity-60" style={{ color: currentTheme?.text }}>{searchStats}</div>
                    </div>

                    <div 
                        className={`flex-1 overflow-y-auto p-4 relative space-y-2 scrollbar-hide`} 
                        style={{ 
                            backgroundColor: currentTheme?.bg || '#ffffff',
                            paddingBottom: '1rem'
                        }}
                    >
                    {isSearching && (
                        <div className="text-center mt-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto"></div>
                            <p className="mt-2 opacity-60 font-bold">جاري البحث...</p>
                        </div>
                    )}
                    
                    {!isSearching && results.length === 0 && query.trim() !== '' && (
                        <div className="text-center opacity-40 mt-10">
                            <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                            <p>لا توجد نتائج لبحثك</p>
                        </div>
                    )}

                    {!isSearching && results.length === 0 && query.trim() === '' && (
                        <div className="text-center opacity-40 mt-10">
                            <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                            <p>ابدأ البحث عن آية، أو كلمة، أو في حصن المسلم</p>
                        </div>
                    )}

                    {sortedSurahKeys.map(surahNum => {
                        const group = groupedResults[surahNum];
                        const isExpanded = expandedSurahs[surahNum];
                        return (
                            <div key={surahNum} className="mb-2 border border-emerald-500/20 rounded-xl overflow-hidden">
                                <button 
                                    onClick={() => toggleSurah(surahNum)}
                                    className="w-full flex justify-between items-center p-3 transition-colors"
                                    style={{ 
                                        backgroundColor: currentTheme?.id === 'night' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                                        borderBottom: isExpanded ? `1px solid ${currentTheme?.accent || '#10b981'}33` : 'none'
                                    }}
                                >
                                    <h4 className="font-amiri-quran text-xl font-bold" style={{ color: currentTheme?.accent || '#10b981' }}>
                                        {group.surahName}
                                    </h4>
                                    <div className="flex items-center gap-2">
                                        <span className="text-white text-[10px] px-2 py-0.5 rounded-full font-bold" style={{ backgroundColor: currentTheme?.accent || '#10b981' }}>
                                            {toArabic(group.ayahs.length)}
                                        </span>
                                        <svg 
                                            className={`w-4 h-4 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} 
                                            fill="none" stroke="currentColor" viewBox="0 0 24 24"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/>
                                        </svg>
                                    </div>
                                </button>
                                
                                {isExpanded && (
                                    <div className={`p-3 ${isLandscape ? 'grid grid-cols-2 gap-2' : 'space-y-2'}`} style={{ backgroundColor: currentTheme?.id === 'night' ? 'rgba(255,255,255,0.02)' : 'transparent' }}>
                                        {group.ayahs.map((r, idx) => (
                                            <div key={idx} className="search-context-block search-main-ayah !mb-0 p-3 rounded-xl border-[2px] cursor-pointer transition-all active:scale-[0.98]" 
                                                style={{ 
                                                    backgroundColor: currentTheme?.id === 'night' ? 'rgba(255,255,255,0.05)' : '#ffffff',
                                                    borderColor: currentTheme?.id === 'night' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'
                                                }}
                                                onClick={() => { onSelect(r.surah, r.ayah); onClose(); }}>
                                                <div className="search-context-label !text-[10px] !mb-1 font-bold opacity-50" style={{ color: currentTheme?.text }}>آية {toArabic(r.ayah)} - صفحة {toArabic(r.page)}</div>
                                                <div className="search-context-ayah !text-base font-amiri-quran" style={{ color: currentTheme?.text, letterSpacing: 0, fontFeatureSettings: '"kern", "liga", "clig", "calt", "ccmp"', textRendering: 'optimizeLegibility' }}>
                                                    {highlightText(r.text, r.highlightRegex)}
                                                </div>
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
                            className="w-full py-4 mt-4 rounded-xl font-bold transition shadow-md active:scale-95 border-[2px]"
                            style={{ backgroundColor: currentTheme?.accent || '#10b981', color: '#ffffff', borderColor: 'rgba(255,255,255,0.2)' }}
                        >
                            عرض المزيد من النتائج ({toArabic(results.length - visibleCount)} متبقية)
                        </button>
                    )}
                </div>
                <div className="p-3 border-t flex gap-2 shrink-0 z-10" style={{ backgroundColor: currentTheme?.bg || '#ffffff', borderColor: currentTheme?.text === '#ffffff' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }}>
                    <button 
                        onClick={onClose} 
                        className="flex-1 py-4 rounded-xl text-xs font-bold w-full transition-all shadow-md active:scale-95 border-[2px]"
                        style={{ 
                            backgroundColor: currentTheme?.btnBg || (currentTheme?.text === '#ffffff' ? 'rgba(255,255,255,0.05)' : '#ffffff'), 
                            color: currentTheme?.btnText || currentTheme?.text, 
                            borderColor: currentTheme?.accent || '#3b82f6' 
                        }}
                    >
                        إغلاق
                    </button>
                </div>
                </div>
            </div>
        </div>
    );
};

export default SearchModal;
