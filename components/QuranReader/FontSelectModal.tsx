import React, { FC } from 'react';
import { FONTS, ENGLISH_FONTS, FontItem, ReadingMode } from './constants';
import { useLanguage } from '../../context/LanguageContext';

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

const FontSelectModal: FC<{
    isOpen: boolean,
    onClose: () => void,
    onSelect: (fontId: string) => void,
    currentFontId: string,
    isLandscape?: boolean,
    readingMode?: ReadingMode | string
}> = ({ isOpen, onClose, onSelect, currentFontId, isLandscape, readingMode }) => {
    const { language, dir } = useLanguage();
    const isEn = language === 'en';
    if (!isOpen) return null;

    const isTranslationMode = readingMode === 'translation';
    // If in translation mode: ONLY show distinctive English fonts, completely hide Arabic fonts!
    // In any other mode: ONLY show Arabic fonts, hide English fonts!
    const fonts: FontItem[] = isTranslationMode ? ENGLISH_FONTS : FONTS;

    const modalTitle = isTranslationMode 
        ? (isEn ? "English Translation Fonts" : "خطوط الترجمة الإنجليزية للمصحف")
        : (isEn ? "Arabic Quran Fonts" : "خطوط المصحف الشريف");

    return (
        <div className={`fixed inset-0 z-[1200] bg-black/40 backdrop-blur-sm flex justify-center items-center ${isLandscape ? 'p-0' : 'p-4'} animate-fadeIn`} onClick={onClose}>
            <div 
                dir={isTranslationMode ? 'ltr' : dir} 
                className={`modal-skinned w-full ${isLandscape ? 'max-w-4xl h-full rounded-none max-h-screen' : 'max-w-md sm:max-w-2xl rounded-2xl max-h-[90vh]'} shadow-2xl flex flex-col animate-modal-enter overflow-hidden`} 
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-3.5 border-b flex items-center justify-between shrink-0" style={{ borderColor: 'var(--qr-card-border)' }}>
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-bold truncate" style={{ color: 'var(--qr-card-text)' }}>
                            {modalTitle}
                        </span>
                        {isTranslationMode && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/30">
                                English Only
                            </span>
                        )}
                    </div>
                    <button 
                        onClick={onClose} 
                        className="p-1 rounded-lg hover:opacity-70 transition opacity-60 text-sm font-bold"
                        style={{ color: 'var(--qr-card-text)' }}
                    >
                        <i className="fa-solid fa-times"></i>
                    </button>
                </div>

                {/* Font list */}
                <div className={`p-3.5 overflow-y-auto flex-1 grid ${isLandscape ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3' : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-2.5'}`}>
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
                                onClick={() => onSelect(f.id)} 
                                className={`w-full p-3.5 rounded-xl text-center font-bold transition flex flex-col justify-center items-center gap-1.5 ${isSelected ? 'theme-accent-btn shadow-md ring-2 ring-emerald-500/50' : 'hover:opacity-85'}`} 
                                style={!isSelected ? { 
                                    backgroundColor: 'var(--qr-card-bg)', 
                                    color: 'var(--qr-card-text)', 
                                    border: '1px solid var(--qr-card-border)' 
                                } : {}}
                            >
                                <div className="flex items-center justify-between w-full px-1">
                                    <span className="text-sm font-bold truncate">{displayName}</span>
                                    {isSelected && <i className="fa-solid fa-circle-check text-xs"></i>}
                                </div>
                                <span 
                                    className={`w-full truncate px-1 opacity-80 ${isTranslationMode ? 'text-sm text-left font-normal italic tracking-wide' : 'text-xs text-center'}`}
                                    style={{ fontFamily: f.id }}
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
