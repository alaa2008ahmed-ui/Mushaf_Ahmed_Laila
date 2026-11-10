import React, { FC } from 'react';
import { X } from 'lucide-react';

interface AutoScrollSettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectTime: (minutes: number) => void;
    currentMinutes: number;
    isLandscape?: boolean;
    isEn?: boolean;
    currentTheme?: any;
}

const extractModalAccentColor = (val?: string, fallback = '#3b82f6'): string => {
    if (!val) return fallback;
    if (val.includes('#')) {
        const match = val.match(/#[0-9a-fA-F]{3,8}/);
        if (match) return match[0];
    }
    return val;
};

const AutoScrollSettingsModal: FC<AutoScrollSettingsModalProps> = ({ 
    isOpen, 
    onClose, 
    onSelectTime, 
    currentMinutes, 
    isLandscape, 
    isEn = false,
    currentTheme 
}) => {
    if (!isOpen) return null;
    const options = Array.from({length: 56}, (_, i) => i + 5);
    const isDeepBlack = currentTheme?.id === 'deep_black';

    const accentColor = isDeepBlack
        ? '#ffffff'
        : extractModalAccentColor(
            currentTheme?.barBorder || currentTheme?.cardBorder || currentTheme?.accent,
            '#3b82f6'
        );

    return (
        <div className={`fixed inset-0 z-[1200] bg-black/30 backdrop-blur-sm flex items-center justify-center ${isLandscape ? 'p-0' : 'p-4'} animate-fadeIn`} onClick={onClose} dir={isEn ? "ltr" : "rtl"}>
            <div 
                className={`modal-skinned w-full ${isLandscape ? 'max-w-xl max-h-[90vh] rounded-3xl' : 'max-w-sm sm:max-w-2xl rounded-3xl max-h-[85vh]'} shadow-2xl flex flex-col border-none animate-modal-enter overflow-hidden`} 
                style={{
                    backgroundColor: currentTheme?.modalBg || currentTheme?.bg || '#ffffff',
                    color: currentTheme?.modalText || currentTheme?.text || '#000000'
                }}
                onClick={e => e.stopPropagation()}
            >
                {/* Header Bar - Identical to Colors & Customization Modal */}
                <div className="p-3.5 shrink-0">
                    <div 
                        className="py-2 px-3 rounded-2xl flex items-center justify-between transition-colors quran-raised-card border-0"
                        style={{
                            backgroundColor: isDeepBlack ? 'rgba(255, 255, 255, 0.08)' : `${accentColor}12`,
                        }}
                    >
                        <span className="text-xs sm:text-sm font-black tracking-wide" style={{ color: accentColor }}>
                            {isEn ? "Auto-Scroll Speed (Minutes)" : "وقت التمرير (بالدقائق)"}
                        </span>
                        <button 
                            onClick={onClose} 
                            className="p-1.5 quran-raised-btn rounded-full transition-all active:scale-90 flex items-center justify-center border-0 cursor-pointer"
                            style={{ color: accentColor }}
                            title={isEn ? "Close" : "إغلاق"}
                        >
                            <X size={16} />
                        </button>
                    </div>
                </div>

                <div className={`p-3.5 pt-1 overflow-y-auto flex-1 grid ${isLandscape ? 'grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-2.5' : 'grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2.5'}`}>
                    {options.map(m => {
                        const isSelected = currentMinutes === m;
                        return (
                            <button 
                                key={m} 
                                onClick={() => { onSelectTime(m); onClose(); }} 
                                className={`p-2.5 rounded-xl text-center font-bold transition-all border-none quran-raised-btn flex flex-col items-center justify-center cursor-pointer ${isSelected ? 'theme-accent-btn quran-raised-btn-selected scale-105' : 'themed-card-bg'}`}
                            >
                                <span className="text-sm font-black">{m}</span>
                                <span className="text-[10px] block opacity-80 mt-0.5">{isEn ? "min" : "دقيقة"}</span>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default AutoScrollSettingsModal;
