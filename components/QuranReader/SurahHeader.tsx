import React, { useRef } from 'react';
import { toArabic, getAyahCountText, SURAH_INFO } from './constants';

interface SurahHeaderProps {
    surahNumber: number;
    surahName: string;
    surahType: string;
    ayahCount: number;
    currentTheme: any;
    design?: number;
    onLongPress?: () => void;
    compact?: boolean;
}

const SurahHeader: React.FC<SurahHeaderProps> = ({
    surahNumber,
    surahName,
    surahType,
    ayahCount,
    currentTheme,
    design = 1,
    onLongPress,
    compact = false
}) => {
    const longPressTimer = useRef<NodeJS.Timeout | null>(null);

    const handleTouchStart = () => {
        if (onLongPress) {
            longPressTimer.current = setTimeout(() => {
                onLongPress();
            }, 600);
        }
    };

    const handleTouchEnd = () => {
        if (longPressTimer.current) {
            clearTimeout(longPressTimer.current);
            longPressTimer.current = null;
        }
    };

    const handleMouseDown = () => {
        if (onLongPress) {
            longPressTimer.current = setTimeout(() => {
                onLongPress();
            }, 600);
        }
    };

    const handleMouseUp = () => {
        if (longPressTimer.current) {
            clearTimeout(longPressTimer.current);
            longPressTimer.current = null;
        }
    };
    const isDarkGroup = currentTheme?.id === 'deep_black' || currentTheme?.id?.startsWith('i_');
    const isDefaultTheme = currentTheme?.id === 'black';
    const isDesign1 = design === 1 || !design; // Handle cases where design might be undefined or 1
    
    // Improved color logic for better contrast and vibrancy across all themes
    // For light themes, we use the accent color as the background to make it stand out
    // EXCEPT for the default theme where the user wants a specific minimalist black & white look for Design 1
    const headerBg = (isDefaultTheme && isDesign1) ? '#ffffff' : (isDarkGroup ? (currentTheme?.headerBg || '#000000') : (currentTheme?.accent || '#22c55e'));
    const headerText = (isDefaultTheme && isDesign1) ? '#000000' : '#ffffff'; 
    const headerBorder = (isDefaultTheme && isDesign1) ? '#000000' : (isDarkGroup ? '#ffffff' : 'rgba(255,255,255,0.6)');
    
    // Cartouche (the inner box for the surah name)
    const cartoucheBg = isDarkGroup ? (currentTheme?.bg || '#000000') : '#ffffff';
    const cartoucheText = (isDefaultTheme && isDesign1) ? '#000000' : (isDarkGroup ? (currentTheme?.accent || '#ffffff') : (currentTheme?.accent || '#14532d'));

    // Ensure "Surah" is not repeated
    const cleanSurahName = surahName.replace(/سورة|سُورَةُ|سُورَة/g, '').trim();
    const fullSurahName = `سُورَةُ ${cleanSurahName}`;

    const renderDesign = () => {
        switch (design) {
            case 1: // Design 1 (Current)
                return (
                    <div className={`surah-header-visual relative h-14 w-full flex items-center justify-between ${compact ? 'px-1' : 'px-2 sm:px-6'} rounded-md border-[3px] overflow-hidden`}
                         style={{ 
                             background: headerBg,
                             borderColor: headerBorder,
                             boxShadow: isDefaultTheme ? 'none' : '0 4px 6px -1px rgba(0, 0, 0, 0.2)'
                         }}>
                        <div className={`font-bold text-sm sm:text-lg z-10 ${isDefaultTheme ? '' : 'drop-shadow-md'} whitespace-nowrap`} style={{ color: headerText }}>
                            {getAyahCountText(ayahCount)}
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="relative h-10 px-6 sm:px-12 flex items-center justify-center border-2 shadow-inner max-w-[50%] sm:max-w-none"
                                 style={{ 
                                     borderRadius: '50px / 50px', 
                                     minWidth: '140px',
                                     backgroundColor: cartoucheBg,
                                     borderColor: headerBorder
                                 }}>
                                <h2 className="text-base sm:text-xl font-bold whitespace-nowrap w-full text-center mb-0" style={{ color: cartoucheText, transform: 'translateY(-4px)' }}>
                                    {fullSurahName}
                                </h2>
                            </div>
                        </div>
                        <div className={`font-bold text-sm sm:text-lg z-10 ${isDefaultTheme ? '' : 'drop-shadow-md'} whitespace-nowrap`} style={{ color: headerText }}>
                            {surahType}
                        </div>
                    </div>
                );

            case 2: // Classic / Ottoman Style
                return (
                    <div className="surah-header-visual relative h-14 w-full flex items-center justify-center px-4 overflow-hidden">
                        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 600 80" preserveAspectRatio="none">
                            <defs>
                                <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                                    <feGaussianBlur in="SourceAlpha" stdDeviation="2" />
                                    <feOffset dx="1" dy="1" result="offsetblur" />
                                    <feComponentTransfer>
                                        <feFuncA type="linear" slope="0.3" />
                                    </feComponentTransfer>
                                    <feMerge>
                                        <feMergeNode />
                                        <feMergeNode in="SourceGraphic" />
                                    </feMerge>
                                </filter>
                            </defs>
                            <path d="M 0 10 Q 300 0 600 10 L 600 70 Q 300 80 0 70 Z" fill={headerBg} stroke={headerBorder} strokeWidth="2" />
                            <path d="M 10 15 Q 300 8 590 15 L 590 65 Q 300 72 10 65 Z" fill="none" stroke={headerBorder} strokeWidth="1" opacity="0.4" />
                            <circle cx="15" cy="15" r="4" fill={headerBorder} />
                            <circle cx="585" cy="15" r="4" fill={headerBorder} />
                            <circle cx="15" cy="65" r="4" fill={headerBorder} />
                            <circle cx="585" cy="65" r="4" fill={headerBorder} />
                        </svg>
                        
                        <div className={`relative z-10 w-full flex items-center justify-between ${compact ? 'px-2' : 'px-6 sm:px-10'}`}>
                            <div className="font-bold text-xs sm:text-base" style={{ color: headerText }}>
                                {getAyahCountText(ayahCount)}
                            </div>
                            <div className="flex flex-col items-center">
                                <h2 className="text-xl sm:text-3xl font-bold mb-0 leading-none" style={{ color: headerText, fontFamily: 'var(--font-amiri-quran)' }}>
                                    {fullSurahName}
                                </h2>
                            </div>
                            <div className="font-bold text-xs sm:text-base" style={{ color: headerText }}>
                                {surahType}
                            </div>
                        </div>
                    </div>
                );

            case 3: // Geometric / Islamic Art
                return (
                    <div className="surah-header-visual relative h-14 w-full flex items-center justify-center rounded-lg border-4"
                         style={{ 
                             backgroundColor: cartoucheBg, 
                             borderColor: headerBorder,
                             backgroundImage: `radial-gradient(${headerBorder}20 1px, transparent 0)`,
                             backgroundSize: '10px 10px'
                         }}>
                        <div className={`absolute left-0 top-0 bottom-0 ${compact ? 'w-10' : 'w-16 sm:w-24'} flex items-center justify-center border-r-2`} style={{ backgroundColor: headerBg, borderColor: headerBorder }}>
                            <div className="text-[10px] sm:text-sm font-bold whitespace-nowrap" style={{ color: headerText }}>
                                {getAyahCountText(ayahCount)}
                            </div>
                        </div>
                        <div className={`absolute right-0 top-0 bottom-0 ${compact ? 'w-10' : 'w-16 sm:w-24'} flex items-center justify-center border-l-2`} style={{ backgroundColor: headerBg, borderColor: headerBorder }}>
                            <div className="text-[10px] sm:text-sm font-bold whitespace-nowrap" style={{ color: headerText }}>
                                {surahType}
                            </div>
                        </div>
                        
                        <h2 className="text-xl sm:text-3xl font-bold mb-0" style={{ color: cartoucheText, fontFamily: 'var(--font-amiri-quran)' }}>
                            {fullSurahName}
                        </h2>
                        
                        <div className="absolute top-1 left-18 sm:left-26 w-2 h-2 border-t border-l" style={{ borderColor: headerBorder }}></div>
                        <div className="absolute top-1 right-18 sm:right-26 w-2 h-2 border-t border-r" style={{ borderColor: headerBorder }}></div>
                        <div className="absolute bottom-1 left-18 sm:left-26 w-2 h-2 border-b border-l" style={{ borderColor: headerBorder }}></div>
                        <div className="absolute bottom-1 right-18 sm:right-26 w-2 h-2 border-b border-r" style={{ borderColor: headerBorder }}></div>
                    </div>
                );

            case 4: // Floral / Arabesque
                return (
                    <div className={`surah-header-visual relative h-14 w-full flex items-center justify-between ${compact ? 'px-2' : 'px-4 sm:px-12'} rounded-xl overflow-hidden shadow-lg`}
                         style={{ background: headerBg }}>
                        <div className="absolute inset-0 opacity-20" style={{ 
                            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 30c0-10 10-10 10-20S30 0 30 0s-10 0-10 10 10 10 10 20z' fill='${headerText.replace('#', '%23')}' fill-rule='evenodd'/%3E%3C/svg%3E")`,
                            backgroundSize: '30px 30px'
                        }}></div>
                        
                        <div className="z-10 bg-black/10 backdrop-blur-sm px-4 py-1.5 rounded-full border text-xs sm:text-sm font-bold" style={{ color: headerText, borderColor: `${headerText}40` }}>
                            {getAyahCountText(ayahCount)}
                        </div>
                        
                        <div className="z-10 flex flex-col items-center">
                            <h2 className="text-xl sm:text-3xl font-bold mb-0 drop-shadow-lg" style={{ color: headerText, fontFamily: 'var(--font-amiri-quran)' }}>
                                {fullSurahName}
                            </h2>
                        </div>
                        
                        <div className="z-10 bg-black/10 backdrop-blur-sm px-4 py-1.5 rounded-full border text-xs sm:text-sm font-bold" style={{ color: headerText, borderColor: `${headerText}40` }}>
                            {surahType}
                        </div>
                    </div>
                );

            case 7: // Pure White / Gold (Elegant)
                return (
                    <div className="surah-header-visual relative h-14 w-full flex items-center justify-center rounded-3xl border-2 shadow-inner"
                         style={{ backgroundColor: headerBg, borderColor: headerBorder }}>
                        <div className="absolute top-2 left-2 right-2 bottom-2 border rounded-2xl opacity-30" style={{ borderColor: headerBorder }}></div>
                        <div className="absolute left-4 sm:left-8 font-bold text-xs sm:text-sm z-10" style={{ color: headerText, fontFamily: 'var(--font-hafs)' }}>{surahType}</div>
                        <div className="relative z-10 flex flex-col items-center">
                            <h2 className="text-2xl sm:text-4xl font-bold" style={{ color: headerText, fontFamily: 'var(--font-amiri-quran)' }}>
                                {fullSurahName}
                            </h2>
                            <div className="h-0.5 w-24 mt-1" style={{ background: `linear-gradient(to right, transparent, ${headerBorder}, transparent)` }}></div>
                        </div>
                        <div className="absolute right-4 sm:right-8 font-bold text-xs sm:text-sm z-10" style={{ color: headerText, fontFamily: 'var(--font-hafs)' }}>{getAyahCountText(ayahCount)}</div>
                    </div>
                );

            case 9: // Octagonal Pattern
                return (
                    <div className="surah-header-visual relative h-14 w-full flex items-center justify-center overflow-hidden rounded-lg border-2"
                         style={{ backgroundColor: headerBg, borderColor: headerBorder }}>
                        <div className="absolute inset-0 opacity-10" style={{ 
                            backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M50 0L100 50L50 100L0 50Z' fill='${headerText.replace('#', '%23')}'/%3E%3C/svg%3E")`,
                            backgroundSize: '50px 50px'
                        }}></div>
                        <div className="z-10 bg-white/90 dark:bg-black/80 px-10 py-2 rounded-lg border-2 shadow-xl" style={{ borderColor: headerBorder }}>
                            <h2 className="text-2xl sm:text-4xl font-bold" style={{ color: cartoucheText, fontFamily: 'var(--font-amiri-quran)' }}>
                                {fullSurahName}
                            </h2>
                        </div>
                        <div className="absolute left-4 font-bold text-xs sm:text-sm" style={{ color: headerText }}>{surahType}</div>
                        <div className="absolute right-4 font-bold text-xs sm:text-sm" style={{ color: headerText }}>{getAyahCountText(ayahCount)}</div>
                    </div>
                );

            case 10: // Mosaic Style
                return (
                    <div className="surah-header-visual relative h-14 w-full flex items-center justify-center rounded-xl border-4"
                         style={{ 
                             backgroundColor: headerBg, 
                             borderColor: headerBorder,
                             backgroundImage: `linear-gradient(45deg, ${headerBorder}10 25%, transparent 25%), linear-gradient(-45deg, ${headerBorder}10 25%, transparent 25%), linear-gradient(45deg, transparent 75%, ${headerBorder}10 75%), linear-gradient(-45deg, transparent 75%, ${headerBorder}10 75%)`,
                             backgroundSize: '20px 20px'
                         }}>
                        <div className="absolute left-4 sm:left-8 font-bold text-xs sm:text-sm z-10" style={{ color: headerText, fontFamily: 'var(--font-hafs)' }}>{surahType}</div>
                        <div className="z-10 flex flex-col items-center bg-white/80 dark:bg-black/80 px-8 py-1 rounded-full border shadow-sm" style={{ borderColor: headerBorder }}>
                            <h2 className="text-2xl sm:text-4xl font-bold" style={{ color: cartoucheText, fontFamily: 'var(--font-amiri-quran)' }}>
                                {fullSurahName}
                            </h2>
                        </div>
                        <div className="absolute right-4 sm:right-8 font-bold text-xs sm:text-sm z-10" style={{ color: headerText, fontFamily: 'var(--font-hafs)' }}>{getAyahCountText(ayahCount)}</div>
                    </div>
                );

            case 11: // Simple Rounded with Side Badges
                return (
                    <div className="surah-header-visual relative h-14 w-full flex items-center justify-between px-4 sm:px-8 rounded-full border-2 shadow-md"
                         style={{ backgroundColor: headerBg, borderColor: headerBorder }}>
                        <div className="flex items-center justify-center px-3 py-1 rounded-full border" style={{ backgroundColor: cartoucheBg, borderColor: headerBorder }}>
                            <span className="text-xs font-bold" style={{ color: cartoucheText, fontFamily: 'var(--font-hafs)' }}>{getAyahCountText(ayahCount)}</span>
                        </div>
                        <h2 className="text-xl sm:text-3xl font-bold" style={{ color: headerText, fontFamily: 'var(--font-hafs)' }}>
                            {fullSurahName}
                        </h2>
                        <div className="flex items-center justify-center px-3 py-1 rounded-full border" style={{ backgroundColor: cartoucheBg, borderColor: headerBorder }}>
                            <span className="text-xs font-bold" style={{ color: cartoucheText, fontFamily: 'var(--font-hafs)' }}>{surahType}</span>
                        </div>
                    </div>
                );

            case 14: // Double Border with Corner Accents
                return (
                    <div className="surah-header-visual relative h-14 w-full flex items-center justify-center p-1"
                         style={{ backgroundColor: headerBg }}>
                        <div className="relative w-full h-full border-2 flex items-center justify-between px-4 sm:px-8" style={{ borderColor: headerBorder }}>
                            <div className="absolute top-0 left-0 w-3 h-3 border-r-2 border-b-2" style={{ borderColor: headerBg, backgroundColor: headerBorder }}></div>
                            <div className="absolute top-0 right-0 w-3 h-3 border-l-2 border-b-2" style={{ borderColor: headerBg, backgroundColor: headerBorder }}></div>
                            <div className="absolute bottom-0 left-0 w-3 h-3 border-r-2 border-t-2" style={{ borderColor: headerBg, backgroundColor: headerBorder }}></div>
                            <div className="absolute bottom-0 right-0 w-3 h-3 border-l-2 border-t-2" style={{ borderColor: headerBg, backgroundColor: headerBorder }}></div>
                            
                            <span className="text-sm font-bold z-10" style={{ color: headerText, fontFamily: 'var(--font-hafs)' }}>{getAyahCountText(ayahCount)}</span>
                            <h2 className="text-2xl sm:text-3xl font-bold z-10" style={{ color: headerText, fontFamily: 'var(--font-hafs)' }}>
                                {fullSurahName}
                            </h2>
                            <span className="text-sm font-bold z-10" style={{ color: headerText, fontFamily: 'var(--font-hafs)' }}>{surahType}</span>
                        </div>
                    </div>
                );

            case 15: // Calligraphic Ribbon
                return (
                    <div className="surah-header-visual relative h-14 w-full flex items-center justify-center my-2">
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-full h-10 shadow-md" style={{ backgroundColor: headerBg }}></div>
                        </div>
                        <div className="absolute left-2 sm:left-6 w-12 h-14 flex items-center justify-center shadow-lg" style={{ backgroundColor: cartoucheBg, clipPath: 'polygon(0 0, 100% 0, 100% 100%, 50% 80%, 0 100%)' }}>
                            <span className="text-xs font-bold mb-2" style={{ color: cartoucheText, fontFamily: 'var(--font-hafs)' }}>{surahType}</span>
                        </div>
                        <div className="absolute right-2 sm:right-6 w-12 h-14 flex items-center justify-center shadow-lg" style={{ backgroundColor: cartoucheBg, clipPath: 'polygon(0 0, 100% 0, 100% 100%, 50% 80%, 0 100%)' }}>
                            <span className="text-xs font-bold mb-2 text-center leading-tight" style={{ color: cartoucheText, fontFamily: 'var(--font-hafs)' }}>{getAyahCountText(ayahCount).replace(' ', '\n')}</span>
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-bold z-10 drop-shadow-md" style={{ color: headerText, fontFamily: 'var(--font-hafs)' }}>
                            {fullSurahName}
                        </h2>
                    </div>
                );

            case 16: // Diamond Center
                return (
                    <div className="surah-header-visual relative h-14 w-full flex items-center justify-center overflow-hidden rounded-lg"
                         style={{ backgroundColor: headerBg, border: `2px solid ${headerBorder}` }}>
                        <div className="absolute inset-0 flex items-center justify-between px-8 opacity-50">
                            <div className="w-16 h-16 rotate-45 border-2" style={{ borderColor: headerBorder }}></div>
                            <div className="w-16 h-16 rotate-45 border-2" style={{ borderColor: headerBorder }}></div>
                        </div>
                        <div className="z-10 flex flex-col items-center bg-white/10 backdrop-blur-sm px-12 py-2 rounded-full border" style={{ borderColor: headerBorder }}>
                            <h2 className="text-2xl sm:text-3xl font-bold" style={{ color: headerText, fontFamily: 'var(--font-hafs)' }}>
                                {fullSurahName}
                            </h2>
                        </div>
                        <div className="absolute left-4 sm:left-12 font-bold text-xs" style={{ color: headerText, fontFamily: 'var(--font-hafs)' }}>{surahType}</div>
                        <div className="absolute right-4 sm:right-12 font-bold text-xs" style={{ color: headerText, fontFamily: 'var(--font-hafs)' }}>{getAyahCountText(ayahCount)}</div>
                    </div>
                );

            case 19: // Traditional Book Cover
                return (
                    <div className="surah-header-visual relative h-14 w-full flex items-center justify-center border-4"
                         style={{ backgroundColor: headerBg, borderColor: cartoucheBg }}>
                        <div className="absolute inset-1 border-2 border-dashed" style={{ borderColor: headerBorder, opacity: 0.5 }}></div>
                        <div className="z-10 bg-white/90 dark:bg-black/90 px-8 py-1 rounded-sm border-2 shadow-inner" style={{ borderColor: cartoucheBg }}>
                            <h2 className="text-2xl sm:text-3xl font-bold" style={{ color: cartoucheText, fontFamily: 'var(--font-hafs)' }}>
                                {fullSurahName}
                            </h2>
                        </div>
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-xs" style={{ color: headerText, fontFamily: 'var(--font-hafs)' }}>{surahType}</div>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-xs" style={{ color: headerText, fontFamily: 'var(--font-hafs)' }}>{getAyahCountText(ayahCount)}</div>
                    </div>
                );

            case 20: // Royal Emblem
                return (
                    <div className="surah-header-visual relative h-14 w-full flex items-center justify-center">
                        <div className="absolute inset-x-8 inset-y-1 rounded-full shadow-lg border-2" style={{ backgroundColor: headerBg, borderColor: headerBorder }}></div>
                        <div className="absolute left-4 sm:left-12 w-10 h-10 rounded-full flex items-center justify-center border-2 shadow-md z-10" style={{ backgroundColor: cartoucheBg, borderColor: headerBorder }}>
                            <span className="text-[10px] font-bold text-center leading-tight" style={{ color: cartoucheText, fontFamily: 'var(--font-hafs)' }}>{surahType}</span>
                        </div>
                        <div className="absolute right-4 sm:right-12 w-10 h-10 rounded-full flex items-center justify-center border-2 shadow-md z-10" style={{ backgroundColor: cartoucheBg, borderColor: headerBorder }}>
                            <span className="text-[10px] font-bold text-center leading-tight" style={{ color: cartoucheText, fontFamily: 'var(--font-hafs)' }}>{getAyahCountText(ayahCount).replace(' ', '\n')}</span>
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-bold z-20 drop-shadow-xl" style={{ color: headerText, fontFamily: 'var(--font-hafs)' }}>
                            {fullSurahName}
                        </h2>
                    </div>
                );

            default:
                return (
                    <div className={`surah-header-visual relative h-14 w-full flex items-center justify-between ${compact ? 'px-1' : 'px-2 sm:px-6'} rounded-md border-[3px] overflow-hidden`}
                         style={{ 
                             background: headerBg,
                             borderColor: headerBorder,
                             boxShadow: (isDefaultTheme && isDesign1) ? 'none' : '0 4px 6px -1px rgba(0, 0, 0, 0.2)'
                         }}>
                        <div className={`font-bold text-sm sm:text-lg z-10 ${(isDefaultTheme && isDesign1) ? '' : 'drop-shadow-md'} whitespace-nowrap`} style={{ color: headerText }}>
                            {getAyahCountText(ayahCount)}
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="relative h-10 px-6 sm:px-12 flex items-center justify-center border-2 shadow-inner max-w-[50%] sm:max-w-none"
                                 style={{ 
                                     borderRadius: '50px / 50px', 
                                     minWidth: '140px',
                                     backgroundColor: cartoucheBg,
                                     borderColor: headerBorder
                                 }}>
                                <h2 className="text-base sm:text-xl font-bold whitespace-nowrap w-full text-center mb-0" style={{ color: cartoucheText, transform: 'translateY(-4px)' }}>
                                    {fullSurahName}
                                </h2>
                            </div>
                        </div>
                        <div className={`font-bold text-sm sm:text-lg z-10 ${(isDefaultTheme && isDesign1) ? '' : 'drop-shadow-md'} whitespace-nowrap`} style={{ color: headerText }}>
                            {surahType}
                        </div>
                    </div>
                );
        }
    };

    return (
        <div id="surah-header-container" className={`surah-header-container-wrapper ${compact ? 'px-0 pt-1 pb-0' : 'px-0 pt-4 pb-0'}`}
             onMouseDown={handleMouseDown}
             onMouseUp={handleMouseUp}
             onMouseLeave={handleMouseUp}
             onTouchStart={handleTouchStart}
             onTouchEnd={handleTouchEnd}
             onTouchCancel={handleTouchEnd}>
            {renderDesign()}
        </div>
    );
};

export default SurahHeader;
