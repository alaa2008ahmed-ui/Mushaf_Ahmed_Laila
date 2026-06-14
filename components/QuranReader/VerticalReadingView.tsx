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
    highlightedAyahId?: string | null;
    onAyahClick: (s: number, a: number) => void;
    onAyahLongPress?: (s: number, a: number, x: number, y: number) => void;
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
    isPlaying?: boolean;
    isRecording?: boolean;
    revealedAyahs?: string[];
    tempRevealedAyah?: string | null;
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
    highlightedAyahId,
    onAyahClick,
    onAyahLongPress,
    onVisibleAyahChange,
    showMarkerNotification,
    showJuzNotification,
    handleSajdahVisible,
    onSettingsChange,
    modeSuffix = '_v',
    hideVerses = false,
    memorizationSettings,
    isLandscape = false,
    onSurahHeaderLongPress,
    isPlaying = false,
    isRecording = false,
    revealedAyahs = [],
    tempRevealedAyah = null
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

    // Long press refs
    const longPressTimer = useRef<number | null>(null);
    const isLongPressTriggered = useRef(false);
    const touchStartPos = useRef<{x: number, y: number} | null>(null);

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

    const handlePointerDown = (s: number, a: number, e: React.PointerEvent) => {
        if (e.button !== 0 && e.pointerType === 'mouse') return;
        
        isLongPressTriggered.current = false;
        touchStartPos.current = { x: e.clientX, y: e.clientY };

        if (longPressTimer.current) {
            window.clearTimeout(longPressTimer.current);
        }

        longPressTimer.current = window.setTimeout(() => {
            if (onAyahLongPress) {
                onAyahLongPress(s, a, e.clientX, e.clientY);
                isLongPressTriggered.current = true;
            }
            longPressTimer.current = null;
        }, 600);
    };

    const handlePointerMoveItem = (e: React.PointerEvent) => {
        if (!touchStartPos.current || !longPressTimer.current) return;
        if (Math.abs(e.clientX - touchStartPos.current.x) > 15 || Math.abs(e.clientY - touchStartPos.current.y) > 15) {
            if (longPressTimer.current) {
                window.clearTimeout(longPressTimer.current);
                longPressTimer.current = null;
            }
        }
    };

    const handlePointerUpItem = () => {
        if (longPressTimer.current) {
            clearTimeout(longPressTimer.current);
            longPressTimer.current = null;
        }
    };

    const handlePointerLeaveItem = () => {
        if (longPressTimer.current) {
            clearTimeout(longPressTimer.current);
            longPressTimer.current = null;
        }
    };

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
                const themeId = currentTheme?.id || 'black';
                const bracketColor = currentTheme?.verseBracket || currentTheme?.accent || '#9333ea';
                const numColor = currentTheme?.accent || currentTheme?.sajdah || '#9333ea';
                
                switch(themeId) {
                    case 'black': return { num: '#000000', bracket: '#d97706' };
                    case 'night_sky': return { num: '#9333ea', bracket: '#9333ea' };
                    case 'green': return { num: '#dc2626', bracket: '#dc2626' };
                    case 'red': return { num: '#2563eb', bracket: '#2563eb' };
                    case 'deep_black': return { num: '#f59e0b', bracket: '#f59e0b' };
                    default: return { num: numColor, bracket: bracketColor };
                }
            };

            const { num: pageNumColor, bracket: bracketColor } = getContrastingColors();

            return (
                <div className="page-footer flex flex-col items-center pt-1 pb-4" style={{ color: currentTheme.text }}>
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

        const isHighlighted = highlightedAyahId === `ayah-${item.surahNumber}-${item.ayahNumber}`;
        
        // Determine if this ayah should be hidden
        let shouldHide = hideVerses && !isHighlighted;
        
        // If in memorization review mode, apply specific hiding rules
        if (memorizationSettings?.isReviewMode) {
            const s = item.surahNumber;
            const a = item.ayahNumber;
            const { fromSurah, fromAyah, toSurah, toAyah } = memorizationSettings;
            
            const isBefore = s < fromSurah || (s === fromSurah && a < fromAyah);
            const isAfter = s > toSurah || (s === toSurah && a > toAyah);
            const isInRange = !isBefore && !isAfter;
            
            const ayahKey = `${s}-${a}`;
            const isRevealed = revealedAyahs.includes(ayahKey) || tempRevealedAyah === ayahKey;
            
            if (isInRange) {
                if (isRevealed) {
                    shouldHide = false; // Show if revealed or hint
                } else if (isRecording && tempRevealedAyah !== ayahKey) {
                    shouldHide = true; // Hide others during recording, unless it's the temp revealed one
                } else if (isPlaying && isHighlighted) {
                    shouldHide = false; // Show only the playing verse
                } else {
                    shouldHide = true; // Hide otherwise
                }
            } else {
                shouldHide = false; // Don't hide verses outside the review range
            }
        } else if (shouldHide && memorizationSettings) {
            // Normal memorization mode logic (hide only within range)
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
            <div className={`${isLandscape ? 'flex justify-center' : ''} px-1`}>
                <div 
                    id={`ayah-${item.surahNumber}-${item.ayahNumber}`}
                    className={`ayah-item ayah-text-block px-1 py-0 rounded-none border-b ${isLandscape ? 'max-w-3xl w-full' : ''}`}
                    style={{ 
                        borderBottomColor: isHighlighted ? (settings.highlightTextColor || currentTheme.accent) : `${currentTheme.border}33`,
                    }}
                    onPointerDown={(e) => handlePointerDown(item.surahNumber, item.ayahNumber, e)}
                    onPointerMove={handlePointerMoveItem}
                    onPointerUp={handlePointerUpItem}
                    onPointerLeave={handlePointerLeaveItem}
                    onClick={() => {
                        if (isLongPressTriggered.current) return;
                        isInternalClickRef.current = true;
                        onAyahClick(item.surahNumber, item.ayahNumber);
                    }}
                >
                    <div className="ayah-text mb-0 text-right leading-loose" 
                         style={{ 
                             fontSize: `${localFontSize}rem`, 
                             fontFamily: settings.fontFamily,
                             fontWeight: settings.isBold ? '900' : 'normal',
                             paddingTop: '4px',
                             paddingBottom: '2px',
                             WebkitTextStroke: settings.isBold ? '0.5px currentColor' : '0px',
                             color: shouldHide ? 'transparent' : (isHighlighted ? (settings.highlightTextColor || currentTheme.highlightText || currentTheme.accent) : (settings.textColor || currentTheme.text)),
                             backgroundColor: shouldHide ? `${settings.highlightTextColor || currentTheme.accent}33` : 'transparent',
                             borderRadius: shouldHide ? '8px' : '0',
                             letterSpacing: 0,
                             fontFeatureSettings: '"kern", "liga", "clig", "calt", "ccmp"',
                             textRendering: 'optimizeLegibility',
                             opacity: shouldHide ? 0.6 : 1,
                             cursor: hideVerses ? 'pointer' : 'default',
                             userSelect: shouldHide ? 'none' : 'auto'
                         }}>
                        {item.text}
                        <span className="inline-flex items-center justify-center mr-2 font-bold opacity-60"
                              style={{ 
                                  fontSize: '0.9em',
                                  color: isHighlighted ? (settings.highlightTextColor || currentTheme.highlightText || currentTheme.accent) : currentTheme.accent
                              }}>
                            ﴿{toArabic(item.ayahNumber)}﴾
                        </span>
                    </div>
                    
                    <div className="explanation-text text-right opacity-90 leading-relaxed pb-2"
                         style={{ 
                             fontSize: `${localFontSize * 0.8}rem`, 
                             marginTop: '-2px',
                             color: isHighlighted ? (settings.highlightTextColor || currentTheme.highlightText || currentTheme.accent) : (settings.textColor || currentTheme.text),
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
    }, [highlightedAyahId, currentTheme, settings, readingMode, onAyahClick, meaningsData, tafseerData, translationData, hideVerses, memorizationSettings, localFontSize]);

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
            style={{ direction: 'rtl', backgroundColor: settings.bgColor || currentTheme.bg }}
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
                    className="scrollbar-hide pb-8"
                    itemContent={(index, item) => renderItem(index, item)}
                    rangeChanged={(range) => {
                    const midIndex = Math.round((range.startIndex + range.endIndex) / 2);
                    const item = flattenedItems[midIndex] || flattenedItems[range.startIndex];
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
                        // onVisibleAyahChange?.(item.surahNumber, item.ayahNumber);
                    }
                }}
            />
            )}
        </div>
    );
});

export default VerticalReadingView;
