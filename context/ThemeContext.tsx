import React, { createContext, useState, useContext, useEffect, useLayoutEffect, useMemo, ReactNode } from 'react';
import { presetThemes, Theme } from './themes';
import { syncWidgetThemeColors } from '../utils/widgetUtils';
import { getQuranThemeForLayout, THEMES as QURAN_THEMES } from '../components/QuranReader/constants';

// State to be saved to localStorage
interface ThemeSettings {
    themeKey: string;
    isGlobalTheme: boolean;
    pageThemes: Record<string, string>;
    lockedPages?: string[];
    customBg?: {
        url: string;
        isVideo: boolean;
    };
}

interface ThemeContextType {
    theme: Theme;
    themeKey: string;
    isGlobalTheme: boolean;
    isPageLocked: boolean;
    isQuranPage: boolean;
    currentPage: string;
    isNightMode: boolean;
    homeLayout: string;
    toggleNightMode: () => void;
    customBg?: {
        url: string;
        isVideo: boolean;
    };
    togglePageLock: () => void;
    applyPresetTheme: (themeKey: string) => void;
    setCustomBackground: (dataUrl: string, isVideo: boolean) => void;
    resetBackground: () => void;
    setIsGlobalTheme: (isGlobal: boolean) => void;
    setCurrentPage: (pageId: string) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_SETTINGS_KEY = 'theme_settings_v3';

function hexToRgb(hex: string | null) {
    if (!hex) return null;
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : null;
}

export const ThemeProvider = ({ children }: { children?: ReactNode }) => {
    const [currentPage, setCurrentPage] = useState('home');
    const [settings, setSettings] = useState<ThemeSettings>(() => {
        try {
            const saved = localStorage.getItem(THEME_SETTINGS_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                return {
                    themeKey: parsed.themeKey || 'default',
                    isGlobalTheme: parsed.isGlobalTheme !== undefined ? parsed.isGlobalTheme : true,
                    pageThemes: parsed.pageThemes || {},
                    lockedPages: parsed.lockedPages || [],
                    customBg: parsed.customBg
                };
            }
            return { themeKey: 'default', isGlobalTheme: true, pageThemes: {}, lockedPages: [] };
        } catch (e) {
            return { themeKey: 'default', isGlobalTheme: true, pageThemes: {}, lockedPages: [] };
        }
    });

    const [homeLayout, setHomeLayout] = useState<string>(() => {
        try {
            const saved = typeof localStorage !== 'undefined' ? localStorage.getItem('home_layout_system') : 'modern';
            return (saved === 'classic' || saved === 'modern') ? saved : 'modern';
        } catch {
            return 'modern';
        }
    });

    const [layoutNightModes, setLayoutNightModes] = useState<Record<string, boolean>>(() => {
        try {
            const legacy = localStorage.getItem('night_mode_active') === 'true';
            const modernSaved = localStorage.getItem('night_mode_active_modern');
            const classicSaved = localStorage.getItem('night_mode_active_classic');
            return {
                modern: modernSaved !== null ? modernSaved === 'true' : legacy,
                classic: classicSaved !== null ? classicSaved === 'true' : false
            };
        } catch {
            return { modern: false, classic: false };
        }
    });

    const currentLayoutKey = (homeLayout === 'classic' || homeLayout === 'modern') ? homeLayout : 'modern';
    const isNightMode = Boolean(layoutNightModes[currentLayoutKey]);

    const toggleNightMode = () => {
        const layout = (homeLayout === 'classic' || homeLayout === 'modern') ? homeLayout : 'modern';
        
        setLayoutNightModes(prev => {
            const currentVal = Boolean(prev[layout]);
            const nextVal = !currentVal;
            
            try {
                localStorage.setItem(`night_mode_active_${layout}`, String(nextVal));
                localStorage.setItem('night_mode_active', String(nextVal));
            } catch (e) {}
            
            return {
                ...prev,
                [layout]: nextVal
            };
        });

        setTimeout(() => {
            window.dispatchEvent(new Event('themeChanged'));
        }, 0);
    };

    const activeThemeKey = useMemo(() => {
        const isModern = homeLayout === 'modern' || (typeof localStorage !== 'undefined' && localStorage.getItem('home_layout_system') === 'modern');

        const pageKey = currentPage === 'quran' || currentPage === 'quran-landscape' || (currentPage && currentPage.startsWith('quran_')) || currentPage === 'quran-search' ? 'quran' : currentPage;

        let isGoldenLocked = true;
        try {
            const saved = typeof localStorage !== 'undefined' ? localStorage.getItem('modern_hub_golden_locked') : 'true';
            if (saved !== null) {
                isGoldenLocked = saved === 'true';
            }
        } catch (e) {}

        if (pageKey === 'quran') {
            const layout = isModern ? 'modern' : 'classic';
            const modeSuffix = (currentPage && currentPage.includes('landscape')) ? '_h' : '_v';
            const quranThemeId = getQuranThemeForLayout(layout, modeSuffix);
            if (presetThemes[quranThemeId]) {
                return quranThemeId;
            }
            if (isNightMode) {
                return 'deep_black';
            }
            return isModern ? 'shiny_gold' : 'default';
        }

        if (isNightMode) {
            return 'black_gold';
        }

        // فى التصميم الذكى الحديث: تفتح جميع الصفحات كلها ماعدا صفحة القرآن الكريم دائماً على الثيم الذهبى ولا تتأثر نهائياً بتغيير الثيمات من قائمة الصفحة الرئيسية
        if (isModern) {
            return 'shiny_gold';
        }

        if (pageKey === 'home') {
            const homeKey = settings.themeKey || 'default';
            return presetThemes[homeKey] ? homeKey : 'default';
        }

        const isLocked = settings.lockedPages?.includes(pageKey);
        if (isLocked && settings.pageThemes[pageKey] && presetThemes[settings.pageThemes[pageKey]]) {
            return settings.pageThemes[pageKey];
        }

        const activeKey = settings.themeKey || 'default';
        return presetThemes[activeKey] ? activeKey : 'default';
    }, [settings, currentPage, homeLayout, isNightMode]);

    const theme = useMemo(() => {
        const baseTheme = presetThemes[activeThemeKey] || presetThemes.default;
        const bg = (baseTheme.bgColor || '').toUpperCase();
        const darkBgs = [
            '#191D3A', '#0C0A09', '#000000', '#4C1D95', '#7C2D12', '#1E40AF', '#1E1B4B', '#1C1917', 
            '#0B0F19', '#3E2723', '#450A0A', '#064E3B', '#0F766E', '#155E75', '#581C87', '#0F172A', 
            '#2E1065', '#0B0F19', '#022C22', '#134E4A', '#334155', '#280A1E', '#041E3A', '#09090B',
            '#1C1917', '#1E3A8A', '#422006', '#78350F', '#0A0A0A', '#111111'
        ];
        
        // Improved isDark detection: if specific textColor is white OR bgColor is in dark list
        const isDark = (baseTheme.textColor && baseTheme.textColor.toLowerCase() === '#ffffff') || 
                      !baseTheme.bgColor || 
                      darkBgs.includes(bg);
                      
        const isGlass = activeThemeKey.includes('glass') || activeThemeKey.includes('emerald') || activeThemeKey.includes('crystal');
        
        const isBlackTheme = (baseTheme.bgColor === '#000000') || baseTheme.name === 'اسود' || baseTheme.name === 'أبيض وأسود' || activeThemeKey === 'deep_black';
        
        return {
            ...baseTheme,
            isDark,
            isGlass,
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

    const saveSettings = (newSettings: ThemeSettings) => {
        setSettings(newSettings);
        try {
            localStorage.setItem(THEME_SETTINGS_KEY, JSON.stringify(newSettings));
            // Force a refresh of the context globally
            window.dispatchEvent(new Event('themeChanged'));
        } catch (e) {
            console.warn('Failed to save theme settings:', e);
        }
    };

    useEffect(() => {
        const syncTheme = () => {
            try {
                const saved = localStorage.getItem(THEME_SETTINGS_KEY);
                if (saved) {
                    const parsed = JSON.parse(saved);
                    setSettings(s => {
                        if (JSON.stringify(s) !== JSON.stringify(parsed)) {
                            return { ...s, ...parsed };
                        }
                        return s;
                    });
                }
            } catch (e) {}
            try {
                const layout = localStorage.getItem('home_layout_system') || 'modern';
                const validLayout = (layout === 'classic' || layout === 'modern') ? layout : 'modern';
                setHomeLayout(prev => prev !== validLayout ? validLayout : prev);
            } catch (e) {}
            try {
                const legacy = localStorage.getItem('night_mode_active') === 'true';
                const modernSaved = localStorage.getItem('night_mode_active_modern');
                const classicSaved = localStorage.getItem('night_mode_active_classic');
                const nextModern = modernSaved !== null ? modernSaved === 'true' : legacy;
                const nextClassic = classicSaved !== null ? classicSaved === 'true' : false;
                setLayoutNightModes(prev => {
                    if (prev.modern === nextModern && prev.classic === nextClassic) {
                        return prev;
                    }
                    return { modern: nextModern, classic: nextClassic };
                });
            } catch (e) {}
        };
        const handleLayoutChange = (e: any) => {
            const layout = (e && e.detail) || (typeof localStorage !== 'undefined' ? localStorage.getItem('home_layout_system') : 'modern') || 'modern';
            setHomeLayout(layout);
        };
        window.addEventListener('themeChanged', syncTheme);
        window.addEventListener('storage', syncTheme);
        window.addEventListener('home-layout-changed', handleLayoutChange);
        return () => {
            window.removeEventListener('themeChanged', syncTheme);
            window.removeEventListener('storage', syncTheme);
            window.removeEventListener('home-layout-changed', handleLayoutChange);
        };
    }, []);
    
    const applyPresetTheme = (key: string) => {
        const pageKey = currentPage === 'quran' || currentPage === 'quran-landscape' || (currentPage && currentPage.startsWith('quran_')) || currentPage === 'quran-search' ? 'quran' : currentPage;
        const isLocked = settings.lockedPages?.includes(pageKey);

        let nextSettings = { ...settings };

        if (pageKey === 'home' || !isLocked) {
            // Changing theme for all UNLOCKED pages (excluding Quran)
            nextSettings.themeKey = key;
            
            // Sync all unlocked pages that have specific theme entries (skip Quran)
            const nextPageThemes = { ...settings.pageThemes };
            Object.keys(nextPageThemes).forEach(pk => {
                if (pk !== 'quran' && !settings.lockedPages?.includes(pk)) {
                    nextPageThemes[pk] = key;
                }
            });
            
            // Ensure the current page is updated if not home and not Quran
            if (pageKey !== 'home' && pageKey !== 'quran') {
                nextPageThemes[pageKey] = key;
            }
            
            nextSettings.pageThemes = nextPageThemes;

            // Quran has its own separate themes and is never overwritten here
        } else {
            // Updating only the current LOCKED page
            nextSettings.pageThemes = { ...settings.pageThemes, [pageKey]: key };
            if (pageKey === 'quran') {
                try {
                    const modeSuffix = (currentPage && currentPage.includes('landscape')) ? '_h' : '_v';
                    localStorage.setItem('current_theme_id' + modeSuffix, key);
                } catch (e) {}
            }
        }
        
        saveSettings(nextSettings);

        const targetTheme = presetThemes[key] || presetThemes.default;
        syncWidgetThemeColors(key, targetTheme);
    };

    useEffect(() => {
        if (theme && activeThemeKey) {
            syncWidgetThemeColors(activeThemeKey, theme);
        }
    }, [activeThemeKey, theme]);

    const setIsGlobalTheme = (isGlobal: boolean) => {
        saveSettings({ ...settings, isGlobalTheme: isGlobal });
    };

    const setCustomBackground = (url: string, isVideo: boolean) => {
        saveSettings({ ...settings, customBg: { url, isVideo } });
    };

    const resetBackground = () => {
        const { customBg, ...newSettings } = settings;
        saveSettings(newSettings as ThemeSettings);
    };

    useLayoutEffect(() => {
        const root = document.documentElement;
        const videoBg = document.getElementById('video-background') as HTMLVideoElement;

        const pageKey = currentPage === 'quran' || currentPage === 'quran-landscape' || currentPage.startsWith('quran_') ? 'quran' : currentPage;
        
        // Apply visual updates immediately
        const isReadingMode = pageKey === 'quran';
        const isPinned = settings.lockedPages?.includes(pageKey);
        const isHome = currentPage === 'home';

        if ((isPinned || isHome) && !isReadingMode) {
            document.body.style.transition = 'none';
        } else {
            document.body.style.transition = 'background-color 0.5s ease-in-out, color 0.5s ease-in-out';
        }

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

        const isModern = homeLayout === 'modern' || (typeof localStorage !== 'undefined' && localStorage.getItem('home_layout_system') === 'modern');
        const isModernHome = isHome && isModern;
        const allowCustomBg = settings.customBg && (!isModern || isHome);

        if (allowCustomBg && settings.customBg) {
            if (settings.customBg.isVideo && videoBg) {
                videoBg.style.display = 'block';
                videoBg.muted = true;
                if (videoBg.src !== settings.customBg.url) {
                    videoBg.src = settings.customBg.url;
                }
                const startPlay = async () => {
                    try {
                        await videoBg.play();
                    } catch (e: any) {
                        const isAutoplayError = 
                            e.name === 'NotAllowedError' || 
                            (e.message && (
                                e.message.includes('user agent') || 
                                e.message.includes('platform') || 
                                e.message.includes('permission') ||
                                e.message.includes('interact')
                            ));

                        if (e.name !== 'AbortError' && !isAutoplayError) {
                            console.warn("Background video play failed:", e);
                        }
                    }
                };
                startPlay();
                document.body.style.backgroundImage = 'none';
                document.body.style.backgroundColor = 'black';
            } else {
                if (videoBg) videoBg.style.display = 'none';
                document.body.style.backgroundImage = `url(${settings.customBg.url})`;
                document.body.style.backgroundSize = 'cover';
                document.body.style.backgroundPosition = 'center';
                document.body.style.backgroundColor = '';
            }
        } else {
            if (videoBg) videoBg.style.display = 'none';
            if (pageKey === 'quran') {
                document.body.style.backgroundImage = 'none';
                const modeSuffix = (currentPage && currentPage.includes('landscape')) ? '_h' : '_v';
                const layout = isModern ? 'modern' : 'classic';
                const quranThemeId = getQuranThemeForLayout(layout, modeSuffix);
                const quranThemeObj = QURAN_THEMES[quranThemeId as keyof typeof QURAN_THEMES];
                const isDarkQuran = quranThemeId === 'deep_black' || quranThemeId.startsWith('i_');
                document.body.style.backgroundColor = (quranThemeObj && quranThemeObj.bg) ? quranThemeObj.bg : (isDarkQuran ? '#000000' : '#ffffff');
            } else if (isModernHome) {
                document.body.style.backgroundColor = '#FFFFFF';
                document.body.style.backgroundImage = 'none';
            } else {
                document.body.style.backgroundColor = theme.bgColor || '#DFE5EC';
                document.body.style.backgroundImage = 'none';
            }
        }

        const isBlackTheme = (theme.bgColor === '#000000') || theme.name === 'اسود' || theme.name === 'أبيض وأسود' || activeThemeKey === 'deep_black';
        const isDark = theme.isDark;
        const isBlackGold = activeThemeKey === 'black_gold' && pageKey !== 'quran';

        if (isBlackGold) {
            document.documentElement.classList.add('theme-black-gold', 'dark');
            document.body.classList.add('theme-black-gold', 'dark');
        } else {
            document.documentElement.classList.remove('theme-black-gold');
            document.body.classList.remove('theme-black-gold');
        }

        if (isModernHome && !isBlackGold) {
            document.body.style.color = '#FFFFFF';
            document.body.style.fontFamily = "'Cairo', sans-serif";
            root.style.setProperty('--theme-font', "'Cairo', sans-serif");
            document.documentElement.classList.remove('theme-black', 'dark');
            document.body.classList.remove('theme-black', 'dark');
            document.documentElement.classList.add('modern-home-active');
            document.body.classList.add('modern-home-active');
        } else {
            document.documentElement.classList.remove('modern-home-active');
            document.body.classList.remove('modern-home-active');
            document.body.style.color = theme.textColor;
            document.body.style.fontFamily = theme.font;
            root.style.setProperty('--theme-font', theme.font);

            if (isBlackTheme) {
                document.documentElement.classList.add('theme-black');
                document.body.classList.add('theme-black');
            } else {
                document.documentElement.classList.remove('theme-black');
                document.body.classList.remove('theme-black');
            }

            const isShinyGold = activeThemeKey === 'shiny_gold' && pageKey !== 'quran';
            if (isShinyGold) {
                document.documentElement.classList.add('theme-shiny-gold');
                document.body.classList.add('theme-shiny-gold');
            } else {
                document.documentElement.classList.remove('theme-shiny-gold');
                document.body.classList.remove('theme-shiny-gold');
            }

            if (isDark) {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }
        }

        root.style.setProperty('--bg-color', pageKey === 'quran' ? '#ffffff' : (theme.bgColor || '#0D1B2A'));
        root.style.setProperty('--text-color', isBlackTheme ? '#FFFFFF' : theme.textColor);
        root.style.setProperty('--text-color-muted', isBlackTheme ? '#E2E8F0' : (isDark ? '#94a3b8' : '#64748b'));

        const topBarBgColor = isBlackTheme ? '#000000' : (theme.topBarBg || theme.barBg || theme.palette[0]);
        const topBarRgb = hexToRgb(topBarBgColor);
        root.style.setProperty('--top-bar-rgb', isBlackTheme ? '0, 0, 0' : (topBarRgb || '26, 35, 50'));
        root.style.setProperty('--top-bar-text', isBlackTheme ? '#FFFFFF' : (theme.topBarText || theme.textColor));
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
    }, [settings.customBg, theme, currentPage, homeLayout]);

    useEffect(() => {
        // Instantly synchronize home screen theme colors with all widgets
        syncWidgetThemeColors(activeThemeKey, theme);
    }, [activeThemeKey, theme]);

    const isPageLocked = useMemo(() => {
        const pageKey = currentPage === 'quran' || currentPage === 'quran-landscape' || (currentPage && currentPage.startsWith('quran_')) || currentPage === 'quran-search' ? 'quran' : currentPage;
        if (pageKey === 'home') return false; // Home cannot be locked
        return settings.lockedPages?.includes(pageKey) || false;
    }, [settings.lockedPages, currentPage]);

    const togglePageLock = () => {
        const pageKey = currentPage === 'quran' || currentPage === 'quran-landscape' || (currentPage && currentPage.startsWith('quran_')) || currentPage === 'quran-search' ? 'quran' : currentPage;
        if (pageKey === 'quran' || pageKey === 'home') return;

        setSettings(prev => {
            const locked = prev.lockedPages || [];
            const isLocked = locked.includes(pageKey);
            let nextLocked: string[];
            let nextThemes = { ...prev.pageThemes };

            if (isLocked) {
                // UNLOCKING: Page stays on its current theme
                // It will resolve to settings.themeKey only when the global theme changes
                nextLocked = locked.filter(k => k !== pageKey);
                // We keep nextThemes[pageKey] as is to avoid immediate jump
            } else {
                // LOCKING: Page records its current theme as its locked state
                nextLocked = [...locked, pageKey];
                nextThemes[pageKey] = activeThemeKey;
            }

            const next = { ...prev, lockedPages: nextLocked, pageThemes: nextThemes };
            localStorage.setItem(THEME_SETTINGS_KEY, JSON.stringify(next));
            return next;
        });
    };

    const isQuranPage = useMemo(() => {
        const pageKey = currentPage === 'quran' || currentPage === 'quran-landscape' || (currentPage && currentPage.startsWith('quran_')) || currentPage === 'quran-search' ? 'quran' : currentPage;
        return pageKey === 'quran';
    }, [currentPage]);

    const contextValue = useMemo(() => ({
        theme,
        themeKey: activeThemeKey,
        isGlobalTheme: settings.isGlobalTheme,
        isPageLocked,
        isQuranPage,
        currentPage,
        isNightMode,
        homeLayout,
        toggleNightMode,
        customBg: settings.customBg,
        togglePageLock,
        applyPresetTheme,
        setCustomBackground,
        resetBackground,
        setIsGlobalTheme,
        setCurrentPage
    }), [theme, settings, activeThemeKey, isPageLocked, currentPage, isNightMode, homeLayout]);

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