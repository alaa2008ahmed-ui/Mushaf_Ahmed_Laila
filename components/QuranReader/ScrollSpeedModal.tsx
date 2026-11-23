import React, { FC, useEffect } from 'react';
import { X } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { registerBackInterceptor } from '../../hooks/useBackButton';
import { THEMES } from './constants';
import { resolveQuranModalPalette } from './modalThemeUtils';

interface ScrollSpeedModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (minutes: number) => void;
    currentMinutes: number;
    isLandscape?: boolean;
    currentTheme?: any;
    zIndexClass?: string;
    isEnOverride?: boolean;
}

const resolveFallbackTheme = (themeKey: string, isNightMode: boolean, homeThemeVariant: string) => {
    if (isNightMode || themeKey === 'black' || themeKey === 'black_gold') return THEMES.deep_black;
    if (homeThemeVariant === 'gold' || themeKey === 'shiny_gold' || themeKey === 'gold') return THEMES.gold;
    if (homeThemeVariant === 'sky' || themeKey === 'sky') return THEMES.night_sky;
    if (homeThemeVariant === 'emerald' || themeKey === 'emerald') return THEMES.green;
    if (homeThemeVariant === 'burgundy' || themeKey === 'burgundy') return THEMES.maroon;
    return THEMES.black;
};

const ScrollSpeedModal: FC<ScrollSpeedModalProps> = ({
    isOpen,
    onClose,
    onSelect,
    currentMinutes,
    isLandscape,
    currentTheme,
    zIndexClass = 'z-[1250]',
    isEnOverride,
}) => {
    const { language } = useLanguage();
    const { themeKey, isNightMode, homeThemeVariant } = useTheme();
    const isEn = isEnOverride ?? (language === 'en');

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
    const options = Array.from({ length: 56 }, (_, i) => i + 5);
    const effectiveTheme = currentTheme || resolveFallbackTheme(themeKey, isNightMode, homeThemeVariant);
    const p = resolveQuranModalPalette(effectiveTheme);

    return (
        <div
            className={`fixed inset-0 ${zIndexClass} bg-black/55 flex items-center justify-center ${isLandscape ? 'p-2' : 'p-4'}`}
            onClick={onClose}
            dir={isEn ? 'ltr' : 'rtl'}
        >
            <div
                className={`modal-skinned scroll-speed-modal-popup settings-3d-adia-scope ${p.isDark ? 'settings-3d-dark quran-3d-dark' : ''} ${isLandscape ? 'w-[56%] max-w-[360px] max-h-[84%] rounded-3xl' : 'w-full max-w-sm sm:max-w-2xl rounded-3xl max-h-[88dvh]'} flex flex-col border-0 overflow-hidden`}
                style={{
                    fontFamily: p.fontFamily,
                    backgroundColor: p.modalBg,
                    color: p.modalText,
                    border: 'none',
                    outline: 'none',
                }}
                onClick={e => e.stopPropagation()}
            >
                {/* Canonical Raised Header */}
                <div className={isLandscape ? "p-2.5 pb-1.5 shrink-0" : "p-3.5 pb-2 shrink-0"}>
                    <div
                        className={`${isLandscape ? 'py-1.5 px-3 rounded-xl' : 'py-2.5 px-3.5 rounded-2xl'} flex items-center justify-between quran-raised-card border-0`}
                        style={{
                            backgroundColor: p.headerBg,
                        }}
                    >
                        <span className={`${isLandscape ? 'text-xs' : 'text-xs sm:text-sm'} font-black tracking-wide`} style={{ color: p.headerAccent }}>
                            {isEn ? 'Auto-Scroll Speed (Minutes)' : 'وقت التمرير (بالدقائق)'}
                        </span>
                        <button
                            type="button"
                            onClick={onClose}
                            className={`${isLandscape ? 'w-7 h-7' : 'w-8 h-8'} rounded-full flex items-center justify-center cursor-pointer quran-raised-btn border-0`}
                            style={{
                                backgroundColor: p.closeBg,
                                color: p.headerAccent,
                            }}
                            aria-label={isEn ? 'Close' : 'إغلاق'}
                        >
                            <X size={isLandscape ? 14 : 16} />
                        </button>
                    </div>
                </div>

                <div
                    className={`${isLandscape ? 'p-2.5 pt-1.5 pb-3 grid-cols-4 gap-2' : 'p-3.5 pt-2 pb-4 grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3'} overflow-y-auto flex-1 min-h-0 custom-scrollbar grid`}
                >
                    {options.map(m => {
                        const isSelected = currentMinutes === m;
                        return (
                            <button
                                key={m}
                                type="button"
                                onClick={() => {
                                    onSelect(m);
                                    onClose();
                                }}
                                className={`${isLandscape ? 'p-2 rounded-xl' : 'p-2.5 rounded-2xl'} text-center font-bold flex flex-col items-center justify-center cursor-pointer border-0 ${isSelected ? 'quran-raised-btn-selected scale-[1.02]' : 'quran-raised-btn'}`}
                                style={{
                                    backgroundColor: isSelected ? p.selectedBg : p.cardBg,
                                    color: isSelected ? p.selectedText : p.cardText,
                                }}
                            >
                                <span className={`${isLandscape ? 'text-xs' : 'text-sm'} font-black tabular-nums`} style={{ color: 'inherit' }}>
                                    {m}
                                </span>
                                <span className={`${isLandscape ? 'text-[9px]' : 'text-[10px]'} block opacity-85 mt-0.5`} style={{ color: 'inherit' }}>
                                    {isEn ? 'min' : 'دقيقة'}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default ScrollSpeedModal;
