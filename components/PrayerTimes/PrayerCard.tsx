import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { getPrayerDisplayName, tPrayer } from '../../utils/prayerTimesTranslations';
import {
  Moon,
  Sun,
  CloudSun,
  Bell,
  BellOff,
  SlidersHorizontal,
  Clock,
  CloudRain,
  Cloud,
  Info
} from 'lucide-react';

export interface PrayerWeatherInfo {
    temp: number;
    code?: number;
    conditionAr?: string;
    conditionEn?: string;
}

interface PrayerCardProps {
    prayerKey: string;
    idx: number;
    displayTimeStr: string;
    iqamaTime: string;
    isMuted: boolean;
    isNextPrayer: boolean;
    prayerNameAr: string;
    primaryColor: string;
    secondaryColor: string;
    isBlackAndWhite: boolean;
    themePalette1: string;
    isDefaultTheme?: boolean;
    isBlackTheme?: boolean;
    isGoldenTheme?: boolean;
    cardBorderColor?: string;
    nextPrayerBorderColor?: string;
    togglePrayerSound: (key: string) => void;
    openSettings: (key: string) => void;
    formatTime12: (time: string) => string;
    formatTime12_clean: (time: string) => string;
    isSummerTime?: boolean;
    toggleSummerTime?: () => void;
    supportsDST?: boolean;
    weatherInfo?: PrayerWeatherInfo | null;
    onOpenWeather?: () => void;
    duhaTimeStr?: string;
}

const parseHexRgb = (hexColor: string): [number, number, number] => {
    const clean = (hexColor || '').replace('#', '').trim();
    if (clean.length === 3) {
        const r = parseInt(clean[0] + clean[0], 16);
        const g = parseInt(clean[1] + clean[1], 16);
        const b = parseInt(clean[2] + clean[2], 16);
        if (!isNaN(r) && !isNaN(g) && !isNaN(b)) return [r, g, b];
    } else if (clean.length === 6) {
        const r = parseInt(clean.substring(0, 2), 16);
        const g = parseInt(clean.substring(2, 4), 16);
        const b = parseInt(clean.substring(4, 6), 16);
        if (!isNaN(r) && !isNaN(g) && !isNaN(b)) return [r, g, b];
    }
    return [16, 185, 129];
};

const mixHex = (baseHex: string, targetHex: string, ratio: number): string => {
    const [r1, g1, b1] = parseHexRgb(baseHex);
    const [r2, g2, b2] = parseHexRgb(targetHex);
    const r = Math.round(r1 + (r2 - r1) * ratio);
    const g = Math.round(g1 + (g2 - g1) * ratio);
    const b = Math.round(b1 + (b2 - b1) * ratio);
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
};

const hexToRgba = (hexColor: string, alpha: number): string => {
    const [r, g, b] = parseHexRgb(hexColor);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const getHexLuminance = (hexColor: string): number => {
    const [r, g, b] = parseHexRgb(hexColor);
    return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
};

const PrayerCard: React.FC<PrayerCardProps> = ({
    prayerKey,
    idx,
    displayTimeStr,
    iqamaTime,
    isMuted,
    isNextPrayer,
    primaryColor,
    isDefaultTheme,
    isBlackTheme,
    isGoldenTheme,
    togglePrayerSound,
    openSettings,
    formatTime12,
    isSummerTime,
    toggleSummerTime,
    supportsDST,
    weatherInfo,
    onOpenWeather,
    duhaTimeStr
}) => {
    const { language, dir, formatNumber } = useLanguage();
    const isEn = language === 'en';

    // Render weather condition icon for prayer time
    const renderPrayerWeatherIcon = (code?: number, temp?: number, iconColor?: string) => {
        const iconClass = "w-4.5 h-4.5 shrink-0";
        const style = iconColor ? { color: iconColor } : undefined;
        if (code !== undefined) {
            if ([51, 53, 55, 61, 63, 65, 80, 81, 82, 95, 96, 99].includes(code)) {
                return <CloudRain className={iconClass} style={style} />;
            }
            if ([2, 3, 45, 48].includes(code)) {
                return <Cloud className={iconClass} style={style} />;
            }
        }
        if (temp !== undefined && temp >= 32) {
            return <Sun className={iconClass} style={style} />;
        }
        if (prayerKey === 'Fajr' || prayerKey === 'Isha') {
            return <Moon className={iconClass} style={style} />;
        }
        return <CloudSun className={iconClass} style={style} />;
    };

    // Dynamic Next Prayer Card styling adapted to the active theme
    const resolvedAccent = primaryColor || '#059669';
    const isLightNextBg = Boolean(
        isBlackTheme || (!isDefaultTheme && !isGoldenTheme && getHexLuminance(resolvedAccent) > 0.62)
    );

    const nextPrayerDynamicBg = (() => {
        if (isGoldenTheme) {
            return resolvedAccent;
        }
        if (isBlackTheme) {
            return 'linear-gradient(145deg, #FFFFFF 0%, #F4F4F5 65%, #E4E4E7 100%)';
        }
        if (isDefaultTheme) {
            return 'linear-gradient(145deg, #10B981 0%, #059669 60%, #047857 100%)';
        }
        const lightStop = mixHex(resolvedAccent, '#FFFFFF', 0.18);
        const darkStop = mixHex(resolvedAccent, '#000000', 0.18);
        return `linear-gradient(145deg, ${lightStop} 0%, ${resolvedAccent} 60%, ${darkStop} 100%)`;
    })();

    const nextTextColor = isLightNextBg ? '#000000' : '#FFFFFF';
    const cardBgColor = isNextPrayer
        ? nextPrayerDynamicBg
        : (isBlackTheme ? '#18181b' : '#FFFFFF');

    const inlineBtnClass = isNextPrayer ? 'unified-3d-btn border-0' : 'app-inner-3d-box unified-3d-btn border-0';
    const inlineBtnSurfaceStyle: React.CSSProperties = isNextPrayer
        ? (isLightNextBg
            ? {
                backgroundColor: isBlackTheme ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.52)',
                boxShadow: '0 2.5px 0 rgba(0, 0, 0, 0.14), 0 4px 8px rgba(0, 0, 0, 0.1), inset 0 1px 1px rgba(255, 255, 255, 0.85), inset 0 -1px 1.5px rgba(0, 0, 0, 0.08)',
            }
            : {
                backgroundColor: 'rgba(255, 255, 255, 0.16)',
                boxShadow: '0 2.5px 0 rgba(0, 0, 0, 0.22), 0 4px 8px rgba(0, 0, 0, 0.16), inset 0 1px 1px rgba(255, 255, 255, 0.42), inset 0 -1px 1.5px rgba(0, 0, 0, 0.14)',
            })
        : {
            backgroundColor: isBlackTheme ? '#27272a' : '#f8fafc',
        };

    return (
        <div 
            dir={dir}
            className={`prayer-card app-page-card border-0 rounded-2xl pt-1.5 pb-1.5 px-2.5 sm:pt-2 sm:pb-2 sm:px-3.5 flex flex-col items-center justify-between relative min-h-[128px] transition-all duration-300 ${
                isNextPrayer ? 'scale-[1.02]' : ''
            }`}
            style={{
                borderRadius: '16px',
                background: cardBgColor,
                border: 'none',
                color: isNextPrayer ? nextTextColor : undefined
            }}
        >
            {/* Top row: Weather chip on left, Bell & Settings stacked vertically on right */}
            <div className="w-full flex justify-between items-start z-10 relative px-0.5 pt-1.5 sm:pt-2">
                {/* 1. Left Side: Weather Chip */}
                <button
                    id={idx === 0 ? "prayer-card-weather-btn" : undefined}
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        if (onOpenWeather) onOpenWeather();
                    }}
                    className={`${inlineBtnClass} inline-flex items-center gap-1 px-2 py-1 rounded-xl cursor-pointer select-none shrink-0 outline-none`}
                    style={{
                        ...inlineBtnSurfaceStyle,
                        color: isNextPrayer
                            ? (isLightNextBg ? '#000000' : '#FFFFFF')
                            : (isBlackTheme ? '#E4E4E7' : '#000000')
                    }}
                    title={isEn 
                        ? (weatherInfo ? `${Number(weatherInfo.temp).toFixed(1)}°C - ${weatherInfo.conditionEn || 'Weather'}` : 'Outdoor Prayer Weather Info')
                        : (weatherInfo ? `${formatNumber(Number(weatherInfo.temp).toFixed(1))}°م - ${weatherInfo.conditionAr || 'الطقس'}` : 'طقس وقت الصلاة')}
                    aria-label={isEn ? 'Prayer weather' : 'طقس وقت الصلاة'}
                >
                    {renderPrayerWeatherIcon(
                        weatherInfo?.code ?? 0, 
                        weatherInfo?.temp ?? 24,
                        isNextPrayer
                            ? (isLightNextBg ? '#000000' : '#FFFFFF')
                            : (isBlackTheme ? '#E4E4E7' : '#000000')
                    )}
                    <span className="tabular-nums font-mono leading-none font-black text-xs sm:text-[13px]" style={{
                        color: isNextPrayer
                            ? (isLightNextBg ? '#000000' : '#FFFFFF')
                            : (isBlackTheme ? '#E4E4E7' : '#000000')
                    }}>
                        {weatherInfo 
                            ? (isEn ? `${Number(weatherInfo.temp).toFixed(1)}°` : `${formatNumber(Number(weatherInfo.temp).toFixed(1))}°`)
                            : (isEn ? 'Weather' : 'الطقس')}
                    </span>
                </button>

                {/* 2. Right Side: Bell and Settings stacked vertically */}
                <div className="flex flex-col items-center gap-1.5 shrink-0">
                    {/* Bell / Mute Toggle Button */}
                    <button 
                        id={idx === 0 ? "prayer-sound-toggle-btn" : undefined}
                        type="button"
                        onClick={() => togglePrayerSound(prayerKey)} 
                        className={`${inlineBtnClass} w-8 h-8 rounded-xl flex items-center justify-center cursor-pointer`}
                        style={{
                            ...inlineBtnSurfaceStyle,
                            color: isMuted 
                                ? '#EF4444' 
                                : (isNextPrayer 
                                    ? nextTextColor 
                                    : (isBlackTheme ? '#FFFFFF' : '#000000'))
                        }}
                        title={isMuted ? tPrayer('alertsMutedTooltip', language) : tPrayer('alertsActiveTooltip', language)}
                        aria-label={isMuted ? tPrayer('alertsMutedTooltip', language) : tPrayer('alertsActiveTooltip', language)}
                    >
                        {isMuted ? (
                            <BellOff className="w-5 h-5" />
                        ) : (
                            <Bell className="w-5 h-5" />
                        )}
                    </button>

                    {/* Settings Button (stacked under Bell) */}
                    <button 
                        id={idx === 0 ? "prayer-settings-btn" : undefined}
                        type="button"
                        onClick={() => openSettings(prayerKey)} 
                        className={`${inlineBtnClass} w-8 h-8 rounded-xl flex items-center justify-center cursor-pointer`}
                        style={{
                            ...inlineBtnSurfaceStyle,
                            color: isNextPrayer 
                                ? nextTextColor 
                                : (isBlackTheme ? '#FFFFFF' : '#000000')
                        }}
                        title={tPrayer('customize', language)}
                        aria-label={tPrayer('customize', language)}
                    >
                        <SlidersHorizontal className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Middle: Name & Time (Absolute 4-Way Dead Center of the Card) */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none z-0 -mt-2">
                <h3 
                    className="font-extrabold text-sm sm:text-base text-center leading-tight tracking-wide"
                    style={{ 
                        color: isNextPrayer 
                            ? nextTextColor 
                            : (isBlackTheme ? '#FFFFFF' : primaryColor),
                        textShadow: isNextPrayer && !isLightNextBg ? '0 1px 2px rgba(0,0,0,0.18)' : undefined
                    }}
                >
                    {getPrayerDisplayName(prayerKey, language)}
                </h3>
                <span 
                    className="font-black text-base sm:text-lg text-center leading-tight tracking-normal mt-0.5 tabular-nums"
                    style={{ 
                        color: isNextPrayer 
                            ? nextTextColor 
                            : (isBlackTheme ? '#FFFFFF' : primaryColor),
                        textShadow: isNextPrayer && !isLightNextBg ? '0 1px 2px rgba(0,0,0,0.18)' : undefined
                    }}
                    dangerouslySetInnerHTML={{ __html: formatTime12(displayTimeStr) }}
                />
            </div>

            {/* Bottom: Iqama Chip (or Duha Chip for Sunrise) */}
            <div className="w-full flex justify-center items-center z-10 relative -mt-2 pb-3 min-h-[22px]">
                {prayerKey === 'Sunrise' && duhaTimeStr && !duhaTimeStr.includes('--') ? (() => {
                    const [hh, mm] = duhaTimeStr.split(':');
                    const hInt = parseInt(hh, 10);
                    const isPm = !isNaN(hInt) && hInt >= 12;
                    const h12 = !isNaN(hInt) ? (hInt % 12 || 12) : 0;
                    const period = isEn ? (isPm ? 'PM' : 'AM') : (isPm ? 'م' : 'ص');
                    const formattedDuha = !isNaN(hInt)
                        ? (isEn ? `${h12}:${mm.padStart(2, '0')} ${period}` : `${formatNumber(`${h12}:${mm.padStart(2, '0')}`)} ${period}`)
                        : '--:--';
                    return (
                        <button 
                            type="button"
                            onClick={() => openSettings('Sunrise')}
                            className={`${inlineBtnClass} text-[11px] font-extrabold px-2.5 py-0.5 rounded-xl whitespace-nowrap leading-tight cursor-pointer flex items-center gap-1`} 
                            style={{
                                ...inlineBtnSurfaceStyle,
                                color: isNextPrayer 
                                    ? nextTextColor 
                                    : (isBlackTheme ? '#FFFFFF' : '#000000'),
                            }}
                            title={tPrayer('duhaButtonTooltip', language)}
                            aria-label={tPrayer('duhaButtonTooltip', language)}
                        >
                            <span style={{ color: isNextPrayer ? nextTextColor : (isBlackTheme ? '#FFFFFF' : '#000000') }}>{tPrayer('duha', language)}:</span>
                            <span className="font-mono tabular-nums font-extrabold" style={{ color: isNextPrayer ? nextTextColor : (isBlackTheme ? '#FFFFFF' : '#000000') }} dir={language === 'ar' ? 'rtl' : 'ltr'}>{formattedDuha}</span>
                        </button>
                    );
                })() : prayerKey !== 'Sunrise' && iqamaTime && !iqamaTime.includes('--') ? (
                    <button 
                        type="button"
                        onClick={() => openSettings(prayerKey)}
                        className={`${inlineBtnClass} text-[11px] font-extrabold px-2.5 py-0.5 rounded-xl whitespace-nowrap leading-tight cursor-pointer flex items-center gap-1`} 
                        style={{
                            ...inlineBtnSurfaceStyle,
                            color: isNextPrayer 
                                ? nextTextColor 
                                : (isBlackTheme ? '#FFFFFF' : '#000000'),
                        }}
                        title={tPrayer('iqamaButtonTooltip', language)}
                        aria-label={tPrayer('iqamaButtonTooltip', language)}
                    >
                        <span style={{ color: isNextPrayer ? nextTextColor : (isBlackTheme ? '#FFFFFF' : '#000000') }}>{tPrayer('iqama', language)}:</span>
                        <span className="font-mono tabular-nums font-extrabold" style={{ color: isNextPrayer ? nextTextColor : (isBlackTheme ? '#FFFFFF' : '#000000') }} dir={language === 'ar' ? 'rtl' : 'ltr'}>{formatNumber(iqamaTime)}</span>
                    </button>
                ) : (
                    <div className="h-4" />
                )}
            </div>
        </div>
    );
};

export default PrayerCard;
