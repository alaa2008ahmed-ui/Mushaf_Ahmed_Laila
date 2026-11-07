import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { 
  CloudRain, 
  Sun, 
  Moon, 
  Wind, 
  Droplets, 
  Footprints,
  Sparkles,
  CloudSun
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { fetchOutdoorPrayerWeather, OutdoorPrayerWeather } from '../../utils/weatherService';
import { registerBackInterceptor } from '../../hooks/useBackButton';

interface OutdoorWeatherBadgeProps {
  lat?: number;
  lng?: number;
  fajrTimeStr?: string;
  ishaTimeStr?: string;
  className?: string;
  compact?: boolean;
}

export const OutdoorWeatherBadge: React.FC<OutdoorWeatherBadgeProps> = ({
  lat,
  lng,
  fajrTimeStr,
  ishaTimeStr,
  className = '',
  compact = false
}) => {
  const { language, formatNumber } = useLanguage();
  const { isNightMode, themeKey, theme, homeThemeVariant } = useTheme();
  const isEn = language === 'en';

  const isBlackTheme = themeKey === 'deep_black' || theme.bgColor === '#000000' || theme.name === 'اسود' || theme.name === 'black';
  const isSkyTheme = !isNightMode && homeThemeVariant === 'sky';
  const isEmeraldTheme = !isNightMode && homeThemeVariant === 'emerald';
  const isBurgundyTheme = !isNightMode && homeThemeVariant === 'burgundy';
  const isDark = isNightMode || isBlackTheme;

  const [weather, setWeather] = useState<OutdoorPrayerWeather | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);

  useEffect(() => {
    if (!lat || !lng) return;
    let isMounted = true;
    setLoading(true);

    fetchOutdoorPrayerWeather(lat, lng, fajrTimeStr, ishaTimeStr)
      .then((data) => {
        if (isMounted) {
          setWeather(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [lat, lng, fajrTimeStr, ishaTimeStr]);

  // Handle hardware / browser back button when modal is open
  useEffect(() => {
    if (!showModal) return;
    const unregister = registerBackInterceptor(() => {
      setShowModal(false);
      return true;
    });
    return unregister;
  }, [showModal]);

  // Compute theme-matching styles for the weather modal
  const themeStyles = useMemo(() => {
    if (isDark) {
      return {
        badgeTextColor: 'text-amber-300',
        modalBg: 'bg-[#18181b] text-white border-zinc-700/90 shadow-2xl shadow-black/90',
        headerGradient: 'from-amber-500 via-emerald-500 to-indigo-500',
        currentCardBg: 'bg-zinc-800/80 border-zinc-700/80 text-white',
        fajrCardBg: 'bg-indigo-950/40 border-indigo-500/30',
        fajrTextColor: 'text-indigo-300',
        ishaCardBg: 'bg-sky-950/40 border-sky-500/30',
        ishaTextColor: 'text-sky-300',
        adviceBg: 'bg-amber-500/10 border-amber-500/30 text-amber-200',
        buttonBg: 'bg-amber-500 hover:bg-amber-600 text-zinc-950 font-black',
        iconBg: 'bg-amber-500/20 text-amber-400',
      };
    }

    if (isSkyTheme) {
      return {
        badgeTextColor: 'text-sky-950',
        modalBg: 'bg-[#f0f9ff] text-slate-800 border-sky-200 shadow-xl shadow-sky-900/15',
        headerGradient: 'from-sky-400 via-blue-500 to-indigo-500',
        currentCardBg: 'bg-sky-100/70 border-sky-200 text-sky-950',
        fajrCardBg: 'bg-indigo-50 border-indigo-200',
        fajrTextColor: 'text-indigo-800',
        ishaCardBg: 'bg-sky-50 border-sky-200',
        ishaTextColor: 'text-sky-800',
        adviceBg: 'bg-sky-100/80 border-sky-300/60 text-sky-950',
        buttonBg: 'bg-sky-600 hover:bg-sky-700 text-white font-bold',
        iconBg: 'bg-sky-500/20 text-sky-700',
      };
    }

    if (isEmeraldTheme) {
      return {
        badgeTextColor: 'text-emerald-950',
        modalBg: 'bg-[#ecfdf5] text-slate-800 border-emerald-200 shadow-xl shadow-emerald-900/15',
        headerGradient: 'from-emerald-500 via-teal-400 to-amber-500',
        currentCardBg: 'bg-emerald-100/70 border-emerald-200 text-emerald-950',
        fajrCardBg: 'bg-emerald-50 border-emerald-200',
        fajrTextColor: 'text-emerald-900',
        ishaCardBg: 'bg-teal-50 border-teal-200',
        ishaTextColor: 'text-teal-900',
        adviceBg: 'bg-emerald-100/80 border-emerald-300/60 text-emerald-950',
        buttonBg: 'bg-emerald-600 hover:bg-emerald-700 text-white font-bold',
        iconBg: 'bg-emerald-500/20 text-emerald-700',
      };
    }

    if (isBurgundyTheme) {
      return {
        badgeTextColor: 'text-rose-950',
        modalBg: 'bg-[#fff1f2] text-slate-800 border-rose-200 shadow-xl shadow-rose-900/15',
        headerGradient: 'from-rose-500 via-amber-500 to-rose-700',
        currentCardBg: 'bg-rose-100/70 border-rose-200 text-rose-950',
        fajrCardBg: 'bg-indigo-50 border-indigo-200',
        fajrTextColor: 'text-indigo-900',
        ishaCardBg: 'bg-rose-50 border-rose-200',
        ishaTextColor: 'text-rose-900',
        adviceBg: 'bg-rose-100/80 border-rose-300/60 text-rose-950',
        buttonBg: 'bg-rose-600 hover:bg-rose-700 text-white font-bold',
        iconBg: 'bg-rose-500/20 text-rose-700',
      };
    }

    // Default Amber / Golden Sand Theme
    return {
      badgeTextColor: 'text-amber-950',
      modalBg: 'bg-[#fffbeb] text-slate-800 border-amber-200 shadow-xl shadow-amber-900/15',
      headerGradient: 'from-amber-400 via-yellow-500 to-amber-600',
      currentCardBg: 'bg-amber-100/80 border-amber-200/80 text-amber-950',
      fajrCardBg: 'bg-amber-50 border-amber-200',
      fajrTextColor: 'text-amber-900',
      ishaCardBg: 'bg-orange-50 border-orange-200',
      ishaTextColor: 'text-orange-900',
      adviceBg: 'bg-amber-100/80 border-amber-300/60 text-amber-950',
      buttonBg: 'bg-amber-600 hover:bg-amber-700 text-white font-bold',
      iconBg: 'bg-amber-500/20 text-amber-800',
    };
  }, [isDark, isSkyTheme, isEmeraldTheme, isBurgundyTheme]);

  if (!weather || loading) {
    return null; // Silent fallback if weather cannot be fetched
  }

  const renderWeatherIcon = (sizeClass = "w-3.5 h-3.5") => {
    if (weather.isRainy) return <CloudRain className={`${sizeClass} text-sky-500`} />;
    if (weather.isCold) return <Moon className={`${sizeClass} text-indigo-400`} />;
    if (weather.currentTemp >= 32) return <Sun className={`${sizeClass} text-amber-500`} />;
    return <CloudSun className={`${sizeClass} text-amber-500`} />;
  };

  const formattedCurrentTemp = isEn ? `${weather.currentTemp}°C` : `${formatNumber(weather.currentTemp)}°م`;
  const formattedFajrTemp = weather.fajrTemp !== null ? (isEn ? `${weather.fajrTemp}°C` : `${formatNumber(weather.fajrTemp)}°م`) : null;
  const formattedIshaTemp = weather.ishaTemp !== null ? (isEn ? `${weather.ishaTemp}°C` : `${formatNumber(weather.ishaTemp)}°م`) : null;

  // Render Portal Modal directly into document.body with completely transparent backdrop (NO darkening/dimming)
  const modalContent = showModal && typeof document !== 'undefined' ? createPortal(
    <div
      className="fixed inset-0 z-[999999] flex items-center justify-center p-3 bg-transparent pointer-events-auto animate-fadeIn"
      onClick={() => setShowModal(false)}
    >
      <div
        className={`w-full max-w-[310px] sm:max-w-[320px] rounded-2xl p-3.5 sm:p-4 relative border overflow-hidden transition-all ${themeStyles.modalBg}`}
        onClick={(e) => e.stopPropagation()}
        dir={isEn ? 'ltr' : 'rtl'}
      >
        {/* Top Decorative Border Sheen */}
        <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${themeStyles.headerGradient}`} />
        
        {/* Header Title (NO X Button as requested) */}
        <div className="flex items-center gap-2.5 pb-2.5 border-b border-black/10 dark:border-white/10">
          <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${themeStyles.iconBg}`}>
            <Footprints className="w-3.5 h-3.5" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-extrabold leading-tight">
              {isEn ? 'Outdoor Prayer Weather' : 'طقس الخروج لصلوات الجماعة'}
            </h4>
            <p className="text-[9.5px] opacity-75 leading-tight mt-0.5">
              {isEn ? 'Fajr & Isha Temperature & Guidelines' : 'حالة الجو وتوجيهات صلاتي الفجر والعشاء'}
            </p>
          </div>
        </div>

        {/* Current Condition Card */}
        <div className={`my-2.5 p-2.5 rounded-xl border flex items-center justify-between ${themeStyles.currentCardBg}`}>
          <div className="flex items-center gap-2.5">
            <div className={`p-1.5 rounded-lg ${themeStyles.iconBg}`}>
              {renderWeatherIcon("w-5 h-5")}
            </div>
            <div>
              <span className="text-xl font-black tabular-nums leading-none">
                {formattedCurrentTemp}
              </span>
              <div className="text-[11px] font-semibold mt-0.5 opacity-90">
                {isEn ? weather.currentConditionEn : weather.currentConditionAr}
              </div>
            </div>
          </div>

          {/* Wind & Humidity */}
          <div className="flex flex-col text-end text-[10px] space-y-0.5 opacity-80">
            <div className="flex items-center justify-end gap-1">
              <Wind className="w-3 h-3 text-sky-500" />
              <span>{isEn ? `${weather.windSpeed} km/h` : `${formatNumber(weather.windSpeed)} كم/س`}</span>
            </div>
            <div className="flex items-center justify-end gap-1">
              <Droplets className="w-3 h-3 text-blue-500" />
              <span>{isEn ? `${weather.humidity}%` : `%${formatNumber(weather.humidity)}`}</span>
            </div>
          </div>
        </div>

        {/* Fajr & Isha Outdoor Temperatures */}
        <div className="grid grid-cols-2 gap-2 my-2.5">
          {/* Fajr Card */}
          <div className={`p-2 rounded-xl border flex flex-col items-center text-center ${themeStyles.fajrCardBg}`}>
            <div className={`flex items-center gap-1 font-bold text-[11px] mb-0.5 ${themeStyles.fajrTextColor}`}>
              <Moon className="w-3 h-3" />
              <span>{isEn ? 'Fajr Prayer' : 'صلاة الفجر'}</span>
            </div>
            <span className={`text-base font-black tabular-nums ${themeStyles.fajrTextColor}`}>
              {formattedFajrTemp || formattedCurrentTemp}
            </span>
            <span className="text-[9.5px] opacity-75 font-medium mt-0.5">
              {isEn ? 'Fajr Outdoor Temp' : 'حرارة وقت الفجر'}
            </span>
          </div>

          {/* Isha Card */}
          <div className={`p-2 rounded-xl border flex flex-col items-center text-center ${themeStyles.ishaCardBg}`}>
            <div className={`flex items-center gap-1 font-bold text-[11px] mb-0.5 ${themeStyles.ishaTextColor}`}>
              <Moon className="w-3 h-3" />
              <span>{isEn ? 'Isha Prayer' : 'صلاة العشاء'}</span>
            </div>
            <span className={`text-base font-black tabular-nums ${themeStyles.ishaTextColor}`}>
              {formattedIshaTemp || formattedCurrentTemp}
            </span>
            <span className="text-[9.5px] opacity-75 font-medium mt-0.5">
              {isEn ? 'Isha Outdoor Temp' : 'حرارة وقت العشاء'}
            </span>
          </div>
        </div>

        {/* Mosque Walk Recommendation */}
        <div className={`p-2.5 rounded-xl border flex items-start gap-1.5 text-[11px] font-medium leading-relaxed ${themeStyles.adviceBg}`}>
          <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
          <p>
            {isEn ? weather.adviceEn : weather.adviceAr}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowModal(false)}
          className={`w-full mt-3 py-1.5 rounded-xl text-xs transition-colors cursor-pointer ${themeStyles.buttonBg}`}
        >
          {isEn ? 'Close' : 'حسناً، فهمت'}
        </button>
      </div>
    </div>,
    document.body
  ) : null;

  return (
    <>
      {/* Trigger Button with NO background pill/box at all, seamlessly integrated with card text */}
      <button
        id="home-prayer-weather-btn"
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setShowModal(true);
        }}
        className={`inline-flex items-center gap-1 font-bold text-[10px] sm:text-[11px] transition-opacity duration-200 shrink-0 border-none bg-transparent shadow-none p-0 outline-none select-none cursor-pointer hover:opacity-80 active:scale-95 ${themeStyles.badgeTextColor} ${className}`}
        title={isEn ? 'Click for Outdoor Prayer Weather & Mosque Walk Info' : 'انقر لرؤية حالة الطقس لصلوات الفجر والعشاء والخروج للمسجد'}
      >
        {renderWeatherIcon()}
        <span className="tabular-nums">{formattedCurrentTemp}</span>
        
        {/* Short Fajr/Isha temp indicators if space allows */}
        {!compact && formattedFajrTemp && (
          <span className="opacity-80 ps-1 flex items-center gap-0.5">
            <span className="text-[9px] font-medium">{isEn ? 'Fajr:' : 'فجر:'}</span>
            <span className="tabular-nums">{formattedFajrTemp}</span>
          </span>
        )}
      </button>

      {/* Portal Modal */}
      {modalContent}
    </>
  );
};

export default OutdoorWeatherBadge;
