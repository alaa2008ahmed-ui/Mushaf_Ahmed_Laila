
import React, { useRef, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { presetThemes } from '../context/themes';
import { showGlobalAppToast } from '../utils/appNotificationSettings';

const englishThemeNames: { [key: string]: string } = {
    black_gold: 'Black & Gold',
    default: 'Default',
    deep_black: 'Deep Black',
    shiny_gold: 'Shiny Gold',
    sky_mode: 'Sky Mode',
    emerald_mode: 'Emerald Mode',
    burgundy_mode: 'Burgundy Mode',
    fajr_light: 'Fajr Light',
    golden_sand: 'Golden Sand',
    olive_grove: 'Olive Grove',
    kaaba_kiswa: 'Kaaba Kiswa',
    evening_tranquility: 'Evening Peace',
    morning_dew: 'Morning Dew',
    madinah_rose: 'Madinah Rose',
    andalusian_garden: 'Andalusian Garden',
    blue_mosque: 'Blue Mosque',
    clay_earth: 'Clay Earth',
    slate_stone: 'Slate Stone',
    sunset_glow: 'Sunset Glow',
    electric_violet: 'Electric Violet',
    sakura_breeze: 'Sakura Breeze',
    midnight_neon: 'Midnight Neon',
    royal_purple: 'Royal Purple',
    desert_night: 'Desert Night',
    ocean_peace: 'Ocean Peace',
    vintage_paper: 'Vintage Paper',
    turquoise_gem: 'Turquoise Gem',
    deep_forest: 'Deep Forest',
    lavender_mist: 'Lavender Mist',
    crystal_glass: 'Crystal Glass',
    frosted_emerald: 'Frosted Emerald',
    midnight_glass: 'Midnight Glass',
};

function ThemeSelector({ onClose, isLandscape }: { onClose: () => void, isLandscape?: boolean }) {
    const { theme, themeKey, applyPresetTheme, setCustomBackground, resetBackground, setHomeThemeVariant } = useTheme();
    const { language } = useLanguage();
    const isEn = language === 'en';
    const fileInputRef = useRef<HTMLInputElement>(null);
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            const target = event.target as Element;
            if (target.closest('[data-id="theme-toggle-button"]')) {
                return;
            }
            if (wrapperRef.current && !wrapperRef.current.contains(target)) {
                onClose();
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [wrapperRef, onClose]);

    useEffect(() => {
        // Scroll to the active theme button after render (Instant jump)
        if (themeKey) {
            const timer = setTimeout(() => {
                const activeButton = wrapperRef.current?.querySelector(`[data-theme-key="${themeKey}"]`);
                if (activeButton) {
                    activeButton.scrollIntoView({ behavior: 'auto', block: 'nearest', inline: 'center' });
                }
            }, 10);
            return () => clearTimeout(timer);
        }
    }, [themeKey]);

    const handleBgUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            const file = event.target.files[0];
            const reader = new FileReader();
            reader.onload = (e) => {
                const result = e.target?.result as string;
                const isVideo = file.type.startsWith('video/');
                setCustomBackground(result, isVideo);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleThemeSelect = (key: string) => {
        applyPresetTheme(key);
        if (key === 'sky_mode') {
            setHomeThemeVariant('sky');
        } else if (key === 'emerald_mode') {
            setHomeThemeVariant('emerald');
        } else if (key === 'burgundy_mode') {
            setHomeThemeVariant('burgundy');
        } else if (key === 'shiny_gold' || key === 'default' || key === 'black_gold') {
            setHomeThemeVariant('gold');
        }
        const themeName = isEn ? (englishThemeNames[key] || presetThemes[key]?.name || key) : (presetThemes[key]?.name || key);
        showGlobalAppToast(isEn ? `Theme: ${themeName}` : `ثيم: ${themeName}`);
        onClose();
    };

    const isBlackTheme = themeKey === 'deep_black' || theme.bgColor === '#000000';

    return (
        <div 
            ref={wrapperRef} 
            className={`theme-selector-container fixed ${isLandscape ? 'inset-0 flex items-center justify-center p-0' : 'bottom-[calc(var(--app-bottom-clearance,5.25rem)+0.5rem)] inset-x-0 mx-auto w-[95%] max-w-md p-0'} z-[100]`}
            dir={isEn ? 'ltr' : 'rtl'}
        >
            <div 
                className={`themed-card p-4 ${isLandscape ? 'w-full max-w-4xl h-full rounded-none overflow-y-auto modal-sheet-safe-bottom' : 'rounded-3xl'} shadow-2xl backdrop-blur-md flex flex-col justify-center border-2`} 
                style={{ 
                    backgroundColor: isBlackTheme ? '#0a0a0c' : '#FFFFFF', 
                    color: isBlackTheme ? '#FFFFFF' : '#0f172a',
                    borderColor: isBlackTheme ? 'rgba(255, 255, 255, 0.25)' : 'rgba(14, 165, 233, 0.35)' 
                }}
            >
                <div className={isLandscape ? 'max-w-lg mx-auto w-full' : 'w-full'}>
                    {/* Top Row: Main 4 Home Themes */}
                    <div className="grid grid-cols-4 gap-1.5 mb-2.5">
                        <button 
                            data-theme-key="shiny_gold" 
                            onClick={() => handleThemeSelect('shiny_gold')} 
                            className="p-2 rounded-xl font-bold flex flex-col items-center justify-center transition-all active:scale-95 shadow-sm border cursor-pointer" 
                            style={{
                                backgroundColor: '#fef08a', 
                                color: '#78350f',
                                borderColor: themeKey === 'shiny_gold' ? '#b45309' : '#eab308'
                            }} 
                            title={isEn ? 'Royal Gold' : 'الذهبي الملكي'}
                        >
                            <span className="text-lg">👑</span>
                            <span className="text-[9.5px] font-black mt-0.5 text-[#78350f] truncate w-full text-center">
                                {isEn ? 'Gold' : 'الذهبي'}
                            </span>
                        </button>

                        <button 
                            data-theme-key="sky_mode" 
                            onClick={() => handleThemeSelect('sky_mode')} 
                            className="p-2 rounded-xl font-bold flex flex-col items-center justify-center transition-all active:scale-95 shadow-sm border cursor-pointer" 
                            style={{
                                backgroundColor: '#e0f2fe', 
                                color: '#0369a1',
                                borderColor: themeKey === 'sky_mode' ? '#0284c7' : '#7dd3fc'
                            }} 
                            title={isEn ? 'Sky Mode' : 'الوضع السماوي'}
                        >
                            <span className="text-lg">☁️</span>
                            <span className="text-[9.5px] font-black mt-0.5 text-[#0369a1] truncate w-full text-center">
                                {isEn ? 'Sky' : 'السماوي'}
                            </span>
                        </button>

                        <button 
                            data-theme-key="emerald_mode" 
                            onClick={() => handleThemeSelect('emerald_mode')} 
                            className="p-2 rounded-xl font-bold flex flex-col items-center justify-center transition-all active:scale-95 shadow-sm border cursor-pointer" 
                            style={{
                                backgroundColor: '#dcfce7', 
                                color: '#047857',
                                borderColor: themeKey === 'emerald_mode' ? '#047857' : '#6ee7b7'
                            }} 
                            title={isEn ? 'Emerald Mode' : 'الوضع الزمردي'}
                        >
                            <span className="text-lg">🌿</span>
                            <span className="text-[9.5px] font-black mt-0.5 text-[#047857] truncate w-full text-center">
                                {isEn ? 'Emerald' : 'الزمردي'}
                            </span>
                        </button>

                        <button 
                            data-theme-key="burgundy_mode" 
                            onClick={() => handleThemeSelect('burgundy_mode')} 
                            className="p-2 rounded-xl font-bold flex flex-col items-center justify-center transition-all active:scale-95 shadow-sm border cursor-pointer" 
                            style={{
                                backgroundColor: '#ffe4e6', 
                                color: '#881337',
                                borderColor: themeKey === 'burgundy_mode' ? '#881337' : '#fda4af'
                            }} 
                            title={isEn ? 'Burgundy Mode' : 'الوضع العنابي'}
                        >
                            <span className="text-lg">🍇</span>
                            <span className="text-[9.5px] font-black mt-0.5 text-[#881337] truncate w-full text-center">
                                {isEn ? 'Burgundy' : 'العنابي'}
                            </span>
                        </button>
                    </div>

                    {/* Secondary Row: Background Image Upload & Reset */}
                    <div className="grid grid-cols-2 gap-2 mb-3">
                        <button 
                            onClick={() => fileInputRef.current?.click()} 
                            className="p-2 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 shadow-sm border cursor-pointer" 
                            style={{
                                backgroundColor: isBlackTheme ? 'rgba(255,255,255,0.1)' : '#f1f5f9', 
                                color: isBlackTheme ? '#ffffff' : '#0f172a',
                                borderColor: isBlackTheme ? 'rgba(255,255,255,0.2)' : '#cbd5e1'
                            }} 
                            title={isEn ? 'Custom Background' : 'خلفية خاصة'}
                        >
                            <span className="text-base">🖼️</span>
                            <span className="text-[11px] font-bold">
                                {isEn ? 'Custom BG' : 'خلفية خاصة'}
                            </span>
                        </button>

                        <button 
                            onClick={resetBackground} 
                            className="p-2 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 shadow-sm border cursor-pointer" 
                            style={{
                                backgroundColor: isBlackTheme ? 'rgba(255,255,255,0.1)' : '#f1f5f9', 
                                color: isBlackTheme ? '#ffffff' : '#0f172a',
                                borderColor: isBlackTheme ? 'rgba(255,255,255,0.2)' : '#cbd5e1'
                            }} 
                            title={isEn ? 'Reset Default' : 'استعادة الافتراضي'}
                        >
                            <span className="text-base">🔄</span>
                            <span className="text-[11px] font-bold">
                                {isEn ? 'Reset BG' : 'استعادة الافتراضي'}
                            </span>
                        </button>
                    </div>

                    <div className="h-[1px] w-full mb-3 opacity-20 bg-slate-400 dark:bg-slate-600"></div>

                    <div className={`flex flex-wrap gap-2 justify-center ${isLandscape ? 'max-h-[50dvh]' : 'max-h-[160px]'} overflow-y-auto hide-scrollbar pb-2`}>
                        {Object.entries(presetThemes).map(([key, themeOption]) => {
                            const isThemeOptionBlack = key === 'deep_black' || themeOption.bgColor === '#000000';
                            const isSelected = themeKey === key;

                            let buttonBg = themeOption.bgColor || '#ffffff';
                            let buttonTextColor = isThemeOptionBlack ? '#ffffff' : (themeOption.textColor && themeOption.textColor !== '#ffffff' ? themeOption.textColor : '#0f172a');
                            let buttonBorderColor = isSelected ? '#0284c7' : (isThemeOptionBlack ? 'rgba(255, 255, 255, 0.4)' : '#cbd5e1');

                            if (key === 'sky_mode') {
                                buttonBg = '#e0f2fe';
                                buttonTextColor = '#0369a1';
                                buttonBorderColor = isSelected ? '#0284c7' : '#7dd3fc';
                            } else if (key === 'emerald_mode') {
                                buttonBg = '#dcfce7';
                                buttonTextColor = '#047857';
                                buttonBorderColor = isSelected ? '#047857' : '#6ee7b7';
                            } else if (key === 'burgundy_mode') {
                                buttonBg = '#ffe4e6';
                                buttonTextColor = '#881337';
                                buttonBorderColor = isSelected ? '#881337' : '#fda4af';
                            } else if (key === 'shiny_gold') {
                                buttonBg = '#fef08a';
                                buttonTextColor = '#78350f';
                                buttonBorderColor = isSelected ? '#b45309' : '#fde047';
                            }

                            const displayName = isEn ? (englishThemeNames[key] || themeOption.name) : themeOption.name;

                            return (
                                <button
                                    key={key}
                                    data-theme-key={key}
                                    onClick={() => handleThemeSelect(key)}
                                    className="theme-selector-button w-[88px] h-11 rounded-xl border-2 text-[11px] font-black flex items-center justify-center text-center shadow-xs transition-all active:scale-95 hover:brightness-105 cursor-pointer"
                                    style={{
                                        backgroundColor: buttonBg,
                                        color: buttonTextColor,
                                        borderColor: buttonBorderColor,
                                        transform: isSelected ? 'scale(1.05)' : 'scale(1)',
                                        boxShadow: isSelected ? '0 0 10px rgba(2, 132, 199, 0.5)' : 'none',
                                        fontWeight: 900
                                    }}
                                >
                                    {displayName}
                                </button>
                            );
                        })}
                    </div>
                </div>
                <input type="file" ref={fileInputRef} id="bg-upload" accept="image/*,video/*" className="sr-only absolute w-0 h-0 opacity-0 overflow-hidden pointer-events-none" onChange={handleBgUpload} />
            </div>
        </div>
    );
}

export default ThemeSelector;
