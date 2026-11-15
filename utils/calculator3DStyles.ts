import React from 'react';
import { Theme } from '../context/themes';
import { hexToRgba } from './flatDesignTokens';

export interface Calculator3DStyles {
  isBlackTheme: boolean;
  isDark: boolean;
  primaryColor: string;
  btnTextColor: string;
  primary3DShadow: string;
  primary3DStyle: React.CSSProperties;
  surfaceCardClass: string;
  innerCardClass: string;
  recessedInputClass: string;
  dividerClass: string;
  pageBgColor: string;
  textColor: string;
  subtextColor: string;
  noticeAccent: string;
  activeTintBg: string;
  softResultBg: string;
}

export function getCalculator3DStyles(
  theme: Theme,
  themeKey?: string,
  isNightMode?: boolean,
  homeThemeVariant?: string
): Calculator3DStyles {
  const isBlackTheme =
    Boolean(isNightMode) ||
    themeKey === 'black_gold' ||
    themeKey === 'deep_black' ||
    theme.bgColor === '#000000' ||
    theme.name === 'أبيض وأسود' ||
    theme.name === 'اسود' ||
    theme.name === 'black';

  const isDark = Boolean(theme.isDark) || isBlackTheme;

  let primaryColor = '#059669';
  if (isBlackTheme) {
    primaryColor = '#FFFFFF';
  } else if (homeThemeVariant === 'sky' || themeKey === 'sky_mode') {
    primaryColor = '#0284c7';
  } else if (homeThemeVariant === 'emerald' || themeKey === 'emerald_mode') {
    primaryColor = '#059669';
  } else if (homeThemeVariant === 'burgundy' || themeKey === 'burgundy_mode') {
    primaryColor = '#9f1239';
  } else {
    primaryColor = theme.palette?.[0] || theme.accent || theme.btnBg || '#059669';
  }

  const btnTextColor = isBlackTheme ? '#000000' : '#FFFFFF';
  const primary3DShadow = isBlackTheme
    ? '0 5px 0 #52525b, 0 10px 18px -2px rgba(0, 0, 0, 0.55), inset 0 2px 2px rgba(255, 255, 255, 0.65)'
    : '0 5px 0 rgba(0, 0, 0, 0.22), 0 10px 18px -2px rgba(0, 0, 0, 0.16), inset 0 2px 2px rgba(255, 255, 255, 0.35)';

  const primary3DStyle: React.CSSProperties = {
    backgroundColor: primaryColor,
    color: btnTextColor,
    boxShadow: primary3DShadow,
  };

  const surfaceCardClass = isBlackTheme
    ? 'bg-[#18181b] text-white'
    : 'bg-white dark:bg-[#1E293B] text-slate-800 dark:text-white';

  const innerCardClass = isBlackTheme
    ? 'bg-[#27272a] text-white'
    : 'bg-white dark:bg-[#0F172A] text-slate-800 dark:text-white';

  const recessedInputClass = isBlackTheme
    ? 'bg-[#27272a] text-white placeholder:text-zinc-500'
    : 'bg-slate-50 dark:bg-[#0F172A] text-slate-800 dark:text-white placeholder:text-slate-400';

  const dividerClass = isBlackTheme
    ? 'border-white/10'
    : 'border-slate-200/70 dark:border-white/10';

  const pageBgColor = isBlackTheme
    ? '#000000'
    : theme.bgColor || (isDark ? '#0B0F19' : '#F5F7FA');

  const textColor = isDark ? '#FFFFFF' : theme.textColor || '#1E293B';
  const subtextColor = isDark ? 'rgba(255, 255, 255, 0.68)' : '#64748B';

  const noticeAccent = isBlackTheme
    ? '#F59E0B'
    : homeThemeVariant === 'sky'
      ? '#0284c7'
      : homeThemeVariant === 'emerald'
        ? '#047857'
        : homeThemeVariant === 'burgundy'
          ? '#881337'
          : primaryColor === '#EAB308' || primaryColor === '#FACC15'
            ? '#B45309'
            : primaryColor;

  const activeTintBg = isBlackTheme
    ? 'rgba(255, 255, 255, 0.14)'
    : hexToRgba(primaryColor, isDark ? 0.2 : 0.12);

  const softResultBg = isBlackTheme
    ? 'rgba(255, 255, 255, 0.08)'
    : hexToRgba(primaryColor, isDark ? 0.16 : 0.09);

  return {
    isBlackTheme,
    isDark,
    primaryColor,
    btnTextColor,
    primary3DShadow,
    primary3DStyle,
    surfaceCardClass,
    innerCardClass,
    recessedInputClass,
    dividerClass,
    pageBgColor,
    textColor,
    subtextColor,
    noticeAccent,
    activeTintBg,
    softResultBg,
  };
}
