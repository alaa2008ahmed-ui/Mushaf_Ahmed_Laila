import React, { useState, useEffect, useRef } from 'react';
import { DEFAULT_SETTINGS, THEMES } from '../components/QuranReader/constants';
import { quranData as quranJsonData } from '../utils/quranData';
const quranJson = { data: quranJsonData };

export const useQuranSettings = (initialLandscape: boolean, modeSuffix: string) => {
    const [quranData, setQuranData] = useState<any>(null);

    useEffect(() => {
        const data = quranJson.data;
        setQuranData(data);
    }, []);
    
    const [isTransparentMode, setIsTransparentMode] = useState(() => localStorage.getItem('transparent_mode' + modeSuffix) === 'true');
    const [isHideToolbarsEnabled, setIsHideToolbarsEnabled] = useState(() => localStorage.getItem('hide_toolbars_enabled' + modeSuffix) === 'true');

    const [settings, setSettings] = useState(() => {
        const saved = localStorage.getItem('quran_settings' + modeSuffix);
        const defaultTheme = THEMES['olive'];
        return saved ? JSON.parse(saved) : {
            fontSize: 1.7, fontFamily: defaultTheme.font, textColor: defaultTheme.text, bgColor: defaultTheme.bg,
            highlightTextColor: defaultTheme.highlightText || defaultTheme.accent,
            reader: 'Abu_Bakr_Ash-Shaatree_128kbps', theme: 'olive', scrollMinutes: 20, tafseer: 'ar.jalalayn',
            hideUIOnAutoScroll: false,
            lockHighlightColor: false
        };
    });
    const settingsRef = useRef(settings);
    useEffect(() => { settingsRef.current = settings; }, [settings]);

    const [currentTheme, setCurrentTheme] = useState(() => {
        const themeId = localStorage.getItem('current_theme_id' + modeSuffix) || 'olive';
        return THEMES[themeId as keyof typeof THEMES] || THEMES['olive'];
    });

    const [toolbarColors, setToolbarColors] = useState(() => {
        const saved = localStorage.getItem('toolbar_colors_v2' + modeSuffix);
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                return parsed;
            } catch (e) {}
        }
        
        const theme = THEMES['olive'];
        
        return {
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
    });

    const [bookmarks, setBookmarks] = useState(() => {
        return JSON.parse(localStorage.getItem('quran_bookmarks_list' + modeSuffix) || '[]');
    });

    const [showSajdahCard, setShowSajdahCard] = useState(() => {
        const saved = localStorage.getItem('show_sajdah_card' + modeSuffix);
        return saved !== null ? saved === 'true' : true;
    });

    const updateSetting = (key: string, value: any, isLandscapeRef: React.MutableRefObject<boolean>) => {
        const currentModeSuffix = isLandscapeRef.current ? '_h' : '_v';
        const newSettings = { ...settings, [key]: value };
        setSettings(newSettings);
        localStorage.setItem('quran_settings' + currentModeSuffix, JSON.stringify(newSettings));
        window.dispatchEvent(new Event('settings-change'));
    };

    return {
        quranData, setQuranData,
        isTransparentMode, setIsTransparentMode,
        isHideToolbarsEnabled, setIsHideToolbarsEnabled,
        settings, setSettings, settingsRef, updateSetting,
        currentTheme, setCurrentTheme,
        toolbarColors, setToolbarColors,
        bookmarks, setBookmarks,
        showSajdahCard, setShowSajdahCard
    };
};
