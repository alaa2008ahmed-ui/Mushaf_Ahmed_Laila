import React, { createContext, useState, useContext, useEffect, useMemo, ReactNode } from 'react';
import { presetThemes, Theme } from './themes';

// State to be saved to localStorage
interface ThemeSettings {
    themeKey: string;
    customBg?: {
        url: string;
        isVideo: boolean;
    };
}

interface ThemeContextType {
    theme: Theme;
    // FIX: Add themeKey to the context type to expose it to consumers.
    themeKey: string;
    applyPresetTheme: (themeKey: string) => void;
    setCustomBackground: (dataUrl: string, isVideo: boolean) => void;
    resetBackground: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_SETTINGS_KEY = 'theme_settings_v1';

function hexToRgb(hex: string | null) {
    if (!hex) return null;
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : null;
}

// FIX: Made `children` prop optional to resolve "Property 'children' is missing" error.
export const ThemeProvider = ({ children }: { children?: ReactNode }) => {
    const [settings, setSettings] = useState<ThemeSettings>(() => {
        try {
            const saved = localStorage.getItem(THEME_SETTINGS_KEY);
            return saved ? JSON.parse(saved) : { themeKey: 'default' };
        } catch (e) {
            return { themeKey: 'default' };
        }
    });

    const theme = useMemo(() => {
        const baseTheme = presetThemes[settings.themeKey] || presetThemes.default;
        const isDark = !baseTheme.bgColor || 
            ['#191D3A', '#0C0A09', '#000000', '#4C1D95', '#7C2D12', '#1E40AF', '#1E1B4B', '#1C1917', '#0B0F19', '#3E2723', '#450A0A', '#064E3B', '#0F766E', '#155E75', '#581C87', '#0F172A', '#2E1065', '#0B0F19', '#022C22'].includes(baseTheme.bgColor.toUpperCase());
        const isGlass = settings.themeKey.includes('glass') || settings.themeKey.includes('emerald') || settings.themeKey.includes('crystal');
        
        return {
            ...baseTheme,
            isDark,
            isGlass,
            cardBg: baseTheme.cardBg || (isDark ? '#1e293b' : '#ffffff'),
            cardBorder: baseTheme.cardBorder || (isDark ? '#334155' : '#e2e8f0'),
            textColor: baseTheme.textColor || (isDark ? '#ffffff' : '#000000')
        };
    }, [settings.themeKey]);

    const saveSettings = (newSettings: ThemeSettings) => {
        setSettings(newSettings);
        try {
            localStorage.setItem(THEME_SETTINGS_KEY, JSON.stringify(newSettings));
            // Dispatch event to notify other components (like PrayerTimesContext) to update widget
            window.dispatchEvent(new Event('themeChanged'));
        } catch (e) {
            console.warn('Failed to save theme settings:', e);
        }
    };
    
    const applyPresetTheme = (key: string) => {
        saveSettings({ ...settings, themeKey: key });
    };

    const setCustomBackground = (url: string, isVideo: boolean) => {
        saveSettings({ ...settings, customBg: { url, isVideo } });
    };

    const resetBackground = () => {
        const { customBg, ...newSettings } = settings;
        saveSettings(newSettings);
    };

    useEffect(() => {
        const root = document.documentElement;
        const videoBg = document.getElementById('video-background') as HTMLVideoElement;

        // Handle Background
        if (settings.customBg) {
            if (settings.customBg.isVideo && videoBg) {
                videoBg.style.display = 'block';
                videoBg.muted = true; // Ensure muted for autoplay
                if (videoBg.src !== settings.customBg.url) {
                    videoBg.src = settings.customBg.url;
                }
                const playPromise = videoBg.play();
                if (playPromise !== undefined) {
                    playPromise.catch(e => {
                        if (e.name !== 'AbortError') {
                            console.warn("Video autoplay failed:", e);
                        }
                    });
                }
                document.body.style.backgroundImage = 'none';
                document.body.style.backgroundColor = 'black'; // Fallback
            } else {
                if (videoBg) videoBg.style.display = 'none';
                document.body.style.backgroundImage = `url(${settings.customBg.url})`;
                document.body.style.backgroundSize = 'cover';
                document.body.style.backgroundPosition = 'center';
                document.body.style.backgroundColor = '';
            }
        } else {
            // Handle theme background
            if (videoBg) videoBg.style.display = 'none';
            document.body.style.backgroundColor = theme.bgColor || '#0D1B2A';
            
            const colorLeft = hexToRgb(theme.palette[0]) || '20, 184, 166';
            const colorRight = hexToRgb(theme.palette[1] || theme.palette[0]) || '124, 58, 237';
            
            document.body.style.backgroundImage = `
                radial-gradient(circle at 15% 25%, rgba(${colorLeft}, 0.5), transparent 50%),
                radial-gradient(circle at 85% 75%, rgba(${colorRight}, 0.5), transparent 50%)
            `;
        }

        // Apply common theme properties
        document.body.style.color = theme.textColor;
        document.body.style.fontFamily = theme.font;
        
        root.style.setProperty('--color-primary', theme.palette[0]);
        root.style.setProperty('--color-secondary', theme.palette[1]);
        
        const isDark = theme.isDark;

        root.style.setProperty('--bg-color', theme.bgColor || '#0D1B2A');
        root.style.setProperty('--text-color', theme.textColor);
        root.style.setProperty('--text-color-muted', isDark ? '#94a3b8' : '#64748b');

        // Bar and Card styles (solid colors)
        const topBarBgColor = theme.topBarBg || theme.barBg || theme.palette[0];
        const topBarRgb = hexToRgb(topBarBgColor);
        root.style.setProperty('--top-bar-rgb', topBarRgb || '26, 35, 50');
        root.style.setProperty('--top-bar-text', theme.topBarText || theme.textColor);
        root.style.setProperty('--bottom-bar-bg', theme.barBg || (isDark ? '#1e293b' : '#ffffff'));
        const barBorderColor = theme.barBorder ? theme.barBorder.split(' ')[2] : (isDark ? '#334155' : '#e2e8f0');
        root.style.setProperty('--bottom-bar-border', barBorderColor);
        root.style.setProperty('--qr-bar-bg', theme.barBg || (isDark ? '#1e293b' : '#ffffff'));
        root.style.setProperty('--qr-bar-border', barBorderColor);
        root.style.setProperty('--card-bg', theme.cardBg || (isDark ? '#1e293b' : '#ffffff'));
        root.style.setProperty('--card-border', theme.cardBorder || (isDark ? '#334155' : '#e2e8f0'));
        
        // Modal styles
        root.style.setProperty('--modal-bg', theme.cardBg || (isDark ? '#1e293b' : '#ffffff'));
        root.style.setProperty('--modal-text', theme.textColor);
        root.style.setProperty('--modal-border', theme.palette[0]);

        root.style.setProperty('--card-bg-hover', isDark ? '#334155' : '#f8fafc');
        root.style.setProperty('--card-shadow', isDark
            ? '0 8px 16px -4px rgba(0,0,0,0.4), 0 4px 6px -2px rgba(0,0,0,0.3)'
            : '0 8px 16px -4px rgba(30,41,59,0.1), 0 4px 6px -2px rgba(30,41,59,0.05)');
            
        root.style.setProperty('--badge-finished-bg', isDark ? 'rgba(74, 222, 128, 0.15)' : 'rgba(34, 197, 94, 0.1)');
        root.style.setProperty('--badge-finished-text', isDark ? '#4ade80' : '#16a34a');


    }, [settings, theme]);

    const contextValue = useMemo(() => ({
        theme,
        // FIX: Provide themeKey in the context value.
        themeKey: settings.themeKey,
        applyPresetTheme,
        setCustomBackground,
        resetBackground
    }), [theme, settings]);

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