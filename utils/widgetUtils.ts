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
  first_third?: string;
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
 * For "default", returns the Modern Smart Design in Gold ("التصميم الذكي الحديث باللون الذهبي").
 */
export function getWidgetThemePalette(themeKey: string, theme?: any) {
  const matchedPreset = theme || (presetThemes as any)[themeKey] || (presetThemes as any).default;
  const isDark = matchedPreset.isDark ?? (
    themeKey === 'deep_black' ||
    ['evening_tranquility', 'electric_violet', 'midnight_neon', 'royal_purple', 'desert_night', 'ocean_peace', 'deep_forest', 'midnight_glass'].includes(themeKey) ||
    matchedPreset.bgColor === '#000000' ||
    (typeof document !== 'undefined' && document.documentElement.classList.contains('dark'))
  );

  // 1. Predefined Themes Map for Light / Dark modes
  const themeDefinitionsMap: Record<string, any> = {
    royal_gold_3d: {
      isDark: true,
      rootBg: '#2D1600',
      cardBg: '#1C0D00',
      textColor: '#FFFFFF',
      section1Bg: '#5E2E00',
      section1Text: '#FDE68A',
      section2Bg: '#451A03',
      section2Text: '#FEF08A',
      heroBg: '#5E2E00',
      heroPrayerName: '#FFFFFF',
      heroPrayerTime: '#FBBF24',
      heroCountdown: '#FFFFFF',
      nextPrayerColor: '#FBBF24',
      highlightPrayerColor: '#F59E0B',
      cardCityColor: '#FDE68A',
      cardDateColor: '#FDE68A'
    },
    emerald_prism_3d: {
      isDark: true,
      rootBg: '#022C22',
      cardBg: '#011712',
      textColor: '#FFFFFF',
      section1Bg: '#064E3B',
      section1Text: '#6EE7B7',
      section2Bg: '#064E3B',
      section2Text: '#A7F3D0',
      heroBg: '#064E3B',
      heroPrayerName: '#FFFFFF',
      heroPrayerTime: '#34D399',
      heroCountdown: '#FFFFFF',
      nextPrayerColor: '#34D399',
      highlightPrayerColor: '#34D399',
      cardCityColor: '#6EE7B7',
      cardDateColor: '#A7F3D0'
    },
    ruby_gem_3d: {
      isDark: true,
      rootBg: '#4C0519',
      cardBg: '#2B000C',
      textColor: '#FFFFFF',
      section1Bg: '#881337',
      section1Text: '#FECDD3',
      section2Bg: '#70092B',
      section2Text: '#FFE4E6',
      heroBg: '#881337',
      heroPrayerName: '#FFFFFF',
      heroPrayerTime: '#FB7185',
      heroCountdown: '#FFFFFF',
      nextPrayerColor: '#FB7185',
      highlightPrayerColor: '#FB7185',
      cardCityColor: '#FECDD3',
      cardDateColor: '#FECDD3'
    },
    antique_bronze_3d: {
      isDark: true,
      rootBg: '#261A12',
      cardBg: '#180F0A',
      textColor: '#FFFFFF',
      section1Bg: '#4D3321',
      section1Text: '#E5C39E',
      section2Bg: '#3D2718',
      section2Text: '#F5D77F',
      heroBg: '#4D3321',
      heroPrayerName: '#FFFFFF',
      heroPrayerTime: '#D4AF37',
      heroCountdown: '#FFFFFF',
      nextPrayerColor: '#D4AF37',
      highlightPrayerColor: '#F5D77F',
      cardCityColor: '#E5C39E',
      cardDateColor: '#D4BFA6'
    },
    royal_marble_3d: {
      isDark: false,
      rootBg: '#F8FAFC',
      cardBg: '#FFFFFF',
      textColor: '#0F172A',
      section1Bg: '#FEF3C7',
      section1Text: '#78350F',
      section2Bg: '#FEF3C7',
      section2Text: '#78350F',
      heroBg: '#FEF3C7',
      heroPrayerName: '#78350F',
      heroPrayerTime: '#B45309',
      heroCountdown: '#78350F',
      nextPrayerColor: '#B45309',
      highlightPrayerColor: '#B45309',
      cardCityColor: '#78350F',
      cardDateColor: '#475569'
    },
    default: {
      isDark: true,
      rootBg: '#064E3B',
      cardBg: '#043628',
      textColor: '#FFFFFF',
      section1Bg: '#065F46',
      section1Text: '#6EE7B7',
      section2Bg: '#1A221E',
      section2Text: '#FDE68A',
      heroBg: '#065F46',
      heroPrayerName: '#34D399',
      heroPrayerTime: '#FDE68A',
      heroCountdown: '#FFFFFF',
      nextPrayerColor: '#34D399',
      highlightPrayerColor: '#FBBF24',
      cardCityColor: '#34D399',
      cardDateColor: '#FDE68A'
    },
    deep_black: {
      isDark: true,
      rootBg: '#000000',
      cardBg: '#111111',
      textColor: '#FFFFFF',
      section1Bg: '#1F2937',
      section1Text: '#F8FAFC',
      section2Bg: '#18181B',
      section2Text: '#FDE68A',
      heroBg: '#18181B',
      heroPrayerName: '#F59E0B',
      heroPrayerTime: '#FDE68A',
      heroCountdown: '#FFFFFF',
      nextPrayerColor: '#F59E0B',
      highlightPrayerColor: '#FBBF24',
      cardCityColor: '#CBD5E1',
      cardDateColor: '#FDE68A'
    },
    shiny_gold: {
      isDark: false,
      rootBg: '#FEF08A',
      cardBg: '#FFFFFF',
      textColor: '#78350F',
      section1Bg: '#FDE047',
      section1Text: '#78350F',
      section2Bg: '#FEF3C7',
      section2Text: '#92400E',
      heroBg: '#FDE047',
      heroPrayerName: '#B45309',
      heroPrayerTime: '#78350F',
      heroCountdown: '#451A03',
      nextPrayerColor: '#B45309',
      highlightPrayerColor: '#D97706',
      cardCityColor: '#78350F',
      cardDateColor: '#92400E'
    },
    emerald_night: {
      isDark: true,
      rootBg: '#043628',
      cardBg: '#022C22',
      textColor: '#FFFFFF',
      section1Bg: '#065F46',
      section1Text: '#34D399',
      section2Bg: '#064E3B',
      section2Text: '#6EE7B7',
      heroBg: '#065F46',
      heroPrayerName: '#34D399',
      heroPrayerTime: '#A7F3D0',
      heroCountdown: '#FFFFFF',
      nextPrayerColor: '#34D399',
      highlightPrayerColor: '#34D399',
      cardCityColor: '#34D399',
      cardDateColor: '#6EE7B7'
    },
    royal_navy: {
      isDark: true,
      rootBg: '#0F172A',
      cardBg: '#1E293B',
      textColor: '#FFFFFF',
      section1Bg: '#1E3A8A',
      section1Text: '#93C5FD',
      section2Bg: '#1E1B4B',
      section2Text: '#38BDF8',
      heroBg: '#1E3A8A',
      heroPrayerName: '#38BDF8',
      heroPrayerTime: '#60A5FA',
      heroCountdown: '#FFFFFF',
      nextPrayerColor: '#38BDF8',
      highlightPrayerColor: '#38BDF8',
      cardCityColor: '#38BDF8',
      cardDateColor: '#93C5FD'
    },
    royal_purple: {
      isDark: true,
      rootBg: '#2E1065',
      cardBg: '#3B0764',
      textColor: '#FFFFFF',
      section1Bg: '#581C87',
      section1Text: '#E9D5FF',
      section2Bg: '#4C1D95',
      section2Text: '#FDE68A',
      heroBg: '#581C87',
      heroPrayerName: '#C084FC',
      heroPrayerTime: '#FDE68A',
      heroCountdown: '#FFFFFF',
      nextPrayerColor: '#C084FC',
      highlightPrayerColor: '#FDE68A',
      cardCityColor: '#C084FC',
      cardDateColor: '#FDE68A'
    },
    deep_forest: {
      isDark: true,
      rootBg: '#022C22',
      cardBg: '#064E3B',
      textColor: '#FFFFFF',
      section1Bg: '#065F46',
      section1Text: '#6EE7B7',
      section2Bg: '#022C22',
      section2Text: '#A7F3D0',
      heroBg: '#065F46',
      heroPrayerName: '#6EE7B7',
      heroPrayerTime: '#A7F3D0',
      heroCountdown: '#FFFFFF',
      nextPrayerColor: '#6EE7B7',
      highlightPrayerColor: '#34D399',
      cardCityColor: '#6EE7B7',
      cardDateColor: '#A7F3D0'
    },
    golden_sand: {
      isDark: true,
      rootBg: '#451A03',
      cardBg: '#78350F',
      textColor: '#FFFFFF',
      section1Bg: '#B45309',
      section1Text: '#FDE68A',
      section2Bg: '#92400E',
      section2Text: '#FEF08A',
      heroBg: '#B45309',
      heroPrayerName: '#FDE68A',
      heroPrayerTime: '#FEF08A',
      heroCountdown: '#FFFFFF',
      nextPrayerColor: '#FDE68A',
      highlightPrayerColor: '#FBBF24',
      cardCityColor: '#FDE68A',
      cardDateColor: '#FEF08A'
    },
    fajr_light: {
      isDark: false,
      rootBg: '#F0F9FF',
      cardBg: '#FFFFFF',
      textColor: '#0C4A6E',
      section1Bg: '#E0F2FE',
      section1Text: '#0369A1',
      section2Bg: '#BAE6FD',
      section2Text: '#0284C7',
      heroBg: '#E0F2FE',
      heroPrayerName: '#0284C7',
      heroPrayerTime: '#0369A1',
      heroCountdown: '#0C4A6E',
      nextPrayerColor: '#0284C7',
      highlightPrayerColor: '#0284C7',
      cardCityColor: '#0284C7',
      cardDateColor: '#0369A1'
    },
    neon_cyber: {
      isDark: true,
      rootBg: '#090D16',
      cardBg: '#0F172A',
      textColor: '#FFFFFF',
      section1Bg: '#1E293B',
      section1Text: '#22D3EE',
      section2Bg: '#0F172A',
      section2Text: '#38BDF8',
      heroBg: '#0F172A',
      heroPrayerName: '#22D3EE',
      heroPrayerTime: '#38BDF8',
      heroCountdown: '#FFFFFF',
      nextPrayerColor: '#22D3EE',
      highlightPrayerColor: '#22D3EE',
      cardCityColor: '#22D3EE',
      cardDateColor: '#38BDF8'
    },
    sunset_amber: {
      isDark: true,
      rootBg: '#7C2D12',
      cardBg: '#9A3412',
      textColor: '#FFFFFF',
      section1Bg: '#C2410C',
      section1Text: '#FDBA74',
      section2Bg: '#7C2D12',
      section2Text: '#FFEDD5',
      heroBg: '#C2410C',
      heroPrayerName: '#FDBA74',
      heroPrayerTime: '#FFEDD5',
      heroCountdown: '#FFFFFF',
      nextPrayerColor: '#FDBA74',
      highlightPrayerColor: '#FDBA74',
      cardCityColor: '#FDBA74',
      cardDateColor: '#FFEDD5'
    },
    rose_velvet: {
      isDark: true,
      rootBg: '#881337',
      cardBg: '#9F1239',
      textColor: '#FFFFFF',
      section1Bg: '#BE123C',
      section1Text: '#FBCFE8',
      section2Bg: '#881337',
      section2Text: '#FFE4E6',
      heroBg: '#BE123C',
      heroPrayerName: '#FBCFE8',
      heroPrayerTime: '#FFE4E6',
      heroCountdown: '#FFFFFF',
      nextPrayerColor: '#FBCFE8',
      highlightPrayerColor: '#FBCFE8',
      cardCityColor: '#FBCFE8',
      cardDateColor: '#FFE4E6'
    },
    midnight_sapphire: {
      isDark: true,
      rootBg: '#1E1B4B',
      cardBg: '#312E81',
      textColor: '#FFFFFF',
      section1Bg: '#3730A3',
      section1Text: '#A5B4FC',
      section2Bg: '#1E1B4B',
      section2Text: '#C7D2FE',
      heroBg: '#3730A3',
      heroPrayerName: '#A5B4FC',
      heroPrayerTime: '#C7D2FE',
      heroCountdown: '#FFFFFF',
      nextPrayerColor: '#A5B4FC',
      highlightPrayerColor: '#A5B4FC',
      cardCityColor: '#A5B4FC',
      cardDateColor: '#C7D2FE'
    },
    mint_fresh: {
      isDark: true,
      rootBg: '#065F46',
      cardBg: '#047857',
      textColor: '#FFFFFF',
      section1Bg: '#059669',
      section1Text: '#A7F3D0',
      section2Bg: '#064E3B',
      section2Text: '#D1FAE5',
      heroBg: '#059669',
      heroPrayerName: '#A7F3D0',
      heroPrayerTime: '#D1FAE5',
      heroCountdown: '#FFFFFF',
      nextPrayerColor: '#A7F3D0',
      highlightPrayerColor: '#A7F3D0',
      cardCityColor: '#A7F3D0',
      cardDateColor: '#D1FAE5'
    },
    bronze_copper: {
      isDark: true,
      rootBg: '#78350F',
      cardBg: '#92400E',
      textColor: '#FFFFFF',
      section1Bg: '#B45309',
      section1Text: '#FED7AA',
      section2Bg: '#78350F',
      section2Text: '#FFEDD5',
      heroBg: '#B45309',
      heroPrayerName: '#FED7AA',
      heroPrayerTime: '#FFEDD5',
      heroCountdown: '#FFFFFF',
      nextPrayerColor: '#FED7AA',
      highlightPrayerColor: '#FED7AA',
      cardCityColor: '#FED7AA',
      cardDateColor: '#FFEDD5'
    },
    amethyst_purple: {
      isDark: true,
      rootBg: '#581C87',
      cardBg: '#6B21A8',
      textColor: '#FFFFFF',
      section1Bg: '#7E22CE',
      section1Text: '#E9D5FF',
      section2Bg: '#581C87',
      section2Text: '#F3E8FF',
      heroBg: '#7E22CE',
      heroPrayerName: '#E9D5FF',
      heroPrayerTime: '#F3E8FF',
      heroCountdown: '#FFFFFF',
      nextPrayerColor: '#E9D5FF',
      highlightPrayerColor: '#E9D5FF',
      cardCityColor: '#E9D5FF',
      cardDateColor: '#F3E8FF'
    },
    clean_paper: {
      isDark: false,
      rootBg: '#F8FAFC',
      cardBg: '#FFFFFF',
      textColor: '#0F172A',
      section1Bg: '#E2E8F0',
      section1Text: '#1E293B',
      section2Bg: '#F1F5F9',
      section2Text: '#334155',
      heroBg: '#0F172A',
      heroPrayerName: '#38BDF8',
      heroPrayerTime: '#FDE68A',
      heroCountdown: '#FFFFFF',
      nextPrayerColor: '#0284C7',
      highlightPrayerColor: '#D97706',
      cardCityColor: '#0284C7',
      cardDateColor: '#475569'
    },
    titanium_3d: {
      isDark: true,
      rootBg: '#181E24',
      cardBg: '#222B35',
      textColor: '#FFFFFF',
      section1Bg: '#2C3847',
      section1Text: '#94A3B8',
      section2Bg: '#181E24',
      section2Text: '#CBD5E1',
      heroBg: '#242F3D',
      heroPrayerName: '#38BDF8',
      heroPrayerTime: '#F8FAFC',
      heroCountdown: '#FFFFFF',
      nextPrayerColor: '#38BDF8',
      highlightPrayerColor: '#FBBF24',
      cardCityColor: '#38BDF8',
      cardDateColor: '#94A3B8'
    },
    emerald_3d: {
      isDark: true,
      rootBg: '#022C22',
      cardBg: '#064E3B',
      textColor: '#FFFFFF',
      section1Bg: '#065F46',
      section1Text: '#6EE7B7',
      section2Bg: '#022C22',
      section2Text: '#A7F3D0',
      heroBg: '#044E3B',
      heroPrayerName: '#34D399',
      heroPrayerTime: '#FDE68A',
      heroCountdown: '#FFFFFF',
      nextPrayerColor: '#34D399',
      highlightPrayerColor: '#FBBF24',
      cardCityColor: '#34D399',
      cardDateColor: '#FDE68A'
    },
    sapphire_3d: {
      isDark: true,
      rootBg: '#091528',
      cardBg: '#0F274A',
      textColor: '#FFFFFF',
      section1Bg: '#1E3A8A',
      section1Text: '#93C5FD',
      section2Bg: '#091528',
      section2Text: '#BAE6FD',
      heroBg: '#12325E',
      heroPrayerName: '#38BDF8',
      heroPrayerTime: '#93C5FD',
      heroCountdown: '#FFFFFF',
      nextPrayerColor: '#38BDF8',
      highlightPrayerColor: '#60A5FA',
      cardCityColor: '#38BDF8',
      cardDateColor: '#93C5FD'
    },
    gold_ingot_3d: {
      isDark: true,
      rootBg: '#140E03',
      cardBg: '#231804',
      textColor: '#FFFFFF',
      section1Bg: '#3D2A07',
      section1Text: '#FDE68A',
      section2Bg: '#140E03',
      section2Text: '#FEF08A',
      heroBg: '#2D1F05',
      heroPrayerName: '#FBBF24',
      heroPrayerTime: '#FDE047',
      heroCountdown: '#FFFFFF',
      nextPrayerColor: '#FBBF24',
      highlightPrayerColor: '#FDE047',
      cardCityColor: '#FBBF24',
      cardDateColor: '#FEF08A'
    },
    ruby_velvet_3d: {
      isDark: true,
      rootBg: '#33050E',
      cardBg: '#4C0816',
      textColor: '#FFFFFF',
      section1Bg: '#700D22',
      section1Text: '#FECDD3',
      section2Bg: '#33050E',
      section2Text: '#FFE4E6',
      heroBg: '#5C0A1B',
      heroPrayerName: '#FB7185',
      heroPrayerTime: '#FECDD3',
      heroCountdown: '#FFFFFF',
      nextPrayerColor: '#FB7185',
      highlightPrayerColor: '#F43F5E',
      cardCityColor: '#FB7185',
      cardDateColor: '#FECDD3'
    },
    cyber_neon_3d: {
      isDark: true,
      rootBg: '#04070A',
      cardBg: '#0A121A',
      textColor: '#FFFFFF',
      section1Bg: '#0E1E2C',
      section1Text: '#22D3EE',
      section2Bg: '#04070A',
      section2Text: '#4ADE80',
      heroBg: '#0B1C2A',
      heroPrayerName: '#22D3EE',
      heroPrayerTime: '#4ADE80',
      heroCountdown: '#FFFFFF',
      nextPrayerColor: '#22D3EE',
      highlightPrayerColor: '#4ADE80',
      cardCityColor: '#22D3EE',
      cardDateColor: '#4ADE80'
    },
    violet_amethyst_3d: {
      isDark: true,
      rootBg: '#200538',
      cardBg: '#350A5C',
      textColor: '#FFFFFF',
      section1Bg: '#51118A',
      section1Text: '#E9D5FF',
      section2Bg: '#200538',
      section2Text: '#FDE68A',
      heroBg: '#430D75',
      heroPrayerName: '#C084FC',
      heroPrayerTime: '#FDE68A',
      heroCountdown: '#FFFFFF',
      nextPrayerColor: '#C084FC',
      highlightPrayerColor: '#FDE68A',
      cardCityColor: '#C084FC',
      cardDateColor: '#E9D5FF'
    },
    copper_bronze_3d: {
      isDark: true,
      rootBg: '#260F04',
      cardBg: '#3D1806',
      textColor: '#FFFFFF',
      section1Bg: '#5C250A',
      section1Text: '#FED7AA',
      section2Bg: '#260F04',
      section2Text: '#FFEDD5',
      heroBg: '#4A1D08',
      heroPrayerName: '#FB923C',
      heroPrayerTime: '#FED7AA',
      heroCountdown: '#FFFFFF',
      nextPrayerColor: '#FB923C',
      highlightPrayerColor: '#FED7AA',
      cardCityColor: '#FB923C',
      cardDateColor: '#FED7AA'
    },
    azure_crystal_3d: {
      isDark: true,
      rootBg: '#052233',
      cardBg: '#083754',
      textColor: '#FFFFFF',
      section1Bg: '#0C4E75',
      section1Text: '#A5F3FC',
      section2Bg: '#052233',
      section2Text: '#E0F2FE',
      heroBg: '#0A4366',
      heroPrayerName: '#22D3EE',
      heroPrayerTime: '#67E8F9',
      heroCountdown: '#FFFFFF',
      nextPrayerColor: '#22D3EE',
      highlightPrayerColor: '#67E8F9',
      cardCityColor: '#22D3EE',
      cardDateColor: '#A5F3FC'
    },
    desert_amber_3d: {
      isDark: true,
      rootBg: '#331606',
      cardBg: '#522309',
      textColor: '#FFFFFF',
      section1Bg: '#78350F',
      section1Text: '#FEF08A',
      section2Bg: '#331606',
      section2Text: '#FFEDD5',
      heroBg: '#612A0B',
      heroPrayerName: '#F59E0B',
      heroPrayerTime: '#FEF08A',
      heroCountdown: '#FFFFFF',
      nextPrayerColor: '#F59E0B',
      highlightPrayerColor: '#FEF08A',
      cardCityColor: '#F59E0B',
      cardDateColor: '#FEF08A'
    },
    mint_frost_3d: {
      isDark: true,
      rootBg: '#03211B',
      cardBg: '#05382E',
      textColor: '#FFFFFF',
      section1Bg: '#075243',
      section1Text: '#99F6E4',
      section2Bg: '#03211B',
      section2Text: '#CCFBF1',
      heroBg: '#064539',
      heroPrayerName: '#2DD4BF',
      heroPrayerTime: '#5EEAD4',
      heroCountdown: '#FFFFFF',
      nextPrayerColor: '#2DD4BF',
      highlightPrayerColor: '#5EEAD4',
      cardCityColor: '#2DD4BF',
      cardDateColor: '#99F6E4'
    },
    pearl_white_3d: {
      isDark: false,
      rootBg: '#F1F5F9',
      cardBg: '#FFFFFF',
      textColor: '#0F172A',
      section1Bg: '#E2E8F0',
      section1Text: '#0F172A',
      section2Bg: '#F8FAFC',
      section2Text: '#334155',
      heroBg: '#0F172A',
      heroPrayerName: '#38BDF8',
      heroPrayerTime: '#FDE68A',
      heroCountdown: '#FFFFFF',
      nextPrayerColor: '#0284C7',
      highlightPrayerColor: '#D97706',
      cardCityColor: '#0284C7',
      cardDateColor: '#334155'
    },
    golden_trio: {
      isDark: false,
      rootBg: '#F8DE8A',
      cardBg: '#FFFFFF',
      textColor: '#000000',
      section1Bg: '#C86400',
      section1Text: '#FFFFFF',
      section2Bg: '#FFFFFF',
      section2Text: '#000000',
      heroBg: '#C86400',
      heroPrayerName: '#FFFFFF',
      heroPrayerTime: '#FFFFFF',
      heroCountdown: '#FFFFFF',
      nextPrayerColor: '#C86400',
      highlightPrayerColor: '#C86400',
      cardCityColor: '#000000',
      cardDateColor: '#000000'
    },
    violet_green_light: {
      isDark: false,
      rootBg: '#F3E8FF',
      cardBg: '#FFFFFF',
      textColor: '#1E1B4B',
      section1Bg: '#D1FAE5',
      section1Text: '#065F46',
      section2Bg: '#EDE9FE',
      section2Text: '#5B21B6',
      heroBg: '#D1FAE5',
      heroPrayerName: '#065F46',
      heroPrayerTime: '#047857',
      heroCountdown: '#1E1B4B',
      nextPrayerColor: '#059669',
      highlightPrayerColor: '#7C3AED',
      cardCityColor: '#1E1B4B',
      cardDateColor: '#065F46'
    },
    sky_blue_light: {
      isDark: false,
      rootBg: '#E0F2FE',
      cardBg: '#FFFFFF',
      textColor: '#0F172A',
      section1Bg: '#BAE6FD',
      section1Text: '#0369A1',
      section2Bg: '#F0F9FF',
      section2Text: '#0284C7',
      heroBg: '#BAE6FD',
      heroPrayerName: '#0369A1',
      heroPrayerTime: '#075985',
      heroCountdown: '#0F172A',
      nextPrayerColor: '#0284C7',
      highlightPrayerColor: '#0369A1',
      cardCityColor: '#0F172A',
      cardDateColor: '#0369A1'
    },
    rose_peach_light: {
      isDark: false,
      rootBg: '#FFF1F2',
      cardBg: '#FFFFFF',
      textColor: '#1F080C',
      section1Bg: '#FFE4E6',
      section1Text: '#BE123C',
      section2Bg: '#FFFBEB',
      section2Text: '#B45309',
      heroBg: '#FFE4E6',
      heroPrayerName: '#BE123C',
      heroPrayerTime: '#9F1239',
      heroCountdown: '#1F080C',
      nextPrayerColor: '#E11D48',
      highlightPrayerColor: '#D97706',
      cardCityColor: '#1F080C',
      cardDateColor: '#BE123C'
    },
    emerald_mint_light: {
      isDark: false,
      rootBg: '#ECFDF5',
      cardBg: '#FFFFFF',
      textColor: '#022C22',
      section1Bg: '#D1FAE5',
      section1Text: '#065F46',
      section2Bg: '#F0FDFA',
      section2Text: '#0F766E',
      heroBg: '#D1FAE5',
      heroPrayerName: '#047857',
      heroPrayerTime: '#065F46',
      heroCountdown: '#022C22',
      nextPrayerColor: '#059669',
      highlightPrayerColor: '#0D9488',
      cardCityColor: '#022C22',
      cardDateColor: '#047857'
    }
  };

  if (themeDefinitionsMap[themeKey]) {
    const def = themeDefinitionsMap[themeKey];
    return {
      themeKey,
      ...def,
      stripColor1: def.nextPrayerColor,
      stripColor2: def.highlightPrayerColor,
      stripColor3: def.section1Text,
      stripColor4: def.section2Text,
      sepColor: def.isDark ? '#334155' : '#CBD5E1',
      primaryColor: def.nextPrayerColor,
      secondaryColor: def.highlightPrayerColor,
      bgColor: def.rootBg
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

export type WidgetStyleType = 'classic' | 'compact';

export interface SingleWidgetSettings {
  opacity: number;
  themeChoice: string;
  textColor: string;
  showDate: boolean;
  showNight: boolean;
  showCountdown: boolean;
}

export const DEFAULT_WIDGET_SETTINGS_BY_STYLE: Record<WidgetStyleType, SingleWidgetSettings> = {
  classic: {
    opacity: 0.95,
    themeChoice: 'royal_gold_3d',
    textColor: 'white',
    showDate: true,
    showNight: true,
    showCountdown: true
  },
  compact: {
    opacity: 0.85,
    themeChoice: 'royal_gold_3d',
    textColor: 'gold',
    showDate: true,
    showNight: false,
    showCountdown: true
  }
};

export const getWidgetStyle = async (): Promise<WidgetStyleType> => {
  try {
    const res = await Preferences.get({ key: 'widget_style' });
    if (res.value && ['classic', 'compact'].includes(res.value)) {
      return res.value as WidgetStyleType;
    }
    const local = typeof window !== 'undefined' ? localStorage.getItem('widget_style') : null;
    if (local && ['classic', 'compact'].includes(local)) {
      return local as WidgetStyleType;
    }
  } catch (e) {}
  return 'classic';
};

export const setWidgetStyle = async (style: WidgetStyleType): Promise<void> => {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem('widget_style', style);
    }
    await Preferences.set({
      key: 'widget_style',
      value: style
    });
    if (AutoSilentMode && typeof AutoSilentMode.updateWidget === 'function') {
      await AutoSilentMode.updateWidget();
    }
  } catch (e) {
    console.warn('Failed to save widget style:', e);
  }
};

export const getSingleWidgetSettings = (style: WidgetStyleType): SingleWidgetSettings => {
  const fallback = DEFAULT_WIDGET_SETTINGS_BY_STYLE[style];
  if (typeof window === 'undefined') return fallback;

  try {
    const opacityRaw = localStorage.getItem(`widget_${style}_opacity`);
    const themeChoice = localStorage.getItem(`widget_${style}_theme_choice`) || fallback.themeChoice;
    const textColor = localStorage.getItem(`widget_${style}_text_color`) || fallback.textColor;
    const showDateRaw = localStorage.getItem(`widget_${style}_show_date`);
    const showNightRaw = localStorage.getItem(`widget_${style}_show_night`);
    const showCountdownRaw = localStorage.getItem(`widget_${style}_show_countdown`);

    return {
      opacity: opacityRaw !== null ? parseFloat(opacityRaw) : fallback.opacity,
      themeChoice,
      textColor,
      showDate: showDateRaw !== null ? showDateRaw === 'true' : fallback.showDate,
      showNight: showNightRaw !== null ? showNightRaw === 'true' : fallback.showNight,
      showCountdown: showCountdownRaw !== null ? showCountdownRaw === 'true' : fallback.showCountdown
    };
  } catch (e) {
    return fallback;
  }
};

export const saveSingleWidgetSettings = async (style: WidgetStyleType, settings: SingleWidgetSettings): Promise<void> => {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(`widget_${style}_opacity`, String(settings.opacity));
      localStorage.setItem(`widget_${style}_theme_choice`, settings.themeChoice);
      localStorage.setItem(`widget_${style}_text_color`, settings.textColor);
      localStorage.setItem(`widget_${style}_show_date`, String(settings.showDate));
      localStorage.setItem(`widget_${style}_show_night`, String(settings.showNight));
      localStorage.setItem(`widget_${style}_show_countdown`, String(settings.showCountdown));
    }

    const transInt = Math.round(settings.opacity * 100);
    await Preferences.set({ key: `widget_${style}_opacity`, value: String(settings.opacity) });
    await Preferences.set({ key: `widget_${style}_transparency`, value: String(transInt) });
    await Preferences.set({ key: `widget_${style}_theme`, value: settings.themeChoice });
    await Preferences.set({ key: `widget_${style}_theme_choice`, value: settings.themeChoice });
    await Preferences.set({ key: `widget_${style}_text_color`, value: settings.textColor });
    await Preferences.set({ key: `widget_${style}_show_date`, value: String(settings.showDate) });
    await Preferences.set({ key: `widget_${style}_show_night`, value: String(settings.showNight) });
    await Preferences.set({ key: `widget_${style}_show_countdown`, value: String(settings.showCountdown) });
  } catch (e) {
    console.warn(`Failed to save settings for widget style ${style}:`, e);
  }
};
