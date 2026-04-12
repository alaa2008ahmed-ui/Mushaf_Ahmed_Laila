
import React, { useRef, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { presetThemes } from '../context/themes';

function ThemeSelector({ onClose, isLandscape }: { onClose: () => void, isLandscape?: boolean }) {
    const { theme, themeKey, applyPresetTheme, setCustomBackground, resetBackground } = useTheme();
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

    return (
        <div 
            ref={wrapperRef} 
            className={`theme-selector-container fixed ${isLandscape ? 'inset-0 flex items-center justify-center p-0' : 'bottom-[calc(70px+env(safe-area-inset-bottom,0px))] left-1/2 -translate-x-1/2 w-full max-w-lg p-2'} z-50`}
        >
            <div className={`themed-card p-3 ${isLandscape ? 'w-full max-w-4xl h-full rounded-none' : 'rounded-2xl'} shadow-2xl !backdrop-blur-none !bg-opacity-100 flex flex-col justify-center`} style={{ backgroundColor: theme.bgColor || '#fff' }}>
                <div className={isLandscape ? 'max-w-lg mx-auto w-full' : ''}>
                    <div className="grid grid-cols-3 gap-2 mb-2">
                        <button onClick={() => fileInputRef.current?.click()} className="p-2 rounded-lg font-bold text-[10px] flex flex-col items-center justify-center gap-1" style={{backgroundColor: theme.palette[0] + '30', color: theme.textColor, border: theme.btnBorder || 'none'}}>
                            <span>🖼️</span>
                            <span>خلفية مخصصة</span>
                        </button>
                        <button onClick={resetBackground} className="p-2 rounded-lg font-bold text-[10px] flex flex-col items-center justify-center gap-1" style={{backgroundColor: theme.palette[1] + '30', color: theme.textColor, border: theme.btnBorder || 'none'}}>
                            <span>🔄</span>
                            <span>استعادة</span>
                        </button>
                        <button onClick={() => applyPresetTheme('default')} className="p-2 rounded-lg font-bold text-[10px] flex flex-col items-center justify-center gap-1" style={{backgroundColor: theme.palette[2] + '30', color: theme.textColor, border: theme.btnBorder || 'none'}}>
                            <span>🎨</span>
                            <span>الافتراضي</span>
                        </button>
                    </div>

                    <div className="h-[1px] w-full my-2" style={{ backgroundColor: 'var(--card-border)' }}></div>

                    <div className={`flex flex-wrap gap-2 justify-center ${isLandscape ? 'max-h-[60vh]' : 'max-h-[120px]'} overflow-y-auto hide-scrollbar`}>
                        {Object.entries(presetThemes).filter(([key]) => key !== 'default').map(([key, themeOption], index) => (
                            <button
                                key={key}
                                onClick={() => applyPresetTheme(key)}
                                className="theme-selector-button w-20 h-12 rounded-lg border-2 text-[9px] font-bold flex items-center justify-center text-center shadow-sm transition-transform active:scale-95"
                                    style={{
                                        animationDelay: `${index * 0.04}s`,
                                        backgroundColor: themeOption.bgColor || '#fff',
                                        backgroundSize: 'cover',
                                        color: themeOption.textColor || '#000',
                                        borderColor: themeKey === key ? theme.palette[1] : themeOption.palette[0],
                                        transform: themeKey === key ? 'scale(1.05)' : 'scale(1)',
                                    }}
                            >
                                {themeOption.name}
                            </button>
                        ))}
                    </div>
                </div>
                <input type="file" ref={fileInputRef} id="bg-upload" accept="image/*,video/*" className="hidden" onChange={handleBgUpload} />
            </div>
        </div>
    );
}

export default ThemeSelector;
