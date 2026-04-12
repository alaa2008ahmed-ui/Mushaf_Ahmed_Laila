import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { Virtuoso, VirtuosoHandle } from 'react-virtuoso';
import { toArabic, SURAH_INFO, SURAH_NAMES_AR, getAyahCountText, SAJDAH_LOCATIONS } from './constants';
import SurahHeader from './SurahHeader';

interface VerticalReadingViewProps {
    quranData: any;
    readingMode: 'tafseer' | 'meanings' | 'translation';
    settings: any;
    currentTheme: any;
    currentAyah: { s: number; a: number };
    onAyahClick: (s: number, a: number) => void;
    onVisibleAyahChange?: (s: number, a: number) => void;
    showMarkerNotification?: (type: 'quarter' | 'sajda' | 'surah', text: string) => void;
    showJuzNotification?: (text: string) => void;
    handleSajdahVisible?: (surahName: string, sNum: number, ayahNum: number) => void;
    onSettingsChange?: (newSettings: any) => void;
    modeSuffix?: string;
    hideVerses?: boolean;
    memorizationSettings?: any;
    isLandscape?: boolean;
    onSurahHeaderLongPress?: () => void;
}

// Global cache to ensure instant loading after first fetch
let cachedTafseerData: any[] | null = null;
let cachedMeaningsData: any[] | null = null;
let cachedTranslationData: any[] | null = null;

const VerticalReadingView: React.FC<VerticalReadingViewProps> = React.memo(({
    quranData,
    readingMode,
    settings,
    currentTheme,
    currentAyah,
    onAyahClick,
    onVisibleAyahChange,
    showMarkerNotification,
    showJuzNotification,
    handleSajdahVisible,
    onSettingsChange,
    modeSuffix = '_v',
    hideVerses = false,
    memorizationSettings,
    isLandscape = false,
    onSurahHeaderLongPress
}) => {
    const [tafseerData, setTafseerData] = useState<any[]>(cachedTafseerData || []);
    const [meaningsData, setMeaningsData] = useState<any[]>(cachedMeaningsData || []);
    const [translationData, setTranslationData] = useState<any[]>(cachedTranslationData || []);
    const [isLoading, setIsLoading] = useState(() => {
        if (readingMode === 'tafseer') return !cachedTafseerData;
        if (readingMode === 'meanings') return !cachedMeaningsData;
        if (readingMode === 'translation') return !cachedTranslationData;
        return true;
    });
    const virtuosoRef = useRef<VirtuosoHandle>(null);
    const isInternalClickRef = useRef(false);
    const lastScrolledAyahRef = useRef<{s: number, a: number} | null>(null);
    const lastNotifiedJuz = useRef<number | null>(null);
    const lastNotifiedQuarter = useRef<number | null>(null);
    const lastNotifiedSajda = useRef<string | null>(null);

    // Pinch-to-zoom refs
    const initialPinchDistanceRef = useRef<number | null>(null);
    const initialPinchFontSizeRef = useRef<number | null>(null);

    const [localFontSize, setLocalFontSize] = useState(settings.fontSize);

    const [scrollParent, setScrollParent] = useState<HTMLElement | undefined>(undefined);

    useEffect(() => {
        const parent = document.getElementById('mushaf-content');
        if (parent) {
            setScrollParent(parent);
        }
    }, []);

    useEffect(() => {
        setLocalFontSize(settings.fontSize);
    }, [settings.fontSize]);

    const handleTouchStart = (e: React.TouchEvent) => {
        if (e.touches.length === 2) {
            const touch1 = e.touches[0];
            const touch2 = e.touches[1];
            const distance = Math.hypot(touch1.clientX - touch2.clientX, touch1.clientY - touch2.clientY);
            initialPinchDistanceRef.current = distance;
            initialPinchFontSizeRef.current = localFontSize;
        }
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (e.touches.length === 2 && initialPinchDistanceRef.current !== null && initialPinchFontSizeRef.current !== null) {
            const touch1 = e.touches[0];
            const touch2 = e.touches[1];
            const distance = Math.hypot(touch1.clientX - touch2.clientX, touch1.clientY - touch2.clientY);
            
            const scaleFactor = distance / initialPinchDistanceRef.current;
            const newFontSize = Math.min(Math.max(initialPinchFontSizeRef.current * scaleFactor, 1.0), 5.0);
            
            setLocalFontSize(newFontSize);
        }
    };

    const handleTouchEnd = () => {
        if (initialPinchDistanceRef.current !== null && onSettingsChange) {
            const newSettings = { ...settings, fontSize: localFontSize };
            onSettingsChange(newSettings);
            localStorage.setItem('quran_settings' + modeSuffix, JSON.stringify(newSettings));
            window.dispatchEvent(new Event('settings-change'));
        }
        initialPinchDistanceRef.current = null;
        initialPinchFontSizeRef.current = null;
    };

    useEffect(() => {
        const fetchTafseer = async () => {
            if (cachedTafseerData) return;
            try {
                const res = await fetch('/assets/data/ar.jalalayn.json');
                const data = await res.json();
                if (data.code === 200 && data.data && data.data.surahs) {
                    cachedTafseerData = data.data.surahs;
                    setTafseerData(cachedTafseerData);
                    if (readingMode === 'tafseer') setIsLoading(false);
                }
            } catch (error) {
                console.error('Error fetching tafseer data:', error);
            }
        };

        const fetchMeanings = async () => {
            if (cachedMeaningsData) return;
            try {
                const res = await fetch('/tafseer.json');
                const data = await res.json();
                cachedMeaningsData = data;
                setMeaningsData(cachedMeaningsData);
                if (readingMode === 'meanings') setIsLoading(false);
            } catch (error) {
                console.error('Error fetching meanings data:', error);
            }
        };

        const fetchTranslation = async () => {
            if (cachedTranslationData) return;
            try {
                const res = await fetch('/en.json');
                const data = await res.json();
                cachedTranslationData = data;
                setTranslationData(cachedTranslationData);
                if (readingMode === 'translation') setIsLoading(false);
            } catch (error) {
                console.error('Error fetching translation data:', error);
            }
        };

        fetchTafseer();
        fetchMeanings();
        fetchTranslation();
    }, [readingMode]);

    // Flatten the Quran data into a single list of items (headers and ayahs)
    const flattenedItems = useMemo(() => {
        const items: any[] = [];
        let lastPage = -1;

        quranData.surahs.forEach((surah: any) => {
            // Check if page changed before adding surah header
            // This happens if the first ayah of the new surah is on a new page
            if (lastPage !== -1 && surah.ayahs.length > 0 && surah.ayahs[0].page !== lastPage) {
                items.push({
                    type: 'page-marker',
                    pageNumber: lastPage
                });
                lastPage = surah.ayahs[0].page;
            }

            // Add Surah Header
            items.push({
                type: 'header',
                surahNumber: surah.number,
                surahName: SURAH_NAMES_AR[surah.number - 1],
                surahType: SURAH_INFO[surah.number].type,
                ayahCount: SURAH_INFO[surah.number].ayahs
            });

            // Add Ayahs
            surah.ayahs.forEach((ayah: any) => {
                // Check if page changed within the surah
                if (lastPage !== -1 && ayah.page !== lastPage) {
                    items.push({
                        type: 'page-marker',
                        pageNumber: lastPage
                    });
                }
                lastPage = ayah.page;

                const isSajdah = SAJDAH_LOCATIONS.some(sl => sl.s === surah.number && sl.a === ayah.numberInSurah);
                items.push({
                    type: 'ayah',
                    surahNumber: surah.number,
                    ayahNumber: ayah.numberInSurah,
                    text: ayah.text,
                    juz: ayah.juz,
                    hizbQuarter: ayah.hizbQuarter,
                    sajda: isSajdah,
                    page: ayah.page,
                    id: `${surah.number}-${ayah.numberInSurah}`
                });
            });
        });

        // Add last page marker
        if (lastPage !== -1) {
            items.push({
                type: 'page-marker',
                pageNumber: lastPage
            });
        }

        return items;
    }, [quranData]);

    // Find the index of the current ayah in the flattened list
    const initialIndex = useMemo(() => {
        const targetId = `${currentAyah.s}-${currentAyah.a}`;
        const index = flattenedItems.findIndex(item => item.type === 'ayah' && item.id === targetId);
        return index !== -1 ? index : 0;
    }, [flattenedItems, currentAyah]);

    // Scroll to current ayah when it changes externally
    useEffect(() => {
        if (!isLoading && virtuosoRef.current) {
            if (isInternalClickRef.current) {
                isInternalClickRef.current = false;
                return;
            }
            if (lastScrolledAyahRef.current?.s === currentAyah.s && lastScrolledAyahRef.current?.a === currentAyah.a) {
                return;
            }
            const targetId = `${currentAyah.s}-${currentAyah.a}`;
            const index = flattenedItems.findIndex(item => item.type === 'ayah' && item.id === targetId);
            
            if (index !== -1) {
                virtuosoRef.current.scrollToIndex({
                    index: index,
                    align: 'center', // Align to center for better visibility of the surah/ayah
                    behavior: 'auto' // Instant jump, no smooth scrolling
                });
            }
        }
    }, [currentAyah.s, currentAyah.a, isLoading, flattenedItems]);

    const getMeaning = (s: number, a: number) => {
        return meaningsData.find(m => m.number === String(s) && m.aya === String(a))?.text;
    };

    const getTafseer = (s: number, a: number) => {
        return tafseerData[s - 1]?.ayahs[a - 1]?.text;
    };

    const getTranslation = (s: number, a: number) => {
        return translationData[s - 1]?.verses[a - 1]?.translation;
    };

    const renderItem = useCallback((index: number, item: any) => {
        if (item.type === 'page-marker') {
            const getContrastingColors = () => {
                const themeId = currentTheme?.id || 'night_sky';
                const bracketColor = currentTheme?.verseBracket || currentTheme?.accent || '#9333ea';
                const numColor = currentTheme?.accent || currentTheme?.sajdah || '#9333ea';
                
                switch(themeId) {
                    case 'night_sky': return { num: '#9333ea', bracket: '#9333ea' };
                    case 'green': return { num: '#dc2626', bracket: '#dc2626' };
                    case 'red': return { num: '#2563eb', bracket: '#2563eb' };
                    case 'deep_black': return { num: '#f59e0b', bracket: '#f59e0b' };
                    default: return { num: numColor, bracket: bracketColor };
                }
            };

            const { num: pageNumColor, bracket: bracketColor } = getContrastingColors();

            return (
                <div className="page-footer flex flex-col items-center py-10" style={{ color: currentTheme.text }}>
                    <div className="flex items-center justify-center">
                        <span className="page-number-bracket" style={{ color: bracketColor }}>﴿</span>
                        <span className="page-number-text" style={{ color: pageNumColor }}>{toArabic(item.pageNumber)}</span>
                        <span className="page-number-bracket" style={{ color: bracketColor }}>﴾</span>
                    </div>
                    <div style={{ width: '60%', height: '2.5px', backgroundColor: bracketColor, marginTop: '12px', opacity: 0.8, borderRadius: '2px' }}></div>
                </div>
            );
        }

        if (item.type === 'header') {
            return (
                <SurahHeader 
                    surahNumber={item.surahNumber}
                    surahName={item.surahName}
                    surahType={item.surahType}
                    ayahCount={item.ayahCount}
                    currentTheme={currentTheme}
                    design={settings.surahHeaderDesign || 1}
                    onLongPress={onSurahHeaderLongPress}
                />
            );
        }

        const isHighlighted = currentAyah.s === item.surahNumber && currentAyah.a === item.ayahNumber;
        
        // Determine if this ayah should be hidden
        let shouldHide = hideVerses && !isHighlighted;
        
        // If in memorization review mode, only hide if it's within the review range
        if (shouldHide && memorizationSettings?.isReviewMode) {
            const s = item.surahNumber;
            const a = item.ayahNumber;
            const { fromSurah, fromAyah, toSurah, toAyah } = memorizationSettings;
            
            const isBefore = s < fromSurah || (s === fromSurah && a < fromAyah);
            const isAfter = s > toSurah || (s === toSurah && a > toAyah);
            
            if (isBefore || isAfter) {
                shouldHide = false;
            }
        }

        return (
            <div className={`px-4 py-2 ${isLandscape ? 'flex justify-center' : ''}`}>
                <div 
                    className={`ayah-item p-4 rounded-xl transition-all border ${isHighlighted ? 'ring-2' : ''} ${isLandscape ? 'max-w-3xl w-full' : ''}`}
                    style={{ 
                        backgroundColor: isHighlighted ? `${currentTheme.accent}20` : 'transparent',
                        borderColor: isHighlighted ? currentTheme.accent : 'transparent'
                    }}
                    onClick={() => {
                        isInternalClickRef.current = true;
                        onAyahClick(item.surahNumber, item.ayahNumber);
                    }}
                >
                    <div className="ayah-text mb-4 text-right leading-relaxed transition-all duration-500" 
                         style={{ 
                             fontSize: `${localFontSize}rem`, 
                             fontFamily: settings.fontFamily,
                             color: currentTheme.accent,
                             letterSpacing: 0,
                             fontFeatureSettings: '"kern", "liga", "clig", "calt", "ccmp"',
                             textRendering: 'optimizeLegibility',
                             filter: shouldHide ? 'blur(8px)' : 'none',
                             opacity: shouldHide ? 0.3 : 1,
                             cursor: hideVerses ? 'pointer' : 'default'
                         }}>
                        {item.text}
                        <span className="inline-flex items-center justify-center w-8 h-8 mr-2 rounded-full border border-current text-sm font-bold"
                              style={{ color: currentTheme.text }}>
                            {toArabic(item.ayahNumber)}
                        </span>
                    </div>
                    
                    <div className="divider h-px w-full my-4 opacity-20" style={{ backgroundColor: currentTheme.text }}></div>
                    
                    <div className="explanation-text text-right opacity-90 leading-relaxed"
                         style={{ 
                             fontSize: `${localFontSize * 0.8}rem`, 
                             color: currentTheme.text,
                             direction: readingMode === 'translation' ? 'ltr' : 'rtl',
                             textAlign: readingMode === 'translation' ? 'left' : 'right'
                         }}>
                        {readingMode === 'tafseer' ? getTafseer(item.surahNumber, item.ayahNumber) : 
                         readingMode === 'meanings' ? getMeaning(item.surahNumber, item.ayahNumber) :
                         getTranslation(item.surahNumber, item.ayahNumber)}
                    </div>
                </div>
            </div>
        );
    }, [currentAyah, currentTheme, settings, readingMode, onAyahClick, meaningsData, tafseerData, translationData, hideVerses, memorizationSettings, localFontSize]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full" style={{ backgroundColor: currentTheme.bg }}>
                <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: currentTheme.accent }}></div>
            </div>
        );
    }

    return (
        <div 
            className="w-full min-h-full" 
            style={{ direction: 'rtl', backgroundColor: currentTheme.bg }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >
            {scrollParent && (
                <Virtuoso
                    ref={virtuosoRef}
                    useWindowScroll={false}
                    customScrollParent={scrollParent}
                    data={flattenedItems}
                    initialTopMostItemIndex={{ index: initialIndex, align: 'center' }}
                    overscan={200} // Pre-render items for smoother experience
                    className="scrollbar-hide"
                    itemContent={renderItem}
                    rangeChanged={(range) => {
                    const item = flattenedItems[range.startIndex];
                    if (item && item.type === 'ayah') {
                        // Detect Juz change
                        if (item.juz && lastNotifiedJuz.current !== null && item.juz !== lastNotifiedJuz.current) {
                            showJuzNotification?.(`بداية الجزء ${toArabic(item.juz)}`);
                        }
                        lastNotifiedJuz.current = item.juz;

                        // Detect Quarter change
                        if (item.hizbQuarter && lastNotifiedQuarter.current !== null && item.hizbQuarter !== lastNotifiedQuarter.current) {
                            let label = '';
                            const qInHizb = ((item.hizbQuarter - 1) % 4) + 1;
                            const hizbNum = Math.ceil(item.hizbQuarter / 4);
                            if (qInHizb === 1) label = `بداية الحزب ${toArabic(hizbNum)}`;
                            else if (qInHizb === 2) label = `ربع الحزب ${toArabic(hizbNum)}`;
                            else if (qInHizb === 3) label = `نصف الحزب ${toArabic(hizbNum)}`;
                            else if (qInHizb === 4) label = `ثلاثة أرباع الحزب ${toArabic(hizbNum)}`;
                            
                            if (label) showMarkerNotification?.('quarter', label);
                        }
                        lastNotifiedQuarter.current = item.hizbQuarter;

                        // Detect Sajdah
                        if (item.sajda) {
                            const sajdaId = `${item.surahNumber}-${item.ayahNumber}`;
                            if (lastNotifiedSajda.current !== sajdaId) {
                                const surahName = SURAH_NAMES_AR[item.surahNumber - 1];
                                if (handleSajdahVisible) {
                                    handleSajdahVisible(surahName, item.surahNumber, item.ayahNumber);
                                } else {
                                    const displaySurah = (surahName.includes('سورة') || surahName.includes('سُورَة')) 
                                        ? surahName 
                                        : `سورة ${surahName}`;
                                    showMarkerNotification?.('sajda', `سجدة تلاوة: ${displaySurah} - آية ${toArabic(item.ayahNumber)}`);
                                }
                                lastNotifiedSajda.current = sajdaId;
                            }
                        } else {
                            lastNotifiedSajda.current = null;
                        }

                        lastScrolledAyahRef.current = { s: item.surahNumber, a: item.ayahNumber };
                        onVisibleAyahChange?.(item.surahNumber, item.ayahNumber);
                    }
                }}
            />
            )}
        </div>
    );
});

export default VerticalReadingView;
