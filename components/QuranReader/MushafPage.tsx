import React, { useEffect, useRef } from 'react';
import { SAJDAH_LOCATIONS, toArabic, SURAH_INFO, getAyahCountText, SURAH_NAMES_AR, getEffectiveWordHighlightColor } from './constants';
import SurahHeader from './SurahHeader';

interface MushafPageProps {
    pageNum: number;
    pageData: any[];
    highlightedAyahId: string | null;
    onAyahClick: (surah: number, ayah: number) => void;
    onVerseClick: (surah: number, ayah: number, event: React.MouseEvent) => void;
    onVerseLongPress?: (surah: number, ayah: number) => void;
    onAyahLongPress?: (surah: number, ayah: number, x: number, y: number) => void;
    onInteractionStart?: () => void;
    onInteractionEnd?: () => void;
    onSurahHeaderLongPress?: () => void;
    settings?: {
        fontSize: number;
        fontFamily: string;
        textColor: string;
        theme: string;
        surahHeaderDesign?: number;
        isBold?: boolean;
        highlightTextColor?: string;
        wordHighlightEnabled?: boolean;
        wordHighlightColor?: string;
    };
    currentTheme?: any;
    hideVerses?: boolean;
    memorizationSettings?: any;
    isPlaying?: boolean;
    isRecording?: boolean;
    revealedAyahs?: string[];
    tempRevealedAyah?: string | null;
    audioProgress?: { currentTime: number; duration: number } | null;
}

export const fixQuranText = (text: string) => {
    if (!text) return text;
    return text.replace(/[۞۩]/g, '');
};

/**
 * Regex Cleaner: Removes hidden characters that break Arabic shaping
 * like Tatweel (\u0640) and Zero Width Joiner (\u200D).
 */
export const cleanArabicText = (text: string) => {
    if (!text) return text;
    return text.replace(/[\u0640\u200D]/g, '');
};

/**
 * Renders Tajweed text as an HTML string to be used with dangerouslySetInnerHTML.
 * This ensures that no extra spaces are added between spans, which would break Arabic shaping.
 */
export const renderTajweedTextHtml = (text: string) => {
    if (!text) return text;
    return fixQuranText(text);
};

const MushafPage: React.FC<MushafPageProps> = React.memo(({ pageNum, pageData, highlightedAyahId, onAyahClick, onVerseClick, onVerseLongPress, onAyahLongPress, onInteractionStart, onInteractionEnd, onSurahHeaderLongPress, settings, currentTheme, hideVerses, memorizationSettings, isPlaying, isRecording, revealedAyahs = [], tempRevealedAyah, audioProgress }) => {
    const pageRef = useRef<HTMLDivElement | null>(null);
    const longPressTimer = useRef<number | null>(null);
    const isLongPressTriggered = useRef(false);
    const touchStartPos = useRef<{x: number, y: number} | null>(null);

    const handlePointerDown = (s: number, a: number, e: React.PointerEvent, isVerse: boolean) => {
        if (e.button !== 0 && e.pointerType === 'mouse') return; 
        e.stopPropagation();
        if (onInteractionStart) onInteractionStart();
        
        isLongPressTriggered.current = false;
        touchStartPos.current = { x: e.clientX, y: e.clientY };

        if (longPressTimer.current) {
            window.clearTimeout(longPressTimer.current);
        }

        longPressTimer.current = window.setTimeout(() => {
            if (isVerse) {
                if (onVerseLongPress) {
                    onVerseLongPress(s, a);
                    isLongPressTriggered.current = true;
                }
            } else {
                if (onAyahLongPress) {
                    onAyahLongPress(s, a, e.clientX, e.clientY);
                    isLongPressTriggered.current = true;
                }
            }
            longPressTimer.current = null;
        }, 600);
    };

    const handlePointerMove = (e: React.PointerEvent) => {
        if (!touchStartPos.current || !longPressTimer.current) return;
        
        if (Math.abs(e.clientX - touchStartPos.current.x) > 15 || Math.abs(e.clientY - touchStartPos.current.y) > 15) {
            if (longPressTimer.current) {
                window.clearTimeout(longPressTimer.current);
                longPressTimer.current = null;
            }
        }
    };

    const handlePointerUp = () => {
        if (onInteractionEnd) onInteractionEnd();
        if (longPressTimer.current) {
            clearTimeout(longPressTimer.current);
            longPressTimer.current = null;
        }
    };

    const handlePointerLeave = () => {
        if (onInteractionEnd) onInteractionEnd();
        if (longPressTimer.current) {
            clearTimeout(longPressTimer.current);
            longPressTimer.current = null;
        }
    };

    if (!pageData || !pageData.length) return <div className={`mushaf-page ${pageNum === 1 ? 'first-page' : ''}`} style={{height: '1000px'}}></div>; // Placeholder for height calculation
    
    let currentSurah = -1;
    
    const pageStyle = {
        fontSize: settings ? `${settings.fontSize}rem` : '1.6rem',
        fontWeight: settings?.isBold ? '900' : 'normal',
        WebkitTextStroke: settings?.isBold ? '0.5px currentColor' : '0px',
        fontFamily: 'var(--qr-fontFamily)',
        color: 'var(--qr-text)',
        letterSpacing: 0,
        fontFeatureSettings: '"kern", "liga", "clig", "calt", "ccmp"',
        textRendering: 'optimizeLegibility' as const
    };

    const headerStyle = {
        fontSize: settings ? `${settings.fontSize * 0.94}rem` : `${(1.6 * 0.94).toFixed(2)}rem`,
        fontFamily: settings?.fontFamily || 'var(--font-amiri-quran)',
        fontWeight: settings?.isBold ? '900' : 'normal',
        WebkitTextStroke: settings?.isBold ? '0.5px currentColor' : '0px',
        color: currentTheme?.id === 'deep_black' ? '#ffffff' : (currentTheme?.accent || '#6d28d9')
    };

    const borderColor = currentTheme?.palette?.[0] || currentTheme?.accent || '#d97706';
    
    // Use contrasting colors for page numbers as requested
    // If theme is blue-ish, use purple/orange. If green, use blue/red.
    const getContrastingColors = () => {
        const themeId = currentTheme?.id || 'black';
        const bracketColor = currentTheme?.verseBracket || currentTheme?.sajdah || '#9333ea';
        const numColor = currentTheme?.accent || currentTheme?.sajdah || '#9333ea';
        
        switch(themeId) {
            case 'black': return { num: '#000000', bracket: '#d97706' };
            case 'night_sky': return { num: '#9333ea', bracket: '#9333ea' }; // Purple for both
            case 'green': return { num: '#dc2626', bracket: '#dc2626' }; // Red for both
            case 'red': return { num: '#2563eb', bracket: '#2563eb' }; // Blue for both
            case 'gold': return { num: currentTheme?.verseNumber || '#b91c1c', bracket: currentTheme?.verseBracket || '#d4af37' };
            case 'deep_black': return { num: currentTheme?.verseNumber || '#38bdf8', bracket: currentTheme?.verseBracket || '#fbbf24' };
            default: return { 
                num: currentTheme?.verseNumber || numColor, 
                bracket: bracketColor 
            };
        }
    };

    const { num: pageNumColor, bracket: bracketColor } = getContrastingColors();

    return (
        <div id={`page-${pageNum}`} className={`mushaf-page ${pageNum === 1 ? 'first-page' : ''}`} data-page={pageNum} ref={pageRef} style={{ 
            backgroundColor: 'var(--qr-bg, #ffffff)',
            boxSizing: 'border-box'
        }}>
            <div className="page-content" style={pageStyle}>
                {pageData.map((ayah, index) => {
                    const isSajdah = SAJDAH_LOCATIONS.some(sl => sl.s === ayah.sNum && sl.a === ayah.numberInSurah);
                    const showHeader = currentSurah !== ayah.sNum && ayah.numberInSurah === 1;
                    if (showHeader) currentSurah = ayah.sNum;
                    
                    // Detect Hizb Quarter change
                    const prevAyah = index > 0 ? pageData[index - 1] : null;
                    const hasMarkerInText = ayah.text.includes('۞');
                    const isNewQuarter = (prevAyah ? (ayah.hizbQuarter !== prevAyah.hizbQuarter) : false) || hasMarkerInText;
                    
                    const text = fixQuranText((ayah.numberInSurah === 1 && ayah.sNum !== 1 && ayah.sNum !== 9) 
                        ? ayah.text.replace('بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ', '').replace('بِّسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ', '').trim() 
                        : ayah.text);
                    
                    const id = `ayah-${ayah.sNum}-${ayah.numberInSurah}`;

                    // Determine if this ayah should be hidden
                    let shouldHide = hideVerses && highlightedAyahId !== id;
                    
                    // If in memorization review mode, only hide if it's within the review range
                    if (memorizationSettings?.isReviewMode) {
                        const s = ayah.sNum;
                        const a = ayah.numberInSurah;
                        const { fromSurah, fromAyah, toSurah, toAyah } = memorizationSettings;
                        
                        const isBefore = s < fromSurah || (s === fromSurah && a < fromAyah);
                        const isAfter = s > toSurah || (s === toSurah && a > toAyah);
                        const isInRange = !isBefore && !isAfter;
                        
                        const isHighlighted = highlightedAyahId === id;
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
                        const s = ayah.sNum;
                        const a = ayah.numberInSurah;
                        const { fromSurah, fromAyah, toSurah, toAyah } = memorizationSettings;
                        
                        const isBefore = s < fromSurah || (s === fromSurah && a < fromAyah);
                        const isAfter = s > toSurah || (s === toSurah && a > toAyah);
                        
                        if (isBefore || isAfter) {
                            shouldHide = false;
                        }
                    }

                    const isDarkGroup = currentTheme?.id === 'deep_black' || currentTheme?.id?.startsWith('i_');
                    const headerBg = currentTheme?.headerBg || '#22c55e';
                    const headerBorder = isDarkGroup ? '#ffffff' : (currentTheme?.accent || '#14532d');
                    const headerText = currentTheme?.headerText || '#ffffff';
                    const cartoucheBg = currentTheme?.bg || '#dcfce7';
                    const cartoucheText = isDarkGroup ? '#ffffff' : (currentTheme?.accent || '#14532d');

                    return (
                        <React.Fragment key={id}>
                            {showHeader && ( 
                                <div className="surah-header-container-wrapper my-2 sm:my-3 block w-full select-none" onClick={() => onSurahHeaderLongPress && onSurahHeaderLongPress()}> 
                                    <SurahHeader 
                                        surahNumber={ayah.sNum}
                                        surahName={ayah.sName ? ayah.sName.replace(/سورة|سُورَةُ|سُورَة/g, '').trim() : (SURAH_NAMES_AR[ayah.sNum - 1] || '')}
                                        surahType={SURAH_INFO[ayah.sNum]?.type || 'مكية'}
                                        ayahCount={SURAH_INFO[ayah.sNum]?.ayahs || 7}
                                        currentTheme={currentTheme}
                                        design={settings?.surahHeaderDesign || 1}
                                        onLongPress={onSurahHeaderLongPress}
                                    />
                                    {ayah.sNum !== 1 && ayah.sNum !== 9 && (
                                        <div className="bismillah" style={headerStyle}>بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</div>
                                    )} 
                                 </div> 
                            )}
                            <span 
                                id={id} 
                                className={`ayah-text-block ${highlightedAyahId === id ? 'highlighted' : ''} ${isSajdah ? 'ayah-sajdah' : ''} ${shouldHide ? 'hide-text' : ''}`} 
                                style={highlightedAyahId === id && currentTheme?.id === 'deep_black' ? { color: 'var(--qr-highlight-text, #f59e0b)', textShadow: '0 0 1px rgba(245, 158, 11, 0.45)' } : undefined}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (!isLongPressTriggered.current) {
                                        onAyahClick(ayah.sNum, ayah.numberInSurah);
                                    }
                                }}
                                onPointerDown={(e) => handlePointerDown(ayah.sNum, ayah.numberInSurah, e, false)}
                                onPointerMove={handlePointerMove}
                                onPointerUp={handlePointerUp}
                                onPointerCancel={handlePointerUp}
                                onPointerLeave={handlePointerLeave}
                                onContextMenu={(e) => e.preventDefault()}
                                data-sajdah={isSajdah} 
                                data-snum={ayah.sNum}
                                data-surah={ayah.sName.trim()} 
                                data-ayah={ayah.numberInSurah}
                                data-juz={ayah.juz}
                                data-hizb-quarter={ayah.hizbQuarter}
                            >
                                {isNewQuarter && <span className="hizb-quarter-marker">۞</span>}
                                {(() => {
                                    const isHighlighted = highlightedAyahId === id;
                                    const cleanAyahText = text.replace(/\s+/g, ' ').trim();
                                    const words = cleanAyahText.split(' ');
                                    const isWordHighlightActive = isHighlighted && isPlaying && settings?.wordHighlightEnabled && audioProgress && audioProgress.duration > 0;

                                    const ayahHighlightColor = settings?.highlightTextColor || currentTheme?.highlightText || currentTheme?.accent || '#d97706';
                                    const wordColors = getEffectiveWordHighlightColor(
                                        ayahHighlightColor,
                                        settings?.wordHighlightColor,
                                        currentTheme?.id
                                    );

                                    if (isWordHighlightActive && words.length > 0) {
                                        const progressRatio = Math.min(1, Math.max(0, audioProgress.currentTime / audioProgress.duration));
                                        const activeWordIdx = Math.min(words.length - 1, Math.floor(progressRatio * words.length));

                                        return (
                                            <span style={{ display: 'contents' }}>
                                                {words.map((word, wIdx) => {
                                                    const isCurrentWord = wIdx === activeWordIdx;
                                                    return (
                                                        <React.Fragment key={wIdx}>
                                                            <span 
                                                                className={`quran-word-span ${isCurrentWord ? 'active-word-highlight' : 'ayah-highlight-word'}`}
                                                                style={{
                                                                    color: isCurrentWord ? (wordColors.bg || '#dc2626') : ayahHighlightColor,
                                                                    transition: 'color 0.1s ease-in-out'
                                                                }}
                                                            >
                                                                {fixQuranText(word)}
                                                            </span>
                                                            {wIdx < words.length - 1 ? ' ' : ''}
                                                        </React.Fragment>
                                                    );
                                                })}
                                            </span>
                                        );
                                    }

                                    return (
                                        <span 
                                            style={{ display: 'contents' }}
                                            dangerouslySetInnerHTML={{ 
                                                __html: renderTajweedTextHtml(cleanAyahText) 
                                            }} 
                                        />
                                    );
                                })()}
                                 {isSajdah && <span className="sajdah-icon-inline">۩</span>}
                                 {(() => {
                                     const digitCount = String(ayah.numberInSurah).length;
                                     const isHighlighted = highlightedAyahId === id;
                                     const themeId = currentTheme?.id;
                                     const bracketColor = isHighlighted
                                         ? (settings?.highlightTextColor || currentTheme?.highlightText || currentTheme?.accent || '#d97706')
                                         : (themeId === 'deep_black'
                                             ? (currentTheme?.verseBracket || '#fbbf24')
                                             : (themeId === 'gold'
                                                 ? (currentTheme?.verseBracket || '#d4af37')
                                                 : (currentTheme?.verseBracket || currentTheme?.accent || '#d97706')));
                                     const numColor = isHighlighted
                                         ? (settings?.highlightTextColor || currentTheme?.highlightText || currentTheme?.accent || '#d97706')
                                         : (themeId === 'deep_black'
                                             ? (currentTheme?.verseNumber || '#38bdf8')
                                             : (themeId === 'gold'
                                                 ? (currentTheme?.verseNumber || '#b91c1c')
                                                 : (currentTheme?.verseNumber || currentTheme?.accent || '#1d4ed8')));

                                     return (
                                         <span className={`verse-container verse-digits-${digitCount} ${isHighlighted ? 'highlighted' : ''}`} 
                                             onClick={(e) => {
                                                 e.stopPropagation();
                                                 if (!isLongPressTriggered.current) {
                                                     onVerseClick(ayah.sNum, ayah.numberInSurah, e);
                                                 }
                                             }}
                                             onPointerDown={(e) => handlePointerDown(ayah.sNum, ayah.numberInSurah, e, true)}
                                             onPointerUp={(e) => {
                                                 e.stopPropagation();
                                                 handlePointerUp();
                                             }}
                                             onPointerCancel={(e) => {
                                                 e.stopPropagation();
                                                 handlePointerUp();
                                             }}
                                             onPointerLeave={(e) => {
                                                 e.stopPropagation();
                                                 handlePointerLeave();
                                             }}
                                             onContextMenu={(e) => {
                                                 e.preventDefault();
                                                 e.stopPropagation();
                                             }}
                                         >
                                             <span className="verse-bracket" style={{ color: bracketColor }}>﴿</span>
                                             <span className="verse-num-inner" style={{ color: numColor }}>{toArabic(ayah.numberInSurah)}</span>
                                             <span className="verse-bracket" style={{ color: bracketColor }}>﴾</span>
                                         </span>
                                     );
                                 })()}
                             </span>
                        </React.Fragment>
                    );
                })}
            </div>
            <div className="page-footer" style={{ flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <span className="page-number-bracket" style={{ color: bracketColor }}>﴿</span>
                    <span className="page-number-text" style={{ color: pageNumColor }}>{toArabic(pageNum)}</span>
                    <span className="page-number-bracket" style={{ color: bracketColor }}>﴾</span>
                </div>
                <div style={{ width: '60%', height: '2.5px', backgroundColor: bracketColor, marginTop: '12px', opacity: 0.8, borderRadius: '2px' }}></div>
            </div>
        </div>
    );
});

export default MushafPage;