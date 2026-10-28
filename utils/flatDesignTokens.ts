import { Theme } from '../context/themes';

export interface ModernFlatTokens {
    isDark: boolean;
    isDeepBlack: boolean;
    primaryColor: string;
    secondaryColor: string;
    themeActiveTextColor: string;
    textColor: string;
    subtextColor: string;
    pageBgColor: string;
    cardBgColor: string;
    cardShadow: string;
    cardShadowHover: string;
    capsuleBg: string;
    filledInputBg: string;
    chipInactiveBg: string;
    chipInactiveHoverBg: string;
    actionBtnBg: string;
    actionBtnHoverBg: string;
    subtleDivider: string;
}

export function getModernFlatTokens(theme: Theme, themeKey?: string): ModernFlatTokens {
    const isDark = Boolean(theme.isDark);
    const isDeepBlack = theme.bgColor === '#000000' || theme.name === 'أبيض وأسود' || themeKey === 'deep_black';
    const primaryColor = isDeepBlack ? 'rgba(255, 255, 255, 0.25)' : (theme.palette?.[0] || theme.accent || '#059669');
    const secondaryColor = isDeepBlack ? '#E2E8F0' : (theme.palette?.[1] || theme.palette?.[0] || primaryColor);
    const themeActiveTextColor = isDeepBlack ? '#FFFFFF' : (theme.accentText || '#FFFFFF');
    const textColor = isDark ? '#FFFFFF' : (theme.textColor || '#1E293B');
    const subtextColor = isDark ? 'rgba(255, 255, 255, 0.65)' : '#64748B';

    // Light mode: Clean Off-white (#F5F7FA) background, Pure White (#FFFFFF) cards
    // Dark mode: Dynamic theme background and card background
    const pageBgColor = isDark ? (theme.bgColor || '#0B0F19') : '#F5F7FA';
    const cardBgColor = isDark ? (isDeepBlack ? '#111111' : (theme.cardBg || '#161F30')) : '#FFFFFF';
    
    // Soft drop shadows without harsh outlines
    const cardShadow = isDark 
        ? '0 4px 20px -2px rgba(0, 0, 0, 0.35)' 
        : '0 4px 14px rgba(0, 0, 0, 0.04)';
    const cardShadowHover = isDark
        ? '0 8px 30px -2px rgba(0, 0, 0, 0.45)'
        : '0 8px 24px rgba(0, 0, 0, 0.07)';

    // Modern flat surfaces for capsule tabs, filled inputs, and chips
    const capsuleBg = isDark ? 'rgba(255, 255, 255, 0.08)' : '#E8EDF3';
    const filledInputBg = isDark ? 'rgba(255, 255, 255, 0.07)' : '#F1F4F9';
    const chipInactiveBg = isDark ? 'rgba(255, 255, 255, 0.07)' : '#F1F4F9';
    const chipInactiveHoverBg = isDark ? 'rgba(255, 255, 255, 0.12)' : '#E4E9F2';
    const actionBtnBg = isDark ? 'rgba(255, 255, 255, 0.08)' : '#F1F4F9';
    const actionBtnHoverBg = isDark ? 'rgba(255, 255, 255, 0.14)' : '#E4E9F2';
    const subtleDivider = isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.04)';

    return {
        isDark,
        isDeepBlack,
        primaryColor,
        secondaryColor,
        themeActiveTextColor,
        textColor,
        subtextColor,
        pageBgColor,
        cardBgColor,
        cardShadow,
        cardShadowHover,
        capsuleBg,
        filledInputBg,
        chipInactiveBg,
        chipInactiveHoverBg,
        actionBtnBg,
        actionBtnHoverBg,
        subtleDivider,
    };
}

export function hexToRgba(hex?: string, alpha: number = 1): string {
    if (!hex) return `rgba(5, 150, 105, ${alpha})`;
    let clean = hex.replace('#', '');
    if (clean.length === 3) {
        clean = clean.split('').map(c => c + c).join('');
    }
    const num = parseInt(clean, 16);
    if (isNaN(num)) return `rgba(5, 150, 105, ${alpha})`;
    const r = (num >> 16) & 255;
    const g = (num >> 8) & 255;
    const b = num & 255;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
