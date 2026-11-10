import React, { FC } from 'react';
import { X } from 'lucide-react';
import { TAFSEERS, getTafseerDisplayName } from './constants';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';

const extractColor = (val?: string, fallback = '#3b82f6'): string => {
    if (!val) return fallback;
    if (val.includes('#')) {
        const match = val.match(/#[0-9a-fA-F]{3,8}/);
        if (match) return match[0];
    }
    return val;
};

const TafseerSelectionModal: FC<{
    isOpen: boolean,
    onClose: () => void,
    onSelect: (tafseerId: string) => void,
    currentTafseerId: string,
    isLandscape?: boolean,
    currentTheme?: any
}> = ({ isOpen, onClose, onSelect, currentTafseerId, isLandscape, currentTheme }) => {
    const { theme } = useTheme();
    const { language, dir } = useLanguage();
    const isEn = language === 'en';
    if (!isOpen) return null;

    const themeBorderColor = currentTheme?.id === 'deep_black'
        ? '#ffffff'
        : extractColor(
            currentTheme?.barBorder || currentTheme?.cardBorder || currentTheme?.accent || theme?.palette?.[0],
            '#3b82f6'
        );

    return (
        <div className={`fixed inset-0 z-[1200] bg-black/40 backdrop-blur-sm flex items-center justify-center ${isLandscape ? 'p-2' : 'p-4'} animate-fadeIn`} onClick={onClose}>
            <div dir={dir} className={`modal-skinned w-full ${isLandscape ? 'max-w-[320px] max-h-[90vh] rounded-2xl' : 'max-w-[300px] rounded-3xl max-h-[80vh]'} shadow-2xl flex flex-col overflow-hidden animate-modal-enter border-0`} 
                style={{ 
                    fontFamily: currentTheme?.font,
                    backgroundColor: currentTheme?.modalBg || 'var(--qr-modal-bg, #FFF)', 
                    color: currentTheme?.modalText || 'var(--qr-modal-text, #000)', 
                    border: 'none', 
                    outline: 'none' 
                }}
                onClick={e => e.stopPropagation()}>
                {/* Header Bar */}
                <div className={`${isLandscape ? 'px-3 pt-3 pb-1' : 'px-4 pt-4 pb-1'} shrink-0`}>
                    <div 
                        className="py-2 px-3 rounded-2xl flex items-center justify-between transition-colors quran-raised-card border-0"
                        style={{
                            backgroundColor: `${themeBorderColor}12`,
                        }}
                    >
                        <span className="text-xs font-black tracking-wide" style={{ color: themeBorderColor }}>
                            {isEn ? "Select Tafseer" : "اختيار التفسير"}
                        </span>
                        <button 
                            onClick={onClose} 
                            className="p-1.5 quran-raised-btn rounded-full transition-all active:scale-90 flex items-center justify-center border-0 cursor-pointer"
                            style={{ color: themeBorderColor }}
                            title={isEn ? "Close" : "إغلاق"}
                        >
                            <X size={16} />
                        </button>
                    </div>
                </div>

                <div className={`${isLandscape ? 'p-3 pt-2.5 gap-2.5' : 'p-4 pt-3 gap-3'} overflow-y-auto flex-1 flex flex-col`}>
                    {TAFSEERS.map(t => {
                        const isSelected = currentTafseerId === t.id;
                        return (
                            <button key={t.id} onClick={() => onSelect(t.id)} 
                                className={`w-full ${isLandscape ? 'py-2.5 px-3 text-sm' : 'py-3 px-4 text-base'} rounded-xl font-bold transition-all flex items-center justify-center text-center gap-2 cursor-pointer ${isSelected ? 'quran-raised-btn-selected shadow-md' : 'quran-raised-btn'}`} 
                                style={{ 
                                    backgroundColor: isSelected ? 'var(--qr-accent)' : 'var(--qr-card-bg)', 
                                    color: isSelected ? 'var(--qr-accent-text, #ffffff)' : 'var(--qr-card-text)'
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
