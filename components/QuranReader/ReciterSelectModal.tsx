import React, { useState, useEffect, useRef, useMemo } from 'react';
import { READERS, ReaderItem, ReadingMode, getReadersForMode, isEnglishReader } from './constants';
import { Search, Check } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { getReciterDisplayName, tListen } from '../../utils/listenQuranTranslations';

interface ReciterSelectModalProps {
    onClose: () => void;
    currentReader: string;
    onSelect: (readerId: string) => void;
    isLandscape?: boolean;
    readersList?: ReaderItem[];
    readingMode?: ReadingMode;
    hideHeader?: boolean;
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
    hideHeader = false
}) => {
    const { language, isRTL, dir } = useLanguage();
    const isEn = language === 'en';
    const [searchTerm, setSearchTerm] = useState('');
    const [activeLetter, setActiveLetter] = useState<string | null>(null);
    const [floatingLetter, setFloatingLetter] = useState<string | null>(null);
    const selectedRef = useRef<HTMLButtonElement>(null);
    const listContainerRef = useRef<HTMLDivElement>(null);
    const floatingTimerRef = useRef<any>(null);

    const isBlackTheme = useMemo(() => {
        try {
            const bg = getComputedStyle(document.documentElement).getPropertyValue('--qr-bg').trim();
            const accent = getComputedStyle(document.documentElement).getPropertyValue('--qr-accent').trim();
            return bg === '#000000' || accent === '#ffffff' || accent === '#FFFFFF';
        } catch {
            return false;
        }
    }, []);

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

    return (
        <div className={`fixed inset-0 bg-black/30 backdrop-blur-sm z-[1200] flex items-center justify-center ${isLandscape ? 'p-0' : 'p-3 sm:p-4'} animate-fadeIn`} onClick={handleClose}>
            <div dir={dir} className={`modal-skinned w-full ${isLandscape ? 'max-w-4xl h-full rounded-none max-h-screen' : 'max-w-md sm:max-w-2xl rounded-2xl max-h-[85vh]'} shadow-2xl overflow-hidden flex flex-col animate-modal-enter relative`} onClick={e => e.stopPropagation()}>
                {/* Header with Title and Search */}
                {(!hideHeader || !isSingleReciterMode) && (
                    <div className="p-3 border-b flex flex-col gap-2 shrink-0" style={{ borderColor: 'var(--qr-card-border)' }}>
                        {!hideHeader && (
                            <div className="flex items-center justify-between px-1">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-bold truncate" style={{ color: 'var(--qr-card-text)' }}>
                                        {modalTitle}
                                    </span>
                                    <span className="text-[11px] px-2 py-0.5 rounded-full font-bold opacity-75" style={{ backgroundColor: 'var(--qr-accent-10, rgba(16, 185, 129, 0.12))', color: 'var(--qr-accent, #10b981)' }}>
                                        {filteredReaders.length}
                                    </span>
                                </div>
                                {isSingleReciterMode && (
                                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-500 dark:text-indigo-300 font-bold border border-indigo-500/30">
                                        {isBilingualMode ? 'AR + EN' : 'EN'}
                                    </span>
                                )}
                            </div>
                        )}
                        {!isSingleReciterMode && (
                            <div className="relative w-full">
                                <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-4 h-4 opacity-50`} />
                                <input
                                    type="text"
                                    placeholder={tListen('searchReciterPlaceholder', language)}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className={`w-full bg-black/5 dark:bg-white/5 border-none rounded-xl py-2.5 ${isRTL ? 'pr-9 pl-3 text-right' : 'pl-9 pr-3 text-left'} text-sm focus:outline-none shadow-inner`}
                                    style={{ 
                                        color: 'var(--qr-card-text)'
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
                        className={`overflow-y-auto flex-1 p-3 ${!isSingleReciterMode ? 'pr-8 sm:pr-9 pl-3' : ''}`}
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
                                            className="w-full max-w-md p-5 rounded-2xl border-none transition-all font-bold flex flex-col items-center justify-center text-center cursor-pointer quran-raised-btn quran-raised-btn-selected"
                                            style={{ 
                                                backgroundColor: isBlackTheme ? 'rgba(255, 255, 255, 0.15)' : 'var(--qr-accent)', 
                                                color: '#ffffff'
                                            }}
                                        >
                                            <div className="flex items-center justify-between w-full">
                                                <span className="text-sm font-black truncate flex-1 text-center">
                                                    {getReciterDisplayName(r.name, language)}
                                                </span>
                                                <Check size={20} className="shrink-0 ml-1 text-white quran-3d-icon" />
                                            </div>
                                            {!isEnReader && (r.subTitle || r.subTitleEn) && (
                                                <span className="text-xs mt-1.5 opacity-90 text-indigo-100">
                                                    {isEn ? (r.subTitleEn || r.subTitle) : r.subTitle}
                                                </span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-2.5 sm:gap-3">
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
                                            className={`w-full p-2.5 sm:p-3 rounded-xl border-none transition-all font-bold flex flex-col items-center justify-center text-center cursor-pointer scroll-mt-3 min-h-[58px] ${
                                                isSelected 
                                                    ? 'quran-raised-btn quran-raised-btn-selected scale-[1.01]' 
                                                    : 'quran-raised-btn hover:opacity-90 active:scale-[0.97]'
                                            }`}
                                            style={{ 
                                                backgroundColor: isEnReader 
                                                    ? 'var(--qr-card-bg)' 
                                                    : (isSelected ? (isBlackTheme ? 'rgba(255, 255, 255, 0.18)' : 'var(--qr-accent)') : 'var(--qr-card-bg)'), 
                                                color: isEnReader 
                                                    ? 'var(--qr-card-text)' 
                                                    : (isSelected ? '#ffffff' : 'var(--qr-card-text)')
                                            }}
                                        >
                                            <div className="flex items-center justify-between w-full gap-1">
                                                <span className="text-xs sm:text-[13px] font-bold line-clamp-2 flex-1 text-center leading-snug">
                                                    {displayName}
                                                </span>
                                                {isSelected && (
                                                    <Check size={16} className="shrink-0 quran-3d-icon" style={{ color: isEnReader ? 'var(--qr-card-text)' : '#ffffff' }} />
                                                )}
                                            </div>
                                            {!isEnReader && subTitle && (
                                                <span className={`text-[10px] mt-0.5 line-clamp-1 opacity-80 ${isSelected ? 'text-indigo-100' : 'text-indigo-600 dark:text-indigo-300'}`}>
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
                            className="absolute right-1 top-2 bottom-2 w-6 sm:w-7 flex flex-col items-center justify-start py-1.5 z-20 overflow-y-auto no-scrollbar rounded-full bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md shadow-md select-none border-none"
                            style={{ direction: 'ltr' }}
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
                                        className={`w-5 h-5 sm:w-5.5 sm:h-5.5 shrink-0 rounded-full flex items-center justify-center text-[10px] sm:text-[11px] font-bold transition-all my-px cursor-pointer border-none ${
                                            isActive 
                                                ? 'text-white quran-raised-btn quran-raised-btn-selected scale-110 font-black' 
                                                : (isAvailable 
                                                    ? 'text-slate-700 dark:text-zinc-200 hover:bg-black/5 dark:hover:bg-white/10 active:scale-125' 
                                                    : 'text-slate-300/60 dark:text-zinc-600/60 cursor-default pointer-events-none')
                                        }`}
                                        style={isActive ? { backgroundColor: 'var(--qr-accent, #10b981)' } : undefined}
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
                                className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl font-black text-white shadow-2xl backdrop-blur-md scale-105"
                                style={{ backgroundColor: 'var(--qr-accent, #10b981)' }}
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
