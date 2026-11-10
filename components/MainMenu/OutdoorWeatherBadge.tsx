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
  CloudSun,
  X,
  Info,
  Sunset
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
  selectedPrayerKey?: string;
  hidePrayerTabs?: boolean;
  className?: string;
  compact?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
}

const PRAYER_KEYS = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

const PRAYER_NAMES: Record<string, { ar: string; en: string }> = {
  Fajr: { ar: 'صلاة الفجر', en: 'Fajr Prayer' },
  Sunrise: { ar: 'وقت الشروق', en: 'Sunrise Time' },
  Dhuhr: { ar: 'صلاة الظهر', en: 'Dhuhr Prayer' },
  Asr: { ar: 'صلاة العصر', en: 'Asr Prayer' },
  Maghrib: { ar: 'صلاة المغرب', en: 'Maghrib Prayer' },
  Isha: { ar: 'صلاة العشاء', en: 'Isha Prayer' }
};

const PRAYER_SHORT_NAMES: Record<string, { ar: string; en: string }> = {
  Fajr: { ar: 'الفجر', en: 'Fajr' },
  Sunrise: { ar: 'الشروق', en: 'Sunrise' },
  Dhuhr: { ar: 'الظهر', en: 'Dhuhr' },
  Asr: { ar: 'العصر', en: 'Asr' },
  Maghrib: { ar: 'المغرب', en: 'Maghrib' },
  Isha: { ar: 'العشاء', en: 'Isha' }
};

export const OutdoorWeatherBadge: React.FC<OutdoorWeatherBadgeProps> = ({
  lat,
  lng,
  fajrTimeStr,
  ishaTimeStr,
  selectedPrayerKey,
  hidePrayerTabs = false,
  className = '',
  compact = false,
  isOpen,
  onClose
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
  const [internalShowModal, setInternalShowModal] = useState<boolean>(false);
  const [activePrayerTab, setActivePrayerTab] = useState<string>(selectedPrayerKey || 'Fajr');

  const isModalOpen = isOpen !== undefined ? isOpen : internalShowModal;

  useEffect(() => {
    if (selectedPrayerKey) {
      setActivePrayerTab(selectedPrayerKey);
    }
  }, [selectedPrayerKey, isOpen]);

  const handleClose = () => {
    if (onClose) onClose();
    setInternalShowModal(false);
  };

  useEffect(() => {
    if (!lat || !lng) return;
    let isMounted = true;
    setLoading(true);

    fetchOutdoorPrayerWeather(lat, lng, fajrTimeStr, ishaTimeStr)
      .then((data) => {
        if (isMounted) {
          if (data) setWeather(data);
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
    if (!isModalOpen) return;
    const unregister = registerBackInterceptor(() => {
      handleClose();
      return true;
    });
    return unregister;
  }, [isModalOpen]);

  // Compute theme-matching styles for the weather modal
  const themeStyles = useMemo(() => {
    if (isDark) {
      return {
        badgeTextColor: 'text-amber-300',
        modalBg: 'bg-zinc-900 text-zinc-100 border-zinc-700/80 shadow-2xl shadow-black/60',
        currentCardBg: 'bg-zinc-800/90 border border-zinc-700/80 text-zinc-100 shadow-none',
        fajrCardBg: 'bg-zinc-800/80 border border-zinc-700/80 text-zinc-100 shadow-none',
        fajrTextColor: 'text-zinc-100',
        ishaCardBg: 'bg-zinc-800/80 border border-zinc-700/80 text-zinc-100 shadow-none',
        ishaTextColor: 'text-zinc-100',
        adviceBg: 'bg-zinc-800/90 border border-zinc-700/80 text-zinc-100 shadow-none',
        iconBg: 'bg-zinc-800 text-amber-400',
        closeBtnHover: 'hover:bg-white/10 text-zinc-300',
        tabActive: 'bg-amber-500 text-zinc-950 font-black shadow-md',
        tabInactive: 'bg-zinc-800/90 text-zinc-300 hover:bg-zinc-700/80'
      };
    }

    if (isSkyTheme) {
      return {
        badgeTextColor: 'text-sky-950',
        modalBg: 'bg-white text-slate-900 border border-slate-200/90 shadow-2xl shadow-black/20',
        currentCardBg: 'bg-sky-100/90 border border-sky-200 text-sky-950 shadow-none',
        fajrCardBg: 'bg-sky-100/80 border border-sky-200 text-sky-950 shadow-none',
        fajrTextColor: 'text-sky-950',
        ishaCardBg: 'bg-sky-100/80 border border-sky-200 text-sky-950 shadow-none',
        ishaTextColor: 'text-sky-950',
        adviceBg: 'bg-sky-100/90 border border-sky-200 text-sky-950 shadow-none',
        iconBg: 'bg-sky-500/20 text-sky-800',
        closeBtnHover: 'hover:bg-slate-100 text-slate-700',
        tabActive: 'bg-sky-600 text-white font-black shadow-md',
        tabInactive: 'bg-sky-50 text-sky-900 hover:bg-sky-100 border border-sky-200/60'
      };
    }

    if (isEmeraldTheme) {
      return {
        badgeTextColor: 'text-emerald-950',
        modalBg: 'bg-white text-slate-900 border border-slate-200/90 shadow-2xl shadow-black/20',
        currentCardBg: 'bg-emerald-100/90 border border-emerald-200 text-emerald-950 shadow-none',
        fajrCardBg: 'bg-emerald-100/80 border border-emerald-200 text-emerald-950 shadow-none',
        fajrTextColor: 'text-emerald-950',
        ishaCardBg: 'bg-emerald-100/80 border border-emerald-200 text-emerald-950 shadow-none',
        ishaTextColor: 'text-emerald-950',
        adviceBg: 'bg-emerald-100/90 border border-emerald-200 text-emerald-950 shadow-none',
        iconBg: 'bg-emerald-500/20 text-emerald-800',
        closeBtnHover: 'hover:bg-slate-100 text-slate-700',
        tabActive: 'bg-emerald-600 text-white font-black shadow-md',
        tabInactive: 'bg-emerald-50 text-emerald-900 hover:bg-emerald-100 border border-emerald-200/60'
      };
    }

    if (isBurgundyTheme) {
      return {
        badgeTextColor: 'text-rose-950',
        modalBg: 'bg-white text-slate-900 border border-slate-200/90 shadow-2xl shadow-black/20',
        currentCardBg: 'bg-rose-100/90 border border-rose-200 text-rose-950 shadow-none',
        fajrCardBg: 'bg-rose-100/80 border border-rose-200 text-rose-950 shadow-none',
        fajrTextColor: 'text-rose-950',
        ishaCardBg: 'bg-rose-100/80 border border-rose-200 text-rose-950 shadow-none',
        ishaTextColor: 'text-rose-950',
        adviceBg: 'bg-rose-100/90 border border-rose-200 text-rose-950 shadow-none',
        iconBg: 'bg-rose-500/20 text-rose-900',
        closeBtnHover: 'hover:bg-slate-100 text-slate-700',
        tabActive: 'bg-rose-700 text-white font-black shadow-md',
        tabInactive: 'bg-rose-50 text-rose-900 hover:bg-rose-100 border border-rose-200/60'
      };
    }

    // Default Amber / Golden Sand Theme
    return {
      badgeTextColor: 'text-amber-950',
      modalBg: 'bg-white text-slate-900 border border-slate-200/90 shadow-2xl shadow-black/20',
      currentCardBg: 'bg-amber-100/90 border border-amber-200 text-amber-950 shadow-none',
      fajrCardBg: 'bg-amber-100/80 border border-amber-200 text-amber-950 shadow-none',
      fajrTextColor: 'text-amber-950',
      ishaCardBg: 'bg-amber-100/80 border border-amber-200 text-amber-950 shadow-none',
      ishaTextColor: 'text-amber-950',
      adviceBg: 'bg-amber-100/90 border border-amber-200 text-amber-950 shadow-none',
      iconBg: 'bg-amber-500/20 text-amber-900',
      closeBtnHover: 'hover:bg-slate-100 text-slate-700',
      tabActive: 'bg-amber-600 text-white font-black shadow-md',
      tabInactive: 'bg-amber-50 text-amber-950 hover:bg-amber-100 border border-amber-200/60'
    };
  }, [isDark, isSkyTheme, isEmeraldTheme, isBurgundyTheme]);

  const activeWeather: OutdoorPrayerWeather = weather || {
    currentTemp: 24.0,
    currentCode: 0,
    currentConditionAr: 'صافٍ ومعتدل',
    currentConditionEn: 'Clear & Mild',
    fajrTemp: 20.0,
    ishaTemp: 22.0,
    prayerTemps: {
      Fajr: { temp: 20.0, code: 0, conditionAr: 'صافٍ ولطيف', conditionEn: 'Clear & Mild' },
      Sunrise: { temp: 21.5, code: 0, conditionAr: 'صافٍ مشرق', conditionEn: 'Sunny' },
      Dhuhr: { temp: 28.0, code: 0, conditionAr: 'مشمس ودافئ', conditionEn: 'Sunny & Warm' },
      Asr: { temp: 27.0, code: 0, conditionAr: 'صافٍ ومعتدل', conditionEn: 'Clear' },
      Maghrib: { temp: 23.0, code: 0, conditionAr: 'معتدل ولطيف', conditionEn: 'Pleasant' },
      Isha: { temp: 22.0, code: 0, conditionAr: 'صافٍ ولطيف', conditionEn: 'Clear & Mild' }
    },
    windSpeed: 12,
    humidity: 45,
    adviceAr: 'الطقس معتدل ولطيف للخروج لأداء صلاة الجماعة في المسجد.',
    adviceEn: 'Weather is pleasant for outdoor walk to the mosque.',
    isRainy: false,
    isCold: false,
    fetchedAt: Date.now()
  };

  const getPrayerWeatherData = (key: string) => {
    if (activeWeather.prayerTemps && activeWeather.prayerTemps[key]) {
      return activeWeather.prayerTemps[key];
    }
    if (key === 'Fajr') {
      return {
        temp: activeWeather.fajrTemp ?? (activeWeather.currentTemp - 2),
        code: activeWeather.currentCode,
        conditionAr: activeWeather.currentConditionAr,
        conditionEn: activeWeather.currentConditionEn
      };
    }
    if (key === 'Isha') {
      return {
        temp: activeWeather.ishaTemp ?? (activeWeather.currentTemp - 1),
        code: activeWeather.currentCode,
        conditionAr: activeWeather.currentConditionAr,
        conditionEn: activeWeather.currentConditionEn
      };
    }
    return {
      temp: activeWeather.currentTemp,
      code: activeWeather.currentCode,
      conditionAr: activeWeather.currentConditionAr,
      conditionEn: activeWeather.currentConditionEn
    };
  };

  const selectedPrayerData = getPrayerWeatherData(activePrayerTab);
  const selectedPrayerName = PRAYER_NAMES[activePrayerTab] || { ar: 'الصلاة', en: 'Prayer' };

  const renderWeatherIcon = (code?: number, temp?: number, sizeClass = "w-3.5 h-3.5") => {
    const t = temp !== undefined ? temp : activeWeather.currentTemp;
    const c = code !== undefined ? code : activeWeather.currentCode;
    const isR = [51, 53, 55, 61, 63, 65, 80, 81, 82, 95, 96, 99].includes(c);
    const isC = t <= 16;
    
    if (isR) return <CloudRain className={`${sizeClass} text-sky-500`} />;
    if (isC) return <Moon className={`${sizeClass} text-indigo-400`} />;
    if (t >= 32) return <Sun className={`${sizeClass} text-amber-500`} />;
    if (activePrayerTab === 'Maghrib' || activePrayerTab === 'Sunrise') return <Sunset className={`${sizeClass} text-amber-500`} />;
    return <CloudSun className={`${sizeClass} text-amber-500`} />;
  };

  const formatVal = (val: number | null | undefined) => {
    if (val === null || val === undefined || isNaN(val)) return '24.0';
    return Number(val).toFixed(1);
  };

  const formattedSelectedTemp = isEn 
    ? `${formatVal(selectedPrayerData.temp)}°C` 
    : `${formatNumber(formatVal(selectedPrayerData.temp))}°م`;

  // Specific guidance advice for the active prayer
  const getSpecificPrayerAdvice = (key: string, temp: number) => {
    const pName = isEn ? PRAYER_NAMES[key]?.en : PRAYER_NAMES[key]?.ar;
    const isR = activeWeather.isRainy;
    
    if (isR) {
      return isEn 
        ? `Rain expected during ${pName}. Bring an umbrella & enjoy the reward of walking to the mosque.`
        : `احتمال أمطار وقت ${pName}. احرص على حمل مظلة واحتساب أجر المشي للمسجد.`;
    }
    if (temp <= 15) {
      return isEn
        ? `Cold weather (${temp.toFixed(1)}°C) for ${pName}. Wear warm clothing for your walk to the mosque.`
        : `أجواء باردة (${formatNumber(temp.toFixed(1))}°م) وقت ${pName}. يُنصح بارتداء ثوب أو معطف دافئ.`;
    }
    if (temp >= 33) {
      return isEn
        ? `Hot weather (${temp.toFixed(1)}°C) for ${pName}. Stay hydrated and take a shaded route.`
        : `أجواء حارة (${formatNumber(temp.toFixed(1))}°م) وقت ${pName}. يُستحب المشي في الظل واصطحاب سجادة صلاة.`;
    }
    return isEn
      ? `Mild and pleasant weather (${temp.toFixed(1)}°C) for ${pName}. Enjoy a peaceful walk to the mosque.`
      : `أجواء معتدلة ولطيفة (${formatNumber(temp.toFixed(1))}°م) وقت ${pName}. خروج ممتع وأجواء مناسبة للجمعة والجماعة.`;
  };

  // Modal Content with top X button only and no bottom close button
  const modalContent = isModalOpen && typeof document !== 'undefined' ? createPortal(
    <div
      className="fixed inset-0 z-[999999] flex items-center justify-center p-3.5 bg-black/40 backdrop-blur-xs pointer-events-auto animate-fadeIn"
      onClick={handleClose}
    >
      <div
        className={`w-full max-w-[345px] sm:max-w-[365px] rounded-3xl p-4 relative border overflow-hidden transition-all ${themeStyles.modalBg}`}
        onClick={(e) => e.stopPropagation()}
        dir={isEn ? 'ltr' : 'rtl'}
      >
        {/* Header Title with X Close Button at Top ONLY */}
        <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-slate-200/80 dark:border-white/10">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${themeStyles.iconBg}`}>
              <Footprints className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h4 className="text-xs sm:text-sm font-extrabold leading-tight truncate">
                {isEn ? `Weather for ${selectedPrayerName.en}` : `طقس ${selectedPrayerName.ar}`}
              </h4>
              <p className="text-[9.5px] opacity-75 leading-tight mt-0.5 truncate">
                {isEn ? 'Prayer outdoor temperature & walking guide' : 'درجة الحرارة ودليل الخروج للمسجد هذه الصلاة'}
              </p>
            </div>
          </div>

          {/* Top X Button */}
          <button
            type="button"
            onClick={handleClose}
            className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-colors cursor-pointer active:scale-90 ${themeStyles.closeBtnHover}`}
            title={isEn ? 'Close' : 'إغلاق'}
            aria-label={isEn ? 'Close' : 'إغلاق'}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Interactive Prayer Tabs (الفجر، الشروق، الظهر، العصر، المغرب، العشاء) */}
        {!hidePrayerTabs && (
          <div className="my-2.5 flex items-center gap-1 overflow-x-auto no-scrollbar py-1 px-0.5">
            {PRAYER_KEYS.map((key) => {
              const isActive = activePrayerTab === key;
              const pData = getPrayerWeatherData(key);
              const pShortName = isEn ? PRAYER_SHORT_NAMES[key].en : PRAYER_SHORT_NAMES[key].ar;
              const pTempStr = isEn ? `${formatVal(pData.temp)}°` : `${formatNumber(formatVal(pData.temp))}°`;

              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setActivePrayerTab(key)}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[10.5px] transition-all shrink-0 cursor-pointer ${
                    isActive ? themeStyles.tabActive : themeStyles.tabInactive
                  }`}
                >
                  <span>{pShortName}</span>
                  <span className="opacity-90 font-mono text-[9.5px] tabular-nums">{pTempStr}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Guidance & Explanation Box */}
        <div className={`my-2 p-2.5 rounded-xl flex items-start gap-2 text-[10.5px] leading-relaxed border ${
          isDark ? 'bg-zinc-800/90 border-amber-500/30 text-amber-200' : 'bg-amber-50/90 border-amber-200 text-amber-950'
        }`}>
          <Info className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
          <p className="font-medium">
            {isEn 
              ? `Guidance: Outdoor temperature forecast specifically for ${selectedPrayerName.en} at your location.`
              : `إرشاد: حالة الطقس ودرجة الحرارة الخرجية المتوقعة تحديداً بوقت ${selectedPrayerName.ar}.`}
          </p>
        </div>

        {/* Current Condition Card for Selected Prayer */}
        <div className={`my-2.5 p-3 rounded-xl flex items-center justify-between ${themeStyles.currentCardBg}`}>
          <div className="flex items-center gap-2.5">
            <div className={`p-1.5 rounded-lg ${themeStyles.iconBg}`}>
              {renderWeatherIcon(selectedPrayerData.code, selectedPrayerData.temp, "w-5 h-5")}
            </div>
            <div>
              <span className="text-xl font-black tabular-nums leading-none">
                {formattedSelectedTemp}
              </span>
              <div className="text-[11px] font-semibold mt-0.5 opacity-90">
                {isEn ? (selectedPrayerData.conditionEn || 'Mild') : (selectedPrayerData.conditionAr || 'معتدل')}
              </div>
            </div>
          </div>

          {/* Wind & Humidity */}
          <div className="flex flex-col text-end text-[10px] space-y-0.5 opacity-80">
            <div className="flex items-center justify-end gap-1">
              <Wind className="w-3 h-3 text-sky-500" />
              <span>{isEn ? `${activeWeather.windSpeed} km/h` : `${formatNumber(activeWeather.windSpeed)} كم/س`}</span>
            </div>
            <div className="flex items-center justify-end gap-1">
              <Droplets className="w-3 h-3 text-blue-500" />
              <span>{isEn ? `${activeWeather.humidity}%` : `%${formatNumber(activeWeather.humidity)}`}</span>
            </div>
          </div>
        </div>

        {/* Mosque Walk Recommendation tailored for selected prayer */}
        <div className={`mt-2.5 p-3 rounded-xl flex items-start gap-2 text-[11px] font-medium leading-relaxed ${themeStyles.adviceBg}`}>
          <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
          <p>
            {getSpecificPrayerAdvice(activePrayerTab, selectedPrayerData.temp)}
          </p>
        </div>
      </div>
    </div>,
    document.body
  ) : null;

  const currentBadgeTemp = isEn 
    ? `${formatVal(activeWeather.currentTemp)}°C` 
    : `${formatNumber(formatVal(activeWeather.currentTemp))}°م`;

  return (
    <>
      {/* Trigger Button with NO background pill/box */}
      <button
        id="home-prayer-weather-btn"
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setInternalShowModal(true);
        }}
        className={`inline-flex items-center gap-1 font-bold text-[10px] sm:text-[11px] transition-opacity duration-200 shrink-0 border-none bg-transparent shadow-none p-0 outline-none select-none cursor-pointer hover:opacity-80 active:scale-95 ${themeStyles.badgeTextColor} ${className}`}
        title={isEn ? 'Click for Outdoor Prayer Weather Guidance' : 'انقر لرؤية دليل وإرشاد طقس الصلوات الخمس'}
      >
        {renderWeatherIcon()}
        <span className="tabular-nums">{currentBadgeTemp}</span>
      </button>

      {/* Portal Modal */}
      {modalContent}
    </>
  );
};

export default OutdoorWeatherBadge;
