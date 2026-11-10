import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { getPrayerDisplayName, tPrayer } from '../../utils/prayerTimesTranslations';
import { 
    Moon, 
    Sun, 
    CloudSun, 
    Sunset, 
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
    onOpenWeather
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

    return (
        <div 
            dir={dir}
            className={`prayer-card app-page-card border-0 rounded-2xl pt-1.5 pb-1.5 px-3 sm:pt-2 sm:pb-2 sm:px-3.5 flex flex-col items-center justify-between relative min-h-[124px] transition-all duration-300 ${
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
            <div className="w-full flex justify-between items-start z-10 relative px-0.5 pt-3 sm:pt-3.5">
                {/* 1. Left Side: Weather Chip (No Background, No Info Circle) */}
                <button
                    id={idx === 0 ? "prayer-card-weather-btn" : undefined}
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        if (onOpenWeather) onOpenWeather();
                    }}
                    className="inline-flex items-center gap-1 p-0.5 bg-transparent border-none shadow-none transition-opacity hover:opacity-80 cursor-pointer select-none active:scale-95 shrink-0 outline-none"
                    style={{
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

                {/* 2. Right Side: Bell and Settings stacked vertically (No Background) */}
                <div className="flex flex-col items-center gap-1 shrink-0">
                    {/* Bell / Mute Toggle Button */}
                    {prayerKey !== 'Sunrise' ? (
                        <button 
                            id={idx === 0 ? "prayer-sound-toggle-btn" : undefined}
                            type="button"
                            onClick={() => togglePrayerSound(prayerKey)} 
                            className="p-0.5 flex items-center justify-center transition-all active:scale-90 cursor-pointer bg-transparent"
                            style={{
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
                    ) : (
                        supportsDST && (
                            <button 
                                type="button"
                                onClick={toggleSummerTime}
                                className="p-0.5 flex items-center justify-center transition-colors text-xs cursor-pointer bg-transparent"
                                style={{
                                    color: isNextPrayer 
                                        ? nextTextColor 
                                        : (isBlackTheme ? '#FFFFFF' : '#000000')
                                }}
                                title={tPrayer('dstTooltip', language)}
                                aria-label={tPrayer('dstTooltip', language)}
                            >
                                <Clock className="w-5 h-5" />
                            </button>
                        )
                    )}

                    {/* Settings Button (stacked under Bell) */}
                    {prayerKey !== 'Sunrise' && (
                        <button 
                            id={idx === 0 ? "prayer-settings-btn" : undefined}
                            type="button"
                            onClick={() => openSettings(prayerKey)} 
                            className="p-0.5 flex items-center justify-center transition-all active:scale-90 cursor-pointer bg-transparent"
                            style={{
                                color: isNextPrayer 
                                    ? nextTextColor 
                                    : (isBlackTheme ? '#FFFFFF' : '#000000')
                            }}
                            title={tPrayer('customize', language)}
                            aria-label={tPrayer('customize', language)}
                        >
                            <SlidersHorizontal className="w-5 h-5" />
                        </button>
                    )}
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

            {/* Bottom: Iqama Chip */}
            <div className="w-full flex justify-center items-center z-10 relative -mt-3.5 pb-2.5 min-h-[18px]">
                {prayerKey !== 'Sunrise' && iqamaTime && !iqamaTime.includes('--') ? (
                    <button 
                        type="button"
                        onClick={() => openSettings(prayerKey)}
                        className="text-[11px] font-extrabold px-1 py-0.5 whitespace-nowrap leading-tight cursor-pointer hover:opacity-90 active:scale-95 transition-all flex items-center gap-1 bg-transparent border-0" 
                        style={{
                            color: isNextPrayer 
                                ? nextTextColor 
                                : (isBlackTheme ? '#FFFFFF' : '#000000'), 
                            backgroundColor: 'transparent',
                            border: 'none'
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
