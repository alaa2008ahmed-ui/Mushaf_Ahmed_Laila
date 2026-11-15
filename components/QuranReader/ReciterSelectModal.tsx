import React, { useState, useEffect, useRef, useMemo } from 'react';
import { READERS, ReaderItem, ReadingMode, getReadersForMode, isEnglishReader, THEMES, isDarkQuranTheme } from './constants';
import { Search } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { getQuranThemeIdForLayout } from '../../utils/quranThemeHelper';
import { getReciterDisplayName, tListen } from '../../utils/listenQuranTranslations';
import { registerBackInterceptor } from '../../hooks/useBackButton';

interface ReciterSelectModalProps {
    onClose: () => void;
    currentReader: string;
    onSelect: (readerId: string) => void;
    isLandscape?: boolean;
    readersList?: ReaderItem[];
    readingMode?: ReadingMode;
    hideHeader?: boolean;
    zIndexClass?: string;
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

const ReciterSelectModal: React.FC<ReciterSelectModalProps> = ({ 
    onClose, 
    currentReader, 
    onSelect, 
    isLandscape, 
    readersList = READERS,
    readingMode = 'mushaf',
    hideHeader = false,
    zIndexClass = 'z-[1200]'
}) => {
    const { language, isRTL, dir } = useLanguage();
    const { theme, themeKey, isNightMode, homeThemeVariant, homeLayout } = useTheme();
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

    const themeColors = useMemo(() => {
        const modeSuffix = isLandscape ? '_h' : '_v';
        const activeQuranThemeId = getQuranThemeIdForLayout(modeSuffix, undefined, readingMode);
        const activeQuranTheme = THEMES[activeQuranThemeId as keyof typeof THEMES];

        const isBlack =
            isNightMode ||
            themeKey === 'deep_black' ||
            theme?.bgColor === '#000000' ||
            activeQuranThemeId === 'deep_black';

        const isDark =
            isBlack ||
            Boolean(theme?.isDark) ||
            isDarkQuranTheme(activeQuranTheme);

        const isModernLayout = homeLayout !== 'classic';

        const homeLightBg = homeThemeVariant === 'sky'
            ? '#F0F9FF'
            : homeThemeVariant === 'emerald'
                ? '#F0FDF4'
                : homeThemeVariant === 'burgundy'
                    ? '#FFF1F2'
                    : '#FEF9C3';

        const homeLightAccent = homeThemeVariant === 'sky'
            ? '#0284c7'
            : homeThemeVariant === 'emerald'
                ? '#047857'
                : homeThemeVariant === 'burgundy'
                    ? '#881337'
                    : '#d4af37';

        const modalBg = isBlack
            ? '#09090b'
            : isDark
                ? (activeQuranTheme?.modalBg && isHexDark(activeQuranTheme.modalBg)
                    ? activeQuranTheme.modalBg
                    : (activeQuranTheme?.bg && isHexDark(activeQuranTheme.bg)
                        ? activeQuranTheme.bg
                        : (theme?.modalBg && isHexDark(theme.modalBg) ? theme.modalBg : '#0f172a')))
                : isModernLayout
                    ? homeLightBg
                    : (activeQuranTheme?.modalBg && activeQuranTheme.modalBg.toLowerCase() !== '#ffffff'
                        ? activeQuranTheme.modalBg
                        : (theme?.bgColor && theme.bgColor.toLowerCase() !== '#ffffff'
                            ? theme.bgColor
                            : '#EEF2F6'));

        const cardBg = isDark ? '#1a1a22' : '#ffffff';
        const cardText = isDark ? '#ffffff' : '#0f172a';
        const subTextColor = isDark ? '#cbd5e1' : '#475569';

        let accent = isBlack
            ? '#ffffff'
            : isDark
                ? (activeQuranTheme?.accent || theme?.accent || '#10b981')
                : isModernLayout
                    ? (activeQuranTheme?.accent || homeLightAccent)
                    : (activeQuranTheme?.accent || theme?.accent || theme?.palette?.[0] || '#10b981');

        if (accent.toLowerCase() === '#000000' && isDark) {
            accent = '#ffffff';
        }

        const accentText = isBlack
            ? '#000000'
            : (activeQuranTheme?.accentText && (!isDark || isHexDark(accent))
                ? activeQuranTheme.accentText
                : (isHexDark(accent) ? '#ffffff' : '#000000'));

        return {
            isBlack,
            isDark,
            modalBg,
            cardBg,
            cardText,
            subTextColor,
            accent,
            accentText
        };
    }, [isNightMode, themeKey, theme, homeThemeVariant, homeLayout, isLandscape, readingMode]);

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
        '--qr-modal-bg': themeColors.modalBg,
        '--qr-modal-text': themeColors.cardText,
        '--qr-card-bg': themeColors.cardBg,
        '--qr-card-text': themeColors.cardText,
        '--qr-accent': themeColors.accent,
        '--qr-accent-text': themeColors.accentText,
        backgroundColor: themeColors.modalBg,
        color: themeColors.cardText,
    } as React.CSSProperties;

    return (
        <div className={`fixed inset-0 bg-black/40 backdrop-blur-sm ${zIndexClass} flex items-center justify-center ${isLandscape ? 'p-0' : 'p-3 sm:p-4'} animate-fadeIn font-cairo select-none`} onClick={handleClose}>
            <div 
                dir={dir} 
                className={`modal-skinned settings-3d-adia-scope ${themeColors.isDark ? 'settings-3d-dark' : ''} font-cairo w-full ${isLandscape ? 'max-w-4xl h-full rounded-none max-h-[100dvh]' : 'max-w-md sm:max-w-2xl rounded-3xl max-h-[88dvh]'} shadow-2xl overflow-hidden flex flex-col animate-modal-enter relative border-0`} 
                style={modalVars}
                onClick={e => e.stopPropagation()}
            >
                {/* Header with Title and Search */}
                {(!hideHeader || !isSingleReciterMode) && (
                    <div className="p-3.5 pb-2 flex flex-col gap-2.5 shrink-0 border-0">
                        {!hideHeader && (
                            <div className="flex items-center justify-between px-1">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-black truncate" style={{ color: themeColors.cardText }}>
                                        {modalTitle}
                                    </span>
                                    <span 
                                        className="text-[11px] px-2.5 py-0.5 rounded-full font-bold app-page-card border-0" 
                                        style={{ backgroundColor: themeColors.cardBg, color: themeColors.isBlack ? '#ffffff' : themeColors.accent }}
                                    >
                                        {filteredReaders.length}
                                    </span>
                                </div>
                                {isSingleReciterMode && (
                                    <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-indigo-500/15 text-indigo-500 dark:text-indigo-300 font-bold">
                                        {isBilingualMode ? 'AR + EN' : 'EN'}
                                    </span>
                                )}
                            </div>
                        )}
                        {!isSingleReciterMode && (
                            <div 
                                className="relative w-full rounded-2xl app-page-card border-0"
                                style={{ backgroundColor: themeColors.cardBg }}
                            >
                                <Search className={`absolute ${isRTL ? 'right-3.5' : 'left-3.5'} top-1/2 -translate-y-1/2 w-4 h-4 opacity-55`} style={{ color: themeColors.cardText }} />
                                <input
                                    type="text"
                                    placeholder={tListen('searchReciterPlaceholder', language)}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className={`w-full bg-transparent border-none rounded-2xl py-2.5 ${isRTL ? 'pr-10 pl-3.5 text-right' : 'pl-10 pr-3.5 text-left'} text-sm font-bold focus:outline-none`}
                                    style={{ 
                                        color: themeColors.cardText
                                    }}
                                />
                            </div>
                        )}
                    </div>
                )}

                {/* Body: 2-column Reciters Grid + Vertical Alphabet Jump Sidebar */}
                <div className="relative flex-1 flex overflow-hidden min-h-0">
                    {/* Scrollable Reciters Area */}
                    <div 
                        ref={listContainerRef} 
                        className={`overflow-y-auto overflow-x-hidden no-scrollbar flex-1 min-h-0 p-3.5 pt-2 pb-5 ${isLandscape ? 'modal-sheet-safe-bottom' : ''} ${!isSingleReciterMode ? 'pr-10 sm:pr-11 pl-3.5' : ''}`}
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
                                            className="w-full max-w-md p-5 rounded-2xl border-0 transition-all font-bold flex flex-col items-center justify-center text-center cursor-pointer app-page-card quran-raised-btn quran-raised-btn-selected"
                                            style={{ 
                                                backgroundColor: themeColors.accent, 
                                                color: themeColors.accentText
                                            }}
                                        >
                                            <div className="flex items-center justify-center w-full">
                                                <span className="text-sm font-black truncate flex-1 text-center">
                                                    {getReciterDisplayName(r.name, language)}
                                                </span>
                                            </div>
                                            {!isEnReader && (r.subTitle || r.subTitleEn) && (
                                                <span className="text-xs mt-1.5 opacity-90" style={{ color: themeColors.accentText }}>
                                                    {isEn ? (r.subTitleEn || r.subTitle) : r.subTitle}
                                                </span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3 py-1">
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
                                            className={`w-full p-3 rounded-2xl border-0 transition-all font-bold flex flex-col items-center justify-center text-center cursor-pointer scroll-mt-3 min-h-[64px] app-page-card ${
                                                isSelected 
                                                    ? 'quran-raised-btn quran-raised-btn-selected scale-[1.01]' 
                                                    : 'quran-raised-btn'
                                            }`}
                                            style={{ 
                                                backgroundColor: isSelected ? themeColors.accent : themeColors.cardBg, 
                                                color: isSelected ? themeColors.accentText : themeColors.cardText
                                            }}
                                        >
                                            <div className="flex items-center justify-center w-full">
                                                <span className="text-xs sm:text-[13px] font-bold line-clamp-2 flex-1 text-center leading-snug">
                                                    {displayName}
                                                </span>
                                            </div>
                                            {!isEnReader && subTitle && (
                                                <span 
                                                    className="text-[10px] mt-1 line-clamp-1 opacity-85"
                                                    style={{ color: isSelected ? themeColors.accentText : themeColors.subTextColor }}
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
                            className="absolute right-1.5 top-2 bottom-3 w-7 flex flex-col items-center justify-start py-1.5 z-20 overflow-y-auto no-scrollbar rounded-full app-page-card select-none border-0"
                            style={{ direction: 'ltr', backgroundColor: themeColors.cardBg }}
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
                                                    ? (themeColors.isDark ? 'text-zinc-100 hover:bg-white/10 active:scale-125' : 'text-slate-700 hover:bg-black/5 active:scale-125')
                                                    : (themeColors.isDark ? 'text-zinc-600/60 cursor-default pointer-events-none' : 'text-slate-300/70 cursor-default pointer-events-none'))
                                        }`}
                                        style={isActive ? { backgroundColor: themeColors.accent, color: themeColors.accentText } : undefined}
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
                                className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl font-black app-page-card quran-raised-btn-selected scale-105"
                                style={{ backgroundColor: themeColors.accent, color: themeColors.accentText }}
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
