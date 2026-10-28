import { Preferences } from '@capacitor/preferences';
import { Capacitor } from '@capacitor/core';
import { AutoSilentMode } from './silentMode';
import { presetThemes } from '../context/themes';

export interface WidgetData {
  hijri: string;
  gregorian: string;
  day: string;
  city: string;
  next_prayer_name: string;
  next_prayer_id: string;
  remaining_time: string;
  target_time_millis?: number;
  base_date_millis?: number;
  coordinates?: {
    lat: number;
    lng: number;
  };
  method_id?: number;
  prayer_offsets?: Record<string, number>;
  isSummerTime?: boolean;
  midnight: string;
  last_third: string;
  times: {
    fajr: string;
    sunrise: string;
    dhuhr: string;
    asr: string;
    maghrib: string;
    isha: string;
  };
  times_24h?: {
    fajr: string;
    sunrise: string;
    dhuhr: string;
    asr: string;
    maghrib: string;
    isha: string;
  };
  timestamps?: {
    fajr: number;
    sunrise: number;
    dhuhr: number;
    asr: number;
    maghrib: number;
    isha: number;
    nextFajr: number;
    nextSunrise: number;
    nextDhuhr: number;
    nextAsr: number;
    nextMaghrib: number;
    nextIsha: number;
  };
  theme?: {
    isDark?: boolean;
    themeKey?: string;
    primaryColor?: string;
    secondaryColor?: string;
    bgColor?: string;
    textColor?: string;
    cardBg?: string;
  } | null;
  app_language?: string;
}

// Helper to blend hex color with white (tint for soft, light, clear widget backgrounds)
function tintColor(hex: string, factor: number = 0.85): string {
  try {
    const clean = hex.replace('#', '').trim();
    const full = clean.length === 3 ? clean.split('').map(c => c + c).join('') : clean;
    const num = parseInt(full, 16);
    let r = (num >> 16) & 255;
    let g = (num >> 8) & 255;
    let b = num & 255;
    r = Math.round(r + (255 - r) * factor);
    g = Math.round(g + (255 - g) * factor);
    b = Math.round(b + (255 - b) * factor);
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()}`;
  } catch (e) {
    return '#F1F5F9';
  }
}

// Helper to darken hex color for high-contrast, perfectly legible text on light backgrounds
function darkenColor(hex: string, factor: number = 0.35): string {
  try {
    const clean = hex.replace('#', '').trim();
    const full = clean.length === 3 ? clean.split('').map(c => c + c).join('') : clean;
    const num = parseInt(full, 16);
    let r = (num >> 16) & 255;
    let g = (num >> 8) & 255;
    let b = num & 255;
    r = Math.round(r * (1 - factor));
    g = Math.round(g * (1 - factor));
    b = Math.round(b * (1 - factor));
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()}`;
  } catch (e) {
    return '#0F172A';
  }
}

/**
 * Returns a complete, beautifully harmonized widget color palette for any theme.
 * For "default", returns the exact original widget colors matching initial device boot.
 * For light themes, creates soft, bright, clear pastel tones derived from the theme colors
 * so the widgets look light, crisp, and matching the main screen rather than dark/gloomy.
 * For dark themes, provides sleek dark mode tones with high-contrast text.
 */
export function getWidgetThemePalette(themeKey: string, theme?: any) {
  const matchedPreset = theme || (presetThemes as any)[themeKey] || (presetThemes as any).default;
  const isDark = matchedPreset.isDark ?? (
    themeKey === 'deep_black' ||
    ['evening_tranquility', 'electric_violet', 'midnight_neon', 'royal_purple', 'desert_night', 'ocean_peace', 'deep_forest', 'midnight_glass'].includes(themeKey) ||
    matchedPreset.bgColor === '#000000' ||
    (typeof document !== 'undefined' && document.documentElement.classList.contains('dark'))
  );

  // 1. Default Theme (Exact 1:1 match with initial device boot / fresh install widget)
  if (themeKey === 'default') {
    return {
      themeKey: 'default',
      isDark: false,
      rootBg: '#FFFFFF',
      middleBg: '#FFFFFF',
      cardBg: '#FFFFFF',
      textColor: '#0F172A',
      section1Bg: '#544670', // Purple date section
      section1Text: '#FFFFFF',
      section2Bg: '#A26743', // Terracotta midnight section
      section2Text: '#FFFFFF',
      heroBg: '#544670',
      heroPrayerName: '#86EFAC',
      heroPrayerTime: '#FDE68A',
      heroCountdown: '#FFFFFF',
      nextPrayerColor: '#2E7D5E',
      highlightPrayerColor: '#3B7A82',
      stripColor1: '#544670',
      stripColor2: '#2E7D5E',
      stripColor3: '#3B7A82',
      stripColor4: '#A26743',
      sepColor: '#E0E0E0',
      cardCityColor: '#544670',
      cardDateColor: '#3B7A82',
      compactCityColor: '#544670',
      compactTagColor: '#3B7A82',
      compactNameColor: '#2E7D5E',
      compactTimeColor: '#A26743',
      // Backward compatibility keys
      primaryColor: '#2E7D5E',
      secondaryColor: '#544670',
      bgColor: '#FFFFFF',
      purpleColor: '#544670',
      greenColor: '#2E7D5E',
      tealColor: '#3B7A82',
      terracottaColor: '#A26743'
    };
  }

  // 2. Predefined Light Themes with handcrafted, luminous, soft shades
  const lightThemesMap: Record<string, any> = {
    fajr_light: {
      rootBg: '#F0F9FF',
      middleBg: '#FFFFFF',
      cardBg: '#FFFFFF',
      textColor: '#0C4A6E',
      section1Bg: '#E0F2FE',
      section1Text: '#0369A1',
      section2Bg: '#EEF2FF',
      section2Text: '#4338CA',
      heroBg: '#E0F2FE',
      heroPrayerName: '#0284C7',
      heroPrayerTime: '#0369A1',
      heroCountdown: '#0C4A6E',
      nextPrayerColor: '#0284C7',
      highlightPrayerColor: '#0284C7',
      stripColor1: '#0284C7',
      stripColor2: '#6366F1',
      stripColor3: '#38BDF8',
      stripColor4: '#0284C7',
      sepColor: '#BAE6FD',
      cardCityColor: '#0284C7',
      cardDateColor: '#0369A1',
      compactCityColor: '#0284C7',
      compactTagColor: '#6366F1',
      compactNameColor: '#0284C7',
      compactTimeColor: '#0369A1'
    },
    golden_sand: {
      rootBg: '#FFFBEB',
      middleBg: '#FFFFFF',
      cardBg: '#FFFFFF',
      textColor: '#451A03',
      section1Bg: '#FEF3C7',
      section1Text: '#92400E',
      section2Bg: '#ECFDF5',
      section2Text: '#065F46',
      heroBg: '#FEF3C7',
      heroPrayerName: '#B45309',
      heroPrayerTime: '#92400E',
      heroCountdown: '#451A03',
      nextPrayerColor: '#B45309',
      highlightPrayerColor: '#B45309',
      stripColor1: '#B45309',
      stripColor2: '#059669',
      stripColor3: '#D97706',
      stripColor4: '#92400E',
      sepColor: '#FDE68A',
      cardCityColor: '#B45309',
      cardDateColor: '#059669',
      compactCityColor: '#B45309',
      compactTagColor: '#059669',
      compactNameColor: '#B45309',
      compactTimeColor: '#92400E'
    },
    olive_grove: {
      rootBg: '#F7FEE7',
      middleBg: '#FFFFFF',
      cardBg: '#FFFFFF',
      textColor: '#1A2E05',
      section1Bg: '#ECFCCB',
      section1Text: '#365314',
      section2Bg: '#FEF3C7',
      section2Text: '#92400E',
      heroBg: '#ECFCCB',
      heroPrayerName: '#4D7C0F',
      heroPrayerTime: '#365314',
      heroCountdown: '#1A2E05',
      nextPrayerColor: '#4D7C0F',
      highlightPrayerColor: '#4D7C0F',
      stripColor1: '#4D7C0F',
      stripColor2: '#B45309',
      stripColor3: '#65A30D',
      stripColor4: '#3F6212',
      sepColor: '#D9F99D',
      cardCityColor: '#4D7C0F',
      cardDateColor: '#B45309',
      compactCityColor: '#4D7C0F',
      compactTagColor: '#B45309',
      compactNameColor: '#4D7C0F',
      compactTimeColor: '#365314'
    },
    kaaba_kiswa: {
      rootBg: '#F9FAFB',
      middleBg: '#FFFFFF',
      cardBg: '#FFFFFF',
      textColor: '#111827',
      section1Bg: '#D1FAE5',
      section1Text: '#065F46',
      section2Bg: '#FEF3C7',
      section2Text: '#92400E',
      heroBg: '#D1FAE5',
      heroPrayerName: '#059669',
      heroPrayerTime: '#065F46',
      heroCountdown: '#111827',
      nextPrayerColor: '#059669',
      highlightPrayerColor: '#059669',
      stripColor1: '#059669',
      stripColor2: '#D97706',
      stripColor3: '#10B981',
      stripColor4: '#1F2937',
      sepColor: '#E5E7EB',
      cardCityColor: '#059669',
      cardDateColor: '#D97706',
      compactCityColor: '#059669',
      compactTagColor: '#D97706',
      compactNameColor: '#059669',
      compactTimeColor: '#065F46'
    },
    islamic_heritage: {
      rootBg: '#FDFCF0',
      middleBg: '#FFFFFF',
      cardBg: '#FFFFFF',
      textColor: '#45322E',
      section1Bg: '#F5EBE1',
      section1Text: '#8B4513',
      section2Bg: '#EDF3E6',
      section2Text: '#3F5124',
      heroBg: '#F5EBE1',
      heroPrayerName: '#8B4513',
      heroPrayerTime: '#5C2E0C',
      heroCountdown: '#45322E',
      nextPrayerColor: '#8B4513',
      highlightPrayerColor: '#8B4513',
      stripColor1: '#8B4513',
      stripColor2: '#556B2F',
      stripColor3: '#A0522D',
      stripColor4: '#8B4513',
      sepColor: '#E6DACB',
      cardCityColor: '#8B4513',
      cardDateColor: '#556B2F',
      compactCityColor: '#8B4513',
      compactTagColor: '#556B2F',
      compactNameColor: '#8B4513',
      compactTimeColor: '#5C2E0C'
    },
    morning_dew: {
      rootBg: '#ECFDF5',
      middleBg: '#FFFFFF',
      cardBg: '#FFFFFF',
      textColor: '#064E3B',
      section1Bg: '#D1FAE5',
      section1Text: '#065F46',
      section2Bg: '#E0F2FE',
      section2Text: '#0369A1',
      heroBg: '#D1FAE5',
      heroPrayerName: '#059669',
      heroPrayerTime: '#047857',
      heroCountdown: '#064E3B',
      nextPrayerColor: '#059669',
      highlightPrayerColor: '#059669',
      stripColor1: '#059669',
      stripColor2: '#0284C7',
      stripColor3: '#10B981',
      stripColor4: '#059669',
      sepColor: '#A7F3D0',
      cardCityColor: '#059669',
      cardDateColor: '#0284C7',
      compactCityColor: '#059669',
      compactTagColor: '#0284C7',
      compactNameColor: '#059669',
      compactTimeColor: '#047857'
    },
    madinah_rose: {
      rootBg: '#FFF1F2',
      middleBg: '#FFFFFF',
      cardBg: '#FFFFFF',
      textColor: '#881337',
      section1Bg: '#FFE4E6',
      section1Text: '#9F1239',
      section2Bg: '#F3E8FF',
      section2Text: '#6D28D9',
      heroBg: '#FFE4E6',
      heroPrayerName: '#BE123C',
      heroPrayerTime: '#9F1239',
      heroCountdown: '#881337',
      nextPrayerColor: '#BE123C',
      highlightPrayerColor: '#BE123C',
      stripColor1: '#BE123C',
      stripColor2: '#7C3AED',
      stripColor3: '#E11D48',
      stripColor4: '#9F1239',
      sepColor: '#FECDD3',
      cardCityColor: '#BE123C',
      cardDateColor: '#7C3AED',
      compactCityColor: '#BE123C',
      compactTagColor: '#7C3AED',
      compactNameColor: '#BE123C',
      compactTimeColor: '#9F1239'
    },
    andalusian_garden: {
      rootBg: '#F0FDF4',
      middleBg: '#FFFFFF',
      cardBg: '#FFFFFF',
      textColor: '#14532D',
      section1Bg: '#DCFCE7',
      section1Text: '#14532D',
      section2Bg: '#FEF3C7',
      section2Text: '#92400E',
      heroBg: '#DCFCE7',
      heroPrayerName: '#166534',
      heroPrayerTime: '#14532D',
      heroCountdown: '#14532D',
      nextPrayerColor: '#166534',
      highlightPrayerColor: '#166534',
      stripColor1: '#166534',
      stripColor2: '#92400E',
      stripColor3: '#22C55E',
      stripColor4: '#15803D',
      sepColor: '#BBF7D0',
      cardCityColor: '#166534',
      cardDateColor: '#92400E',
      compactCityColor: '#166534',
      compactTagColor: '#92400E',
      compactNameColor: '#166534',
      compactTimeColor: '#14532D'
    },
    blue_mosque: {
      rootBg: '#ECFEFF',
      middleBg: '#FFFFFF',
      cardBg: '#FFFFFF',
      textColor: '#164E63',
      section1Bg: '#CFFAFE',
      section1Text: '#155E75',
      section2Bg: '#E0E7FF',
      section2Text: '#3730A3',
      heroBg: '#CFFAFE',
      heroPrayerName: '#0E7490',
      heroPrayerTime: '#155E75',
      heroCountdown: '#164E63',
      nextPrayerColor: '#0E7490',
      highlightPrayerColor: '#0E7490',
      stripColor1: '#0E7490',
      stripColor2: '#4338CA',
      stripColor3: '#06B6D4',
      stripColor4: '#0E7490',
      sepColor: '#A5F3FC',
      cardCityColor: '#0E7490',
      cardDateColor: '#4338CA',
      compactCityColor: '#0E7490',
      compactTagColor: '#4338CA',
      compactNameColor: '#0E7490',
      compactTimeColor: '#155E75'
    },
    clay_earth: {
      rootBg: '#FAFAF9',
      middleBg: '#FFFFFF',
      cardBg: '#FFFFFF',
      textColor: '#44403C',
      section1Bg: '#F5F5F4',
      section1Text: '#44403C',
      section2Bg: '#FFEDD5',
      section2Text: '#9A3412',
      heroBg: '#F5F5F4',
      heroPrayerName: '#9A3412',
      heroPrayerTime: '#44403C',
      heroCountdown: '#292524',
      nextPrayerColor: '#9A3412',
      highlightPrayerColor: '#9A3412',
      stripColor1: '#44403C',
      stripColor2: '#9A3412',
      stripColor3: '#78716C',
      stripColor4: '#C2410C',
      sepColor: '#E7E5E4',
      cardCityColor: '#44403C',
      cardDateColor: '#9A3412',
      compactCityColor: '#44403C',
      compactTagColor: '#9A3412',
      compactNameColor: '#9A3412',
      compactTimeColor: '#44403C'
    },
    slate_stone: {
      rootBg: '#F8FAFC',
      middleBg: '#FFFFFF',
      cardBg: '#FFFFFF',
      textColor: '#334155',
      section1Bg: '#F1F5F9',
      section1Text: '#1E293B',
      section2Bg: '#CCFBF1',
      section2Text: '#0F766E',
      heroBg: '#F1F5F9',
      heroPrayerName: '#0D9488',
      heroPrayerTime: '#1E293B',
      heroCountdown: '#334155',
      nextPrayerColor: '#0D9488',
      highlightPrayerColor: '#0D9488',
      stripColor1: '#334155',
      stripColor2: '#0D9488',
      stripColor3: '#64748B',
      stripColor4: '#0F766E',
      sepColor: '#CBD5E1',
      cardCityColor: '#334155',
      cardDateColor: '#0D9488',
      compactCityColor: '#334155',
      compactTagColor: '#0D9488',
      compactNameColor: '#0D9488',
      compactTimeColor: '#1E293B'
    },
    sunset_glow: {
      rootBg: '#FFF7ED',
      middleBg: '#FFFFFF',
      cardBg: '#FFFFFF',
      textColor: '#9A3412',
      section1Bg: '#FFEDD5',
      section1Text: '#C2410C',
      section2Bg: '#F3E8FF',
      section2Text: '#7E22CE',
      heroBg: '#FFEDD5',
      heroPrayerName: '#EA580C',
      heroPrayerTime: '#C2410C',
      heroCountdown: '#9A3412',
      nextPrayerColor: '#EA580C',
      highlightPrayerColor: '#EA580C',
      stripColor1: '#EA580C',
      stripColor2: '#9333EA',
      stripColor3: '#F97316',
      stripColor4: '#EA580C',
      sepColor: '#FED7AA',
      cardCityColor: '#EA580C',
      cardDateColor: '#9333EA',
      compactCityColor: '#EA580C',
      compactTagColor: '#9333EA',
      compactNameColor: '#EA580C',
      compactTimeColor: '#C2410C'
    },
    sakura_breeze: {
      rootBg: '#FFF1F2',
      middleBg: '#FFFFFF',
      cardBg: '#FFFFFF',
      textColor: '#9D174D',
      section1Bg: '#FCE7F3',
      section1Text: '#BE185D',
      section2Bg: '#F3E8FF',
      section2Text: '#6D28D9',
      heroBg: '#FCE7F3',
      heroPrayerName: '#DB2777',
      heroPrayerTime: '#BE185D',
      heroCountdown: '#9D174D',
      nextPrayerColor: '#DB2777',
      highlightPrayerColor: '#DB2777',
      stripColor1: '#DB2777',
      stripColor2: '#7C3AED',
      stripColor3: '#F472B6',
      stripColor4: '#DB2777',
      sepColor: '#FBCFE8',
      cardCityColor: '#DB2777',
      cardDateColor: '#7C3AED',
      compactCityColor: '#DB2777',
      compactTagColor: '#7C3AED',
      compactNameColor: '#DB2777',
      compactTimeColor: '#BE185D'
    },
    vintage_paper: {
      rootBg: '#FEFBF1',
      middleBg: '#FFFFFF',
      cardBg: '#FFFFFF',
      textColor: '#3D3328',
      section1Bg: '#EDE6D3',
      section1Text: '#78350F',
      section2Bg: '#ECFCCB',
      section2Text: '#3F6212',
      heroBg: '#EDE6D3',
      heroPrayerName: '#78350F',
      heroPrayerTime: '#451A03',
      heroCountdown: '#3D3328',
      nextPrayerColor: '#78350F',
      highlightPrayerColor: '#78350F',
      stripColor1: '#78350F',
      stripColor2: '#4D7C0F',
      stripColor3: '#C2B092',
      stripColor4: '#78350F',
      sepColor: '#D4C5A9',
      cardCityColor: '#78350F',
      cardDateColor: '#4D7C0F',
      compactCityColor: '#78350F',
      compactTagColor: '#4D7C0F',
      compactNameColor: '#78350F',
      compactTimeColor: '#451A03'
    },
    turquoise_gem: {
      rootBg: '#F0FDFA',
      middleBg: '#FFFFFF',
      cardBg: '#FFFFFF',
      textColor: '#134E4A',
      section1Bg: '#CCFBF1',
      section1Text: '#0F766E',
      section2Bg: '#DBEAFE',
      section2Text: '#1D4ED8',
      heroBg: '#CCFBF1',
      heroPrayerName: '#0D9488',
      heroPrayerTime: '#0F766E',
      heroCountdown: '#134E4A',
      nextPrayerColor: '#0D9488',
      highlightPrayerColor: '#0D9488',
      stripColor1: '#0D9488',
      stripColor2: '#2563EB',
      stripColor3: '#2DD4BF',
      stripColor4: '#0D9488',
      sepColor: '#99F6E4',
      cardCityColor: '#0D9488',
      cardDateColor: '#2563EB',
      compactCityColor: '#0D9488',
      compactTagColor: '#2563EB',
      compactNameColor: '#0D9488',
      compactTimeColor: '#0F766E'
    },
    lavender_mist: {
      rootBg: '#FAF5FF',
      middleBg: '#FFFFFF',
      cardBg: '#FFFFFF',
      textColor: '#581C87',
      section1Bg: '#F3E8FF',
      section1Text: '#6D28D9',
      section2Bg: '#FCE7F3',
      section2Text: '#9D174D',
      heroBg: '#F3E8FF',
      heroPrayerName: '#7C3AED',
      heroPrayerTime: '#6D28D9',
      heroCountdown: '#581C87',
      nextPrayerColor: '#7C3AED',
      highlightPrayerColor: '#7C3AED',
      stripColor1: '#7C3AED',
      stripColor2: '#BE185D',
      stripColor3: '#A855F7',
      stripColor4: '#7C3AED',
      sepColor: '#E9D5FF',
      cardCityColor: '#7C3AED',
      cardDateColor: '#BE185D',
      compactCityColor: '#7C3AED',
      compactTagColor: '#BE185D',
      compactNameColor: '#7C3AED',
      compactTimeColor: '#6D28D9'
    },
    crystal_glass: {
      rootBg: '#FFFFFF',
      middleBg: '#FFFFFF',
      cardBg: '#FFFFFF',
      textColor: '#0369A1',
      section1Bg: '#E0F2FE',
      section1Text: '#0369A1',
      section2Bg: '#F3E8FF',
      section2Text: '#6D28D9',
      heroBg: '#E0F2FE',
      heroPrayerName: '#0284C7',
      heroPrayerTime: '#0369A1',
      heroCountdown: '#0C4A6E',
      nextPrayerColor: '#0284C7',
      highlightPrayerColor: '#0284C7',
      stripColor1: '#0284C7',
      stripColor2: '#7C3AED',
      stripColor3: '#38BDF8',
      stripColor4: '#0284C7',
      sepColor: '#BAE6FD',
      cardCityColor: '#0284C7',
      cardDateColor: '#7C3AED',
      compactCityColor: '#0284C7',
      compactTagColor: '#7C3AED',
      compactNameColor: '#0284C7',
      compactTimeColor: '#0369A1'
    },
    frosted_emerald: {
      rootBg: '#ECFDF5',
      middleBg: '#FFFFFF',
      cardBg: '#FFFFFF',
      textColor: '#065F46',
      section1Bg: '#D1FAE5',
      section1Text: '#047857',
      section2Bg: '#EDE9FE',
      section2Text: '#6D28D9',
      heroBg: '#D1FAE5',
      heroPrayerName: '#059669',
      heroPrayerTime: '#047857',
      heroCountdown: '#065F46',
      nextPrayerColor: '#059669',
      highlightPrayerColor: '#059669',
      stripColor1: '#059669',
      stripColor2: '#8B5CF6',
      stripColor3: '#10B981',
      stripColor4: '#064E3B',
      sepColor: '#A7F3D0',
      cardCityColor: '#059669',
      cardDateColor: '#8B5CF6',
      compactCityColor: '#059669',
      compactTagColor: '#8B5CF6',
      compactNameColor: '#059669',
      compactTimeColor: '#047857'
    }
  };

  if (!isDark && lightThemesMap[themeKey]) {
    const p = lightThemesMap[themeKey];
    return {
      themeKey,
      isDark: false,
      ...p,
      primaryColor: p.nextPrayerColor,
      secondaryColor: p.section1Text,
      bgColor: p.rootBg,
      purpleColor: p.section1Bg,
      greenColor: p.nextPrayerColor,
      tealColor: p.highlightPrayerColor,
      terracottaColor: p.section2Bg
    };
  }

  // 3. Predefined Dark / Black Themes with high contrast & nocturnal elegance
  if (isDark) {
    const isPureBlack = themeKey === 'deep_black' || matchedPreset.bgColor === '#000000';
    const darkRoot = isPureBlack ? '#000000' : (matchedPreset.bgColor || '#0F172A');
    const darkCard = isPureBlack ? '#111111' : (matchedPreset.cardBg || '#1E293B');
    const prim = matchedPreset.palette?.[0] || '#10B981';
    const sec = matchedPreset.palette?.[1] || '#38BDF8';
    const tert = matchedPreset.palette?.[2] || '#A855F7';

    return {
      themeKey,
      isDark: true,
      rootBg: darkRoot,
      middleBg: darkCard,
      cardBg: darkCard,
      textColor: '#FFFFFF',
      section1Bg: isPureBlack ? '#1F2937' : '#1E293B',
      section1Text: '#F8FAFC',
      section2Bg: isPureBlack ? '#18181B' : '#1E1B4B',
      section2Text: '#FDE68A',
      heroBg: isPureBlack ? '#18181B' : '#1E293B',
      heroPrayerName: prim,
      heroPrayerTime: '#FDE68A',
      heroCountdown: '#FFFFFF',
      nextPrayerColor: prim,
      highlightPrayerColor: sec,
      stripColor1: prim,
      stripColor2: sec,
      stripColor3: tert,
      stripColor4: prim,
      sepColor: isPureBlack ? '#27272A' : '#334155',
      cardCityColor: '#CBD5E1',
      cardDateColor: '#94A3B8',
      compactCityColor: sec,
      compactTagColor: prim,
      compactNameColor: prim,
      compactTimeColor: '#FDE68A',
      // Compat
      primaryColor: prim,
      secondaryColor: sec,
      bgColor: darkRoot,
      purpleColor: '#1E293B',
      greenColor: prim,
      tealColor: sec,
      terracottaColor: '#1E1B4B'
    };
  }

  // 4. Fallback for any arbitrary light theme: dynamically generate light pastel shades
  const p0 = matchedPreset.palette?.[0] || '#059669';
  const p1 = matchedPreset.palette?.[1] || '#B45309';
  const p2 = matchedPreset.palette?.[2] || p0;
  const p3 = matchedPreset.palette?.[3] || p1;

  const lightRoot = matchedPreset.bgColor || '#F8FAFC';
  const s1Bg = tintColor(p0, 0.88);
  const s1Text = darkenColor(p0, 0.2);
  const s2Bg = tintColor(p1, 0.88);
  const s2Text = darkenColor(p1, 0.2);

  return {
    themeKey,
    isDark: false,
    rootBg: lightRoot,
    middleBg: '#FFFFFF',
    cardBg: '#FFFFFF',
    textColor: matchedPreset.textColor || '#0F172A',
    section1Bg: s1Bg,
    section1Text: s1Text,
    section2Bg: s2Bg,
    section2Text: s2Text,
    heroBg: s1Bg,
    heroPrayerName: p0,
    heroPrayerTime: s1Text,
    heroCountdown: matchedPreset.textColor || '#0F172A',
    nextPrayerColor: p0,
    highlightPrayerColor: p2,
    stripColor1: p0,
    stripColor2: p1,
    stripColor3: p2,
    stripColor4: p3,
    sepColor: tintColor(p0, 0.75),
    cardCityColor: p0,
    cardDateColor: p1,
    compactCityColor: p0,
    compactTagColor: p1,
    compactNameColor: p0,
    compactTimeColor: s1Text,
    // Compat
    primaryColor: p0,
    secondaryColor: p1,
    bgColor: lightRoot,
    purpleColor: s1Bg,
    greenColor: p0,
    tealColor: p2,
    terracottaColor: s2Bg
  };
}

/**
 * Updates the Android App Widgets (Full & Compact) with the latest prayer times data.
 * This function stores the data in Capacitor's default SharedPreferences
 * and sends an immediate native broadcast/plugin call to update all widgets instantly.
 */
export const updateAndroidWidget = async (data: WidgetData, syncTheme: boolean = true) => {
  if (Capacitor.getPlatform() !== 'android') return;

  try {
    const widgetLockLang = (typeof window !== 'undefined' ? localStorage.getItem('widget_lock_lang') : null);
    const appLang = (widgetLockLang === 'ar' || widgetLockLang === 'en')
      ? widgetLockLang
      : (data.app_language || (typeof window !== 'undefined' ? localStorage.getItem('app_language') : null) || 'ar');
    const isWidgetLockTheme = (typeof window !== 'undefined' && localStorage.getItem('widget_lock_theme') === 'true');

    // Retrieve existing theme if any
    let existingTheme: any = null;
    try {
      const raw = await Preferences.get({ key: 'widget_prayer_data' });
      if (raw.value) {
        const parsed = JSON.parse(raw.value);
        if (parsed.theme) existingTheme = parsed.theme;
      }
    } catch (e) {}

    const reqThemeKey = data.theme?.themeKey || existingTheme?.themeKey || 'default';
    const computedPalette = getWidgetThemePalette(reqThemeKey, data.theme);

    // When widget_lock_theme is enabled and existingTheme exists, keep existing theme intact!
    const appliedTheme = (isWidgetLockTheme && existingTheme)
      ? existingTheme
      : computedPalette;

    const finalData = {
      ...data,
      base_date_millis: data.base_date_millis || Date.now(),
      app_language: appLang,
      theme: appliedTheme
    };

    // Store in CapacitorStorage for native access
    await Preferences.set({
      key: 'widget_prayer_data',
      value: JSON.stringify(finalData)
    });

    // Also persist widget lock preferences directly
    if (widgetLockLang) {
      await Preferences.set({
        key: 'widget_lock_lang',
        value: widgetLockLang
      });
    } else {
      await Preferences.remove({ key: 'widget_lock_lang' });
    }

    await Preferences.set({
      key: 'widget_lock_theme',
      value: isWidgetLockTheme ? 'true' : 'false'
    });

    // Immediate native update: triggers PrayerWidgetProvider, PrayerCompactWidgetProvider, & PersistentPrayerNotification
    try {
      if (AutoSilentMode && typeof AutoSilentMode.updateWidget === 'function') {
        await AutoSilentMode.updateWidget();
      }
    } catch (pluginErr) {
      console.warn('Native updateWidget call failed, fallback will handle it:', pluginErr);
    }

    // Also refresh native persistent notification
    try {
      const { updateNativePersistentNotification } = await import('./silentMode');
      await updateNativePersistentNotification();
    } catch (e) {
      console.warn('Could not update persistent notification:', e);
    }

    console.log('Android Widgets (Full & Compact) and Notification updated successfully');
  } catch (error) {
    console.error('Failed to update Android Widget data:', error);
  }
};

/**
 * Synchronizes the home screen theme colors directly to all Android home screen widgets in real time.
 */
export const syncWidgetThemeColors = async (themeKey: string, theme: any) => {
  if (Capacitor.getPlatform() !== 'android') return;

  const isWidgetLockTheme = (typeof window !== 'undefined' && localStorage.getItem('widget_lock_theme') === 'true');
  if (isWidgetLockTheme) {
    console.log('Real-time widget theme sync skipped because widget_lock_theme is enabled');
    return;
  }

  try {
    const rawData = await Preferences.get({ key: 'widget_prayer_data' });
    let parsed: any = {};
    if (rawData.value) {
      try {
        parsed = JSON.parse(rawData.value);
      } catch (err) {
        parsed = {};
      }
    }

    if (!parsed.times) {
      parsed.city = parsed.city || 'الدمام';
      parsed.next_prayer_name = parsed.next_prayer_name || 'الفجر';
      parsed.times = {
        fajr: '04:30',
        sunrise: '05:50',
        dhuhr: '11:45',
        asr: '02:55',
        maghrib: '05:40',
        isha: '07:10'
      };
      parsed.hijri = parsed.hijri || '';
      parsed.gregorian = parsed.gregorian || '';
      parsed.base_date_millis = Date.now();
    }

    const appliedTheme = getWidgetThemePalette(themeKey, theme);
    parsed.theme = appliedTheme;

    await Preferences.set({
      key: 'widget_prayer_data',
      value: JSON.stringify(parsed)
    });

    if (AutoSilentMode && typeof AutoSilentMode.updateWidget === 'function') {
      await AutoSilentMode.updateWidget();
    }
    console.log('Real-time widget theme sync completed:', themeKey);
  } catch (e) {
    console.warn('Failed to sync widget theme colors:', e);
  }
};

