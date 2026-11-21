import React, { createContext, useState, useContext, useEffect, useLayoutEffect, useMemo, useCallback, ReactNode } from 'react';
import { presetThemes, Theme } from './themes';
import { syncWidgetThemeColors } from '../utils/widgetUtils';
import { getQuranThemeForLayout, THEMES as QURAN_THEMES, applyQuranThemeForHomeVariant, isDarkQuranTheme } from '../components/QuranReader/constants';
import { syncCurrentSplashImage } from '../utils/splashThemeHelper';
import { syncSystemStatusBar } from '../utils/statusBar';
import {
    setSelectedShareDesign,
    getShareDesignForHomeVariant,
} from '../utils/shareCardDesigns';
import { isTourPreviewMode, getTourPreviewInitParams } from '../utils/tourPreviewMode';

interface ThemeContextType {
    theme: Theme;
    themeKey: string;
    isQuranPage: boolean;
    currentPage: string;
    isNightMode: boolean;
    homeLayout: string;
    homeThemeVariant: 'gold' | 'sky' | 'emerald' | 'burgundy';
    setHomeThemeVariant: (variant: 'gold' | 'sky' | 'emerald' | 'burgundy') => void;
    toggleNightMode: () => void;
    setNightModeActive: (active: boolean) => void;
    setCurrentPage: (pageId: string) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

function hexToRgb(hex: string | null) {
    if (!hex) return null;
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : null;
}

export const syncModernDOMClasses = (isNight: boolean, variant: 'gold' | 'sky' | 'emerald' | 'burgundy') => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    const body = document.body;

    if (isNight) {
        root.classList.add('theme-black-gold', 'dark');
        body.classList.add('theme-black-gold', 'dark');
        root.classList.remove('theme-sky', 'theme-emerald', 'theme-shiny-gold', 'theme-burgundy', 'theme-black');
        body.classList.remove('theme-sky', 'theme-emerald', 'theme-shiny-gold', 'theme-burgundy', 'theme-black');
    } else {
        root.classList.remove('theme-black-gold', 'theme-black', 'dark');
        body.classList.remove('theme-black-gold', 'theme-black', 'dark');

        root.classList.add('modern-home-active');
        body.classList.add('modern-home-active');

        if (variant === 'sky') {
            root.classList.add('theme-sky');
            body.classList.add('theme-sky');
            root.classList.remove('theme-emerald', 'theme-burgundy', 'theme-shiny-gold');
            body.classList.remove('theme-emerald', 'theme-burgundy', 'theme-shiny-gold');
        } else if (variant === 'emerald') {
            root.classList.add('theme-emerald');
            body.classList.add('theme-emerald');
            root.classList.remove('theme-sky', 'theme-burgundy', 'theme-shiny-gold');
            body.classList.remove('theme-sky', 'theme-burgundy', 'theme-shiny-gold');
        } else if (variant === 'burgundy') {
            root.classList.add('theme-burgundy');
            body.classList.add('theme-burgundy');
            root.classList.remove('theme-sky', 'theme-emerald', 'theme-shiny-gold');
            body.classList.remove('theme-sky', 'theme-emerald', 'theme-shiny-gold');
        } else {
            root.classList.add('theme-shiny-gold');
            body.classList.add('theme-shiny-gold');
            root.classList.remove('theme-sky', 'theme-emerald', 'theme-burgundy');
            body.classList.remove('theme-sky', 'theme-emerald', 'theme-burgundy');
        }
    }
};

export const restoreHomeThemeDOMInstantly = () => {
    if (typeof document === 'undefined' || isTourPreviewMode()) return;
    try {
        const root = document.documentElement;
        const body = document.body;

        root.classList.remove('quran-context', 'quran-page-active');
        body.classList.remove('quran-context', 'quran-page-active');
        body.style.removeProperty('background-color');

        const isNight = localStorage.getItem('night_mode_active_modern') === 'true' || localStorage.getItem('night_mode_active') === 'true';
        const variant = (localStorage.getItem('modern_home_theme_variant') as any) || 'gold';

        syncModernDOMClasses(isNight, variant);
        body.style.backgroundColor = isNight ? '#000000' : '#FFFFFF';
        body.style.backgroundImage = 'none';
        syncSystemStatusBar(isNight, '#FFFFFF', `modern:${isNight ? 'night' : variant}`);
    } catch (e) {}
};

// Immediate DOM sync on load to prevent any initial render theme flash
try {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
        if (isTourPreviewMode()) {
            const init = getTourPreviewInitParams();
            const isNight = init.night ?? (localStorage.getItem('night_mode_active_modern') === 'true' || localStorage.getItem('night_mode_active') === 'true');
            const variant = init.variant ?? ((localStorage.getItem('modern_home_theme_variant') as any) || 'gold');
            syncModernDOMClasses(isNight, variant);
        } else {
            const isNight = localStorage.getItem('night_mode_active_modern') === 'true' || localStorage.getItem('night_mode_active') === 'true';
            const variant = (localStorage.getItem('modern_home_theme_variant') as any) || 'gold';
            syncModernDOMClasses(isNight, variant);
            syncSystemStatusBar(isNight, '#FFFFFF', `modern:${isNight ? 'night' : variant}`);
        }
    }
} catch (e) {}

export const ThemeProvider = ({ children }: { children?: ReactNode }) => {
    const isTourPreview = useMemo(() => isTourPreviewMode(), []);
    const tourInit = useMemo(() => (isTourPreview ? getTourPreviewInitParams() : null), [isTourPreview]);

    const [currentPage, setCurrentPageState] = useState(() => (tourInit?.page || 'home'));
    const homeLayout = 'modern';

    const [isNightMode, setIsNightMode] = useState<boolean>(() => {
        if (tourInit && tourInit.night !== null) return tourInit.night;
        try {
            const legacy = localStorage.getItem('night_mode_active') === 'true';
            const modernSaved = localStorage.getItem('night_mode_active_modern');
            return modernSaved !== null ? modernSaved === 'true' : legacy;
        } catch {
            return false;
        }
    });

    const [homeThemeVariant, setHomeThemeVariantState] = useState<'gold' | 'sky' | 'emerald' | 'burgundy'>(() => {
        if (tourInit?.variant) return tourInit.variant;
        try {
            const saved = localStorage.getItem('modern_home_theme_variant');
            if (saved === 'sky' || saved === 'emerald' || saved === 'burgundy' || saved === 'gold') {
                return saved;
            }
            return 'gold';
        } catch {
            return 'gold';
        }
    });

    const setCurrentPage = useCallback((pageId: string) => {
        if (pageId === 'home') {
            if (isTourPreview) {
                syncModernDOMClasses(isNightMode, homeThemeVariant);
            } else {
                restoreHomeThemeDOMInstantly();
            }
        }
        setCurrentPageState(prev => (prev === pageId ? prev : pageId));
    }, [isTourPreview, isNightMode, homeThemeVariant]);

    const applyHomeThemeVariant = (variant: 'gold' | 'sky' | 'emerald' | 'burgundy', syncShareDesign = true) => {
        setHomeThemeVariantState(variant);
        try {
            if (!isTourPreview) {
                localStorage.setItem('modern_home_theme_variant', variant);
                const storedNight = localStorage.getItem('night_mode_active_modern');
                const effectiveNight = storedNight !== null ? storedNight === 'true' : isNightMode;
                syncModernDOMClasses(effectiveNight, variant);
                syncCurrentSplashImage(effectiveNight, variant);
                applyQuranThemeForHomeVariant(variant);
                if (syncShareDesign && !effectiveNight) {
                    setSelectedShareDesign(getShareDesignForHomeVariant(variant, false));
                }
            } else {
                syncModernDOMClasses(isNightMode, variant);
            }
        } catch {}
        setTimeout(() => {
            window.dispatchEvent(new Event('themeChanged'));
            window.dispatchEvent(new Event('theme-change'));
            window.dispatchEvent(new Event('settings-change'));
        }, 0);
    };

    const setHomeThemeVariant = (variant: 'gold' | 'sky' | 'emerald' | 'burgundy') => {
        applyHomeThemeVariant(variant, true);
    };

    useEffect(() => {
        if (isTourPreview) return;
        try {
            const syncedVariant = localStorage.getItem('quran_synced_home_theme_variant');
            if (syncedVariant !== homeThemeVariant) {
                applyQuranThemeForHomeVariant(homeThemeVariant);
            }
        } catch (e) {}
    }, [homeThemeVariant, isTourPreview]);

    useEffect(() => {
        if (isTourPreview) return;
        syncCurrentSplashImage(isNightMode, homeThemeVariant);
    }, [isNightMode, homeThemeVariant, isTourPreview]);

    const setNightModeActive = (active: boolean) => {
        if (!isTourPreview) {
            try {
                localStorage.setItem('night_mode_active_modern', String(active));
                localStorage.setItem('night_mode_active', String(active));
            } catch (e) {}
            syncCurrentSplashImage(active, homeThemeVariant);
            setSelectedShareDesign(
                active ? 'obsidian_gold' : getShareDesignForHomeVariant(homeThemeVariant, false)
            );
        }
        syncModernDOMClasses(active, homeThemeVariant);
        setIsNightMode(active);
        setTimeout(() => {
            window.dispatchEvent(new Event('themeChanged'));
        }, 0);
    };

    const toggleNightMode = () => {
        const nextVal = !isNightMode;
        if (!isTourPreview) {
            try {
                localStorage.setItem('night_mode_active_modern', String(nextVal));
                localStorage.setItem('night_mode_active', String(nextVal));
            } catch (e) {}
            syncCurrentSplashImage(nextVal, homeThemeVariant);
            setSelectedShareDesign(
                nextVal ? 'obsidian_gold' : getShareDesignForHomeVariant(homeThemeVariant, false)
            );
        }
        syncModernDOMClasses(nextVal, homeThemeVariant);

        setIsNightMode(nextVal);

        setTimeout(() => {
            window.dispatchEvent(new Event('themeChanged'));
        }, 0);
    };

    const activeThemeKey = useMemo(() => {
        if (isNightMode) return 'black_gold';
        if (homeThemeVariant === 'sky') return 'sky_mode';
        if (homeThemeVariant === 'emerald') return 'emerald_mode';
        if (homeThemeVariant === 'burgundy') return 'burgundy_mode';
        return 'shiny_gold';
    }, [isNightMode, homeThemeVariant]);

    const theme = useMemo(() => {
        const baseTheme = presetThemes[activeThemeKey] || presetThemes.shiny_gold;

        const bg = (baseTheme.bgColor || '').toUpperCase();
        const darkBgs = ['#000000', '#0A0A0A', '#111111'];

        // Improved isDark detection: if specific textColor is white OR bgColor is in dark list
        const isDark = (baseTheme.textColor && baseTheme.textColor.toLowerCase() === '#ffffff') ||
                      !baseTheme.bgColor ||
                      darkBgs.includes(bg);

        const isBlackTheme = baseTheme.bgColor === '#000000';

        return {
            ...baseTheme,
            isDark,
            cardBg: isBlackTheme ? '#111111' : (baseTheme.cardBg || (isDark ? '#1e293b' : '#ffffff')),
            cardBorder: isBlackTheme ? '#333333' : (baseTheme.cardBorder || (isDark ? '#334155' : '#e2e8f0')),
            textColor: isBlackTheme ? '#FFFFFF' : (baseTheme.textColor || (isDark ? '#ffffff' : '#000000')),
            accent: isBlackTheme ? '#FFFFFF' : (baseTheme.accent || baseTheme.palette[0]),
            accentText: isBlackTheme ? '#000000' : (baseTheme.accentText || '#ffffff'),
            modalBg: isBlackTheme ? '#000000' : (baseTheme.modalBg || baseTheme.cardBg || (isDark ? '#1e293b' : '#ffffff')),
            modalText: isBlackTheme ? '#FFFFFF' : (baseTheme.modalText || baseTheme.textColor || (isDark ? '#ffffff' : '#000000')),
            topBarText: isBlackTheme ? '#FFFFFF' : (baseTheme.topBarText || baseTheme.textColor || (isDark ? '#ffffff' : '#000000'))
        };
    }, [activeThemeKey]);

    useEffect(() => {
        if (isTourPreview) return;
        const syncTheme = () => {
            try {
                const legacy = localStorage.getItem('night_mode_active') === 'true';
                const modernSaved = localStorage.getItem('night_mode_active_modern');
                const nextModern = modernSaved !== null ? modernSaved === 'true' : legacy;
                setIsNightMode(prev => (prev !== nextModern ? nextModern : prev));
            } catch (e) {}
            try {
                const savedVariant = localStorage.getItem('modern_home_theme_variant');
                if (savedVariant === 'sky' || savedVariant === 'emerald' || savedVariant === 'burgundy' || savedVariant === 'gold') {
                    setHomeThemeVariantState(savedVariant);
                }
            } catch (e) {}
        };
        window.addEventListener('themeChanged', syncTheme);
        window.addEventListener('storage', syncTheme);
        return () => {
            window.removeEventListener('themeChanged', syncTheme);
            window.removeEventListener('storage', syncTheme);
        };
    }, [isTourPreview]);

    useEffect(() => {
        if (isTourPreview) return;
        if (theme && activeThemeKey) {
            syncWidgetThemeColors(activeThemeKey, theme);
        }
    }, [activeThemeKey, theme, isTourPreview]);

    useLayoutEffect(() => {
        const root = document.documentElement;
        const videoBg = document.getElementById('video-background') as HTMLVideoElement;

        const pageKey = currentPage === 'quran' || currentPage === 'quran-landscape' || currentPage.startsWith('quran_') ? 'quran' : currentPage;

        // Always disable CSS transition on body background to prevent color fading flashes during navigation
        document.body.style.transition = 'none';

        if (pageKey === 'quran') {
            document.body.classList.add('quran-context');
        } else {
            document.body.classList.remove('quran-context');
        }

        const isHub = currentPage === 'home';
        if (isHub) {
            document.body.classList.add('hide-top-bars');
        } else {
            document.body.classList.remove('hide-top-bars');
        }

        if (videoBg) videoBg.style.display = 'none';
        if (pageKey === 'quran') {
            document.body.style.backgroundImage = 'none';
            document.body.classList.add('quran-page-active');
            const modeSuffix = (currentPage && currentPage.includes('landscape')) ? '_h' : '_v';
            const quranThemeId = getQuranThemeForLayout('modern', modeSuffix);
            const quranThemeObj = QURAN_THEMES[quranThemeId as keyof typeof QURAN_THEMES];
            const isDarkQuran = quranThemeId === 'deep_black';
            const quranBg = (quranThemeObj && quranThemeObj.bg) ? quranThemeObj.bg : (isDarkQuran ? '#000000' : '#ffffff');
            document.body.style.setProperty('background-color', quranBg, 'important');
        } else {
            document.documentElement.classList.remove('quran-page-active');
            document.body.classList.remove('quran-page-active');
            document.body.style.removeProperty('background-color');
            document.body.style.backgroundColor = isNightMode ? '#000000' : (isHub ? '#FFFFFF' : (theme.bgColor || '#FFFFFF'));
            document.body.style.backgroundImage = 'none';
        }

        const isBlackTheme = theme.bgColor === '#000000';
        const isDark = theme.isDark;

        syncModernDOMClasses(isNightMode, homeThemeVariant);
        document.body.style.color = isNightMode ? '#FFFFFF' : '#000000';
        document.body.style.fontFamily = "'Cairo', sans-serif";
        root.style.setProperty('--theme-font', "'Cairo', sans-serif");

        root.style.setProperty('--bg-color', theme.bgColor || '#0D1B2A');
        root.style.setProperty('--text-color', isBlackTheme ? '#FFFFFF' : theme.textColor);
        root.style.setProperty('--text-color-muted', isBlackTheme ? '#E2E8F0' : (isDark ? '#94a3b8' : '#64748b'));

        const isSkyActive = homeThemeVariant === 'sky' || activeThemeKey === 'sky_mode';
        const isEmeraldActive = homeThemeVariant === 'emerald' || activeThemeKey === 'emerald_mode';
        const isBurgundyActive = homeThemeVariant === 'burgundy' || activeThemeKey === 'burgundy_mode';

        const topBarBgColor = isBlackTheme 
            ? '#000000' 
            : (isSkyActive
                ? '#0284c7'
                : (isEmeraldActive
                    ? '#047857'
                    : (isBurgundyActive
                        ? '#881337'
                        : (theme.topBarBg || theme.barBg || theme.palette[0]))));

        const topBarRgb = hexToRgb(topBarBgColor);
        root.style.setProperty('--top-bar-rgb', isBlackTheme ? '0, 0, 0' : (topBarRgb || '26, 35, 50'));

        const topBarTextColor = (isSkyActive || isEmeraldActive || isBurgundyActive) 
            ? '#FFFFFF' 
            : (isBlackTheme ? '#FFFFFF' : (theme.topBarText || theme.textColor));

        root.style.setProperty('--top-bar-text', topBarTextColor);
        root.style.setProperty('--bottom-bar-bg', isBlackTheme ? '#000000' : (theme.barBg || (isDark ? '#1e293b' : '#ffffff')));
        const barBorderColor = isBlackTheme ? '#333333' : (theme.barBorder ? theme.barBorder.split(' ')[2] : (isDark ? '#334155' : '#e2e8f0'));
        root.style.setProperty('--bottom-bar-border', barBorderColor);
        root.style.setProperty('--qr-bar-bg', isBlackTheme ? '#000000' : (theme.barBg || (isDark ? '#1e293b' : '#ffffff')));
        root.style.setProperty('--qr-bar-border', barBorderColor);
        root.style.setProperty('--qr-bar-text', isBlackTheme ? '#FFFFFF' : (theme.topBarText || theme.textColor));
        
        const quranCardBg = theme.cardBg || (isDark ? '#1e293b' : '#ffffff');
        const quranCardBorder = theme.cardBorder || (isDark ? '#334155' : '#e2e8f0');
        const defaultCardBg = isDark ? '#1f2937' : '#ffffff';
        const defaultCardBorder = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';
        
        root.style.setProperty('--card-bg', pageKey === 'quran' ? quranCardBg : defaultCardBg);
        root.style.setProperty('--card-border', pageKey === 'quran' ? quranCardBorder : defaultCardBorder);
        
        root.style.setProperty('--modal-bg', theme.cardBg || (isDark ? '#1e293b' : '#ffffff'));
        root.style.setProperty('--modal-text', theme.textColor);
        root.style.setProperty('--modal-border', theme.palette[0]);

        root.style.setProperty('--card-bg-hover', pageKey === 'quran' ? (isDark ? '#334155' : '#f8fafc') : (isDark ? '#374151' : '#f9fafb'));
        root.style.setProperty('--card-shadow', isDark
            ? '0 8px 16px -4px rgba(0,0,0,0.4), 0 4px 6px -2px rgba(0,0,0,0.3)'
            : '0 8px 16px -4px rgba(0,0,0,0.05), 0 4px 6px -2px rgba(0,0,0,0.02)');
            
        root.style.setProperty('--badge-finished-bg', isDark ? 'rgba(74, 222, 128, 0.15)' : 'rgba(34, 197, 94, 0.1)');
        root.style.setProperty('--badge-finished-text', isDark ? '#4ade80' : '#16a34a');

        // Set compatibility variables for components that use qr- prefix
        root.style.setProperty('--qr-accent', isBlackTheme ? '#FFFFFF' : theme.palette[0]);
        root.style.setProperty('--qr-accent-text', isBlackTheme ? '#000000' : (theme.accentText || '#ffffff'));
        root.style.setProperty('--qr-bg', theme.bgColor || '#0D1B2A');
        root.style.setProperty('--qr-text', isBlackTheme ? '#FFFFFF' : theme.textColor);
        root.style.setProperty('--qr-card-bg', pageKey === 'quran' ? quranCardBg : (isBlackTheme ? '#111111' : defaultCardBg));
        root.style.setProperty('--qr-card-text', isBlackTheme ? '#FFFFFF' : theme.textColor);
        root.style.setProperty('--qr-card-border', pageKey === 'quran' ? quranCardBorder : (isBlackTheme ? '#333333' : defaultCardBorder));
        root.style.setProperty('--qr-modal-bg', isBlackTheme ? '#000000' : (theme.cardBg || (isDark ? '#1e293b' : '#ffffff')));
        root.style.setProperty('--qr-modal-text', isBlackTheme ? '#FFFFFF' : theme.textColor);
        root.style.setProperty('--qr-modal-border', isBlackTheme ? '#FFFFFF' : theme.palette[0]);

        // Synchronize mobile StatusBar icons ONLY when theme changes (QuranReader syncs its own active Quran theme)
        const isQuranReaderScreen = currentPage === 'quran' || currentPage === 'quran-landscape';
        if (!isQuranReaderScreen && !isTourPreview) {
            let shouldUseLightStatusBarIcons = false;
            if (pageKey === 'quran') {
                const modeSuffix = (currentPage && currentPage.includes('landscape')) ? '_h' : '_v';
                const quranThemeId = getQuranThemeForLayout('modern', modeSuffix);
                shouldUseLightStatusBarIcons = isDarkQuranTheme(quranThemeId);
            } else {
                shouldUseLightStatusBarIcons = isNightMode || isBlackTheme || Boolean(isDark);
            }
            syncSystemStatusBar(shouldUseLightStatusBarIcons, '#FFFFFF', activeThemeKey);
        }
    }, [theme, currentPage, homeThemeVariant, isNightMode, isTourPreview]);

    useEffect(() => {
        if (isTourPreview) return;
        // Instantly synchronize home screen theme colors with all widgets
        syncWidgetThemeColors(activeThemeKey, theme);
    }, [activeThemeKey, theme, isTourPreview]);

    const isQuranPage = useMemo(() => {
        const pageKey = currentPage === 'quran' || currentPage === 'quran-landscape' || (currentPage && currentPage.startsWith('quran_')) || currentPage === 'quran-search' ? 'quran' : currentPage;
        return pageKey === 'quran';
    }, [currentPage]);

    const contextValue = useMemo(() => ({
        theme,
        themeKey: activeThemeKey,
        isQuranPage,
        currentPage,
        isNightMode,
        homeLayout,
        homeThemeVariant,
        setHomeThemeVariant,
        toggleNightMode,
        setNightModeActive,
        setCurrentPage
    }), [theme, activeThemeKey, isQuranPage, currentPage, isNightMode, homeLayout, homeThemeVariant]);

    return (
        <ThemeContext.Provider value={contextValue}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};