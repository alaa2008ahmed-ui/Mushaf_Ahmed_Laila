import React, { createContext, useState, useContext, useEffect, useLayoutEffect, useMemo, ReactNode } from 'react';
import { presetThemes, Theme } from './themes';

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

    const activeThemeKey = useMemo(() => {
        const pageKey = currentPage === 'quran' || currentPage === 'quran-landscape' || (currentPage && currentPage.startsWith('quran_')) || currentPage === 'search' ? 'quran' : currentPage;

        if (pageKey === 'quran') {
            const modeSuffix = (currentPage && currentPage.includes('landscape')) ? '_h' : '_v';
            const savedQuranTheme = localStorage.getItem('current_theme_id' + modeSuffix);
            if (savedQuranTheme && presetThemes[savedQuranTheme]) return savedQuranTheme;
            return settings.pageThemes[pageKey] || 'default';
        }

        if (pageKey === 'home') {
            return settings.themeKey || 'default';
        }

        const isLocked = settings.lockedPages?.includes(pageKey);
        if (isLocked && settings.pageThemes[pageKey]) {
            return settings.pageThemes[pageKey];
        }

        return settings.themeKey || 'default';
    }, [settings, currentPage]);

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
        
        return {
            ...baseTheme,
            isDark,
            isGlass,
            cardBg: baseTheme.cardBg || (isDark ? '#1e293b' : '#ffffff'),
            cardBorder: baseTheme.cardBorder || (isDark ? '#334155' : '#e2e8f0'),
            textColor: baseTheme.textColor || (isDark ? '#ffffff' : '#000000'),
            accent: baseTheme.accent || baseTheme.palette[0],
            accentText: baseTheme.accentText || '#ffffff',
            modalBg: baseTheme.modalBg || baseTheme.cardBg || (isDark ? '#1e293b' : '#ffffff'),
            modalText: baseTheme.modalText || baseTheme.textColor || (isDark ? '#ffffff' : '#000000'),
            topBarText: baseTheme.topBarText || baseTheme.textColor || (isDark ? '#ffffff' : '#000000')
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
        };
        window.addEventListener('themeChanged', syncTheme);
        window.addEventListener('storage', syncTheme);
        return () => {
            window.removeEventListener('themeChanged', syncTheme);
            window.removeEventListener('storage', syncTheme);
        };
    }, []);
    
    const applyPresetTheme = (key: string) => {
        const pageKey = currentPage === 'quran' || currentPage === 'quran-landscape' || (currentPage && currentPage.startsWith('quran_')) || currentPage === 'search' ? 'quran' : currentPage;
        const isLocked = settings.lockedPages?.includes(pageKey);

        let nextSettings = { ...settings };

        if (pageKey === 'home' || !isLocked) {
            // Changing theme for all UNLOCKED pages
            nextSettings.themeKey = key;
            
            // Sync all unlocked pages that have specific theme entries
            const nextPageThemes = { ...settings.pageThemes };
            Object.keys(nextPageThemes).forEach(pk => {
                if (!settings.lockedPages?.includes(pk)) {
                    nextPageThemes[pk] = key;
                }
            });
            
            // Ensure the current page is updated if not home
            if (pageKey !== 'home') {
                nextPageThemes[pageKey] = key;
            }
            
            nextSettings.pageThemes = nextPageThemes;
        } else {
            // Updating only the current LOCKED page
            nextSettings.pageThemes = { ...settings.pageThemes, [pageKey]: key };
        }
        
        saveSettings(nextSettings);
    };

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
        const isAppList = currentPage === 'more-menu';
        const isPinned = settings.lockedPages?.includes(pageKey);
        const isHome = currentPage === 'home';

        if ((isPinned || isHome) && !isReadingMode && !isAppList) {
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

        if (settings.customBg) {
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
            document.body.style.backgroundColor = theme.bgColor || '#0D1B2A';
            
            const colorLeft = hexToRgb(theme.palette[0]) || '20, 184, 166';
            const colorRight = hexToRgb(theme.palette[1] || theme.palette[0]) || '124, 58, 237';
            
            if (pageKey === 'quran') {
                document.body.style.backgroundImage = `
                    radial-gradient(circle at 15% 25%, rgba(${colorLeft}, 0.5), transparent 50%),
                    radial-gradient(circle at 85% 75%, rgba(${colorRight}, 0.5), transparent 50%)
                `;
            } else {
                document.body.style.backgroundImage = 'none';
            }
        }

        document.body.style.color = theme.textColor;
        document.body.style.fontFamily = theme.font;
        root.style.setProperty('--theme-font', theme.font);

        root.style.setProperty('--color-primary', theme.palette[0]);
        root.style.setProperty('--color-secondary', theme.palette[1]);
        
        const isDark = theme.isDark;

        if (isDark) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }

        root.style.setProperty('--bg-color', theme.bgColor || '#0D1B2A');
        root.style.setProperty('--text-color', theme.textColor);
        root.style.setProperty('--text-color-muted', isDark ? '#94a3b8' : '#64748b');

        const topBarBgColor = theme.topBarBg || theme.barBg || theme.palette[0];
        const topBarRgb = hexToRgb(topBarBgColor);
        root.style.setProperty('--top-bar-rgb', topBarRgb || '26, 35, 50');
        root.style.setProperty('--top-bar-text', theme.topBarText || theme.textColor);
        root.style.setProperty('--bottom-bar-bg', theme.barBg || (isDark ? '#1e293b' : '#ffffff'));
        const barBorderColor = theme.barBorder ? theme.barBorder.split(' ')[2] : (isDark ? '#334155' : '#e2e8f0');
        root.style.setProperty('--bottom-bar-border', barBorderColor);
        root.style.setProperty('--qr-bar-bg', theme.barBg || (isDark ? '#1e293b' : '#ffffff'));
        root.style.setProperty('--qr-bar-border', barBorderColor);
        
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
        root.style.setProperty('--qr-accent', theme.palette[0]);
        root.style.setProperty('--qr-accent-text', theme.accentText || '#ffffff');
        root.style.setProperty('--qr-bg', theme.bgColor || '#0D1B2A');
        root.style.setProperty('--qr-text', theme.textColor);
        root.style.setProperty('--qr-card-bg', pageKey === 'quran' ? quranCardBg : defaultCardBg);
        root.style.setProperty('--qr-card-text', theme.textColor);
        root.style.setProperty('--qr-card-border', pageKey === 'quran' ? quranCardBorder : defaultCardBorder);
        root.style.setProperty('--qr-modal-bg', theme.cardBg || (isDark ? '#1e293b' : '#ffffff'));
        root.style.setProperty('--qr-modal-text', theme.textColor);
        root.style.setProperty('--qr-modal-border', theme.palette[0]);
    }, [settings.customBg, theme, currentPage]);

    const isPageLocked = useMemo(() => {
        const pageKey = currentPage === 'quran' || currentPage === 'quran-landscape' || (currentPage && currentPage.startsWith('quran_')) || currentPage === 'search' ? 'quran' : currentPage;
        if (pageKey === 'home') return false; // Home cannot be locked
        return settings.lockedPages?.includes(pageKey) || false;
    }, [settings.lockedPages, currentPage]);

    const togglePageLock = () => {
        const pageKey = currentPage === 'quran' || currentPage === 'quran-landscape' || (currentPage && currentPage.startsWith('quran_')) || currentPage === 'search' ? 'quran' : currentPage;
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
        const pageKey = currentPage === 'quran' || currentPage === 'quran-landscape' || (currentPage && currentPage.startsWith('quran_')) || currentPage === 'search' ? 'quran' : currentPage;
        return pageKey === 'quran';
    }, [currentPage]);

    const contextValue = useMemo(() => ({
        theme,
        themeKey: activeThemeKey,
        isGlobalTheme: settings.isGlobalTheme,
        isPageLocked,
        isQuranPage,
        currentPage,
        togglePageLock,
        applyPresetTheme,
        setCustomBackground,
        resetBackground,
        setIsGlobalTheme,
        setCurrentPage
    }), [theme, settings, activeThemeKey, isPageLocked, currentPage]);

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