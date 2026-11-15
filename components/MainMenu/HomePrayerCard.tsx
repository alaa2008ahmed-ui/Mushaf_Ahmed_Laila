import React, { useState, useEffect } from 'react';
import { 
  Sun, 
  Sunset, 
  Moon, 
  CloudSun, 
  Clock, 
  Sparkles,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { usePrayerTimes, computeTimesSync } from '../../context/PrayerTimesContext';
import { useTheme } from '../../context/ThemeContext';
import { prayerNamesAr } from '../../data/prayerTimesData';
import { checkSupportsDST, applyOffset } from '../../utils/prayerTimesUtils';
import { PRAYER_NAMES_EN } from '../../utils/prayerTimesTranslations';
import { OutdoorWeatherBadge } from './OutdoorWeatherBadge';

interface HomePrayerCardProps {
  onNavigate: (pageId: string, params?: any) => void;
  cardRef?: React.RefObject<HTMLDivElement | null>;
}

const getClassicCityNow = () => {
  const cityTimezone = typeof localStorage !== 'undefined' ? localStorage.getItem('grandLocationTimezone') : null;
  let current = new Date();
  if (cityTimezone) {
    try {
      const cityTimeStr = current.toLocaleString('en-US', { timeZone: cityTimezone });
      current = new Date(cityTimeStr);
    } catch {
      // fallback to local time
    }
  }
  return current;
};

interface IsolatedClassicPrayerBodyProps {
  times: Record<string, string>;
  config: any;
  language: string;
  isBlackTheme: boolean;
  primaryColor: string;
  formatNumber: (n: number | string) => string;
  t: (key: string, fallback?: string) => string;
}

const IsolatedClassicPrayerBody: React.FC<IsolatedClassicPrayerBodyProps> = React.memo(({
  times,
  config,
  language,
  isBlackTheme,
  primaryColor,
  formatNumber,
  t,
}) => {
  const [nowDate, setNowDate] = useState<Date>(() => getClassicCityNow());

  useEffect(() => {
    const timer = setInterval(() => {
      setNowDate(getClassicCityNow());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const getPrayerDateTime = (key: string, baseDate: Date) => {
    let rawTime = times?.[key];
    if (!rawTime || rawTime.includes('--')) {
      const fallbackComputed = computeTimesSync(config.location, baseDate, language === 'en');
      if (fallbackComputed?.timings && (fallbackComputed.timings as any)[key]) {
        rawTime = (fallbackComputed.timings as any)[key];
      }
    }
    if (!rawTime || rawTime.includes('--')) return null;

    const supportsDST = checkSupportsDST(config.location?.combinedCode, config.location?.fullCountry);
    const isSummerTimeActive = config.isSummerTime && supportsDST;
    const totalOffset = (config.prayerOffsets?.[key] || 0) + (isSummerTimeActive ? 60 : 0);
    const adjustedTime = applyOffset(rawTime, totalOffset);

    if (!adjustedTime || adjustedTime.includes('--')) return null;

    const [hours, minutes] = adjustedTime.split(':').map(Number);
    const date = new Date(baseDate);
    date.setHours(hours, minutes, 0, 0);
    return date;
  };

  const formatTime12 = (date: Date | null) => {
    if (!date) return language === 'en' ? '--:--' : formatNumber('--:--');
    let h = date.getHours();
    const m = date.getMinutes().toString().padStart(2, '0');
    const isPM = h >= 12;
    h = h % 12 || 12;
    const hStr = h.toString().padStart(2, '0');

    if (language === 'en') {
      return `${hStr}:${m} ${isPM ? 'PM' : 'AM'}`;
    }
    const formattedDigits = formatNumber(`${hStr}:${m}`);
    return `${formattedDigits} ${isPM ? 'م' : 'ص'}`;
  };

  const renderPrayerIcon = (key: string, sizeClass = "w-4 h-4") => {
    switch (key) {
      case 'Fajr':
        return <Moon className={sizeClass} strokeWidth={2.2} />;
      case 'Dhuhr':
        return <Sun className={sizeClass} strokeWidth={2.2} />;
      case 'Asr':
        return <CloudSun className={sizeClass} strokeWidth={2.2} />;
      case 'Maghrib':
        return <Sunset className={sizeClass} strokeWidth={2.2} />;
      case 'Isha':
        return <Moon className={sizeClass} strokeWidth={2.2} />;
      default:
        return <Clock className={sizeClass} strokeWidth={2.2} />;
    }
  };

  const salahCalculation = () => {
    let fajrToday = getPrayerDateTime('Fajr', nowDate);
    let dhuhrToday = getPrayerDateTime('Dhuhr', nowDate);
    let asrToday = getPrayerDateTime('Asr', nowDate);
    let maghribToday = getPrayerDateTime('Maghrib', nowDate);
    let ishaToday = getPrayerDateTime('Isha', nowDate);

    if (!fajrToday || !dhuhrToday || !asrToday || !maghribToday || !ishaToday) {
      const fallbackLoc = config.location?.lat ? config.location : { lat: 21.4225, lng: 39.8262 };
      const fallback = computeTimesSync(fallbackLoc, nowDate, language === 'en');
      if (fallback?.timings) {
        const parsePrayerTime = (timeStr: string) => {
          const [h, m] = timeStr.split(':').map(Number);
          const d = new Date(nowDate);
          d.setHours(h, m, 0, 0);
          return d;
        };
        fajrToday = parsePrayerTime(fallback.timings.Fajr);
        dhuhrToday = parsePrayerTime(fallback.timings.Dhuhr);
        asrToday = parsePrayerTime(fallback.timings.Asr);
        maghribToday = parsePrayerTime(fallback.timings.Maghrib);
        ishaToday = parsePrayerTime(fallback.timings.Isha);
      }
    }

    if (!fajrToday || !dhuhrToday || !asrToday || !maghribToday || !ishaToday) {
      return {
        prevKey: 'Fajr',
        prevName: language === 'en' ? 'Fajr' : 'الفجر',
        prevDate: null,
        nextKey: 'Dhuhr',
        nextName: language === 'en' ? 'Dhuhr' : 'الظهر',
        nextDate: null,
        countdownStr: '--:--:--',
        progressPercent: 0,
      };
    }

    let prevKey = 'Isha';
    let prevDate = new Date(ishaToday);
    prevDate.setDate(prevDate.getDate() - 1);

    let nextKey = 'Fajr';
    let nextDate = fajrToday;

    if (nowDate < fajrToday) {
      prevKey = 'Isha';
      prevDate = new Date(ishaToday);
      prevDate.setDate(prevDate.getDate() - 1);
      nextKey = 'Fajr';
      nextDate = fajrToday;
    } else if (nowDate >= fajrToday && nowDate < dhuhrToday) {
      prevKey = 'Fajr';
      prevDate = fajrToday;
      nextKey = 'Dhuhr';
      nextDate = dhuhrToday;
    } else if (nowDate >= dhuhrToday && nowDate < asrToday) {
      prevKey = 'Dhuhr';
      prevDate = dhuhrToday;
      nextKey = 'Asr';
      nextDate = asrToday;
    } else if (nowDate >= asrToday && nowDate < maghribToday) {
      prevKey = 'Asr';
      prevDate = asrToday;
      nextKey = 'Maghrib';
      nextDate = maghribToday;
    } else if (nowDate >= maghribToday && nowDate < ishaToday) {
      prevKey = 'Maghrib';
      prevDate = maghribToday;
      nextKey = 'Isha';
      nextDate = ishaToday;
    } else {
      prevKey = 'Isha';
      prevDate = ishaToday;
      nextKey = 'Fajr';
      nextDate = new Date(fajrToday);
      nextDate.setDate(nextDate.getDate() + 1);
    }

    const prevName = language === 'en'
      ? (PRAYER_NAMES_EN[prevKey] || prevKey)
      : (prayerNamesAr[prevKey] || prevKey);

    const nextName = language === 'en'
      ? (PRAYER_NAMES_EN[nextKey] || nextKey)
      : (prayerNamesAr[nextKey] || nextKey);

    const totalDuration = nextDate.getTime() - prevDate.getTime();
    const elapsed = Math.max(0, nowDate.getTime() - prevDate.getTime());
    const progressPercent = totalDuration > 0
      ? Math.min(100, Math.max(0, (elapsed / totalDuration) * 100))
      : 0;

    const diffMs = Math.max(0, nextDate.getTime() - nowDate.getTime());
    const h = Math.floor(diffMs / 3600000);
    const m = Math.floor((diffMs % 3600000) / 60000);
    const s = Math.floor((diffMs % 60000) / 1000);
    const countdownStr = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;

    return {
      prevKey,
      prevName,
      prevDate,
      nextKey,
      nextName,
      nextDate,
      countdownStr,
      progressPercent
    };
  };

  const {
    prevKey,
    prevName,
    prevDate,
    nextKey,
    nextName,
    nextDate,
    countdownStr,
    progressPercent
  } = salahCalculation();

  return (
    <>
      {/* الصف العلوي: الصلاة السابقة والصلاة القادمة */}
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center shrink-0 transition-colors"
            style={{
              backgroundColor: isBlackTheme ? 'rgba(16, 185, 129, 0.18)' : `${primaryColor}14`,
              color: primaryColor,
            }}
          >
            {renderPrayerIcon(prevKey, "w-4 h-4 sm:w-4.5 sm:h-4.5")}
          </div>
          <div className="flex flex-col text-start">
            <span className={`text-[11px] font-medium leading-tight ${isBlackTheme ? 'text-zinc-400' : 'text-slate-400'}`}>
              {language === 'en' ? 'Previous' : t('prayer_card.previous', 'الصلاة السابقة')}
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className={`text-sm sm:text-base font-bold leading-tight ${isBlackTheme ? 'text-white' : 'text-slate-800'}`}>
                {prevName}
              </span>
              <span className={`text-[10px] sm:text-[11px] font-semibold tabular-nums ${isBlackTheme ? 'text-zinc-400' : 'text-slate-400'}`}>
                {formatTime12(prevDate)}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-row-reverse text-end">
          <div
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center shrink-0 transition-colors"
            style={{
              backgroundColor: isBlackTheme ? 'rgba(16, 185, 129, 0.18)' : `${primaryColor}14`,
              color: primaryColor,
            }}
          >
            {renderPrayerIcon(nextKey, "w-4 h-4 sm:w-4.5 sm:h-4.5")}
          </div>
          <div className="flex flex-col text-end">
            <span className={`text-[11px] font-medium leading-tight ${isBlackTheme ? 'text-zinc-400' : 'text-slate-400'}`}>
              {language === 'en' ? 'Next' : t('prayer_card.next', 'الصلاة القادمة')}
            </span>
            <div className="flex items-baseline justify-end gap-1.5 mt-0.5">
              <span className={`text-sm sm:text-base font-bold leading-tight ${isBlackTheme ? 'text-white' : 'text-slate-800'}`}>
                {nextName}
              </span>
              <span className={`text-[10px] sm:text-[11px] font-semibold tabular-nums ${isBlackTheme ? 'text-zinc-400' : 'text-slate-400'}`}>
                {formatTime12(nextDate)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* الصف الأوسط */}
      <div className="flex flex-col items-center justify-center my-3 sm:my-3.5" style={{ contain: 'layout style' }}>
        <div className="flex items-center gap-2 mb-0.5">
          <span className={`text-[11px] font-semibold tracking-wider select-none ${isBlackTheme ? 'text-zinc-400' : 'text-slate-400'}`}>
            {language === 'en' ? 'Remaining' : 'متبقي'}
          </span>
          <OutdoorWeatherBadge
            lat={config.location?.lat}
            lng={config.location?.lng}
            fajrTimeStr={times?.Fajr}
            ishaTimeStr={times?.Isha}
            compact={true}
          />
        </div>
        <div className="flex items-center justify-center gap-1.5">
          <span
            className={`text-3xl sm:text-4xl font-black font-mono tracking-tight tabular-nums select-all leading-tight min-h-[2.25rem] ${isBlackTheme ? 'text-white' : 'text-slate-800'}`}
            dir="ltr"
          >
            {language === 'en' ? countdownStr : formatNumber(countdownStr)}
          </span>
        </div>
      </div>

      {/* الصف السفلي */}
      <div className="w-full mt-1">
        <div className={`w-full h-2 rounded-full overflow-hidden relative ${isBlackTheme ? 'bg-zinc-800' : 'bg-slate-100'}`}>
          <div
            className="h-full rounded-full transition-all duration-1000 ease-linear"
            style={{
              width: `${progressPercent}%`,
              backgroundColor: primaryColor,
              boxShadow: `0 0 8px ${primaryColor}40`,
            }}
          />
        </div>

        <div className={`flex items-center justify-between text-[10px] mt-1.5 font-medium px-0.5 ${isBlackTheme ? 'text-zinc-400' : 'text-slate-400'}`}>
          <span className="tabular-nums">{formatTime12(prevDate)}</span>
          <span className="tabular-nums font-bold" style={{ color: primaryColor }}>
            {language === 'en' ? Math.round(progressPercent) : formatNumber(Math.round(progressPercent))}%
          </span>
          <span className="tabular-nums">{formatTime12(nextDate)}</span>
        </div>
      </div>
    </>
  );
});

export const HomePrayerCard: React.FC<HomePrayerCardProps> = React.memo(({ onNavigate, cardRef }) => {
  const { language, dir, t, formatNumber } = useLanguage();
  const { times, config } = usePrayerTimes();
  const { theme, themeKey } = useTheme();

  const isBlackTheme = themeKey === 'deep_black' || theme.bgColor === '#000000' || theme.name === 'اسود' || theme.name === 'black';
  const primaryColor = isBlackTheme ? '#10b981' : (theme.palette?.[0] || '#059669');

  return (
    <div
      ref={cardRef}
      id="main-prayer-status-card"
      dir={dir}
      onClick={() => onNavigate('prayer-times')}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onNavigate('prayer-times');
        }
      }}
      className={`w-full p-4 sm:p-5 cursor-pointer relative overflow-hidden select-none ${
        isBlackTheme ? 'bg-[#18181b] text-white tactile-3d-card-dark' : 'bg-white text-slate-800 tactile-3d-card-light'
      }`}
      title={language === 'en' ? 'Click to open Prayer Times' : 'انقر لعرض صفحة مواقيت الصلاة كاملة'}
    >
      {/* 3D Glossy specular sheen */}
      <div className="absolute inset-x-2 top-0.5 h-[35%] rounded-t-[18px] bg-gradient-to-b from-white/35 via-white/10 to-transparent pointer-events-none" />
      <div className="absolute inset-x-6 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/85 to-transparent rounded-full pointer-events-none" />
      <div className="absolute inset-x-4 bottom-0 h-[2px] bg-black/10 rounded-b-[20px] pointer-events-none" />

      <IsolatedClassicPrayerBody
        times={times}
        config={config}
        language={language}
        isBlackTheme={isBlackTheme}
        primaryColor={primaryColor}
        formatNumber={formatNumber}
        t={t}
      />
    </div>
  );
});

export default HomePrayerCard;
