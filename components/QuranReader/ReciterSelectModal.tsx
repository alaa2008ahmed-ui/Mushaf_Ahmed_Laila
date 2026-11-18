import React, { useState, useEffect, useRef, useMemo } from 'react';
import { READERS, ReaderItem, ReadingMode, getReadersForMode, isEnglishReader, THEMES } from './constants';
import { Search, X } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { getQuranThemeIdForLayout } from '../../utils/quranThemeHelper';
import { getReciterDisplayName, tListen } from '../../utils/listenQuranTranslations';
import { registerBackInterceptor } from '../../hooks/useBackButton';
import { resolveQuranModalPalette } from './modalThemeUtils';

interface ReciterSelectModalProps {
    onClose: () => void;
    currentReader: string;
    onSelect: (readerId: string) => void;
    isLandscape?: boolean;
    readersList?: ReaderItem[];
    readingMode?: ReadingMode;
    hideHeader?: boolean;
    zIndexClass?: string;
    currentTheme?: any;
}

const ARABIC_ALPHABET = [
    'أ', 'ب', 'ت', 'ث', 'ج', 'ح', 'خ', 'د', 'ذ', 'ر', 
    'ز', 'س', 'ش', 'ص', 'ض', 'ط', 'ظ', 'ع', 'غ', 'ف', 
    'ق', 'ك', 'ل', 'م', 'ن', 'هـ', 'و', 'ي'
];

const ENGLISH_ALPHABET = [
    'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 
    'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 
    'U', 'V', 'W', 'X', 'Y', 'Z'
];

const isHexDark = (color?: string | null): boolean => {
    if (!color) return false;
    const hex = color.trim().replace('#', '');
    if (!/^[0-9a-fA-F]{3,6}$/.test(hex)) return false;
    const fullHex = hex.length === 3 ? hex.split('').map(c => c + c).join('') : hex;
    const r = parseInt(fullHex.slice(0, 2), 16);
    const g = parseInt(fullHex.slice(2, 4), 16);
    const b = parseInt(fullHex.slice(4, 6), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance < 0.45;
};

// Helper to determine the alphabetical group letter for a reciter name
const getReciterIndexLetter = (name: string, isEn: boolean): string => {
    if (isEn) {
        const en = getReciterDisplayName(name, 'en').trim();
        return (en.charAt(0) || '').toUpperCase();
    }
    let clean = name.trim();
    // Strip Al- prefix if followed by letters
    if (clean.startsWith('ال') && clean.length > 3) {
        clean = clean.substring(2).trim();
    }
    const firstChar = clean.charAt(0);
    if (['أ', 'إ', 'آ', 'ا'].includes(firstChar)) return 'أ';
    if (firstChar === 'ه') return 'هـ';
    return firstChar;
};

const resolveFallbackTheme = (themeKey: string, isNightMode: boolean, homeThemeVariant: string) => {
    if (isNightMode || themeKey === 'black' || themeKey === 'black_gold') return THEMES.deep_black;
    if (homeThemeVariant === 'gold' || themeKey === 'shiny_gold' || themeKey === 'gold') return THEMES.gold;
    if (homeThemeVariant === 'sky' || themeKey === 'sky') return THEMES.night_sky;
    if (homeThemeVariant === 'emerald' || themeKey === 'emerald') return THEMES.green;
    if (homeThemeVariant === 'burgundy' || themeKey === 'burgundy') return THEMES.maroon;
    return THEMES.black;
};

const ReciterSelectModal: React.FC<ReciterSelectModalProps> = ({ 
    onClose, 
    currentReader, 
    onSelect, 
    isLandscape, 
    readersList = READERS,
    readingMode = 'mushaf',
    hideHeader = false,
    zIndexClass = 'z-[1200]',
    currentTheme
}) => {
    const { language, isRTL, dir } = useLanguage();
    const { theme, themeKey, isNightMode, homeThemeVariant } = useTheme();
    const isEn = language === 'en';
    const [searchTerm, setSearchTerm] = useState('');
    const [activeLetter, setActiveLetter] = useState<string | null>(null);
    const [floatingLetter, setFloatingLetter] = useState<string | null>(null);
    const selectedRef = useRef<HTMLButtonElement>(null);
    const listContainerRef = useRef<HTMLDivElement>(null);
    const floatingTimerRef = useRef<any>(null);

    useEffect(() => {
        const interceptor = () => {
            onClose();
            return true;
        };
        const unregister = registerBackInterceptor(interceptor);
        return unregister;
    }, [onClose]);

    const effectiveTheme = useMemo(() => {
        if (currentTheme) return currentTheme;
        const modeSuffix = isLandscape ? '_h' : '_v';
        const activeQuranThemeId = getQuranThemeIdForLayout(modeSuffix, undefined, readingMode);
        if (activeQuranThemeId && THEMES[activeQuranThemeId as keyof typeof THEMES]) {
            return THEMES[activeQuranThemeId as keyof typeof THEMES];
        }
        return resolveFallbackTheme(themeKey, isNightMode, homeThemeVariant);
    }, [currentTheme, isLandscape, readingMode, themeKey, isNightMode, homeThemeVariant]);

    const p = useMemo(() => resolveQuranModalPalette(effectiveTheme), [effectiveTheme]);

    // Strictly filter the available readers based on current reading mode or custom readers list
    const modeReaders = useMemo(() => {
        if (readersList && readersList !== READERS) {
            return readersList;
        }
        return getReadersForMode(readingMode, readersList);
    }, [readingMode, readersList]);

    // Sort readers alphabetically based on language for intuitive indexing
    const sortedModeReaders = useMemo(() => {
        const list = [...modeReaders];
        if (isEn) {
            return list.sort((a, b) => {
                const nameA = getReciterDisplayName(a.name, 'en');
                const nameB = getReciterDisplayName(b.name, 'en');
                return nameA.localeCompare(nameB, 'en');
            });
        } else {
            return list.sort((a, b) => {
                const cleanA = a.name.trim().replace(/^ال(?=[^\s]{2,})/, '').replace(/^[أإآا]/, 'أ');
                const cleanB = b.name.trim().replace(/^ال(?=[^\s]{2,})/, '').replace(/^[أإآا]/, 'أ');
                return cleanA.localeCompare(cleanB, 'ar');
            });
        }
    }, [modeReaders, isEn]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (selectedRef.current) {
                selectedRef.current.scrollIntoView({ behavior: 'auto', block: 'center' });
            }
        }, 150);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        return () => {
            if (floatingTimerRef.current) clearTimeout(floatingTimerRef.current);
        };
    }, []);

    const handleClose = () => {
        onClose();
    };

    const handleSelect = (id: string) => {
        onSelect(id);
        handleClose();
    };

    const searchLower = searchTerm.toLowerCase().trim();
    const filteredReaders = useMemo(() => {
        return sortedModeReaders.filter(r => {
            if (!searchLower) return true;
            const arName = r.name.toLowerCase();
            const enName = getReciterDisplayName(r.name, 'en').toLowerCase();
            return arName.includes(searchLower) || enName.includes(searchLower);
        });
    }, [sortedModeReaders, searchLower]);

    const activeAlphabet = isEn ? ENGLISH_ALPHABET : ARABIC_ALPHABET;

    // Map each alphabet letter to the first reciter ID in the current filtered list
    const letterFirstIdMap = useMemo(() => {
        const map = new Map<string, string>();
        filteredReaders.forEach(r => {
            const letter = getReciterIndexLetter(r.name, isEn);
            if (letter && !map.has(letter)) {
                map.set(letter, r.id);
            }
        });
        return map;
    }, [filteredReaders, isEn]);

    const handleLetterClick = (letter: string) => {
        const targetReciterId = letterFirstIdMap.get(letter);
        if (!targetReciterId) return;

        setActiveLetter(letter);
        setFloatingLetter(letter);
        if (floatingTimerRef.current) clearTimeout(floatingTimerRef.current);
        floatingTimerRef.current = setTimeout(() => setFloatingLetter(null), 850);

        const targetEl = document.getElementById(`reciter-card-${encodeURIComponent(targetReciterId)}`);
        if (targetEl) {
            targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    const isBilingualMode = readingMode === 'bilingual';
    const isTranslationMode = readingMode === 'translation';
    const isSingleReciterMode = isBilingualMode || isTranslationMode;

    const modalTitle = isBilingualMode 
        ? (isEn ? "Recitation & Translation Reciter" : "قارئ التلاوة والترجمة الإنجليزية")
        : isTranslationMode
            ? (isEn ? "English Translation Reciter" : "قارئ الترجمة الإنجليزية (صحيح إنترناشونال)")
            : (isEn ? "Holy Quran Reciters" : "قراء القرآن الكريم");

    const modalVars = {
        '--qr-modal-bg': p.modalBg,
        '--qr-modal-text': p.cardText,
        '--qr-card-bg': p.cardBg,
        '--qr-card-text': p.cardText,
        '--qr-accent': p.selectedBg,
        '--qr-accent-text': p.selectedText,
        backgroundColor: p.modalBg,
        color: p.modalText,
    } as React.CSSProperties;

    return (
        <div className={`fixed inset-0 bg-black/55 ${zIndexClass} flex items-center justify-center ${isLandscape ? 'p-2' : 'p-3 sm:p-4'} font-cairo select-none`} onClick={handleClose}>
            <div 
                dir={dir} 
                className={`modal-skinned settings-3d-adia-scope ${p.isDark ? 'settings-3d-dark quran-3d-dark' : ''} font-cairo ${isLandscape ? 'w-[62%] max-w-[430px] h-[86%] max-h-[86%] rounded-3xl' : 'w-full max-w-md sm:max-w-2xl rounded-3xl max-h-[88dvh]'} shadow-2xl overflow-hidden flex flex-col relative border-0`} 
                style={{
                    fontFamily: p.fontFamily,
                    backgroundColor: p.modalBg,
                    color: p.modalText,
                    border: 'none',
                    outline: 'none',
                    ...modalVars
                }}
                onClick={e => e.stopPropagation()}
            >
                {/* Canonical Raised Header with Title, Count, Close and Search */}
                <div className={`${isLandscape ? 'p-2.5 pb-1.5 gap-2' : 'p-3.5 pb-2 gap-2.5'} flex flex-col shrink-0 border-0`}>
                    <div 
                        className={`${isLandscape ? 'py-1.5 px-3 rounded-xl' : 'py-2.5 px-3.5 rounded-2xl'} flex items-center justify-between quran-raised-card border-0`}
                        style={{ backgroundColor: p.headerBg }}
                    >
                        <div className="flex items-center gap-2 min-w-0">
                            <span className={`${isLandscape ? 'text-xs' : 'text-xs sm:text-sm'} font-black tracking-wide truncate`} style={{ color: p.headerAccent }}>
                                {modalTitle}
                            </span>
                            <span 
                                className={`${isLandscape ? 'text-[10px]' : 'text-[11px]'} px-2 py-0.5 rounded-full font-bold border-0`} 
                                style={{ backgroundColor: p.modalBg, color: p.headerAccent }}
                            >
                                {filteredReaders.length}
                            </span>
                            {isSingleReciterMode && (
                                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold" style={{ backgroundColor: p.selectedBg, color: p.selectedText }}>
                                    {isBilingualMode ? 'AR + EN' : 'EN'}
                                </span>
                            )}
                        </div>
                        <button 
                            type="button"
                            onClick={handleClose} 
                            className={`${isLandscape ? 'w-7 h-7' : 'w-8 h-8'} quran-raised-btn rounded-full flex items-center justify-center border-0 cursor-pointer shrink-0`}
                            style={{ backgroundColor: p.closeBg, color: p.headerAccent }}
                            aria-label={isEn ? "Close" : "إغلاق"}
                        >
                            <X size={isLandscape ? 14 : 16} />
                        </button>
                    </div>

                    {!isSingleReciterMode && (
                        <div 
                            className={`relative w-full ${isLandscape ? 'rounded-xl' : 'rounded-2xl'} quran-raised-card border-0`}
                            style={{ backgroundColor: p.cardBg }}
                        >
                            <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-3.5 h-3.5 opacity-55`} style={{ color: p.cardText }} />
                            <input
                                type="text"
                                placeholder={tListen('searchReciterPlaceholder', language)}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className={`w-full bg-transparent border-none ${isLandscape ? 'py-1.5 text-xs rounded-xl' : 'py-2.5 text-sm rounded-2xl'} ${isRTL ? 'pr-9 pl-3 text-right' : 'pl-9 pr-3 text-left'} font-bold focus:outline-none`}
                                style={{ 
                                    color: p.cardText
                                }}
                            />
                        </div>
                    )}
                </div>

                {/* Body: 2-column Reciters Grid + Vertical Alphabet Jump Sidebar */}
                <div className="relative flex-1 flex overflow-hidden min-h-0">
                    {/* Scrollable Reciters Area */}
                    <div 
                        ref={listContainerRef} 
                        className={`overflow-y-auto overflow-x-hidden no-scrollbar flex-1 min-h-0 ${isLandscape ? 'p-2.5 pt-1 pb-3' : 'p-3.5 pt-2 pb-5'} ${!isSingleReciterMode ? (isLandscape ? 'pr-9 pl-2.5' : 'pr-10 sm:pr-11 pl-3.5') : ''}`}
                    >
                        {isSingleReciterMode ? (
                            <div className="flex flex-col items-center justify-center h-full p-4">
                                {filteredReaders.map(r => {
                                    const isSelected = currentReader === r.id || isSingleReciterMode;
                                    const isEnReader = isEnglishReader(r);
                                    return (
                                        <button 
                                            key={r.id} 
                                            ref={isSelected ? selectedRef : null}
                                            onClick={() => handleSelect(r.id)}
                                            className={`w-full max-w-md ${isLandscape ? 'p-3.5 rounded-xl' : 'p-5 rounded-2xl'} border-0 transition-all font-bold flex flex-col items-center justify-center text-center cursor-pointer quran-raised-btn quran-raised-btn-selected`}
                                            style={{ 
                                                backgroundColor: p.selectedBg, 
                                                color: p.selectedText,
                                                border: 'none'
                                            }}
                                        >
                                            <div className="flex items-center justify-center w-full overflow-hidden">
                                                <span
                                                    className={`font-cairo ${isLandscape ? 'text-sm' : 'text-base sm:text-lg'} font-extrabold line-clamp-2 break-words flex-1 text-center leading-snug`}
                                                    style={{ fontFamily: "'Cairo', sans-serif" }}
                                                >
                                                    {getReciterDisplayName(r.name, language)}
                                                </span>
                                            </div>
                                            {!isEnReader && (r.subTitle || r.subTitleEn) && (
                                                <span className="text-xs mt-1.5 opacity-90" style={{ color: p.selectedText }}>
                                                    {isEn ? (r.subTitleEn || r.subTitle) : r.subTitle}
                                                </span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className={`grid ${isLandscape ? 'grid-cols-2 gap-2' : 'grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3'} py-1`}>
                                {filteredReaders.map(r => {
                                    const isSelected = currentReader === r.id;
                                    const isEnReader = isEnglishReader(r);
                                    const displayName = getReciterDisplayName(r.name, language);
                                    const subTitle = isEn ? (r.subTitleEn || r.subTitle) : r.subTitle;

                                    return (
                                        <button 
                                            key={r.id} 
                                            id={`reciter-card-${encodeURIComponent(r.id)}`}
                                            ref={isSelected ? selectedRef : null}
                                            onClick={() => handleSelect(r.id)}
                                            className={`w-full ${isLandscape ? 'px-2 py-2 rounded-xl min-h-[54px]' : 'px-2.5 py-3 rounded-2xl min-h-[68px]'} border-0 transition-all font-bold flex flex-col items-center justify-center text-center cursor-pointer scroll-mt-3 overflow-hidden ${
                                                isSelected 
                                                    ? 'quran-raised-btn quran-raised-btn-selected scale-[1.01]' 
                                                    : 'quran-raised-btn'
                                            }`}
                                            style={{ 
                                                backgroundColor: isSelected ? p.selectedBg : p.cardBg, 
                                                color: isSelected ? p.selectedText : p.cardText,
                                                border: 'none'
                                            }}
                                        >
                                            <div className="flex items-center justify-center w-full overflow-hidden">
                                                <span
                                                    className="font-cairo text-sm sm:text-[15px] font-extrabold line-clamp-2 break-words flex-1 text-center leading-snug"
                                                    style={{ fontFamily: "'Cairo', sans-serif" }}
                                                >
                                                    {displayName}
                                                </span>
                                            </div>
                                            {!isEnReader && subTitle && (
                                                <span 
                                                    className="text-[10px] mt-1 line-clamp-1 opacity-85"
                                                    style={{ color: isSelected ? p.selectedText : p.mutedText }}
                                                >
                                                    {subTitle}
                                                </span>
                                            )}
                                        </button>
                                    );
                                })}

                                {filteredReaders.length === 0 && (
                                    <div className="col-span-full py-12 text-center opacity-50 text-sm">
                                        {tListen('noSearchResults', language)}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Vertical Alphabet Index Rail on the Right Side */}
                    {!isSingleReciterMode && (
                        <div 
                            className="absolute right-1.5 top-2 bottom-3 w-7 flex flex-col items-center justify-start py-1.5 z-20 overflow-y-auto no-scrollbar rounded-full quran-raised-card select-none border-0"
                            style={{ direction: 'ltr', backgroundColor: p.cardBg }}
                        >
                            {activeAlphabet.map((char) => {
                                const isAvailable = letterFirstIdMap.has(char);
                                const isActive = activeLetter === char;
                                return (
                                    <button
                                        key={char}
                                        type="button"
                                        disabled={!isAvailable}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleLetterClick(char);
                                        }}
                                        className={`w-5.5 h-5.5 shrink-0 rounded-full flex items-center justify-center text-[10px] sm:text-[11px] font-bold transition-all my-px cursor-pointer border-none ${
                                            isActive 
                                                ? 'quran-raised-btn quran-raised-btn-selected scale-110 font-black' 
                                                : (isAvailable 
                                                    ? (p.isDark ? 'text-zinc-100 hover:bg-white/10 active:scale-125' : 'text-slate-700 hover:bg-black/5 active:scale-125')
                                                    : (p.isDark ? 'text-zinc-600/60 cursor-default pointer-events-none' : 'text-slate-300/70 cursor-default pointer-events-none'))
                                        }`}
                                        style={isActive ? { backgroundColor: p.selectedBg, color: p.selectedText } : undefined}
                                        title={isAvailable ? char : undefined}
                                        aria-label={`Jump to letter ${char}`}
                                    >
                                        {char}
                                    </button>
                                );
                            })}
                        </div>
                    )}

                    {/* Floating Center Badge Indicator when user taps an alphabet letter */}
                    {floatingLetter && (
                        <div className="pointer-events-none absolute inset-0 flex items-center justify-center z-30 animate-fadeIn">
                            <div 
                                className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl font-black quran-raised-btn-selected scale-105 border-0"
                                style={{ backgroundColor: p.selectedBg, color: p.selectedText }}
                            >
                                {floatingLetter}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ReciterSelectModal;
