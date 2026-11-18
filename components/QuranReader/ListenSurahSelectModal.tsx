import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Search, X } from 'lucide-react';
import { THEMES } from './constants';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { getQuranThemeIdForLayout } from '../../utils/quranThemeHelper';
import { getSurahDisplayName, formatListenNumber, tListen } from '../../utils/listenQuranTranslations';
import { registerBackInterceptor } from '../../hooks/useBackButton';
import { resolveQuranModalPalette } from './modalThemeUtils';

interface ListenSurahSelectModalProps {
    onClose: () => void;
    currentSurah: number;
    onSelect: (surahNumber: number) => void;
    isLandscape?: boolean;
    surahsList: { number: number, name: string }[];
    zIndexClass?: string;
    currentTheme?: any;
}

const resolveFallbackTheme = (themeKey: string, isNightMode: boolean, homeThemeVariant: string) => {
    if (isNightMode || themeKey === 'black' || themeKey === 'black_gold') return THEMES.deep_black;
    if (homeThemeVariant === 'gold' || themeKey === 'shiny_gold' || themeKey === 'gold') return THEMES.gold;
    if (homeThemeVariant === 'sky' || themeKey === 'sky') return THEMES.night_sky;
    if (homeThemeVariant === 'emerald' || themeKey === 'emerald') return THEMES.green;
    if (homeThemeVariant === 'burgundy' || themeKey === 'burgundy') return THEMES.maroon;
    return THEMES.black;
};

const normalizeArabicSearch = (text: string) =>
    text
        .replace(/[\u064B-\u065F\u0670\u0640]/g, '')
        .replace(/[أإآٱ]/g, 'ا')
        .replace(/ة/g, 'ه')
        .replace(/ى/g, 'ي')
        .toLowerCase()
        .trim();

const ListenSurahSelectModal: React.FC<ListenSurahSelectModalProps> = ({
    onClose,
    currentSurah,
    onSelect,
    isLandscape,
    surahsList,
    zIndexClass = 'z-[1200]',
    currentTheme
}) => {
    const { language, isRTL, dir } = useLanguage();
    const { themeKey, isNightMode, homeThemeVariant } = useTheme();
    const isEn = language === 'en';
    const [searchTerm, setSearchTerm] = useState('');
    const selectedRef = useRef<HTMLButtonElement>(null);

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
        const activeQuranThemeId = getQuranThemeIdForLayout(modeSuffix, undefined, 'mushaf');
        if (activeQuranThemeId && THEMES[activeQuranThemeId as keyof typeof THEMES]) {
            return THEMES[activeQuranThemeId as keyof typeof THEMES];
        }
        return resolveFallbackTheme(themeKey, isNightMode, homeThemeVariant);
    }, [currentTheme, isLandscape, themeKey, isNightMode, homeThemeVariant]);

    const p = useMemo(() => resolveQuranModalPalette(effectiveTheme), [effectiveTheme]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (selectedRef.current) {
                selectedRef.current.scrollIntoView({ behavior: 'auto', block: 'center' });
            }
        }, 150);
        return () => clearTimeout(timer);
    }, []);

    const handleClose = () => {
        onClose();
    };

    const handleSelect = (id: number) => {
        onSelect(id);
        handleClose();
    };

    const searchLower = searchTerm.toLowerCase().trim();
    const normalizedQuery = normalizeArabicSearch(searchTerm);
    const filteredSurahs = useMemo(() => {
        return surahsList.filter(s => {
            if (!searchLower) return true;
            const arName = s.name.toLowerCase();
            const normalizedArName = normalizeArabicSearch(s.name);
            const enName = getSurahDisplayName(s.number, 'en').toLowerCase();
            const numStr = String(s.number);
            return (
                arName.includes(searchLower) ||
                normalizedArName.includes(normalizedQuery) ||
                enName.includes(searchLower) ||
                numStr.includes(searchLower)
            );
        });
    }, [surahsList, searchLower, normalizedQuery]);

    const modalTitle = isEn ? 'Holy Quran Surahs' : 'سور القرآن الكريم';

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
        <div
            className={`fixed inset-0 bg-black/55 ${zIndexClass} flex items-center justify-center ${isLandscape ? 'p-0' : 'p-3 sm:p-4'} font-cairo select-none`}
            onClick={handleClose}
        >
            <div
                dir={dir}
                className={`modal-skinned settings-3d-adia-scope ${p.isDark ? 'settings-3d-dark quran-3d-dark' : ''} font-cairo w-full ${isLandscape ? 'max-w-4xl h-full rounded-none max-h-[100dvh]' : 'max-w-md sm:max-w-2xl rounded-3xl max-h-[88dvh]'} shadow-2xl overflow-hidden flex flex-col relative border-0`}
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
                <div className="p-3.5 pb-2 flex flex-col gap-2.5 shrink-0 border-0">
                    <div
                        className="py-2.5 px-3.5 rounded-2xl flex items-center justify-between quran-raised-card border-0"
                        style={{ backgroundColor: p.headerBg }}
                    >
                        <div className="flex items-center gap-2 min-w-0">
                            <span className="text-xs sm:text-sm font-black tracking-wide truncate" style={{ color: p.headerAccent }}>
                                {modalTitle}
                            </span>
                            <span
                                className="text-[11px] px-2 py-0.5 rounded-full font-bold border-0"
                                style={{ backgroundColor: p.modalBg, color: p.headerAccent }}
                            >
                                {filteredSurahs.length}
                            </span>
                        </div>
                        <button
                            type="button"
                            onClick={handleClose}
                            className="w-8 h-8 quran-raised-btn rounded-full flex items-center justify-center border-0 cursor-pointer shrink-0"
                            style={{ backgroundColor: p.closeBg, color: p.headerAccent }}
                            aria-label={isEn ? 'Close' : 'إغلاق'}
                        >
                            <X size={16} />
                        </button>
                    </div>

                    <div
                        className="relative w-full rounded-2xl quran-raised-card border-0"
                        style={{ backgroundColor: p.cardBg }}
                    >
                        <Search className={`absolute ${isRTL ? 'right-3.5' : 'left-3.5'} top-1/2 -translate-y-1/2 w-4 h-4 opacity-55`} style={{ color: p.cardText }} />
                        <input
                            type="text"
                            placeholder={language === 'en' ? 'Search Surah (name or number)...' : 'ابحث عن سورة بالاسم أو الرقم...'}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className={`w-full bg-transparent border-none rounded-2xl py-2.5 ${isRTL ? 'pr-10 pl-3.5 text-right' : 'pl-10 pr-3.5 text-left'} text-sm font-bold focus:outline-none`}
                            style={{
                                color: p.cardText
                            }}
                        />
                    </div>
                </div>

                {/* Body: Surahs Grid */}
                <div className="relative flex-1 flex overflow-hidden min-h-0">
                    <div
                        className={`overflow-y-auto overflow-x-hidden no-scrollbar flex-1 min-h-0 p-3.5 pt-2 pb-5 ${isLandscape ? 'modal-sheet-safe-bottom' : ''}`}
                    >
                        <div className={`grid ${isLandscape ? 'grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-3' : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3'} py-1`}>
                            {filteredSurahs.map(s => {
                                const isCurrent = currentSurah === s.number;
                                const surahLabel = `${formatListenNumber(s.number, language)} - ${getSurahDisplayName(s.number, language)}`;
                                return (
                                    <button
                                        key={s.number}
                                        ref={isCurrent ? selectedRef : null}
                                        onClick={() => handleSelect(s.number)}
                                        className={`w-full px-2.5 py-3 rounded-2xl border-0 transition-all font-bold flex flex-col items-center justify-center text-center cursor-pointer scroll-mt-3 min-h-[60px] overflow-hidden ${
                                            isCurrent
                                                ? 'quran-raised-btn quran-raised-btn-selected scale-[1.01]'
                                                : 'quran-raised-btn'
                                        }`}
                                        style={{
                                            backgroundColor: isCurrent ? p.selectedBg : p.cardBg,
                                            color: isCurrent ? p.selectedText : p.cardText,
                                            border: 'none'
                                        }}
                                    >
                                        <span
                                            className="font-cairo text-sm sm:text-[15px] font-extrabold line-clamp-2 break-words w-full text-center leading-snug"
                                            style={{ fontFamily: "'Cairo', sans-serif" }}
                                        >
                                            {surahLabel}
                                        </span>
                                    </button>
                                );
                            })}
                            {filteredSurahs.length === 0 && (
                                <div className="col-span-full py-12 text-center opacity-50 text-sm">
                                    {tListen('noSearchResults', language)}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ListenSurahSelectModal;

