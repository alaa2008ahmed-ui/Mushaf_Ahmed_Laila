import React, { useState, useEffect, useMemo } from 'react';
import { ChevronLeft, X } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { usePrayerTimes, computeTimesSync } from '../../context/PrayerTimesContext';
import { checkSupportsDST, applyOffset } from '../../utils/prayerTimesUtils';
import { recordAppVisit } from '../../utils/favoriteAppsManager';
import {
  PrayerScheduleSnapshot,
  resolveContextualReminder
} from '../../utils/islamicOccasionsEngine';

interface SmartSeasonalStripProps {
  onNavigate: (pageId: string, params?: any) => void;
}

const DISMISSED_STORAGE_KEY = 'smart_seasonal_strip_dismissed_v1';

export const SmartSeasonalStrip: React.FC<SmartSeasonalStripProps> = ({
  onNavigate
}) => {
  const { language, isRTL, dir, formatNumber } = useLanguage();
  const { times, config } = usePrayerTimes();
  const isEn = language === 'en';

  const getCityNow = () => {
    const cityTimezone =
      typeof localStorage !== 'undefined' ? localStorage.getItem('grandLocationTimezone') : null;
    let current = new Date();
    if (cityTimezone) {
      try {
        const cityTimeStr = current.toLocaleString('en-US', { timeZone: cityTimezone });
        current = new Date(cityTimeStr);
      } catch {}
    }
    return current;
  };

  const [nowDate, setNowDate] = useState<Date>(() => getCityNow());

  useEffect(() => {
    const interval = setInterval(() => {
      setNowDate(getCityNow());
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const [dismissedIds, setDismissedIds] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem(DISMISSED_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return {};
  });

  const prayerSchedule = useMemo<PrayerScheduleSnapshot | null>(() => {
    const getPrayerDate = (key: string, baseDate: Date): Date | null => {
      let rawTime = times?.[key];
      if (!rawTime || rawTime.includes('--')) {
        const fallbackLoc = config?.location?.lat
          ? config.location
          : { lat: 21.4225, lng: 39.8262 };
        const fallbackComputed = computeTimesSync(fallbackLoc, baseDate, isEn);
        if (fallbackComputed?.timings && (fallbackComputed.timings as any)[key]) {
          rawTime = (fallbackComputed.timings as any)[key];
        }
      }
      if (!rawTime || rawTime.includes('--')) return null;

      const supportsDST = checkSupportsDST(
        config?.location?.combinedCode,
        config?.location?.fullCountry
      );
      const isSummerTimeActive = Boolean(config?.isSummerTime && supportsDST);
      const totalOffset = (config?.prayerOffsets?.[key] || 0) + (isSummerTimeActive ? 60 : 0);
      const adjustedTime = applyOffset(rawTime, totalOffset);
      if (!adjustedTime || adjustedTime.includes('--')) return null;

      const [hours, minutes] = adjustedTime.split(':').map(Number);
      if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;

      const d = new Date(baseDate);
      d.setHours(hours, minutes, 0, 0);
      return d;
    };

    const fajrToday = getPrayerDate('Fajr', nowDate);
    const sunriseToday = getPrayerDate('Sunrise', nowDate);
    const dhuhrToday = getPrayerDate('Dhuhr', nowDate);
    const asrToday = getPrayerDate('Asr', nowDate);
    const maghribToday = getPrayerDate('Maghrib', nowDate);
    const ishaToday = getPrayerDate('Isha', nowDate);

    if (
      !fajrToday ||
      !sunriseToday ||
      !dhuhrToday ||
      !asrToday ||
      !maghribToday ||
      !ishaToday
    ) {
      return null;
    }

    const tomorrowBase = new Date(nowDate);
    tomorrowBase.setDate(tomorrowBase.getDate() + 1);
    const yesterdayBase = new Date(nowDate);
    yesterdayBase.setDate(yesterdayBase.getDate() - 1);

    const fajrTomorrow =
      getPrayerDate('Fajr', tomorrowBase) ||
      new Date(fajrToday.getTime() + 24 * 3600000);
    const maghribYesterday =
      getPrayerDate('Maghrib', yesterdayBase) ||
      new Date(maghribToday.getTime() - 24 * 3600000);

    return {
      fajrToday,
      sunriseToday,
      dhuhrToday,
      asrToday,
      maghribToday,
      ishaToday,
      fajrTomorrow,
      maghribYesterday
    };
  }, [
    times,
    config,
    isEn,
    nowDate.getFullYear(),
    nowDate.getMonth(),
    nowDate.getDate()
  ]);

  const activeReminder = useMemo(() => {
    if (!prayerSchedule) return null;
    return resolveContextualReminder(
      nowDate,
      prayerSchedule,
      isEn,
      formatNumber,
      'modern_home'
    );
  }, [nowDate, prayerSchedule, isEn, formatNumber]);

  if (!activeReminder || dismissedIds[activeReminder.id]) {
    return null;
  }

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = { ...dismissedIds, [activeReminder.id]: true };
    setDismissedIds(updated);
    try {
      localStorage.setItem(DISMISSED_STORAGE_KEY, JSON.stringify(updated));
    } catch {}
  };

  const handleAction = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!activeReminder.targetPage) return;
    recordAppVisit(activeReminder.targetPage);
    onNavigate(activeReminder.targetPage, activeReminder.targetParams);
  };

  return (
    <div
      dir={dir}
      onClick={activeReminder.targetPage ? handleAction : undefined}
      className={`w-full golden-3d-card px-3.5 py-2.5 sm:px-4 sm:py-3 select-none transition-all animate-fadeIn ${
        activeReminder.targetPage ? 'cursor-pointer' : ''
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex flex-col min-w-0 flex-1 text-start">
          <span className="card-header-title text-xs sm:text-[13px] font-black font-cairo text-[#451A03] leading-snug truncate">
            {activeReminder.title}
          </span>
          <span className="text-[10.5px] sm:text-[11px] font-medium text-amber-900/90 leading-snug mt-0.5">
            {activeReminder.subtitle}
          </span>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {activeReminder.actionLabel && activeReminder.targetPage && (
            <button
              type="button"
              onClick={handleAction}
              className="px-3 py-1.5 rounded-full golden-3d-pill-btn font-bold text-[11px] sm:text-xs flex items-center gap-1 active:scale-95 transition-all cursor-pointer shrink-0"
            >
              <span>{activeReminder.actionLabel}</span>
              <ChevronLeft className={`w-3.5 h-3.5 ${isRTL ? '' : 'rotate-180'}`} />
            </button>
          )}

          <button
            type="button"
            onClick={handleDismiss}
            className="p-1 rounded-full opacity-55 hover:opacity-100 active:scale-90 transition-all bg-transparent border-none outline-none cursor-pointer gold-accent-icon shrink-0"
            title={isEn ? 'Dismiss reminder' : 'إخفاء التذكير'}
            aria-label={isEn ? 'Dismiss reminder' : 'إخفاء التذكير'}
          >
            <X className="w-3.5 h-3.5 text-amber-900 stroke-[2.4]" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SmartSeasonalStrip;
