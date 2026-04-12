import React, { useEffect } from 'react';
import { DEFAULT_SETTINGS, THEMES } from '../components/QuranReader/constants';
import { quranData as quranJsonData } from '../utils/quranData';
const quranJson = { data: quranJsonData };

export const useQuranEventListeners = (
    isLandscapeRef: React.MutableRefObject<boolean>,
    setCurrentTheme: React.Dispatch<React.SetStateAction<any>>,
    setSettings: React.Dispatch<React.SetStateAction<any>>,
    setToolbarColors: React.Dispatch<React.SetStateAction<any>>,
    setQuranData: React.Dispatch<React.SetStateAction<any>>,
    setIsTransparentMode: React.Dispatch<React.SetStateAction<boolean>>,
    setIsHideToolbarsEnabled: React.Dispatch<React.SetStateAction<boolean>>,
    setBookmarks: React.Dispatch<React.SetStateAction<any[]>>,
    setShowSajdahCard: React.Dispatch<React.SetStateAction<boolean>>,
    setIsLandscapeUIHidden: React.Dispatch<React.SetStateAction<boolean>>
) => {
    useEffect(() => {
        const handleThemeChange = () => {
            const mode = isLandscapeRef.current ? '_h' : '_v';
            const themeId = localStorage.getItem('current_theme_id' + mode) || 'olive';
            const newTheme = THEMES[themeId as keyof typeof THEMES] || THEMES['olive'];
            setCurrentTheme(newTheme);
            
            const savedSettings = localStorage.getItem('quran_settings' + mode);
            if (savedSettings) {
                setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(savedSettings) });
            } else {
                setSettings(DEFAULT_SETTINGS);
            }
            
            const savedToolbarColors = localStorage.getItem('toolbar_colors_v2' + mode);
            if (savedToolbarColors) {
                try {
                    const parsed = JSON.parse(savedToolbarColors);
                    setToolbarColors(parsed);
                } catch (e) {}
            } else {
                const theme = THEMES['olive'];
                setToolbarColors({
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
                    'btn-search': { bg: theme.btnBg, text: theme.btnText, border: (theme as any).btnBorder || theme.barBorder }
                });
            }
            
            setQuranData(quranJson.data);

            const transSetting = localStorage.getItem('transparent_mode' + mode) === 'true';
            setIsTransparentMode(transSetting);

            const hideToolbarsSetting = localStorage.getItem('hide_toolbars_enabled' + mode) === 'true';
            setIsHideToolbarsEnabled(hideToolbarsSetting);

            const savedBookmarks = localStorage.getItem('quran_bookmarks_list' + mode);
            setBookmarks(savedBookmarks ? JSON.parse(savedBookmarks) : []);

            const savedSajdah = localStorage.getItem('show_sajdah_card' + mode);
            setShowSajdahCard(savedSajdah !== null ? savedSajdah === 'true' : true);

            if (mode === '_h') {
                setIsLandscapeUIHidden(localStorage.getItem('is_landscape_ui_hidden') === 'true');
            } else {
                setIsLandscapeUIHidden(false);
            }
        };

        const handleSettingsChange = () => {
            const mode = isLandscapeRef.current ? '_h' : '_v';
            const saved = localStorage.getItem('quran_settings' + mode);
            if (saved) setSettings(JSON.parse(saved));
            
            const savedToolbarColors = localStorage.getItem('toolbar_colors_v2' + mode);
            if (savedToolbarColors) {
                try {
                    const parsed = JSON.parse(savedToolbarColors);
                    setToolbarColors(parsed);
                } catch (e) {}
            } else {
                const theme = THEMES['olive'];
                setToolbarColors({
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
                    'btn-search': { bg: theme.btnBg, text: theme.btnText, border: (theme as any).btnBorder || theme.barBorder }
                });
            }
            
            setQuranData(quranJson.data);
            
            const transSetting = localStorage.getItem('transparent_mode' + mode) === 'true';
            setIsTransparentMode(transSetting);

            const hideToolbarsSetting = localStorage.getItem('hide_toolbars_enabled' + mode) === 'true';
            setIsHideToolbarsEnabled(hideToolbarsSetting);

            const savedBookmarks = localStorage.getItem('quran_bookmarks_list' + mode);
            setBookmarks(savedBookmarks ? JSON.parse(savedBookmarks) : []);

            const savedSajdah = localStorage.getItem('show_sajdah_card' + mode);
            setShowSajdahCard(savedSajdah !== null ? savedSajdah === 'true' : true);

            if (mode === '_h') {
                setIsLandscapeUIHidden(localStorage.getItem('is_landscape_ui_hidden') === 'true');
            } else {
                setIsLandscapeUIHidden(false);
            }
        };

        window.addEventListener('theme-change', handleThemeChange);
        window.addEventListener('settings-change', handleSettingsChange);
        return () => {
            window.removeEventListener('theme-change', handleThemeChange);
            window.removeEventListener('settings-change', handleSettingsChange);
        };
    }, [isLandscapeRef, setCurrentTheme, setSettings, setToolbarColors, setQuranData, setIsTransparentMode, setIsHideToolbarsEnabled, setBookmarks, setShowSajdahCard, setIsLandscapeUIHidden]);
};
