import React from 'react';
import { Theme } from '../context/themes';

export interface Toast3DStyleResult {
  style: React.CSSProperties;
  iconStyle: React.CSSProperties;
  isDark: boolean;
  isGolden: boolean;
  accentColor: string;
}

export function getToast3DStyles(
  theme?: Partial<Theme> | null,
  themeKey?: string,
  isNightMode?: boolean,
  homeThemeVariant?: string,
  variant: 'theme' | 'danger' = 'theme'
): Toast3DStyleResult {
  const isBlackTheme =
    Boolean(isNightMode) ||
    themeKey === 'black_gold' ||
    themeKey === 'deep_black' ||
    theme?.bgColor === '#000000' ||
    theme?.name === 'أبيض وأسود' ||
    theme?.name === 'اسود' ||
    theme?.name === 'black';

  const isDark = Boolean(theme?.isDark) || isBlackTheme;

  if (variant === 'danger') {
    return {
      style: {
        background: 'linear-gradient(180deg, #F87171 0%, #EF4444 48%, #DC2626 100%)',
        color: '#FFFFFF',
        ['--toast-3d-lip' as any]: '#991B1B',
        ['--toast-3d-ring' as any]: 'rgba(254, 202, 202, 0.45)',
        ['--toast-3d-highlight' as any]: 'rgba(255, 255, 255, 0.55)',
      },
      iconStyle: {
        background: 'linear-gradient(180deg, #FFFFFF 0%, #FEE2E2 100%)',
        color: '#DC2626',
        boxShadow: '0 2px 0 #991B1B, inset 0 1px 1px rgba(255, 255, 255, 0.9)',
      },
      isDark,
      isGolden: false,
      accentColor: '#EF4444',
    };
  }

  if (isBlackTheme) {
    const isGoldNight = themeKey === 'black_gold' || Boolean(isNightMode);
    return {
      style: {
        background: 'linear-gradient(180deg, #27272A 0%, #18181B 55%, #111114 100%)',
        color: '#FFFFFF',
        ['--toast-3d-lip' as any]: '#050507',
        ['--toast-3d-ring' as any]: isGoldNight
          ? 'rgba(245, 158, 11, 0.42)'
          : 'rgba(255, 255, 255, 0.22)',
        ['--toast-3d-highlight' as any]: 'rgba(255, 255, 255, 0.28)',
      },
      iconStyle: isGoldNight
        ? {
            background: 'linear-gradient(180deg, #FBBF24 0%, #D97706 100%)',
            color: '#000000',
            boxShadow: '0 2px 0 #78350F, inset 0 1px 1px rgba(255, 255, 255, 0.65)',
          }
        : {
            background: 'linear-gradient(180deg, #FFFFFF 0%, #E4E4E7 100%)',
            color: '#09090B',
            boxShadow: '0 2px 0 #09090B, inset 0 1px 1px rgba(255, 255, 255, 0.9)',
          },
      isDark: true,
      isGolden: false,
      accentColor: isGoldNight ? '#F59E0B' : '#FFFFFF',
    };
  }

  const isGold =
    homeThemeVariant === 'gold' ||
    themeKey === 'shiny_gold' ||
    themeKey === 'gold' ||
    theme?.cardBg === '#FDE047' ||
    theme?.name === 'الذهبي اللامع' ||
    theme?.name === 'الذهبي';

  if (isGold) {
    return {
      style: {
        background: 'linear-gradient(180deg, #FEF08A 0%, #FACC15 45%, #EAB308 100%)',
        color: '#000000',
        ['--toast-3d-lip' as any]: '#A16207',
        ['--toast-3d-ring' as any]: 'rgba(180, 83, 9, 0.36)',
        ['--toast-3d-highlight' as any]: 'rgba(255, 255, 255, 0.88)',
      },
      iconStyle: {
        background: 'linear-gradient(180deg, #D97706 0%, #B45309 100%)',
        color: '#FFFFFF',
        boxShadow: '0 2px 0 #78350F, inset 0 1px 1px rgba(255, 255, 255, 0.5)',
      },
      isDark: false,
      isGolden: true,
      accentColor: '#D97706',
    };
  }

  const isSky = homeThemeVariant === 'sky' || themeKey === 'sky_mode';
  if (isSky) {
    return {
      style: {
        background: 'linear-gradient(180deg, #38BDF8 0%, #0284C7 52%, #0369A1 100%)',
        color: '#FFFFFF',
        ['--toast-3d-lip' as any]: '#075985',
        ['--toast-3d-ring' as any]: 'rgba(125, 211, 252, 0.45)',
        ['--toast-3d-highlight' as any]: 'rgba(255, 255, 255, 0.58)',
      },
      iconStyle: {
        background: 'linear-gradient(180deg, #FFFFFF 0%, #E0F2FE 100%)',
        color: '#0284C7',
        boxShadow: '0 2px 0 #075985, inset 0 1px 1px rgba(255, 255, 255, 0.9)',
      },
      isDark: false,
      isGolden: false,
      accentColor: '#0284C7',
    };
  }

  const isEmerald = homeThemeVariant === 'emerald' || themeKey === 'emerald_mode';
  if (isEmerald) {
    return {
      style: {
        background: 'linear-gradient(180deg, #34D399 0%, #059669 52%, #047857 100%)',
        color: '#FFFFFF',
        ['--toast-3d-lip' as any]: '#064E3B',
        ['--toast-3d-ring' as any]: 'rgba(110, 231, 183, 0.45)',
        ['--toast-3d-highlight' as any]: 'rgba(255, 255, 255, 0.58)',
      },
      iconStyle: {
        background: 'linear-gradient(180deg, #FFFFFF 0%, #D1FAE5 100%)',
        color: '#047857',
        boxShadow: '0 2px 0 #064E3B, inset 0 1px 1px rgba(255, 255, 255, 0.9)',
      },
      isDark: false,
      isGolden: false,
      accentColor: '#059669',
    };
  }

  const isBurgundy = homeThemeVariant === 'burgundy' || themeKey === 'burgundy_mode';
  if (isBurgundy) {
    return {
      style: {
        background: 'linear-gradient(180deg, #E11D48 0%, #9F1239 52%, #881337 100%)',
        color: '#FFFFFF',
        ['--toast-3d-lip' as any]: '#4C0519',
        ['--toast-3d-ring' as any]: 'rgba(253, 164, 175, 0.42)',
        ['--toast-3d-highlight' as any]: 'rgba(255, 255, 255, 0.52)',
      },
      iconStyle: {
        background: 'linear-gradient(180deg, #FFFFFF 0%, #FFE4E6 100%)',
        color: '#881337',
        boxShadow: '0 2px 0 #4C0519, inset 0 1px 1px rgba(255, 255, 255, 0.9)',
      },
      isDark: false,
      isGolden: false,
      accentColor: '#881337',
    };
  }

  const fallbackAccent = theme?.palette?.[0] || theme?.accent || theme?.btnBg || '#059669';
  return {
    style: {
      background: `linear-gradient(180deg, ${fallbackAccent}ee 0%, ${fallbackAccent} 100%)`,
      color: theme?.btnText || theme?.accentText || '#FFFFFF',
      ['--toast-3d-lip' as any]: 'rgba(0, 0, 0, 0.34)',
      ['--toast-3d-ring' as any]: 'rgba(255, 255, 255, 0.35)',
      ['--toast-3d-highlight' as any]: 'rgba(255, 255, 255, 0.55)',
    },
    iconStyle: {
      background: 'linear-gradient(180deg, #FFFFFF 0%, #F1F5F9 100%)',
      color: fallbackAccent,
      boxShadow: '0 2px 0 rgba(0, 0, 0, 0.25), inset 0 1px 1px rgba(255, 255, 255, 0.9)',
    },
    isDark,
    isGolden: false,
    accentColor: fallbackAccent,
  };
}
