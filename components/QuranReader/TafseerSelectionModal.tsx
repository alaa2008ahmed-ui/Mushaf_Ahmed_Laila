import React, { FC, useEffect } from 'react';
import { X } from 'lucide-react';
import { TAFSEERS, getTafseerDisplayName } from './constants';
import { useLanguage } from '../../context/LanguageContext';
import { registerBackInterceptor } from '../../hooks/useBackButton';
import { resolveQuranModalPalette } from './modalThemeUtils';

const TafseerSelectionModal: FC<{
    isOpen: boolean,
    onClose: () => void,
    onSelect: (tafseerId: string) => void,
    currentTafseerId: string,
    isLandscape?: boolean,
    currentTheme?: any
}> = ({ isOpen, onClose, onSelect, currentTafseerId, isLandscape, currentTheme }) => {
    const { language, dir } = useLanguage();
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

    if (!isOpen) return null;

    const p = resolveQuranModalPalette(currentTheme);

    return (
        <div className={`fixed inset-0 z-[1200] bg-black/55 flex items-center justify-center ${isLandscape ? 'p-2' : 'p-4'}`} onClick={onClose}>
            <div dir={dir} className={`modal-skinned settings-3d-adia-scope ${p.isDark ? 'settings-3d-dark quran-3d-dark' : ''} ${isLandscape ? 'w-[54%] max-w-[360px] max-h-[84%] rounded-3xl' : 'w-full max-w-[310px] rounded-3xl max-h-[85dvh]'} flex flex-col overflow-hidden border-0`} 
                style={{ 
                    fontFamily: p.fontFamily,
                    backgroundColor: p.modalBg, 
                    color: p.modalText, 
                    border: 'none', 
                    outline: 'none' 
                }}
                onClick={e => e.stopPropagation()}>
                {/* Canonical Raised Header */}
                <div className={isLandscape ? "p-2.5 pb-1.5 shrink-0" : "p-3.5 pb-2 shrink-0"}>
                    <div 
                        className={`${isLandscape ? 'py-1.5 px-3 rounded-xl' : 'py-2.5 px-3.5 rounded-2xl'} flex items-center justify-between quran-raised-card border-0`}
                        style={{
                            backgroundColor: p.headerBg,
                        }}
                    >
                        <span className={`${isLandscape ? 'text-xs' : 'text-xs sm:text-sm'} font-black tracking-wide`} style={{ color: p.headerAccent }}>
                            {isEn ? "Select Tafseer" : "اختيار التفسير"}
                        </span>
                        <button 
                            type="button"
                            onClick={onClose} 
                            className={`${isLandscape ? 'w-7 h-7' : 'w-8 h-8'} quran-raised-btn rounded-full flex items-center justify-center border-0 cursor-pointer`}
                            style={{ backgroundColor: p.closeBg, color: p.headerAccent }}
                            aria-label={isEn ? "Close" : "إغلاق"}
                        >
                            <X size={isLandscape ? 14 : 16} />
                        </button>
                    </div>
                </div>

                <div 
                    className={isLandscape ? "p-2.5 pt-1.5 pb-3 grid grid-cols-2 gap-2 overflow-y-auto flex-1 min-h-0" : "p-3.5 pt-2 pb-4 gap-3 overflow-y-auto flex-1 min-h-0 flex flex-col"}
                >
                    {TAFSEERS.map(t => {
                        const isSelected = currentTafseerId === t.id;
                        return (
                            <button key={t.id} onClick={() => onSelect(t.id)} 
                                className={`w-full ${isLandscape ? 'py-2 px-2.5 text-xs rounded-xl' : 'py-3 px-4 text-base rounded-2xl'} font-bold flex items-center justify-center text-center gap-2 cursor-pointer border-0 ${isSelected ? 'quran-raised-btn-selected' : 'quran-raised-btn'}`} 
                                style={{ 
                                    backgroundColor: isSelected ? p.selectedBg : p.cardBg, 
                                    color: isSelected ? p.selectedText : p.cardText
                                }}>
                                <span className="font-bold truncate text-center flex-1">{getTafseerDisplayName(t.id, language as 'ar' | 'en')}</span>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default TafseerSelectionModal;
