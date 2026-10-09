
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

    return (
        <div 
            ref={wrapperRef} 
            className={`theme-selector-container fixed ${isLandscape ? 'inset-0 flex items-center justify-center p-0' : 'bottom-[calc(85px+env(safe-area-inset-bottom,0px))] inset-x-0 mx-auto w-[95%] max-w-md p-0'} z-[100]`}
        >
            <div className={`themed-card p-4 ${isLandscape ? 'w-full max-w-4xl h-full rounded-none' : 'rounded-3xl'} shadow-2xl !backdrop-blur-md !bg-opacity-95 flex flex-col justify-center border-2`} style={{ backgroundColor: theme.bgColor || '#fff', borderColor: theme.palette[0] + '40' }}>
                <div className={isLandscape ? 'max-w-lg mx-auto w-full' : 'w-full'}>
                    <div className="grid grid-cols-3 gap-1.5 mb-4">
                        <button onClick={() => fileInputRef.current?.click()} className="p-2 rounded-xl font-bold text-[10px] flex flex-col items-center justify-center gap-1.5 transition-all active:scale-95 shadow-sm" style={{backgroundColor: theme.palette[0] + '20', color: theme.textColor, borderWidth: '1px', borderStyle: 'solid', borderColor: theme.palette[0] + '40'}}>
                            <span className="text-lg">🖼️</span>
                            <span>خلفية</span>
                        </button>
                        <button onClick={resetBackground} className="p-2 rounded-xl font-bold text-[10px] flex flex-col items-center justify-center gap-1.5 transition-all active:scale-95 shadow-sm" style={{backgroundColor: theme.palette[1] + '20', color: theme.textColor, borderWidth: '1px', borderStyle: 'solid', borderColor: theme.palette[1] + '40'}}>
                            <span className="text-lg">🔄</span>
                            <span>استعادة</span>
                        </button>
                        <button data-theme-key="default" onClick={() => { applyPresetTheme('default'); onClose(); }} className="p-2 rounded-xl font-bold text-[10px] flex flex-col items-center justify-center gap-1.5 transition-all active:scale-95 shadow-sm" style={{backgroundColor: theme.palette[2] + '20', color: theme.textColor, borderWidth: '1px', borderStyle: 'solid', borderColor: theme.palette[2] + '40'}}>
                            <span className="text-lg">🎨</span>
                            <span>الافتراضي</span>
                        </button>
                    </div>

                    <div className="h-[1px] w-full mb-4 opacity-20" style={{ backgroundColor: theme.textColor }}></div>

                    <div className={`flex flex-wrap gap-2.5 justify-center ${isLandscape ? 'max-h-[50vh]' : 'max-h-[160px]'} overflow-y-auto hide-scrollbar pb-2`}>
                        {Object.entries(presetThemes).filter(([key]) => key !== 'default').map(([key, themeOption], index) => (
                            <button
                                key={key}
                                data-theme-key={key}
                                onClick={() => { applyPresetTheme(key); onClose(); }}
                                className="theme-selector-button w-[85px] h-14 rounded-xl border-2 text-[10px] font-bold flex items-center justify-center text-center shadow-sm transition-all active:scale-95 hover:brightness-110"
                                    style={{
                                        backgroundColor: themeOption.bgColor || '#fff',
                                        backgroundSize: 'cover',
                                        color: themeOption.textColor || '#000',
                                        borderColor: themeKey === key ? theme.palette[1] : themeOption.palette[0] + '60',
                                        transform: themeKey === key ? 'scale(1.05)' : 'scale(1)',
                                        boxShadow: themeKey === key ? `0 0 12px ${theme.palette[1]}40` : 'none'
                                    }}
                            >
                                {themeOption.name}
                            </button>
                        ))}
                    </div>
                </div>
                <input type="file" ref={fileInputRef} id="bg-upload" accept="image/*,video/*" className="sr-only absolute w-0 h-0 opacity-0 overflow-hidden pointer-events-none" onChange={handleBgUpload} />
            </div>
        </div>
    );
}

export default ThemeSelector;
