import { isDarkQuranTheme } from './constants';

export const extractModalColor = (val?: string, fallback = '#10b981'): string => {
    if (!val) return fallback;
    if (val.includes('#')) {
        const match = val.match(/#[0-9a-fA-F]{3,8}/);
        if (match) return match[0];
    }
    return val;
};

export interface QuranModalPalette {
    isDark: boolean;
    isDeepBlack: boolean;
    accentColor: string;
    headerAccent: string;
    modalBg: string;
    modalText: string;
    headerBg: string;
    closeBg: string;
    cardBg: string;
    cardText: string;
    subtleBg: string;
    selectedBg: string;
    selectedText: string;
    mutedText: string;
    fontFamily?: string;
}

export const resolveQuranModalPalette = (currentTheme?: any): QuranModalPalette => {
    const isDark = isDarkQuranTheme(currentTheme);
    const isDeepBlack = currentTheme?.id === 'deep_black';

    const accentColor = extractModalColor(
        currentTheme?.accent,
        '#10b981'
    );

    const headerAccent = isDeepBlack
        ? '#ffffff'
        : extractModalColor(
            currentTheme?.barText || currentTheme?.barBorder || currentTheme?.cardBorder || currentTheme?.accent,
            accentColor
        );

    const modalBg = currentTheme?.modalBg || currentTheme?.bg || (isDark ? '#0A0A0A' : '#ffffff');
    const modalText = currentTheme?.modalText || currentTheme?.text || (isDark ? '#ffffff' : '#0f172a');

    const cardBg = isDark
        ? (currentTheme?.cardBg || '#141414')
        : '#ffffff';

    const cardText = isDark
        ? (currentTheme?.cardText || '#ffffff')
        : (currentTheme?.cardText || modalText || '#0f172a');

    const closeBg = isDark
        ? (currentTheme?.btnBg || '#1e1e24')
        : '#ffffff';

    const headerBg = isDark
        ? 'rgba(255, 255, 255, 0.08)'
        : `${headerAccent}14`;

    const subtleBg = isDark
        ? 'rgba(255, 255, 255, 0.06)'
        : `${headerAccent}0d`;

    const selectedBg = currentTheme?.accent || accentColor;
    const selectedText = currentTheme?.accentText || '#ffffff';
    const mutedText = isDark ? 'rgba(255, 255, 255, 0.72)' : 'rgba(15, 23, 42, 0.65)';

    return {
        isDark,
        isDeepBlack,
        accentColor,
        headerAccent,
        modalBg,
        modalText,
        headerBg,
        closeBg,
        cardBg,
        cardText,
        subtleBg,
        selectedBg,
        selectedText,
        mutedText,
        fontFamily: "'Cairo', sans-serif",
    };
};
