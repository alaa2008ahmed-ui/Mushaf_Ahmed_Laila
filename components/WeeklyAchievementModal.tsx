import React, { useState, useRef, useMemo } from 'react';
import { X, Share2, Check, Award, BookOpen, Clock, Heart, Star } from 'lucide-react';
import moment from 'moment-hijri';
import { DailyRecord, CustomHabit } from '../hooks/useHabitTracker';
import { renderAchievementCardToDataUrl } from '../utils/achievementCardCanvas';
import { Share } from '@capacitor/share';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { useTheme } from '../context/ThemeContext';
import { getCalculator3DStyles } from '../utils/calculator3DStyles';
import { getToast3DStyles } from '../utils/toast3DStyles';
import { gregorianMonths, hijriMonths } from '../data/calendarData';

interface WeeklyAchievementModalProps {
  records: Record<string, DailyRecord>;
  getDailyProgress: (date: string) => number;
  customHabits: CustomHabit[];
  theme: any;
  hexColor: string;
  isBlackTheme: boolean;
  onClose: () => void;
}

type AchievementTab = 'today' | 'weekly' | 'monthly';

const ARABIC_DAYS = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

const parseHexRgb = (color?: string): [number, number, number] => {
  if (!color || typeof color !== 'string') return [5, 150, 105];
  const trimmed = color.trim();
  if (trimmed.startsWith('#')) {
    let clean = trimmed.slice(1);
    if (clean.length === 3) {
      clean = clean.split('').map((c) => c + c).join('');
    }
    const num = parseInt(clean.slice(0, 6), 16);
    if (!Number.isNaN(num)) {
      return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
    }
  }
  const rgbMatch = trimmed.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
  if (rgbMatch) {
    return [Number(rgbMatch[1]), Number(rgbMatch[2]), Number(rgbMatch[3])];
  }
  return [5, 150, 105];
};

const rgbToHex = (r: number, g: number, b: number): string => {
  const clamp = (n: number) => Math.max(0, Math.min(255, Math.round(n)));
  return (
    '#' +
    [clamp(r), clamp(g), clamp(b)]
      .map((v) => v.toString(16).padStart(2, '0'))
      .join('')
  );
};

const mixHex = (hexA: string, hexB: string, weightB: number): string => {
  const [r1, g1, b1] = parseHexRgb(hexA);
  const [r2, g2, b2] = parseHexRgb(hexB);
  const w = Math.max(0, Math.min(1, weightB));
  return rgbToHex(r1 + (r2 - r1) * w, g1 + (g2 - g1) * w, b1 + (b2 - b1) * w);
};

const darkenHex = (hex: string, amount: number): string => mixHex(hex, '#06080d', amount);
const lightenHex = (hex: string, amount: number): string => mixHex(hex, '#ffffff', amount);

const hexAlpha = (hex: string, alpha: number): string => {
  const [r, g, b] = parseHexRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const buildIslamicCardPalette = (
  themeObj: any,
  primaryColor: string,
  isBlackTheme: boolean,
  themeKey?: string
) => {
  const isGoldBlack =
    themeKey === 'black_gold' ||
    themeObj?.name === 'الأسود والذهبي' ||
    (isBlackTheme && themeObj?.accent === '#F59E0B');

  const accentBase =
    isBlackTheme && !isGoldBlack
      ? '#CBD5E1'
      : isGoldBlack
        ? '#F59E0B'
        : primaryColor === '#FFFFFF'
          ? '#059669'
          : primaryColor || '#059669';

  const secondaryBase =
    isBlackTheme
      ? isGoldBlack
        ? '#D97706'
        : '#64748B'
      : themeObj?.palette?.[1] && themeObj.palette[1] !== '#000000'
        ? themeObj.palette[1]
        : accentBase;

  const isGoldenTheme =
    !isBlackTheme &&
    !themeObj?.isDark &&
    (themeKey === 'shiny_gold' ||
      themeObj?.name === 'الذهبي اللامع' ||
      primaryColor?.toUpperCase() === '#D97706' ||
      primaryColor?.toUpperCase() === '#EAB308');

  if (isGoldenTheme) {
    return {
      bgGradient: 'linear-gradient(140deg, #FFFDF7 0%, #FEF8E7 18%, #FCE8AB 50%, #F5D374 80%, #E8BE48 100%)',
      sanctuaryBg: 'linear-gradient(180deg, rgba(255, 255, 255, 0.36) 0%, rgba(254, 243, 199, 0.16) 100%)',
      archBg: 'linear-gradient(180deg, rgba(255, 254, 249, 0.94) 0%, rgba(254, 243, 199, 0.82) 100%)',
      goldAccent: '#B45309',
      activeChipText: '#92400E',
      primaryText: '#451A03',
      bodyText: '#5B2605',
      softTintText: '#78350F',
      mutedText: 'rgba(120, 53, 15, 0.58)',
      sunnahActiveText: '#047857',
      sunnahInactiveText: 'rgba(120, 53, 15, 0.48)',
      progressStroke: '#D97706',
      ringTrackStroke: 'rgba(180, 83, 9, 0.18)',
      patternColor: '#B45309',
      patternOpacity: 0.14,
      frameBorder: 'rgba(217, 119, 6, 0.55)',
      innerFrameBorder: 'rgba(180, 83, 9, 0.28)',
      panelBg: 'linear-gradient(180deg, rgba(255, 254, 249, 0.94) 0%, rgba(254, 248, 235, 0.88) 60%, rgba(253, 242, 219, 0.90) 100%)',
      tileBg: 'linear-gradient(180deg, rgba(255, 254, 249, 0.95) 0%, rgba(254, 249, 237, 0.90) 65%, rgba(253, 244, 223, 0.92) 100%)',
      activeTileBg: 'linear-gradient(165deg, #FEF9C3 0%, #FDE68A 58%, #FCD34D 100%)',
      emptyTileBg: 'rgba(217, 119, 6, 0.08)',
      emptyTileBorder: 'rgba(217, 119, 6, 0.22)',
      medallionBg: 'linear-gradient(145deg, #FEF08A 0%, #F59E0B 55%, #D97706 100%)',
      medallionText: '#451A03',
      medallionShadow: '0 4px 0 #92400E, 0 8px 16px rgba(180, 83, 9, 0.28), inset 0 2px 2px rgba(255, 255, 255, 0.85)',
      ringWellBg: 'linear-gradient(145deg, #FFFDF7 0%, #FEF3C7 55%, #FDE68A 100%)',
      ringWellShadow: '0 4px 0 rgba(180, 83, 9, 0.35), 0 8px 16px rgba(180, 115, 20, 0.22), inset 0 2px 2px rgba(255, 255, 255, 0.95)',
      outerShadow: '0 10px 0 #B45309, 0 22px 38px rgba(180, 115, 20, 0.34), inset 0 2px 3px rgba(255, 255, 255, 0.95), inset 0 -4px 8px rgba(146, 64, 14, 0.22)',
      panelShadow: '0 5px 0 rgba(217, 119, 6, 0.24), 0 10px 20px rgba(180, 115, 20, 0.16), inset 0 2px 1.5px rgba(255, 255, 255, 0.95)',
      tileShadow: '0 4px 0 rgba(217, 119, 6, 0.20), 0 8px 14px rgba(180, 115, 20, 0.14), inset 0 1.5px 1px rgba(255, 255, 255, 0.95)',
    };
  }

  if (isBlackTheme) {
    const goldColor = isGoldBlack ? '#FBBF24' : '#FDE68A';
    const bgGradient = isGoldBlack
      ? 'linear-gradient(155deg, #17120a 0%, #0d0b08 52%, #1a1409 100%)'
      : 'linear-gradient(155deg, #141417 0%, #09090b 52%, #18181b 100%)';

    return {
      bgGradient,
      sanctuaryBg: 'linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(0,0,0,0.14) 100%)',
      archBg: isGoldBlack
        ? 'linear-gradient(180deg, rgba(245, 158, 11, 0.24) 0%, rgba(245, 158, 11, 0.04) 100%)'
        : 'linear-gradient(180deg, rgba(255, 255, 255, 0.14) 0%, rgba(255, 255, 255, 0.02) 100%)',
      goldAccent: goldColor,
      activeChipText: goldColor,
      primaryText: '#ffffff',
      bodyText: 'rgba(255, 255, 255, 0.92)',
      softTintText: isGoldBlack ? '#FEF3C7' : '#E4E4E7',
      mutedText: 'rgba(255, 255, 255, 0.55)',
      sunnahActiveText: '#6ee7b7',
      sunnahInactiveText: 'rgba(255, 255, 255, 0.45)',
      progressStroke: isGoldBlack ? '#FBBF24' : '#FFFFFF',
      ringTrackStroke: 'rgba(255, 255, 255, 0.16)',
      patternColor: isGoldBlack ? '#F59E0B' : '#FFFFFF',
      patternOpacity: 0.22,
      frameBorder: isGoldBlack ? 'rgba(251, 191, 36, 0.48)' : 'rgba(255, 255, 255, 0.28)',
      innerFrameBorder: isGoldBlack ? 'rgba(251, 191, 36, 0.32)' : 'rgba(255, 255, 255, 0.18)',
      panelBg: 'linear-gradient(165deg, rgba(255, 255, 255, 0.11) 0%, rgba(255, 255, 255, 0.04) 55%, rgba(0, 0, 0, 0.35) 100%)',
      tileBg: 'linear-gradient(165deg, rgba(255, 255, 255, 0.09) 0%, rgba(255, 255, 255, 0.03) 60%, rgba(0, 0, 0, 0.32) 100%)',
      activeTileBg: isGoldBlack
        ? 'linear-gradient(165deg, rgba(245, 158, 11, 0.34) 0%, rgba(180, 83, 9, 0.24) 100%)'
        : 'linear-gradient(165deg, rgba(255, 255, 255, 0.24) 0%, rgba(255, 255, 255, 0.10) 100%)',
      emptyTileBg: 'rgba(0, 0, 0, 0.24)',
      emptyTileBorder: 'rgba(255, 255, 255, 0.14)',
      medallionBg: isGoldBlack
        ? 'linear-gradient(145deg, #fbbf24 0%, #b45309 100%)'
        : 'linear-gradient(145deg, #f4f4f5 0%, #a1a1aa 100%)',
      medallionText: '#09090b',
      medallionShadow: '0 4px 0 rgba(0,0,0,0.32), 0 8px 16px rgba(0,0,0,0.28), inset 0 1.5px 2px rgba(255,255,255,0.75)',
      ringWellBg: 'linear-gradient(145deg, #1f1f23 0%, #09090b 100%)',
      ringWellShadow: '0 4px 0 rgba(0,0,0,0.4), 0 8px 14px rgba(0,0,0,0.35), inset 0 1.5px 2px rgba(255,255,255,0.25)',
      outerShadow: isGoldBlack
        ? '0 10px 0 #451a03, 0 22px 40px rgba(0, 0, 0, 0.75), inset 0 2px 3px rgba(253, 230, 138, 0.35), inset 0 -4px 8px rgba(0, 0, 0, 0.55)'
        : '0 10px 0 #000000, 0 22px 40px rgba(0, 0, 0, 0.78), inset 0 2px 3px rgba(255, 255, 255, 0.26), inset 0 -4px 8px rgba(0, 0, 0, 0.6)',
      panelShadow: '0 5px 0 rgba(0, 0, 0, 0.55), 0 10px 18px rgba(0, 0, 0, 0.45), inset 0 1.5px 1px rgba(255, 255, 255, 0.18)',
      tileShadow: '0 4px 0 rgba(0, 0, 0, 0.52), 0 8px 14px rgba(0, 0, 0, 0.35), inset 0 1px 1px rgba(255, 255, 255, 0.15)',
    };
  }

  const isDarkThemeBg = Boolean(themeObj?.isDark);
  const darkAnchor = isDarkThemeBg && themeObj?.bgColor ? themeObj.bgColor : darkenHex(accentBase, 0.56);
  const topStop = mixHex(darkAnchor, darkenHex(accentBase, 0.38), 0.55);
  const midStop = darkenHex(accentBase, 0.28);
  const botStop = darkenHex(mixHex(accentBase, secondaryBase, 0.38), 0.48);

  const goldAccent = '#FDE68A';
  const brightThemeTint = lightenHex(accentBase, 0.62);

  return {
    bgGradient: `linear-gradient(155deg, ${topStop} 0%, ${midStop} 50%, ${botStop} 100%)`,
    sanctuaryBg: 'linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(0,0,0,0.14) 100%)',
    archBg: `linear-gradient(180deg, ${hexAlpha(brightThemeTint, 0.24)} 0%, ${hexAlpha(accentBase, 0.04)} 100%)`,
    goldAccent,
    activeChipText: goldAccent,
    primaryText: '#ffffff',
    bodyText: 'rgba(255, 255, 255, 0.92)',
    softTintText: lightenHex(accentBase, 0.76),
    mutedText: 'rgba(255, 255, 255, 0.55)',
    sunnahActiveText: '#6ee7b7',
    sunnahInactiveText: 'rgba(255, 255, 255, 0.45)',
    progressStroke: '#FDE047',
    ringTrackStroke: 'rgba(255, 255, 255, 0.16)',
    patternColor: brightThemeTint,
    patternOpacity: 0.22,
    frameBorder: hexAlpha(goldAccent, 0.45),
    innerFrameBorder: hexAlpha(goldAccent, 0.3),
    panelBg: `linear-gradient(165deg, rgba(255, 255, 255, 0.16) 0%, ${hexAlpha(accentBase, 0.22)} 55%, rgba(0, 0, 0, 0.2) 100%)`,
    tileBg: `linear-gradient(165deg, rgba(255, 255, 255, 0.15) 0%, ${hexAlpha(accentBase, 0.18)} 60%, rgba(0, 0, 0, 0.18) 100%)`,
    activeTileBg: `linear-gradient(165deg, ${hexAlpha(lightenHex(accentBase, 0.32), 0.45)} 0%, ${hexAlpha(accentBase, 0.38)} 100%)`,
    emptyTileBg: 'rgba(0, 0, 0, 0.22)',
    emptyTileBorder: 'rgba(255, 255, 255, 0.14)',
    medallionBg: `linear-gradient(145deg, #fef08a 0%, #f59e0b 100%)`,
    medallionText: darkenHex(accentBase, 0.68),
    medallionShadow: '0 4px 0 rgba(0,0,0,0.32), 0 8px 16px rgba(0,0,0,0.28), inset 0 1.5px 2px rgba(255,255,255,0.75)',
    ringWellBg: `linear-gradient(145deg, ${darkenHex(accentBase, 0.22)} 0%, ${darkenHex(accentBase, 0.55)} 100%)`,
    ringWellShadow: '0 4px 0 rgba(0,0,0,0.4), 0 8px 14px rgba(0,0,0,0.35), inset 0 1.5px 2px rgba(255,255,255,0.25)',
    outerShadow: `0 10px 0 ${darkenHex(accentBase, 0.65)}, 0 22px 38px rgba(0, 0, 0, 0.42), inset 0 2px 3px rgba(255, 255, 255, 0.34), inset 0 -4px 8px rgba(0, 0, 0, 0.32)`,
    panelShadow: `0 5px 0 ${hexAlpha(darkenHex(accentBase, 0.72), 0.6)}, 0 10px 18px rgba(0, 0, 0, 0.24), inset 0 1.5px 1.5px rgba(255, 255, 255, 0.28)`,
    tileShadow: `0 4px 0 ${hexAlpha(darkenHex(accentBase, 0.74), 0.55)}, 0 8px 14px rgba(0, 0, 0, 0.2), inset 0 1px 1px rgba(255, 255, 255, 0.24)`,
  };
};

const getHijriDateLabel = (m: moment.Moment): string => {
  try {
    const localNoon = new Date(m.year(), m.month(), m.date(), 12, 0, 0);
    const parts = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura', {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
    }).formatToParts(localNoon);
    const hDay = parseInt(parts.find((p) => p.type === 'day')?.value || '0', 10);
    const hMonth = parseInt(parts.find((p) => p.type === 'month')?.value || '0', 10);
    const hYear = parseInt(parts.find((p) => p.type === 'year')?.value || '0', 10);
    if (hDay > 0 && hMonth > 0 && hYear > 0) {
      const mName = hijriMonths[hMonth - 1]?.name || '';
      return `${hDay} ${mName} ${hYear} هـ`;
    }
  } catch {}
  const fallbackMonth = hijriMonths[m.iMonth()]?.name || '';
  return `${m.iDate()} ${fallbackMonth} ${m.iYear()} هـ`;
};

const getArabicGregDateLabel = (m: moment.Moment): string => {
  const mName = gregorianMonths[m.month()]?.name || '';
  return `${m.date()} ${mName}`;
};

export const WeeklyAchievementModal: React.FC<WeeklyAchievementModalProps> = ({
  records,
  getDailyProgress,
  theme,
  hexColor,
  isBlackTheme,
  onClose,
}) => {
  const { theme: ctxTheme, themeKey, isNightMode, homeThemeVariant } = useTheme();
  const activeTheme = ctxTheme || theme;
  const s3d = getCalculator3DStyles(activeTheme, themeKey, isNightMode, homeThemeVariant);
  const toast3D = getToast3DStyles(activeTheme, themeKey, isNightMode, homeThemeVariant);

  const [toastMsg, setToastMsg] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [viewRange, setViewRange] = useState<AchievementTab>('today');

  const cardRef = useRef<HTMLDivElement>(null);

  const palette = useMemo(
    () => buildIslamicCardPalette(activeTheme, s3d.primaryColor || hexColor, s3d.isBlackTheme || isBlackTheme, themeKey),
    [activeTheme, s3d.primaryColor, s3d.isBlackTheme, hexColor, isBlackTheme, themeKey]
  );

  // Build geometric 8-point Islamic star SVG pattern data URI
  const islamicPatternUri = useMemo(() => {
    const strokeCol = palette.patternColor;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80">
      <g fill="none" stroke="${strokeCol}" stroke-width="1">
        <polygon points="40,6 49,21 66,14 59,31 74,40 59,49 66,66 49,59 40,74 31,59 14,66 21,49 6,40 21,31 14,14 31,21" stroke-opacity="0.45"/>
        <circle cx="40" cy="40" r="10" stroke-opacity="0.35"/>
        <path d="M0 0 L14 14 M80 0 L66 14 M0 80 L14 66 M80 80 L66 66" stroke-opacity="0.28"/>
      </g>
    </svg>`;
    return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
  }, [palette.patternColor]);

  // Compute days according to active tab:
  // 1) today -> Today only
  // 2) weekly -> Last completed Sat..Fri week
  // 3) monthly -> Last completed calendar month
  const periodMeta = useMemo(() => {
    const today = moment().startOf('day');

    if (viewRange === 'today') {
      const dayName = ARABIC_DAYS[today.day()];
      const hijriStr = getHijriDateLabel(today);
      const gregStr = `${getArabicGregDateLabel(today)} ${today.year()} م`;
      return {
        days: [today],
        cardSubtitle: 'حصاد اليوم الإيماني',
        dateRangeStr: `${dayName} • ${hijriStr}`,
        secondaryDateStr: gregStr,
        ringSubtitle: 'إنجاز اليوم',
        trackerTitle: 'تفاصيل الصلوات والأوراد اليومية:',
      };
    }

    if (viewRange === 'weekly') {
      const daysSinceSaturday = (today.day() + 1) % 7;
      const currentWeekStart = today.clone().subtract(daysSinceSaturday, 'days');
      const lastWeekStart = currentWeekStart.clone().subtract(7, 'days');
      const weekDays: moment.Moment[] = [];
      for (let i = 0; i < 7; i++) {
        weekDays.push(lastWeekStart.clone().add(i, 'days'));
      }
      const startDate = weekDays[0];
      const endDate = weekDays[weekDays.length - 1];
      return {
        days: weekDays,
        cardSubtitle: 'حصاد آخر أسبوع مكتمل',
        dateRangeStr: `من ${ARABIC_DAYS[startDate.day()]} (${getArabicGregDateLabel(startDate)}) إلى ${ARABIC_DAYS[endDate.day()]} (${getArabicGregDateLabel(endDate)})`,
        secondaryDateStr: `${startDate.year()} م`,
        ringSubtitle: 'معدل الأسبوع',
        trackerTitle: 'تقويم الأسبوع المكتمل (السبت - الجمعة):',
      };
    }

    // monthly -> Last completed month
    const lastMonth = today.clone().subtract(1, 'month');
    const startOfMonth = lastMonth.clone().startOf('month');
    const totalMonthDays = startOfMonth.daysInMonth();
    const monthDays: moment.Moment[] = [];
    for (let i = 0; i < totalMonthDays; i++) {
      monthDays.push(startOfMonth.clone().add(i, 'days'));
    }
    const monthName = gregorianMonths[startOfMonth.month()]?.name || '';
    return {
      days: monthDays,
      cardSubtitle: `حصاد شهر ${monthName} المكتمل`,
      dateRangeStr: `شهر ${monthName} ${startOfMonth.year()} م (${totalMonthDays} يوماً)`,
      secondaryDateStr: getHijriDateLabel(startOfMonth),
      ringSubtitle: 'معدل الشهر',
      trackerTitle: `سجل أيام شهر ${monthName}:`,
    };
  }, [viewRange]);

  const stats = useMemo(() => {
    let totalProgressSum = 0;
    let prayersCount = 0;
    let quranPages = 0;
    let adhkarCount = 0;
    let ethicsCount = 0;
    let customCount = 0;
    let daysWith100 = 0;
    let activeDaysCount = 0;

    const daysStats = periodMeta.days.map((d) => {
      const dateStr = d.format('YYYY-MM-DD');
      const rec = records[dateStr];
      const prog = getDailyProgress(dateStr);
      totalProgressSum += prog;
      if (prog === 100) daysWith100++;
      if (prog > 0) activeDaysCount++;

      let dPrayers = 0;
      let dQuran = 0;
      let dAdhkar = 0;
      let dEthics = 0;
      let dCustom = 0;

      if (rec) {
        if (rec.prayers) {
          Object.values(rec.prayers).forEach((v) => {
            if (v) dPrayers++;
          });
        }
        if (rec.quran) {
          dQuran = rec.quran.pages || 0;
        }
        if (rec.adhkar) {
          Object.values(rec.adhkar).forEach((v) => {
            if (v) dAdhkar++;
          });
        }
        if (rec.ethics) {
          Object.values(rec.ethics).forEach((v) => {
            if (v) dEthics++;
          });
        }
        if (rec.custom) {
          Object.values(rec.custom).forEach((v) => {
            if (v) dCustom++;
          });
        }
      }

      prayersCount += dPrayers;
      quranPages += dQuran;
      adhkarCount += dAdhkar;
      ethicsCount += dEthics;
      customCount += dCustom;

      return {
        dateStr,
        dayNum: d.date(),
        dayName: ARABIC_DAYS[d.day()],
        shortDate: getArabicGregDateLabel(d),
        progress: prog,
        prayers: dPrayers,
        quran: dQuran,
        isToday: dateStr === moment().format('YYYY-MM-DD'),
      };
    });

    const totalDays = Math.max(1, periodMeta.days.length);
    const averageProgress = Math.round(totalProgressSum / totalDays);

    // Daily detailed breakdown (used in 'today' view)
    const todayRecord = records[periodMeta.days[0]?.format('YYYY-MM-DD')];
    const dailyPrayersList = [
      { id: 'fajr', label: 'الفجر', fard: Boolean(todayRecord?.prayers?.fajr), sunnah: Boolean(todayRecord?.prayers?.fajrSunnah) },
      { id: 'dhuhr', label: 'الظهر', fard: Boolean(todayRecord?.prayers?.dhuhr), sunnah: Boolean(todayRecord?.prayers?.dhuhrSunnah) },
      { id: 'asr', label: 'العصر', fard: Boolean(todayRecord?.prayers?.asr), sunnah: Boolean(todayRecord?.prayers?.asrSunnah) },
      { id: 'maghrib', label: 'المغرب', fard: Boolean(todayRecord?.prayers?.maghrib), sunnah: Boolean(todayRecord?.prayers?.maghribSunnah) },
      { id: 'isha', label: 'العشاء', fard: Boolean(todayRecord?.prayers?.isha), sunnah: Boolean(todayRecord?.prayers?.ishaSunnah) },
    ];
    const fardDone = dailyPrayersList.filter((p) => p.fard).length;
    const sunnahDone = dailyPrayersList.filter((p) => p.sunnah).length;
    const dailyAdhkarChips = [
      { label: 'أذكار الصباح', done: Boolean(todayRecord?.adhkar?.sabah) },
      { label: 'أذكار المساء', done: Boolean(todayRecord?.adhkar?.masaa) },
      { label: 'أذكار الصلاة', done: Boolean(todayRecord?.adhkar?.salah) },
      { label: 'الاستغفار', done: Boolean(todayRecord?.adhkar?.istighfar) },
      { label: 'الأدعية', done: Boolean(todayRecord?.adhkar?.adia) },
    ];

    let medal = {
      title: 'وسام السابقون بالخيرات',
      badge: '🥇',
      desc:
        viewRange === 'today'
          ? 'يوم إيماني عامر بالذكر والصلاة والطاعات ما شاء الله'
          : 'إنجاز إيماني استثنائي وثبات عظيم على الطاعات ما شاء الله',
    };

    if (averageProgress < 50) {
      medal = {
        title: 'وسام الساعي في الخير',
        badge: '🌸',
        desc:
          viewRange === 'today'
            ? 'بداية طيبة وخطوات مباركة في يومك نحو علو الهمة'
            : 'خطوات مباركة، وبداية طيبة نحو الاستمرار وعلو الهمة',
      };
    } else if (averageProgress < 75) {
      medal = {
        title: 'وسام المجاهد لنفسه',
        badge: '🥉',
        desc: 'جهاد النفس في الطاعة من أعظم القربات، استمر في العطاء',
      };
    } else if (averageProgress < 90) {
      medal = {
        title: 'وسام المداوم على الطاعات',
        badge: '🥈',
        desc: 'ثبات وهمة عالية، أحب الأعمال إلى الله أدومها وإن قل',
      };
    }

    return {
      daysStats,
      totalDays,
      averageProgress,
      prayersCount,
      quranPages,
      adhkarCount,
      ethicsCount,
      customCount,
      goodDeedsTotal: ethicsCount + customCount,
      daysWith100,
      activeDaysCount,
      medal,
      fardDone,
      sunnahDone,
      quranCompleted: Boolean(todayRecord?.quran?.completed),
      dailyPrayersList,
      dailyAdhkarChips,
    };
  }, [periodMeta.days, records, getDailyProgress, viewRange]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  // Generate high-DPI image matching the live preview card 100% identically
  const generateCardImage = async (): Promise<string> => {
    const isDarkSurface = Boolean(s3d.isDark || s3d.isBlackTheme || isBlackTheme || activeTheme?.isDark);
    const previewWidth = cardRef.current?.offsetWidth;
    return renderAchievementCardToDataUrl(
      {
        viewRange,
        palette,
        isDarkSurface,
        periodMeta: {
          cardSubtitle: periodMeta.cardSubtitle,
          dateRangeStr: periodMeta.dateRangeStr,
          ringSubtitle: periodMeta.ringSubtitle,
          trackerTitle: periodMeta.trackerTitle,
        },
        stats,
      },
      previewWidth
    );
  };

  const handleShareImage = async () => {
    setIsGenerating(true);
    showToast('جاري تجهيز بطاقة الإنجاز...');

    try {
      const dataUrl = await generateCardImage();
      const filePrefix = viewRange === 'today' ? 'daily' : viewRange === 'weekly' ? 'weekly' : 'monthly';

      if (Capacitor.isNativePlatform()) {
        const fileName = `${filePrefix}_achievement_${Date.now()}.jpg`;
        const base64Data = dataUrl.split(',')[1];

        const savedFile = await Filesystem.writeFile({
          path: fileName,
          data: base64Data,
          directory: Directory.Cache,
        });

        await Share.share({
          title: 'مشاركة',
          url: savedFile.uri,
          dialogTitle: 'مشاركة عبر',
        });
      } else if (navigator.share) {
        try {
          const response = await fetch(dataUrl);
          const blob = await response.blob();
          const file = new File([blob], `${filePrefix}_achievement.jpg`, { type: 'image/jpeg' });

          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({
              files: [file],
              title: 'مشاركة',
            });
          } else {
            downloadImage(dataUrl);
          }
        } catch (e: any) {
          if (e.name !== 'AbortError') {
            downloadImage(dataUrl);
          }
        }
      } else {
        downloadImage(dataUrl);
      }
    } catch (err) {
      console.error('Error sharing achievement card:', err);
      showToast('تعذر تصدير الصورة، جاري المحاولة بطريقة بديلة');
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadImage = (dataUrl: string) => {
    const filePrefix = viewRange === 'today' ? 'daily' : viewRange === 'weekly' ? 'weekly' : 'monthly';
    const link = document.createElement('a');
    link.download = `${filePrefix}_achievement_${moment().format('YYYY-MM-DD')}.jpg`;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('تم حفظ صورة الإنجاز بنجاح 🌟');
  };

  const previewRadius = 26;
  const previewStroke = 5.5;
  const previewCirc = 2 * Math.PI * previewRadius;
  const previewOffset = previewCirc - (stats.averageProgress / 100) * previewCirc;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/65" dir="rtl" onClick={onClose}>
      <div
        className={`app-page-card border-0 w-full max-w-lg rounded-3xl overflow-hidden flex flex-col max-h-[92dvh] ${s3d.surfaceCardClass}`}
        style={{ fontFamily: activeTheme?.font }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Bar */}
        <div className={`flex items-center justify-between px-5 py-3.5 border-b ${s3d.dividerClass} shrink-0 overflow-visible`}>
          <div className="flex items-center gap-2.5">
            <span className={`app-3d-badge border-0 w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${s3d.isBlackTheme ? 'bg-white/10' : 'bg-slate-100 dark:bg-white/10'}`}>
              <Award className="w-5 h-5" style={{ color: s3d.primaryColor }} />
            </span>
            <div>
              <h2 className="font-extrabold text-base sm:text-lg" style={{ color: s3d.textColor }}>
                بطاقة الإنجاز
              </h2>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              disabled={isGenerating}
              onClick={handleShareImage}
              className="app-page-card border-0 w-9 h-9 rounded-xl flex items-center justify-center cursor-pointer transition-all active:scale-95 disabled:opacity-50"
              style={{ backgroundColor: s3d.primaryColor, color: s3d.btnTextColor }}
              title="مشاركة كصورة"
              aria-label="مشاركة كصورة"
            >
              <Share2 className="w-5 h-5" strokeWidth={2.25} />
            </button>
            <button
              onClick={onClose}
              className={`app-page-card border-0 w-9 h-9 rounded-xl flex items-center justify-center cursor-pointer transition-all ${s3d.surfaceCardClass}`}
              aria-label="إغلاق"
            >
              <X className="w-5 h-5" style={{ color: s3d.textColor }} />
            </button>
          </div>
        </div>

        {/* 3-Tab Range Selector */}
        <div className="px-4 sm:px-5 pt-3 pb-2 flex gap-2 shrink-0 overflow-visible">
          {(
            [
              { id: 'today', label: 'إنجاز اليوم' },
              { id: 'weekly', label: 'الأسبوعي' },
              { id: 'monthly', label: 'الشهري' },
            ] as { id: AchievementTab; label: string }[]
          ).map((tab) => {
            const isActive = viewRange === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setViewRange(tab.id)}
                className={`app-page-card border-0 flex-1 py-2 px-2.5 rounded-2xl text-xs transition-all cursor-pointer whitespace-nowrap ${
                  isActive ? 'font-black' : `font-bold ${s3d.surfaceCardClass}`
                }`}
                style={isActive ? { backgroundColor: s3d.primaryColor, color: s3d.btnTextColor } : undefined}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Scrollable Preview Area */}
        <div className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-5 pt-2.5 pb-5 overscroll-contain">
          {/* Stunning 3D Islamic Theme-Synced Visual Card */}
          <div
            ref={cardRef}
            className="rounded-3xl p-3 sm:p-3.5 relative overflow-hidden"
            style={{
              background: palette.bgGradient,
              color: palette.primaryText,
              border: `2px solid ${palette.frameBorder}`,
              boxShadow: palette.outerShadow,
            }}
          >
            {/* Repeating Islamic 8-Point Star Lattice */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                backgroundImage: islamicPatternUri,
                backgroundSize: '64px 64px',
                opacity: palette.patternOpacity,
              }}
            />

            {/* Inner Sanctuary Frame */}
            <div
              className="relative z-10 rounded-2xl p-3.5 sm:p-4 space-y-3"
              style={{
                border: `1.5px solid ${palette.innerFrameBorder}`,
                background: palette.sanctuaryBg,
              }}
            >
              {/* Ornate Islamic Arch Crest Header */}
              <div
                className="px-3 py-3 text-center"
                style={{
                  background: palette.archBg,
                  border: `1.5px solid ${palette.innerFrameBorder}`,
                  borderRadius: '72px 72px 18px 18px',
                  boxShadow: palette.panelShadow,
                }}
              >
                {/* 3D Crescent & Star Medallion */}
                <div
                  className="w-10 h-10 rounded-full mx-auto mb-1.5 flex items-center justify-center"
                  style={{
                    background: palette.medallionBg,
                    color: palette.medallionText,
                    boxShadow: palette.medallionShadow,
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2l2.2 4.8L19 7l-3.4 3.6L16.5 16 12 13.4 7.5 16l.9-5.4L5 7l4.8-.2L12 2z" opacity="0.28" />
                    <path d="M14.5 3.5A8.5 8.5 0 1 0 20.5 15.8 7 7 0 0 1 14.5 3.5z" />
                  </svg>
                </div>

                <div className="font-extrabold text-base sm:text-lg leading-tight" style={{ color: palette.primaryText }}>
                  مربّي العبادات
                </div>
                <div className="text-[11px] font-bold mt-0.5" style={{ color: palette.goldAccent }}>
                  {periodMeta.cardSubtitle} • مصحف أحمد و ليلى
                </div>

                {/* Ornamental Islamic Divider */}
                <div className="flex items-center justify-center gap-2 my-1.5">
                  <span className="h-[1px] w-12" style={{ backgroundColor: palette.innerFrameBorder }} />
                  <span className="text-xs leading-none" style={{ color: palette.goldAccent }}>۞</span>
                  <span className="h-[1px] w-12" style={{ backgroundColor: palette.innerFrameBorder }} />
                </div>

                <div className="text-[11px] font-medium" style={{ color: palette.softTintText }}>
                  {periodMeta.dateRangeStr}
                </div>
              </div>

              {/* Hero Medal & 3D Circular Gauge */}
              <div
                className="rounded-2xl p-3 sm:p-3.5 flex items-center justify-between gap-2.5 sm:gap-3"
                style={{
                  background: palette.panelBg,
                  border: `1.5px solid ${palette.frameBorder}`,
                  boxShadow: palette.panelShadow,
                }}
              >
                <div className="flex-1 min-w-0">
                  <div
                    className="text-[13px] sm:text-[15px] font-black flex flex-wrap items-center gap-1 mb-1 leading-snug"
                    style={{ color: palette.goldAccent }}
                  >
                    <span>{stats.medal.title}</span>
                    <span>{stats.medal.badge}</span>
                  </div>
                  <p className="text-[10.5px] sm:text-[11px] leading-relaxed mb-1.5" style={{ color: palette.bodyText }}>
                    {stats.medal.desc}
                  </p>
                  <div
                    className="text-[10.5px] sm:text-[11px] font-bold flex flex-wrap items-center gap-x-1.5 gap-y-0.5 leading-relaxed"
                    style={{ color: palette.softTintText }}
                  >
                    {viewRange === 'today' ? (
                      <>
                        <span className="whitespace-nowrap">
                          الفرائض: <b style={{ color: palette.primaryText }}>{stats.fardDone} من 5</b>
                        </span>
                        <span>•</span>
                        <span className="whitespace-nowrap">
                          السنن: <b style={{ color: palette.primaryText }}>{stats.sunnahDone} من 5</b>
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="whitespace-nowrap">
                          أيام النشاط: <b style={{ color: palette.primaryText }}>{stats.activeDaysCount} من {stats.totalDays}</b>
                        </span>
                        <span>•</span>
                        <span className="whitespace-nowrap">
                          الإتمام الكامل: <b style={{ color: palette.primaryText }}>{stats.daysWith100}</b>
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* 3D Circular Progress Medallion */}
                <div
                  className="w-[70px] h-[70px] sm:w-[74px] sm:h-[74px] rounded-full flex items-center justify-center relative shrink-0"
                  style={{
                    background: palette.ringWellBg,
                    border: `2px solid ${palette.frameBorder}`,
                    boxShadow: palette.ringWellShadow,
                  }}
                >
                  <svg width="62" height="62" viewBox="0 0 64 64" className="-rotate-90">
                    <circle cx="32" cy="32" r={previewRadius} stroke={palette.ringTrackStroke} strokeWidth={previewStroke} fill="none" />
                    <circle
                      cx="32"
                      cy="32"
                      r={previewRadius}
                      stroke={palette.progressStroke}
                      strokeWidth={previewStroke}
                      fill="none"
                      strokeDasharray={previewCirc}
                      strokeDashoffset={previewOffset}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-[15px] sm:text-base font-black font-sans leading-none" style={{ color: palette.primaryText }}>{stats.averageProgress}%</span>
                    <span className="text-[8px] sm:text-[8.5px] font-bold mt-0.5" style={{ color: palette.goldAccent }}>{periodMeta.ringSubtitle}</span>
                  </div>
                </div>
              </div>

              {/* 4 3D Sculpted Stats Grid */}
              <div className="grid grid-cols-2 gap-2.5">
                <div
                  className="rounded-xl p-2.5 sm:p-3"
                  style={{
                    background: palette.tileBg,
                    border: `1px solid ${palette.innerFrameBorder}`,
                    boxShadow: palette.tileShadow,
                  }}
                >
                  <div className="text-[11px] font-bold flex items-center gap-1 mb-1" style={{ color: palette.goldAccent }}>
                    <Clock className="w-3.5 h-3.5" />
                    <span>الصلوات والسنن</span>
                  </div>
                  <div className="text-base sm:text-lg font-black" style={{ color: palette.primaryText }}>
                    {stats.prayersCount} <span className="text-[11px] font-medium" style={{ color: palette.softTintText }}>صلاة وسنة</span>
                  </div>
                </div>

                <div
                  className="rounded-xl p-2.5 sm:p-3"
                  style={{
                    background: palette.tileBg,
                    border: `1px solid ${palette.innerFrameBorder}`,
                    boxShadow: palette.tileShadow,
                  }}
                >
                  <div className="text-[11px] font-bold flex items-center gap-1 mb-1" style={{ color: palette.goldAccent }}>
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>الورد القرآني</span>
                  </div>
                  <div className="text-base sm:text-lg font-black" style={{ color: palette.primaryText }}>
                    {stats.quranPages} <span className="text-[11px] font-medium" style={{ color: palette.softTintText }}>صفحة مقروءة</span>
                  </div>
                </div>

                <div
                  className="rounded-xl p-2.5 sm:p-3"
                  style={{
                    background: palette.tileBg,
                    border: `1px solid ${palette.innerFrameBorder}`,
                    boxShadow: palette.tileShadow,
                  }}
                >
                  <div className="text-[11px] font-bold flex items-center gap-1 mb-1" style={{ color: palette.goldAccent }}>
                    <Heart className="w-3.5 h-3.5" />
                    <span>الأذكار والأوراد</span>
                  </div>
                  <div className="text-base sm:text-lg font-black" style={{ color: palette.primaryText }}>
                    {stats.adhkarCount}{' '}
                    <span className="text-[11px] font-medium" style={{ color: palette.softTintText }}>
                      {viewRange === 'today' ? 'من 5 أوراد' : 'ورد منجز'}
                    </span>
                  </div>
                </div>

                <div
                  className="rounded-xl p-2.5 sm:p-3"
                  style={{
                    background: palette.tileBg,
                    border: `1px solid ${palette.innerFrameBorder}`,
                    boxShadow: palette.tileShadow,
                  }}
                >
                  <div className="text-[11px] font-bold flex items-center gap-1 mb-1" style={{ color: palette.goldAccent }}>
                    <Star className="w-3.5 h-3.5" />
                    <span>البر والعادات</span>
                  </div>
                  <div className="text-base sm:text-lg font-black" style={{ color: palette.primaryText }}>
                    {stats.goodDeedsTotal} <span className="text-[11px] font-medium" style={{ color: palette.softTintText }}>طاعة</span>
                  </div>
                </div>
              </div>

              {/* Tab-Specific Detailed Breakdown */}
              <div
                className="rounded-2xl p-3"
                style={{
                  background: palette.panelBg,
                  border: `1px solid ${palette.innerFrameBorder}`,
                  boxShadow: palette.panelShadow,
                }}
              >
                <div className="text-[11px] font-extrabold mb-2 flex items-center gap-1.5" style={{ color: palette.goldAccent }}>
                  <span>۞</span>
                  <span>{periodMeta.trackerTitle}</span>
                </div>

                {viewRange === 'today' && (
                  <div className="space-y-2">
                    <div className="grid grid-cols-5 gap-1 sm:gap-1.5">
                      {stats.dailyPrayersList.map((p) => (
                        <div
                          key={p.id}
                          className="min-w-0 overflow-hidden rounded-xl py-2 px-0.5 sm:px-1 text-center"
                          style={{
                            background: p.fard ? palette.activeTileBg : palette.tileBg,
                            border: `1px solid ${p.fard ? palette.goldAccent : palette.innerFrameBorder}`,
                            boxShadow: palette.tileShadow,
                          }}
                        >
                          <div className="text-[10px] sm:text-[11px] font-extrabold truncate" style={{ color: palette.primaryText }}>{p.label}</div>
                          <div
                            className="text-[8.5px] sm:text-[9.5px] font-bold mt-1 whitespace-nowrap"
                            style={{ color: p.fard ? palette.goldAccent : palette.mutedText }}
                          >
                            {p.fard ? 'فرض ✓' : 'فرض —'}
                          </div>
                          <div
                            className="text-[8.5px] sm:text-[9px] font-bold mt-0.5 whitespace-nowrap"
                            style={{ color: p.sunnah ? palette.sunnahActiveText : palette.sunnahInactiveText }}
                          >
                            {p.sunnah ? 'سنة ★' : 'سنة —'}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex flex-wrap justify-center gap-1.5 pt-0.5">
                      {stats.dailyAdhkarChips.map((chip) => (
                        <span
                          key={chip.label}
                          className="px-2 py-0.5 rounded-full text-[9.5px] font-bold"
                          style={{
                            background: chip.done ? palette.activeTileBg : palette.emptyTileBg,
                            border: `1px solid ${chip.done ? palette.goldAccent : palette.emptyTileBorder}`,
                            color: chip.done ? palette.activeChipText : palette.mutedText,
                            boxShadow: palette.tileShadow,
                          }}
                        >
                          {chip.done ? '✓ ' : ''}
                          {chip.label}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {viewRange === 'weekly' && (
                  <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5">
                    {stats.daysStats.map((d, i) => (
                      <div
                        key={i}
                        className="min-w-0 overflow-hidden rounded-xl py-2 px-1 text-center"
                        style={{
                          background: d.progress >= 80 ? palette.activeTileBg : palette.tileBg,
                          border: `1px solid ${d.progress === 100 ? palette.goldAccent : d.progress >= 50 ? palette.frameBorder : palette.innerFrameBorder}`,
                          boxShadow: palette.tileShadow,
                        }}
                      >
                        <div className="text-[10px] sm:text-[9.5px] font-bold leading-tight whitespace-nowrap" style={{ color: palette.primaryText }}>{d.dayName}</div>
                        <div className="text-[8.5px] mt-0.5" style={{ color: palette.softTintText, opacity: 0.85 }}>
                          {d.dayNum}
                        </div>
                        <div
                          className="text-[11px] font-black font-sans mt-1"
                          style={{ color: d.progress >= 80 ? palette.goldAccent : palette.primaryText }}
                        >
                          {d.progress}%
                        </div>
                        <div className="text-[9.5px] mt-0.5">
                          {d.progress === 100 ? '⭐' : d.progress >= 50 ? '✓' : '•'}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {viewRange === 'monthly' && (
                  <div className="grid grid-cols-7 sm:grid-cols-10 gap-1">
                    {stats.daysStats.map((d, i) => (
                      <div
                        key={i}
                        className="min-w-0 overflow-hidden rounded-lg py-1 px-0.5 text-center"
                        style={{
                          background:
                            d.progress >= 80
                              ? palette.activeTileBg
                              : d.progress > 0
                                ? palette.tileBg
                                : palette.emptyTileBg,
                          border: `1px solid ${
                            d.progress === 100
                              ? palette.goldAccent
                              : d.progress > 0
                                ? palette.frameBorder
                                : palette.emptyTileBorder
                          }`,
                          boxShadow: palette.tileShadow,
                        }}
                      >
                        <div className="text-[9px] font-bold font-sans leading-none" style={{ color: palette.mutedText }}>{d.dayNum}</div>
                        <div
                          className="text-[8.5px] font-black font-sans mt-0.5 leading-none"
                          style={{ color: d.progress >= 80 ? palette.goldAccent : palette.primaryText }}
                        >
                          {d.progress}%
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Hadith & Dedication Footer */}
              <div className="text-center pt-2" style={{ borderTop: `1px solid ${palette.innerFrameBorder}` }}>
                <p className="text-xs font-amiri font-bold" style={{ color: palette.goldAccent }}>
                  «أَحَبُّ الأَعْمَالِ إِلَى اللهِ أَدْوَمُهَا وَإِنْ قَلَّ»
                </p>
                <p className="text-[10px] font-amiri mt-0.5" style={{ color: palette.softTintText }}>
                  صدقة جارية عن أرواح أحمد وليلى 🤍
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Toast */}
          {toastMsg && (
            <div
              className="app-3d-toast absolute bottom-5 left-1/2 -translate-x-1/2 max-w-[85vw] w-max text-xs sm:text-sm font-bold py-2.5 px-4 rounded-2xl z-50 pointer-events-none flex items-center justify-center gap-2.5 text-center leading-normal break-words"
              style={toast3D.style}
            >
              <span
                className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                style={toast3D.iconStyle}
              >
                <Check className="w-3 h-3 stroke-[3]" />
              </span>
              <span>{toastMsg}</span>
            </div>
          )}
      </div>
    </div>
  );
};

export default WeeklyAchievementModal;
