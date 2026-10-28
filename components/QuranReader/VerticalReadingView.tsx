import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { Virtuoso, VirtuosoHandle } from 'react-virtuoso';
import { toArabic, SURAH_INFO, SURAH_NAMES_AR, SURAH_NAMES_EN, getAyahCountText, SAJDAH_LOCATIONS, getBilingualEnglishFont } from './constants';
import SurahHeader from './SurahHeader';

interface VerticalReadingViewProps {
    quranData: any;
    readingMode: 'tafseer' | 'meanings' | 'translation' | 'bilingual';
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
    isLandscapeUIHidden?: boolean;
    onSurahHeaderLongPress?: () => void;
    isPlaying?: boolean;
    isRecording?: boolean;
    revealedAyahs?: string[];
    tempRevealedAyah?: string | null;
    onAyahNumberLongPress?: (s: number, a: number) => void;
    onAyahNumberClick?: (s: number, a: number) => void;
    onInteractionStart?: () => void;
    onInteractionEnd?: () => void;
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
    isLandscapeUIHidden = false,
    onSurahHeaderLongPress,
    isPlaying = false,
    isRecording = false,
    revealedAyahs = [],
    tempRevealedAyah = null,
    onAyahNumberLongPress,
    onAyahNumberClick,
    onInteractionStart,
    onInteractionEnd
}) => {
    const [tafseerData, setTafseerData] = useState<any[]>(cachedTafseerData || []);
    const [meaningsData, setMeaningsData] = useState<any[]>(cachedMeaningsData || []);
    const [translationData, setTranslationData] = useState<any[]>(cachedTranslationData || []);
    const [isLoading, setIsLoading] = useState(() => {
        if (readingMode === 'tafseer') return !cachedTafseerData;
        if (readingMode === 'meanings') return !cachedMeaningsData;
        if (readingMode === 'translation' || readingMode === 'bilingual') return !cachedTranslationData;
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

    // Dedicated Ayah Number Long-Press (English Tafseer) refs & handlers
    const numberLongPressTimerRef = useRef<number | null>(null);
    const isNumberLongPressRef = useRef(false);
    const numberTouchStartPos = useRef<{ x: number; y: number } | null>(null);

    const handleNumberPointerDown = (s: number, a: number, e: React.PointerEvent) => {
        if (e.button !== 0 && e.pointerType === 'mouse') return;
        e.stopPropagation();
        isNumberLongPressRef.current = false;
        numberTouchStartPos.current = { x: e.clientX, y: e.clientY };

        if (numberLongPressTimerRef.current) {
            window.clearTimeout(numberLongPressTimerRef.current);
        }

        numberLongPressTimerRef.current = window.setTimeout(() => {
            isNumberLongPressRef.current = true;
            if (typeof navigator !== 'undefined' && navigator.vibrate) {
                try { navigator.vibrate(50); } catch (_) {}
            }
            if (onAyahNumberLongPress) {
                onAyahNumberLongPress(s, a);
            }
            numberLongPressTimerRef.current = null;
        }, 450);
    };

    const handleNumberPointerUp = (e: React.PointerEvent) => {
        e.stopPropagation();
        if (numberLongPressTimerRef.current) {
            window.clearTimeout(numberLongPressTimerRef.current);
            numberLongPressTimerRef.current = null;
        }
    };

    const handleNumberPointerMove = (e: React.PointerEvent) => {
        if (!numberTouchStartPos.current || !numberLongPressTimerRef.current) return;
        if (Math.abs(e.clientX - numberTouchStartPos.current.x) > 10 || Math.abs(e.clientY - numberTouchStartPos.current.y) > 10) {
            if (numberLongPressTimerRef.current) {
                window.clearTimeout(numberLongPressTimerRef.current);
                numberLongPressTimerRef.current = null;
            }
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
            const rawFontSize = Math.min(Math.max(initialPinchFontSizeRef.current * scaleFactor, 0.5), 5.0);
            const newFontSize = parseFloat(rawFontSize.toFixed(2));
            
            setLocalFontSize(newFontSize);
        }
    };

    const handleTouchEnd = () => {
        if (initialPinchDistanceRef.current !== null && onSettingsChange) {
            const roundedFontSize = parseFloat(Number(localFontSize || 1).toFixed(2));
            const newSettings = { ...settings, fontSize: roundedFontSize };
            onSettingsChange(newSettings);
            localStorage.setItem('quran_settings' + modeSuffix, JSON.stringify(newSettings));
            window.dispatchEvent(new Event('settings-change'));
        }
        initialPinchDistanceRef.current = null;
        initialPinchFontSizeRef.current = null;
    };

    useEffect(() => {
        const fetchTafseer = async () => {
            if (cachedTafseerData) {
                if (readingMode === 'tafseer') setIsLoading(false);
                return;
            }
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
                if (readingMode === 'tafseer') setIsLoading(false);
            }
        };

        const fetchMeanings = async () => {
            if (cachedMeaningsData) {
                if (readingMode === 'meanings') setIsLoading(false);
                return;
            }
            try {
                const res = await fetch('/tafseer.json');
                const data = await res.json();
                cachedMeaningsData = data;
                setMeaningsData(cachedMeaningsData);
                if (readingMode === 'meanings') setIsLoading(false);
            } catch (error) {
                console.error('Error fetching meanings data:', error);
                if (readingMode === 'meanings') setIsLoading(false);
            }
        };

        const fetchTranslation = async () => {
            if (cachedTranslationData) {
                if (readingMode === 'translation' || readingMode === 'bilingual') setIsLoading(false);
                return;
            }
            try {
                const res = await fetch('/en.json');
                const data = await res.json();
                cachedTranslationData = data;
                setTranslationData(cachedTranslationData);
                if (readingMode === 'translation' || readingMode === 'bilingual') setIsLoading(false);
            } catch (error) {
                console.error('Error fetching translation data:', error);
                if (readingMode === 'translation' || readingMode === 'bilingual') setIsLoading(false);
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
            const isTranslation = readingMode === 'translation';
            const isBilingual = readingMode === 'bilingual';
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
                <div className={`${isLandscape ? 'flex justify-center w-full' : 'w-full'}`}>
                    <div className={`page-footer flex flex-col items-center pt-2 pb-4 ${isLandscape ? 'max-w-3xl w-full' : 'w-full'}`} style={{ color: currentTheme.text, direction: isTranslation ? 'ltr' : 'rtl' }}>
                        <div className="flex items-center justify-center font-bold text-sm">
                            {isBilingual ? (
                                <>
                                    <span className="page-number-bracket" style={{ color: bracketColor }}>﴿</span>
                                    <span className="page-number-text" style={{ color: pageNumColor, margin: '0 4px' }}>{toArabic(item.pageNumber)}</span>
                                    <span className="page-number-bracket" style={{ color: bracketColor }}>﴾</span>
                                    <span className="mx-2 opacity-50">•</span>
                                    <span className="page-number-bracket text-xs uppercase tracking-wider" style={{ color: bracketColor }}>Page </span>
                                    <span className="page-number-text font-sans font-bold" style={{ color: pageNumColor, margin: '0 4px' }}>{item.pageNumber}</span>
                                </>
                            ) : (
                                <>
                                    <span className="page-number-bracket" style={{ color: bracketColor }}>{isTranslation ? '— Page ' : '﴿'}</span>
                                    <span className="page-number-text" style={{ color: pageNumColor, margin: '0 4px' }}>{isTranslation ? item.pageNumber : toArabic(item.pageNumber)}</span>
                                    <span className="page-number-bracket" style={{ color: bracketColor }}>{isTranslation ? ' —' : '﴾'}</span>
                                </>
                            )}
                        </div>
                        <div style={{ width: '60%', height: '2px', backgroundColor: bracketColor, marginTop: '10px', opacity: 0.6, borderRadius: '2px' }}></div>
                    </div>
                </div>
            );
        }

        if (item.type === 'header') {
            return (
                <div className={`${isLandscape ? 'flex justify-center w-full' : 'w-full'}`}>
                    <div className={isLandscape ? 'max-w-3xl w-full' : 'w-full'}>
                        <SurahHeader 
                            surahNumber={item.surahNumber}
                            surahName={item.surahName}
                            surahType={item.surahType}
                            ayahCount={item.ayahCount}
                            currentTheme={currentTheme}
                            design={settings.surahHeaderDesign || 1}
                            onLongPress={onSurahHeaderLongPress}
                            isTranslationMode={readingMode === 'translation'}
                            isBilingualMode={readingMode === 'bilingual'}
                        />
                    </div>
                </div>
            );
        }

        const isHighlighted = highlightedAyahId === `ayah-${item.surahNumber}-${item.ayahNumber}`;
        
        // In Translation Mode: Display ONLY English text full width, completely hide Arabic Quranic text
        if (readingMode === 'translation') {
            const translationText = getTranslation(item.surahNumber, item.ayahNumber);
            return (
                <div className={`${isLandscape ? 'flex justify-center' : ''} px-2`}>
                    <div 
                        id={`ayah-${item.surahNumber}-${item.ayahNumber}`}
                        className={`ayah-item px-3.5 py-3.5 rounded-xl border-b transition-colors ${isLandscape ? 'max-w-3xl w-full' : 'w-full'}`}
                        style={{ 
                            borderBottomColor: isHighlighted ? (settings.highlightTextColor || currentTheme.accent) : `${currentTheme.border || '#000000'}22`,
                            backgroundColor: isHighlighted ? `${settings.highlightTextColor || currentTheme.accent}18` : 'transparent',
                        }}
                        onPointerDown={(e) => handlePointerDown(item.surahNumber, item.ayahNumber, e)}
                        onPointerMove={handlePointerMoveItem}
                        onPointerUp={handlePointerUpItem}
                        onPointerLeave={handlePointerLeaveItem}
                        onClick={(e) => {
                            e.stopPropagation();
                            if (isLongPressTriggered.current) return;
                            isInternalClickRef.current = true;
                            onAyahClick(item.surahNumber, item.ayahNumber);
                        }}
                    >
                        <div 
                            className="translation-text leading-relaxed text-left w-full"
                            style={{ 
                                fontSize: `${localFontSize * 0.95}rem`,
                                fontWeight: settings.isBold ? '700' : '400',
                                color: isHighlighted 
                                    ? (settings.highlightTextColor || currentTheme.highlightText || currentTheme.accent) 
                                    : (settings.textColor || currentTheme.text),
                                direction: 'ltr',
                                textAlign: 'left',
                                fontFamily: (settings.fontFamily && !settings.fontFamily.startsWith('var(--font-')) 
                                    ? settings.fontFamily 
                                    : "'EB Garamond', Garamond, serif"
                            }}
                        >
                            <span 
                                className="inline-flex items-center justify-center font-bold text-xs rounded-md mr-2.5 align-middle select-none px-2 py-0.5 cursor-pointer active:scale-95 transition-transform"
                                style={{ 
                                    minWidth: '26px',
                                    backgroundColor: isHighlighted 
                                        ? currentTheme.accent 
                                        : `${currentTheme.accent}22`,
                                    color: isHighlighted ? '#ffffff' : currentTheme.accent,
                                    border: `1px solid ${isHighlighted ? 'transparent' : `${currentTheme.accent}44`}`,
                                }}
                                onPointerDown={(e) => handleNumberPointerDown(item.surahNumber, item.ayahNumber, e)}
                                onPointerUp={handleNumberPointerUp}
                                onPointerMove={handleNumberPointerMove}
                                onPointerLeave={handleNumberPointerUp}
                                onPointerCancel={handleNumberPointerUp}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (onAyahNumberClick) {
                                        onAyahNumberClick(item.surahNumber, item.ayahNumber);
                                    } else if (onAyahNumberLongPress) {
                                        onAyahNumberLongPress(item.surahNumber, item.ayahNumber);
                                    } else {
                                        onAyahClick(item.surahNumber, item.ayahNumber);
                                    }
                                }}
                                title="اضغط لعرض التفسير • Click to view Tafsir"
                            >
                                {item.ayahNumber}
                            </span>
                            <span className="align-middle">
                                {translationText || ''}
                            </span>
                        </div>
                    </div>
                </div>
            );
        }

        // Determine if this ayah should be hidden in Arabic memorization mode
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
                    onClick={(e) => {
                        e.stopPropagation();
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
                        <span className="inline-flex items-center justify-center mr-2 font-bold opacity-80 cursor-pointer active:scale-95 transition-transform"
                              style={{ 
                                  fontSize: '0.9em',
                                  color: currentTheme.accent
                              }}
                              onPointerDown={(e) => handleNumberPointerDown(item.surahNumber, item.ayahNumber, e)}
                              onPointerUp={handleNumberPointerUp}
                              onPointerMove={handleNumberPointerMove}
                              onPointerLeave={handleNumberPointerUp}
                              onPointerCancel={handleNumberPointerUp}
                              onClick={(e) => {
                                  e.stopPropagation();
                                  if (readingMode === 'bilingual') {
                                      if (onAyahNumberClick) {
                                          onAyahNumberClick(item.surahNumber, item.ayahNumber);
                                      } else if (onAyahNumberLongPress) {
                                          onAyahNumberLongPress(item.surahNumber, item.ayahNumber);
                                      } else {
                                          onAyahClick(item.surahNumber, item.ayahNumber);
                                      }
                                      return;
                                  }
                                  onAyahClick(item.surahNumber, item.ayahNumber);
                              }}
                              title="اضغط لعرض التفسير • Click to view Tafsir"
                        >
                            ﴿{toArabic(item.ayahNumber)}﴾
                        </span>
                    </div>
                    
                    {readingMode === 'bilingual' ? (
                        <div 
                            className="translation-subtext text-left pt-2 pb-2.5 mt-1 border-t border-dashed"
                            style={{ 
                                borderColor: isHighlighted 
                                    ? `${currentTheme.accent}55` 
                                    : `${currentTheme.accent}33`,
                                direction: 'ltr',
                                textAlign: 'left',
                                fontFamily: getBilingualEnglishFont(settings.fontFamily)
                            }}
                        >
                            <div className="flex items-start gap-2.5">
                                <span 
                                    className="inline-flex items-center justify-center font-bold text-xs rounded-md select-none px-2 py-0.5 mt-0.5 shrink-0 cursor-pointer active:scale-95 transition-transform"
                                    style={{ 
                                        minWidth: '26px',
                                        backgroundColor: isHighlighted 
                                            ? currentTheme.accent 
                                            : `${currentTheme.accent}20`,
                                        color: isHighlighted ? '#ffffff' : currentTheme.accent,
                                        border: `1px solid ${isHighlighted ? 'transparent' : `${currentTheme.accent}55`}`,
                                    }}
                                    onPointerDown={(e) => handleNumberPointerDown(item.surahNumber, item.ayahNumber, e)}
                                    onPointerUp={handleNumberPointerUp}
                                    onPointerMove={handleNumberPointerMove}
                                    onPointerLeave={handleNumberPointerUp}
                                    onPointerCancel={handleNumberPointerUp}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (onAyahNumberClick) {
                                            onAyahNumberClick(item.surahNumber, item.ayahNumber);
                                        } else if (onAyahNumberLongPress) {
                                            onAyahNumberLongPress(item.surahNumber, item.ayahNumber);
                                        } else {
                                            onAyahClick(item.surahNumber, item.ayahNumber);
                                        }
                                    }}
                                    title="اضغط لعرض التفسير • Click to view Tafsir"
                                >
                                    {item.ayahNumber}
                                </span>
                                <p 
                                    className="leading-relaxed flex-1 select-text"
                                    style={{ 
                                        fontSize: `${localFontSize * 0.88}rem`,
                                        fontFamily: getBilingualEnglishFont(settings.fontFamily),
                                        fontWeight: settings.isBold ? '700' : '400',
                                        color: isHighlighted 
                                            ? (settings.highlightTextColor || currentTheme.highlightText || currentTheme.accent) 
                                            : (settings.textColor || currentTheme.text),
                                        opacity: isHighlighted ? 1 : 0.9
                                    }}
                                >
                                    {getTranslation(item.surahNumber, item.ayahNumber) || ''}
                                </p>
                            </div>
                        </div>
                    ) : (readingMode === 'tafseer' || readingMode === 'meanings') ? (
                        <div className="explanation-text text-right opacity-90 leading-relaxed pb-2"
                             style={{ 
                                 fontSize: `${localFontSize * 0.8}rem`, 
                                 marginTop: '-2px',
                                 color: isHighlighted ? (settings.highlightTextColor || currentTheme.highlightText || currentTheme.accent) : (settings.textColor || currentTheme.text),
                                 direction: 'rtl',
                                 textAlign: 'right'
                             }}>
                            {readingMode === 'tafseer' ? getTafseer(item.surahNumber, item.ayahNumber) : 
                             getMeaning(item.surahNumber, item.ayahNumber)}
                        </div>
                    ) : null}
                </div>
            </div>
        );
    }, [highlightedAyahId, currentTheme, settings, readingMode, onAyahClick, onAyahNumberClick, onAyahNumberLongPress, meaningsData, tafseerData, translationData, hideVerses, memorizationSettings, localFontSize]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full" style={{ backgroundColor: currentTheme.bg || '#ffffff' }}>
                <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: currentTheme.accent }}></div>
            </div>
        );
    }

    return (
        <div 
            className={`w-full min-h-full ${isLandscape ? (!isLandscapeUIHidden ? 'pt-[calc(48px+var(--logical-safe-top))] pb-[calc(56px+var(--logical-safe-bottom))]' : 'pt-2 pb-8') : ''}`} 
            style={{ direction: readingMode === 'translation' ? 'ltr' : 'rtl', backgroundColor: settings.bgColor || currentTheme.bg || '#ffffff' }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >
            {scrollParent && (
                <Virtuoso
                    ref={virtuosoRef}
                    useWindowScroll={false}
                    customScrollParent={scrollParent}
                    isScrolling={(scrolling) => {
                        if (scrolling) onInteractionStart?.();
                        else onInteractionEnd?.();
                    }}
                    data={flattenedItems}
                    context={{
                        themeId: currentTheme?.id,
                        accent: currentTheme?.accent,
                        bg: currentTheme?.bg,
                        text: currentTheme?.text,
                        highlightText: currentTheme?.highlightText,
                        settings,
                        highlightedAyahId,
                        readingMode,
                        localFontSize
                    }}
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
                            if (readingMode === 'bilingual') {
                                showJuzNotification?.(`بداية الجزء ${toArabic(item.juz)} • Start of Juz ${item.juz}`);
                            } else if (readingMode === 'translation') {
                                showJuzNotification?.(`Start of Juz ${item.juz}`);
                            } else {
                                showJuzNotification?.(`بداية الجزء ${toArabic(item.juz)}`);
                            }
                        }
                        lastNotifiedJuz.current = item.juz;

                        // Detect Quarter change
                        if (item.hizbQuarter && lastNotifiedQuarter.current !== null && item.hizbQuarter !== lastNotifiedQuarter.current) {
                            let label = '';
                            const qInHizb = ((item.hizbQuarter - 1) % 4) + 1;
                            const hizbNum = Math.ceil(item.hizbQuarter / 4);
                            if (readingMode === 'bilingual') {
                                let labelAr = '';
                                let labelEn = '';
                                if (qInHizb === 1) { labelAr = `بداية الحزب ${toArabic(hizbNum)}`; labelEn = `Start of Hizb ${hizbNum}`; }
                                else if (qInHizb === 2) { labelAr = `ربع الحزب ${toArabic(hizbNum)}`; labelEn = `Quarter of Hizb ${hizbNum}`; }
                                else if (qInHizb === 3) { labelAr = `نصف الحزب ${toArabic(hizbNum)}`; labelEn = `Half of Hizb ${hizbNum}`; }
                                else if (qInHizb === 4) { labelAr = `ثلاثة أرباع الحزب ${toArabic(hizbNum)}`; labelEn = `Three Quarters of Hizb ${hizbNum}`; }
                                label = `${labelAr} • ${labelEn}`;
                            } else if (readingMode === 'translation') {
                                if (qInHizb === 1) label = `Start of Hizb ${hizbNum}`;
                                else if (qInHizb === 2) label = `Quarter of Hizb ${hizbNum}`;
                                else if (qInHizb === 3) label = `Half of Hizb ${hizbNum}`;
                                else if (qInHizb === 4) label = `Three Quarters of Hizb ${hizbNum}`;
                            } else {
                                if (qInHizb === 1) label = `بداية الحزب ${toArabic(hizbNum)}`;
                                else if (qInHizb === 2) label = `ربع الحزب ${toArabic(hizbNum)}`;
                                else if (qInHizb === 3) label = `نصف الحزب ${toArabic(hizbNum)}`;
                                else if (qInHizb === 4) label = `ثلاثة أرباع الحزب ${toArabic(hizbNum)}`;
                            }
                            
                            if (label) showMarkerNotification?.('quarter', label);
                        }
                        lastNotifiedQuarter.current = item.hizbQuarter;

                        // Detect Sajdah
                        if (item.sajda) {
                            const sajdaId = `${item.surahNumber}-${item.ayahNumber}`;
                            if (lastNotifiedSajda.current !== sajdaId) {
                                if (readingMode === 'bilingual') {
                                    const surahNameAr = SURAH_NAMES_AR[item.surahNumber - 1];
                                    const displaySurahAr = (surahNameAr.includes('سورة') || surahNameAr.includes('سُورَة')) 
                                        ? surahNameAr 
                                        : `سورة ${surahNameAr}`;
                                    const surahNameEn = SURAH_NAMES_EN[item.surahNumber - 1] || `Surah ${item.surahNumber}`;
                                    showMarkerNotification?.('sajda', `سجدة تلاوة: ${displaySurahAr} - آية ${toArabic(item.ayahNumber)} • Sajdah: ${surahNameEn} - Verse ${item.ayahNumber}`);
                                } else if (readingMode === 'translation') {
                                    const surahNameEn = SURAH_NAMES_EN[item.surahNumber - 1] || `Surah ${item.surahNumber}`;
                                    showMarkerNotification?.('sajda', `Prostration of Recitation (Sajdah): Surah ${surahNameEn} - Verse ${item.ayahNumber}`);
                                } else {
                                    const surahName = SURAH_NAMES_AR[item.surahNumber - 1];
                                    if (handleSajdahVisible) {
                                        handleSajdahVisible(surahName, item.surahNumber, item.ayahNumber);
                                    } else {
                                        const displaySurah = (surahName.includes('سورة') || surahName.includes('سُورَة')) 
                                            ? surahName 
                                            : `سورة ${surahName}`;
                                        showMarkerNotification?.('sajda', `سجدة تلاوة: ${displaySurah} - آية ${toArabic(item.ayahNumber)}`);
                                    }
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
