import React, { FC, useEffect, useMemo } from 'react';
import { X } from 'lucide-react';
import { FONTS, ENGLISH_FONTS, FontItem, ReadingMode, THEMES } from './constants';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { registerBackInterceptor } from '../../hooks/useBackButton';
import { resolveQuranModalPalette } from './modalThemeUtils';

const FONT_NAMES_EN: Record<string, string> = {
    "نسخ": "Naskh",
    "نسخ حديث": "Modern Naskh",
    "تراثي": "Traditional",
    "ثلوث": "Thuluth",
    "رقعة": "Ruq'ah",
    "ورش": "Warsh",
    "حفص": "Hafs",
    "خط المصحف": "Mushaf Font",
    "قطيبة": "Katibeh",
    "قلم": "Qalam",
    "كوفي": "Kufi",
    "مجمع الملك فهد": "King Fahd Complex",
    "مجود": "Mujawwad",
    "ميرزا": "Mirza"
};

const resolveFallbackTheme = (themeKey: string, isNightMode: boolean, homeThemeVariant: string) => {
    if (isNightMode || themeKey === 'black' || themeKey === 'black_gold') return THEMES.deep_black;
    if (homeThemeVariant === 'gold' || themeKey === 'shiny_gold' || themeKey === 'gold') return THEMES.gold;
    if (homeThemeVariant === 'sky' || themeKey === 'sky') return THEMES.night_sky;
    if (homeThemeVariant === 'emerald' || themeKey === 'emerald') return THEMES.green;
    if (homeThemeVariant === 'burgundy' || themeKey === 'burgundy') return THEMES.maroon;
    return THEMES.black;
};

const FontSelectModal: FC<{
    isOpen: boolean,
    onClose: () => void,
    onSelect: (fontId: string) => void,
    currentFontId: string,
    isLandscape?: boolean,
    readingMode?: ReadingMode | string,
    currentTheme?: any
}> = ({ isOpen, onClose, onSelect, currentFontId, isLandscape, readingMode, currentTheme }) => {
    const { language, dir } = useLanguage();
    const { themeKey, isNightMode, homeThemeVariant } = useTheme();
    const isEn = language === 'en';

    useEffect(() => {
        if (!isOpen) return;
        const interceptor = () => {
            onClose();
            return true;
        };
        const unregister = registerBackInterceptor(interceptor);
        return unregister;
    }, [isOpen, onClose]);

    const effectiveTheme = useMemo(() => {
        return currentTheme || resolveFallbackTheme(themeKey, isNightMode, homeThemeVariant);
    }, [currentTheme, themeKey, isNightMode, homeThemeVariant]);

    const p = useMemo(() => resolveQuranModalPalette(effectiveTheme), [effectiveTheme]);

    if (!isOpen) return null;

    const isTranslationMode = readingMode === 'translation';
    const fonts: FontItem[] = isTranslationMode ? ENGLISH_FONTS : FONTS;

    const modalTitle = isTranslationMode 
        ? (isEn ? "English Translation Fonts" : "خطوط الترجمة الإنجليزية للمصحف")
        : (isEn ? "Arabic Quran Fonts" : "خطوط المصحف الشريف");

    return (
        <div className={`fixed inset-0 z-[1200] bg-black/55 flex justify-center items-center ${isLandscape ? 'p-2' : 'p-4'} font-cairo select-none`} onClick={onClose}>
            <div 
                dir={isTranslationMode ? 'ltr' : dir} 
                className={`modal-skinned settings-3d-adia-scope ${p.isDark ? 'settings-3d-dark quran-3d-dark' : ''} ${isLandscape ? 'w-[60%] max-w-[420px] max-h-[86%] rounded-3xl' : 'w-full max-w-md sm:max-w-2xl rounded-3xl max-h-[88dvh]'} shadow-2xl flex flex-col overflow-hidden border-0`} 
                style={{
                    fontFamily: p.fontFamily,
                    backgroundColor: p.modalBg,
                    color: p.modalText,
                    border: 'none',
                    outline: 'none'
                }}
                onClick={e => e.stopPropagation()}
            >
                {/* Canonical Raised Header */}
                <div className={isLandscape ? "p-2.5 pb-1.5 shrink-0 border-0" : "p-3.5 pb-2 shrink-0 border-0"}>
                    <div 
                        className={`${isLandscape ? 'py-1.5 px-3 rounded-xl' : 'py-2.5 px-3.5 rounded-2xl'} flex items-center justify-between quran-raised-card border-0`}
                        style={{ backgroundColor: p.headerBg }}
                    >
                        <div className="flex items-center gap-2">
                            <span className={`${isLandscape ? 'text-xs' : 'text-xs sm:text-sm'} font-black tracking-wide`} style={{ color: p.headerAccent }}>
                                {modalTitle}
                            </span>
                            {isTranslationMode && (
                                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold" style={{ backgroundColor: p.selectedBg, color: p.selectedText }}>
                                    English Only
                                </span>
                            )}
                        </div>
                        <button 
                            type="button"
                            onClick={onClose} 
                            className={`${isLandscape ? 'w-7 h-7' : 'w-8 h-8'} quran-raised-btn rounded-full flex items-center justify-center border-0 cursor-pointer shrink-0`}
                            style={{ backgroundColor: p.closeBg, color: p.headerAccent }}
                            aria-label={isEn ? "Close" : "إغلاق"}
                        >
                            <X size={isLandscape ? 14 : 16} />
                        </button>
                    </div>
                </div>

                {/* Font list */}
                <div 
                    className={`${isLandscape ? 'p-2.5 pt-1.5 pb-3 grid-cols-2 gap-2.5' : 'p-3.5 pt-2 pb-5 grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-3'} overflow-y-auto flex-1 min-h-0 custom-scrollbar grid`}
                >
                    {fonts.map(f => {
                        const isSelected = isTranslationMode
                            ? (currentFontId === f.id || ((!currentFontId || currentFontId.startsWith('var(--font-')) && f.id === ENGLISH_FONTS[0].id))
                            : currentFontId === f.id;

                        const displayName = isTranslationMode 
                            ? (f.nameEn || f.name)
                            : (isEn ? (FONT_NAMES_EN[f.name] || f.name) : f.name);

                        const previewText = isTranslationMode
                            ? (f.previewEn || "In the name of Allah, the Entirely Merciful")
                            : "﴿بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ﴾";

                        return (
                            <button 
                                key={f.id} 
                                type="button"
                                onClick={() => onSelect(f.id)} 
                                className={`w-full ${isLandscape ? 'p-2.5 rounded-xl gap-1' : 'p-3.5 rounded-2xl gap-1.5'} text-center font-bold transition-all flex flex-col justify-center items-center cursor-pointer border-0 ${
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
                                <div className="flex items-center justify-center w-full px-1">
                                    <span className="text-sm font-bold truncate text-center">{displayName}</span>
                                </div>
                                <span 
                                    className={`w-full truncate px-1 opacity-95 font-preview font-quran ${isTranslationMode ? 'text-sm text-left font-normal italic tracking-wide' : 'text-base sm:text-lg text-center font-normal'}`}
                                    style={{ fontFamily: f.id, fontStyle: 'normal' }}
                                >
                                    {previewText}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default FontSelectModal;
