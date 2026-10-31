import React from 'react';
import { 
    THEMES, 
    LIGHT_THEME_IDS, 
    DARK_THEME_IDS, 
    THEME_NAMES_EN, 
    DEFAULT_SETTINGS,
    getCurrentLayoutContext,
    getQuranThemeForLayout,
    saveQuranThemeForLayout,
    syncQuranThemeToStorage
} from './constants';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';

interface ThemesModalProps {
    onClose: () => void;
    showToast: (msg: string) => void;
    isLandscape: boolean;
    readingMode: string;
    modeSuffix: string;
}

const ThemesModal: React.FC<ThemesModalProps> = ({ onClose, showToast, isLandscape, readingMode, modeSuffix }) => {
    const { applyPresetTheme: _unused } = useTheme();
    const { language, isRTL, t: langT } = useLanguage();
    const isEn = language === 'en';
    const layout = getCurrentLayoutContext();
    const currentThemeId = getQuranThemeForLayout(layout, modeSuffix, readingMode);
    const activeTheme = THEMES[currentThemeId as keyof typeof THEMES] || (layout === 'classic' ? THEMES['black'] : THEMES['gold']);

    React.useEffect(() => {
        const activeEl = document.getElementById(`theme-btn-${currentThemeId}`);
        if (activeEl) {
            setTimeout(() => {
                activeEl.scrollIntoView({ behavior: 'auto', block: 'center' });
            }, 10);
        }
    }, [currentThemeId]);

    const [lockHighlightColor, setLockHighlightColor] = React.useState(() => {
        const saved = JSON.parse(localStorage.getItem('quran_settings' + modeSuffix) || '{}');
        return saved.lockHighlightColor || false;
    });

    const [isTransparent, setIsTransparent] = React.useState(() => {
        return localStorage.getItem('transparent_mode' + modeSuffix) === 'true';
    });

    const toggleTransparency = (e: React.MouseEvent) => {
        e.stopPropagation();
        const newValue = !isTransparent;
        setIsTransparent(newValue);
        localStorage.setItem('transparent_mode' + modeSuffix, String(newValue));
        window.dispatchEvent(new Event('theme-change'));
        showToast(newValue ? (isEn ? 'Toolbar transparency enabled' : 'تم تفعيل الشفافية') : (isEn ? 'Toolbar transparency disabled' : 'تم تعطيل الشفافية'));
    };

    const toggleLockHighlightColor = (e: React.MouseEvent) => {
        e.stopPropagation();
        const newValue = !lockHighlightColor;
        setLockHighlightColor(newValue);
        const saved = JSON.parse(localStorage.getItem('quran_settings' + modeSuffix) || '{}');
        const updated = { ...saved, lockHighlightColor: newValue };
        localStorage.setItem('quran_settings' + modeSuffix, JSON.stringify(updated));
        showToast(newValue ? (isEn ? 'Highlight color locked' : 'تم قفل لون التحديد') : (isEn ? 'Highlight color unlocked' : 'تم إلغاء قفل لون التحديد'));
    };

    const applyTheme = (themeId: string) => {
        const theme = THEMES[themeId as keyof typeof THEMES];
        if (!theme) return;

        const currentLayout = getCurrentLayoutContext();
        saveQuranThemeForLayout(themeId, currentLayout, modeSuffix, readingMode);
        syncQuranThemeToStorage(theme, modeSuffix);

        // Dispatch a custom event to notify the main component to reload theme
        window.dispatchEvent(new Event('theme-change'));
        
        const themeDisplayName = isEn ? (THEME_NAMES_EN[themeId] || langT(`theme.${themeId}`, theme.name)) : theme.name;
        showToast(isEn ? `Theme applied: ${themeDisplayName}` : `تم تطبيق ثيم: ${theme.name}`);
        onClose();
    };

    return (
        <div className="fixed z-[1300] bg-black/40 backdrop-blur-sm flex items-center justify-center overflow-hidden" style={{ top: 0, bottom: 0, left: 0, right: 0 }} dir={isRTL ? "rtl" : "ltr"} onClick={onClose}>
            <div className="w-full h-full flex flex-col overflow-hidden shadow-none border-0" style={{ backgroundColor: activeTheme.bg || '#ffffff', border: 'none', outline: 'none' }} onClick={e => e.stopPropagation()}>
                <div className="flex-1 w-full flex flex-col overflow-hidden" style={{ color: activeTheme.text || '#000000' }}>
                    
                    {/* Full Screen Modal Header */}
                    <div className="p-3.5 border-0 flex items-center justify-center shrink-0" style={{ backgroundColor: activeTheme.bg || '#ffffff' }}>
                        <h3 className="text-sm sm:text-base font-black tracking-wide" style={{ color: activeTheme.text }}>
                            {isEn ? 'Choose Theme' : 'اختر الثيم'}
                        </h3>
                    </div>

                    <div className={`px-4 py-3 border-0 flex ${isLandscape ? 'flex-row' : 'flex-wrap'} gap-3 justify-center shrink-0`} style={{ backgroundColor: activeTheme.bg || '#ffffff' }}>
                    <button 
                        onClick={toggleTransparency}
                        className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-bold transition-all border-0 ${isTransparent ? 'quran-raised-btn-selected shadow-md' : 'quran-raised-btn'}`}
                        style={isTransparent ? { backgroundColor: activeTheme.accent, color: activeTheme.accentText } : { backgroundColor: activeTheme.cardBg, color: activeTheme.cardText }}
                        title={isEn ? "Toggle toolbar transparency" : "تفعيل/تعطيل شفافية الأشرطة"}
                    >
                        <i className={`fa-solid ${isTransparent ? 'fa-eye' : 'fa-eye-slash'} quran-3d-icon`}></i>
                        <span className="whitespace-nowrap">{isEn ? 'Toolbar Transparency' : 'شفافية الأشرطة'}</span>
                    </button>
                    <button 
                        onClick={toggleLockHighlightColor}
                        className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-bold transition-all border-0 ${lockHighlightColor ? 'quran-raised-btn-selected shadow-md' : 'quran-raised-btn'}`}
                        style={lockHighlightColor ? { backgroundColor: activeTheme.accent, color: activeTheme.accentText } : { backgroundColor: activeTheme.cardBg, color: activeTheme.cardText }}
                        title={isEn ? "Lock current highlight color" : "قفل لون التحديد الحالي"}
                    >
                        <i className={`fa-solid ${lockHighlightColor ? 'fa-lock' : 'fa-lock-open'} quran-3d-icon`}></i>
                        <span className="whitespace-nowrap">{isEn ? 'Lock Highlight Color' : 'قفل لون التحديد'}</span>
                    </button>
                </div>
                <div className={`overflow-y-auto p-4 grid ${isLandscape ? 'grid-cols-3 sm:grid-cols-4' : 'grid-cols-2'} gap-3.5 flex-1 scrollbar-hide`} style={{ backgroundColor: activeTheme.bg }}>
                    {LIGHT_THEME_IDS.map((key) => {
                        const t = THEMES[key as keyof typeof THEMES];
                        if (!t) return null;
                        const nameDisplay = isEn ? (THEME_NAMES_EN[key] || langT(`theme.${key}`, t.name)) : t.name;
                        const isSelected = currentThemeId === key;
                        return (
                            <button 
                                id={`theme-btn-${key}`}
                                key={key} 
                                onClick={() => applyTheme(key)} 
                                className={`theme-card text-center p-3 rounded-2xl border-0 transition-all ${isSelected ? 'quran-raised-btn-selected shadow-xl scale-[1.02]' : 'quran-raised-card hover:scale-[1.01]'}`}
                                style={isSelected ? { 
                                    backgroundColor: t.accent, 
                                    color: t.accentText,
                                    border: 'none'
                                } as React.CSSProperties : { 
                                    backgroundColor: 'var(--qr-card-bg)', 
                                    color: 'var(--qr-card-text)',
                                    border: 'none'
                                }}
                            >
                                <div className="font-bold mb-2 text-sm flex items-center justify-center gap-2">
                                    {isSelected && <i className="fa-solid fa-check-circle quran-3d-icon"></i>}
                                    <span>{nameDisplay}</span>
                                </div>
                                <div className="w-full h-20 rounded-xl p-2 shadow-inner flex flex-col justify-between" style={{ backgroundColor: t.bg }}>
                                    <div className="w-full h-5 rounded-md" style={{ backgroundColor: t.barBg }}></div>
                                    <p className="text-xs truncate font-bold" style={{ color: t.text, fontFamily: t.font }}>بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</p>
                                    <div className="flex items-center justify-end gap-1.5 mt-1">
                                        <div className="w-[11px] h-[11px] rounded-full shadow-sm" style={{ backgroundColor: t.btnBg }}></div>
                                        <div className="w-[11px] h-[11px] rounded-full shadow-sm" style={{ backgroundColor: key === 'black' ? '#10b981' : t.accent }}></div>
                                    </div>
                                </div>
                            </button>
                        );
                    })}

                    {/* فاصل صغير بين المجموعتين */}
                    <div className={`${isLandscape ? 'col-span-3 sm:col-span-4' : 'col-span-2'} py-2 flex items-center justify-center`}>
                        <div className="w-full h-[1.5px] rounded-full opacity-25" style={{ backgroundColor: activeTheme.text || '#94a3b8' }} />
                    </div>

                    {DARK_THEME_IDS.map((key) => {
                        const t = THEMES[key as keyof typeof THEMES];
                        if (!t) return null;
                        const nameDisplay = isEn ? (THEME_NAMES_EN[key] || langT(`theme.${key}`, t.name)) : t.name;
                        const isSelected = currentThemeId === key;
                        return (
                            <button 
                                id={`theme-btn-${key}`}
                                key={key} 
                                onClick={() => applyTheme(key)} 
                                className={`theme-card text-center p-3 rounded-2xl border-0 transition-all ${isSelected ? 'quran-raised-btn-selected shadow-xl scale-[1.02]' : 'quran-raised-card hover:scale-[1.01]'}`}
                                style={isSelected ? { 
                                    backgroundColor: t.accent, 
                                    color: t.accentText,
                                    border: 'none'
                                } as React.CSSProperties : { 
                                    backgroundColor: 'var(--qr-card-bg)', 
                                    color: 'var(--qr-card-text)',
                                    border: 'none'
                                }}
                            >
                                <div className="font-bold mb-2 text-sm flex items-center justify-center gap-2">
                                    {isSelected && <i className="fa-solid fa-check-circle quran-3d-icon"></i>}
                                    <span>{nameDisplay}</span>
                                </div>
                                <div className="w-full h-20 rounded-xl p-2 shadow-inner flex flex-col justify-between" style={{ backgroundColor: t.bg }}>
                                    <div className="w-full h-5 rounded-md" style={{ backgroundColor: t.barBg }}></div>
                                    <p className="text-xs truncate font-bold" style={{ color: t.text, fontFamily: t.font }}>بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</p>
                                    <div className="flex items-center justify-end gap-1.5 mt-1">
                                        <div className="w-[11px] h-[11px] rounded-full shadow-sm" style={{ backgroundColor: t.btnBg }}></div>
                                        <div className="w-[11px] h-[11px] rounded-full shadow-sm" style={{ backgroundColor: key === 'black' ? '#10b981' : t.accent }}></div>
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>
                <div 
                    className="p-3 border-0 flex gap-2 shrink-0 z-10" 
                    style={{ 
                        backgroundColor: activeTheme.bg || '#ffffff',
                        paddingBottom: 'calc(max(env(safe-area-inset-bottom, 0px), 56px) + 0.75rem)'
                    }}
                >
                    <button 
                        onClick={onClose} 
                        className="flex-1 py-3.5 rounded-2xl text-xs sm:text-sm font-bold w-full transition-all border-0 quran-raised-btn-selected flex items-center justify-center gap-2"
                        style={{ backgroundColor: activeTheme.accent || '#3b82f6', color: activeTheme.accentText || '#ffffff' }}
                    >
                        <span>{isEn ? 'Close' : 'إغلاق'}</span>
                    </button>
                </div>
                </div>
            </div>
        </div>
    );
};

export default ThemesModal;