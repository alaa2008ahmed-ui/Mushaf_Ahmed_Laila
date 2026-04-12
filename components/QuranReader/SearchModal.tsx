import React, { useState, useEffect, useRef, useCallback } from 'react';
import { toArabic } from './constants';
import { X } from 'lucide-react';
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
        // The gap regex allows for any number of diacritics, small letters, and Quranic marks between search characters
        const gap = '[\\u0610-\\u061A\\u064B-\\u065F\\u0670\\u06D6-\\u06ED\\u0640]*';
        const highlightPattern = normQ.split('').map(c => (
            c === 'ا' ? '[أإآٱا]' : 
            (c === 'ه' ? '[هة]' : 
            (c === 'ي' ? '[يى]' : c.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')))
        )).join(gap);
        
        const regex = new RegExp(highlightPattern, 'gi');
        
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
                    
                    // Use regex test on clean text for much more flexible matching
                    if (regex.test(cleanText)) {
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
        <div className={`fixed inset-0 z-[1200] bg-transparent flex justify-center items-center ${isLandscape ? 'p-0' : 'p-4'} animate-fadeIn`} onClick={onClose}>
            <div className={`modal-skinned w-full ${isLandscape ? 'max-w-4xl h-full rounded-none' : 'max-w-lg rounded-2xl max-h-[90vh]'} flex flex-col shadow-2xl`} onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="relative">
                        <input 
                            type="text" 
                            value={query}
                            onChange={(e) => handleSearchInput(e.target.value)}
                            placeholder="اكتب كلمة للبحث..." 
                            className="w-full p-3 pl-10 pr-10 rounded-xl border focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold themed-input"
                            autoFocus
                        />
                        {query && (
                            <button 
                                onClick={() => handleSearchInput('')}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                                title="مسح البحث"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        )}
                        <button onClick={() => performSearch(query)} className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-emerald-500 text-white p-1.5 rounded-lg hover:bg-emerald-600 transition">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                        </button>
                    </div>
                    <div className="text-xs text-center mt-2 opacity-60 font-bold">{searchStats}</div>
                </div>
                <div className={`flex-1 overflow-y-auto p-4 relative themed-bg space-y-2`}>
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
                            <p>ابدأ البحث عن أي كلمة أو آية</p>
                        </div>
                    )}

                    {sortedSurahKeys.map(surahNum => {
                        const group = groupedResults[surahNum];
                        const isExpanded = expandedSurahs[surahNum];
                        return (
                            <div key={surahNum} className="mb-2 border border-emerald-500/20 rounded-xl overflow-hidden">
                                <button 
                                    onClick={() => toggleSurah(surahNum)}
                                    className="w-full flex justify-between items-center p-3 bg-emerald-500/5 hover:bg-emerald-500/10 transition-colors"
                                >
                                    <h4 className="font-amiri-quran text-xl font-bold text-emerald-600 dark:text-emerald-400">
                                        {group.surahName}
                                    </h4>
                                    <div className="flex items-center gap-2">
                                        <span className="bg-emerald-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
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
                                    <div className={`p-3 bg-white/5 ${isLandscape ? 'grid grid-cols-2 gap-2' : 'space-y-2'}`}>
                                        {group.ayahs.map((r, idx) => (
                                            <div key={idx} className="search-context-block search-main-ayah !mb-0" onClick={() => { onSelect(r.surah, r.ayah); onClose(); }}>
                                                <div className="search-context-label !text-[10px] !mb-1">آية {toArabic(r.ayah)} - صفحة {toArabic(r.page)}</div>
                                                <div className="search-context-ayah !text-sm" style={{ letterSpacing: 0, fontFeatureSettings: '"kern", "liga", "clig", "calt", "ccmp"', textRendering: 'optimizeLegibility' }}>
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
                            className="w-full py-3 mt-4 bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-600 transition shadow-md"
                        >
                            عرض المزيد من النتائج ({toArabic(results.length - visibleCount)} متبقية)
                        </button>
                    )}
                </div>
                <div className="p-3 border-t themed-card-bg rounded-b-2xl">
                    <button onClick={onClose} className="w-full py-2 rounded-xl font-bold theme-btn-bg">إغلاق</button>
                </div>
            </div>
        </div>
    );
};

export default SearchModal;
