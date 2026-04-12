import React from 'react';
import { THEMES, DEFAULT_SETTINGS } from './constants';

interface ThemesModalProps {
    onClose: () => void;
    showToast: (msg: string) => void;
    isLandscape: boolean;
    readingMode: string;
    modeSuffix: string;
}

const ThemesModal: React.FC<ThemesModalProps> = ({ onClose, showToast, isLandscape, readingMode, modeSuffix }) => {
    const currentThemeId = localStorage.getItem('current_theme_id' + modeSuffix) || 'olive';
    const activeTheme = THEMES[currentThemeId as keyof typeof THEMES] || THEMES['olive'];

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
        showToast(newValue ? 'تم تفعيل الشفافية' : 'تم تعطيل الشفافية');
    };

    const toggleLockHighlightColor = (e: React.MouseEvent) => {
        e.stopPropagation();
        const newValue = !lockHighlightColor;
        setLockHighlightColor(newValue);
        const saved = JSON.parse(localStorage.getItem('quran_settings' + modeSuffix) || '{}');
        const updated = { ...saved, lockHighlightColor: newValue };
        localStorage.setItem('quran_settings' + modeSuffix, JSON.stringify(updated));
        showToast(newValue ? 'تم قفل لون التحديد' : 'تم إلغاء قفل لون التحديد');
    };

    const applyTheme = (themeId: string) => {
        const theme = THEMES[themeId as keyof typeof THEMES];
        if (!theme) return;

        localStorage.getItem('current_theme_id' + modeSuffix);
        localStorage.setItem('current_theme_id' + modeSuffix, themeId);
        
        const themeColors = { 
            'top-toolbar': { bg: theme.barBg, border: theme.barBorder }, 
            'bottom-toolbar': { bg: theme.barBg, border: theme.barBorder }, 
            'surah': { bg: theme.btnBg, text: theme.btnText, border: (theme as any).btnBorder || theme.barBorder, font: theme.font }, 
            'juz': { bg: theme.btnBg, text: theme.btnText, border: (theme as any).btnBorder || theme.barBorder, font: theme.font }, 
            'page': { bg: theme.btnBg, text: theme.btnText, border: (theme as any).btnBorder || theme.barBorder, font: theme.font }, 
            'audio': { bg: theme.btnBg, text: theme.btnText, border: (theme as any).btnBorder || theme.barBorder }, 
            'btn-settings': { bg: theme.btnBg, text: theme.btnText, border: (theme as any).btnBorder || theme.barBorder }, 
            'btn-home': { bg: theme.btnBg, text: theme.btnText, border: (theme as any).btnBorder || theme.barBorder }, 
            'btn-bookmark': { bg: theme.btnBg, text: theme.btnText, border: (theme as any).btnBorder || theme.barBorder }, 
            'btn-bookmarks-list': { bg: theme.btnBg, text: theme.btnText, border: (theme as any).btnBorder || theme.barBorder }, 
            'btn-themes': { bg: theme.btnBg, text: theme.btnText, border: (theme as any).btnBorder || theme.barBorder }, 
            'btn-autoscroll': { bg: theme.btnBg, text: theme.btnText, border: (theme as any).btnBorder || theme.barBorder }, 
            'btn-menu': { bg: theme.btnBg, text: theme.btnText, border: (theme as any).btnBorder || theme.barBorder }, 
            'btn-search': { bg: theme.btnBg, text: theme.btnText, border: (theme as any).btnBorder || theme.barBorder },
            'btn-share': { bg: theme.btnBg, text: theme.btnText, border: (theme as any).btnBorder || theme.barBorder }
        };

        localStorage.setItem('toolbar_colors_v2' + modeSuffix, JSON.stringify(themeColors));

        // Update quran_settings to match the theme's colors and font
        const savedSettings = JSON.parse(localStorage.getItem('quran_settings' + modeSuffix) || '{}');
        const baseSettings = { ...DEFAULT_SETTINGS, ...savedSettings };
        const updatedSettings = {
            ...baseSettings,
            bgColor: theme.bg,
            textColor: theme.text,
            fontFamily: theme.font,
            ...(baseSettings.lockHighlightColor ? {} : { highlightTextColor: theme.highlightText || theme.accent }),
            theme: themeId
        };
        localStorage.setItem('quran_settings' + modeSuffix, JSON.stringify(updatedSettings));

        // Dispatch a custom event to notify the main component to reload theme
        window.dispatchEvent(new Event('theme-change'));
        
        showToast(`تم تطبيق ثيم: ${theme.name}`);
        onClose();
    };

    return (
        <div className={`fixed inset-0 z-[1200] bg-black/60 flex justify-center items-center ${isLandscape ? 'p-0' : 'px-4'} animate-fadeIn`} onClick={onClose}>
            <div className={`modal-skinned w-full ${isLandscape ? 'max-w-4xl h-full rounded-none max-h-screen' : 'max-w-md rounded-2xl max-h-[85vh]'} flex flex-col shadow-2xl`} onClick={e => e.stopPropagation()}>
                <div className="p-4 rounded-t-2xl flex justify-between items-center shadow-md" style={{ backgroundColor: activeTheme.headerBg, color: activeTheme.headerText }}>
                    <h3 className="font-bold text-lg">اختر الثيم</h3>
                    <button onClick={onClose} className="text-2xl hover:opacity-80 transition">&times;</button>
                </div>
                
                <div className={`px-4 py-4 border-b flex ${isLandscape ? 'flex-row' : 'flex-wrap'} gap-3 justify-center`} style={{ backgroundColor: activeTheme.barBg, borderColor: activeTheme.barBorder }}>
                    <button 
                        onClick={toggleTransparency}
                        className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all border ${isTransparent ? 'shadow-lg' : 'hover:opacity-80'}`}
                        style={isTransparent ? { backgroundColor: activeTheme.accent, borderColor: activeTheme.accent, color: activeTheme.accentText } : { backgroundColor: activeTheme.cardBg, borderColor: activeTheme.cardBorder, color: activeTheme.cardText }}
                        title="تفعيل/تعطيل شفافية الأشرطة"
                    >
                        <i className={`fa-solid ${isTransparent ? 'fa-eye' : 'fa-eye-slash'}`}></i>
                        <span className="whitespace-nowrap">شفافية الأشرطة</span>
                    </button>
                    <button 
                        onClick={toggleLockHighlightColor}
                        className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all border ${lockHighlightColor ? 'shadow-lg' : 'hover:opacity-80'}`}
                        style={lockHighlightColor ? { backgroundColor: activeTheme.accent, borderColor: activeTheme.accent, color: activeTheme.accentText } : { backgroundColor: activeTheme.cardBg, borderColor: activeTheme.cardBorder, color: activeTheme.cardText }}
                        title="قفل لون التحديد الحالي"
                    >
                        <i className={`fa-solid ${lockHighlightColor ? 'fa-lock' : 'fa-lock-open'}`}></i>
                        <span className="whitespace-nowrap">قفل لون التحديد</span>
                    </button>
                </div>
                <div className={`overflow-y-auto p-4 grid ${isLandscape ? 'grid-cols-3 sm:grid-cols-4' : 'grid-cols-2'} gap-3 flex-1`} style={{ '--theme-card-border-color': activeTheme.accent, '--theme-card-shadow-color': `${activeTheme.accent}4D` } as React.CSSProperties}>
                    {Object.entries(THEMES).map(([key, t]: [string, any]) => (
                        <button 
                            id={`theme-btn-${key}`}
                            key={key} 
                            onClick={() => applyTheme(key)} 
                            className={`theme-card text-center ${currentThemeId === key ? 'selected ring-2 ring-offset-2' : ''}`}
                            style={currentThemeId === key ? { 
                                backgroundColor: t.accent, 
                                color: t.accentText, 
                                borderColor: t.accent,
                                '--tw-ring-color': t.accent
                            } as React.CSSProperties : { 
                                backgroundColor: 'var(--qr-card-bg)', 
                                color: 'var(--qr-card-text)', 
                                borderColor: 'var(--qr-card-border)' 
                            }}
                        >
                            <div className="font-bold mb-2 text-sm flex items-center justify-center gap-2">
                                {currentThemeId === key && <i className="fa-solid fa-check-circle"></i>}
                                <span>{t.name}</span>
                            </div>
                            <div className="w-full h-20 rounded-lg p-2 shadow-inner flex flex-col justify-between" style={{ backgroundColor: t.bg }}>
                                <div className="w-full h-5 rounded-sm" style={{ backgroundColor: t.barBg }}></div>
                                <p className="text-xs truncate" style={{ color: t.text, fontFamily: t.font }}>بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</p>
                                <div className="flex items-center justify-end gap-1 mt-1">
                                    <div className="w-3 h-3 rounded-full border border-black/10" style={{ backgroundColor: t.btnBg }}></div>
                                    <div className="w-3 h-3 rounded-full border border-black/10" style={{ backgroundColor: t.accent }}></div>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ThemesModal;