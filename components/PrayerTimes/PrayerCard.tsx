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
    Cloud
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

    // Select flat modern icon for each prayer
    const renderPrayerIcon = (key: string) => {
        const iconClass = "w-4 h-4";
        switch (key) {
            case 'Fajr':
                return <Moon className={iconClass} strokeWidth={2.2} />;
            case 'Sunrise':
                return <Sun className={iconClass} strokeWidth={2.2} />;
            case 'Dhuhr':
                return <Sun className={iconClass} strokeWidth={2.2} />;
            case 'Asr':
                return <CloudSun className={iconClass} strokeWidth={2.2} />;
            case 'Maghrib':
                return <Sunset className={iconClass} strokeWidth={2.2} />;
            case 'Isha':
                return <Moon className={iconClass} strokeWidth={2.2} />;
            default:
                return <Clock className={iconClass} strokeWidth={2.2} />;
        }
    };

    // Render weather condition icon for prayer time
    const renderPrayerWeatherIcon = (code?: number, temp?: number) => {
        const iconClass = "w-3 h-3 shrink-0";
        if (code !== undefined) {
            if ([51, 53, 55, 61, 63, 65, 80, 81, 82, 95, 96, 99].includes(code)) {
                return <CloudRain className={`${iconClass} text-sky-400`} />;
            }
            if ([2, 3, 45, 48].includes(code)) {
                return <Cloud className={`${iconClass} text-slate-400`} />;
            }
        }
        if (temp !== undefined && temp >= 32) {
            return <Sun className={`${iconClass} text-amber-500`} />;
        }
        if (prayerKey === 'Fajr' || prayerKey === 'Isha') {
            return <Moon className={`${iconClass} text-indigo-400`} />;
        }
        return <CloudSun className={`${iconClass} text-amber-500`} />;
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
            className={`prayer-card app-page-card border-0 rounded-2xl pt-3.5 pb-2.5 px-3 sm:pt-4 sm:pb-3 sm:px-3.5 flex flex-col items-center justify-between relative min-h-[122px] transition-all duration-300 ${
                isNextPrayer ? 'scale-[1.02]' : ''
            }`}
            style={{
                borderRadius: '16px',
                background: cardBgColor,
                border: 'none',
                color: isNextPrayer ? nextTextColor : undefined
            }}
        >
            {/* Top row: Actions & Integrated Weather Chip without expanding height */}
            <div className="w-full flex justify-between items-center z-10 relative px-0.5">
                {/* Right/Left 1: Prayer Icon Badge */}
                <div 
                    className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-colors"
                    style={{
                        backgroundColor: isNextPrayer
                            ? (isLightNextBg ? 'rgba(0, 0, 0, 0.09)' : 'rgba(255, 255, 255, 0.22)')
                            : (isBlackTheme ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0,0,0,0.04)'),
                        color: isNextPrayer ? nextTextColor : (isBlackTheme ? '#FFFFFF' : '#64748B'),
                        boxShadow: isNextPrayer
                            ? (isLightNextBg ? 'inset 0 1px 1px rgba(255,255,255,0.45)' : 'inset 0 1px 1px rgba(255,255,255,0.3)')
                            : undefined
                    }}
                >
                    {renderPrayerIcon(prayerKey)}
                </div>

                {/* Center: Integrated Weather Badge for this prayer */}
                {weatherInfo && (
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            if (onOpenWeather) onOpenWeather();
                        }}
                        className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold transition-all cursor-pointer select-none active:scale-95 ${
                            isNextPrayer
                                ? (isLightNextBg 
                                    ? 'bg-black/8 hover:bg-black/12 text-slate-800' 
                                    : 'bg-white/20 hover:bg-white/25 text-white')
                                : (isBlackTheme
                                    ? 'bg-white/10 hover:bg-white/15 text-zinc-300'
                                    : 'bg-slate-100 hover:bg-slate-200/80 text-slate-600')
                        }`}
                        title={isEn 
                            ? `${weatherInfo.temp}°C - ${weatherInfo.conditionEn || 'Weather'} (Click for details)` 
                            : `${formatNumber(weatherInfo.temp)}°م - ${weatherInfo.conditionAr || 'الطقس'} (انقر للتفاصيل)`}
                        aria-label={isEn ? 'Prayer weather' : 'طقس وقت الصلاة'}
                    >
                        {renderPrayerWeatherIcon(weatherInfo.code, weatherInfo.temp)}
                        <span className="tabular-nums font-mono leading-none">
                            {isEn ? `${weatherInfo.temp}°` : `${formatNumber(weatherInfo.temp)}°`}
                        </span>
                    </button>
                )}

                {prayerKey !== 'Sunrise' ? (
                    <div id={idx === 0 ? "prayer-actions-container" : undefined} className="flex items-center gap-1.5">
                        {/* Sound Toggle (Flat Modern Icon Button) */}
                        <button 
                            id={idx === 0 ? "prayer-sound-toggle-btn" : undefined}
                            type="button"
                            onClick={() => togglePrayerSound(prayerKey)} 
                            className={`w-7 h-7 rounded-full flex items-center justify-center transition-all active:scale-90 cursor-pointer ${
                                isMuted 
                                    ? (isNextPrayer ? 'bg-red-500/85 text-white' : 'bg-red-500/10 text-red-500') 
                                    : (isNextPrayer 
                                        ? (isLightNextBg ? 'bg-black/10 hover:bg-black/15' : 'bg-white/20 text-white hover:bg-white/30') 
                                        : (isBlackTheme 
                                            ? 'bg-white/10 text-white' 
                                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'))
                            }`}
                            style={
                                isNextPrayer
                                    ? {
                                        color: isMuted ? '#FFFFFF' : nextTextColor,
                                        boxShadow: isLightNextBg ? 'inset 0 1px 1px rgba(255,255,255,0.4)' : 'inset 0 1px 1px rgba(255,255,255,0.25)'
                                    }
                                    : undefined
                            }
                            title={isMuted ? tPrayer('alertsMutedTooltip', language) : tPrayer('alertsActiveTooltip', language)}
                            aria-label={isMuted ? tPrayer('alertsMutedTooltip', language) : tPrayer('alertsActiveTooltip', language)}
                        >
                            {isMuted ? (
                                <BellOff className="w-3.5 h-3.5" />
                            ) : (
                                <Bell className="w-3.5 h-3.5" />
                            )}
                        </button>

                        {/* Settings Button */}
                        <button 
                            id={idx === 0 ? "prayer-settings-btn" : undefined}
                            type="button"
                            onClick={() => openSettings(prayerKey)} 
                            className={`w-7 h-7 rounded-full flex items-center justify-center transition-all active:scale-90 cursor-pointer ${
                                isNextPrayer
                                    ? (isLightNextBg ? 'bg-black/10 hover:bg-black/15' : 'bg-white/20 text-white hover:bg-white/30')
                                    : 'text-slate-400 hover:text-slate-700 hover:bg-black/5 dark:hover:bg-white/10 dark:hover:text-white'
                            }`}
                            style={
                                isNextPrayer
                                    ? {
                                        color: nextTextColor,
                                        boxShadow: isLightNextBg ? 'inset 0 1px 1px rgba(255,255,255,0.4)' : 'inset 0 1px 1px rgba(255,255,255,0.25)'
                                    }
                                    : undefined
                            }
                            title={tPrayer('customize', language)}
                            aria-label={tPrayer('customize', language)}
                        >
                            <SlidersHorizontal className="w-3.5 h-3.5" />
                        </button>
                    </div>
                ) : (
                    supportsDST ? (
                        <button 
                            type="button"
                            onClick={toggleSummerTime}
                            className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors text-xs cursor-pointer ${
                                isNextPrayer
                                    ? (isLightNextBg ? 'bg-black/10' : 'bg-white/20 text-white')
                                    : (isSummerTime 
                                        ? (isBlackTheme ? 'bg-white text-black' : 'text-white') 
                                        : 'bg-slate-100 text-slate-400 dark:bg-white/10')
                            }`}
                            style={
                                isNextPrayer
                                    ? { color: nextTextColor }
                                    : (isSummerTime && !isBlackTheme ? { backgroundColor: primaryColor } : undefined)
                            }
                            title={tPrayer('dstTooltip', language)}
                            aria-label={tPrayer('dstTooltip', language)}
                        >
                            <Clock className="w-3.5 h-3.5" />
                        </button>
                    ) : <div />
                )}
            </div>

            {/* Middle: Name & Time */}
            <div className="flex-1 w-full flex flex-col items-center justify-center text-center py-1 z-0 relative">
                <h3 
                    className="font-bold text-xs sm:text-[13px] text-center leading-tight tracking-wide"
                    style={{ 
                        color: isNextPrayer 
                            ? nextTextColor 
                            : (isBlackTheme ? '#FFFFFF' : '#334155'),
                        textShadow: isNextPrayer && !isLightNextBg ? '0 1px 2px rgba(0,0,0,0.18)' : undefined
                    }}
                >
                    {getPrayerDisplayName(prayerKey, language)}
                </h3>
                <span 
                    className="font-black text-sm sm:text-base text-center leading-tight tracking-normal mt-0.5 tabular-nums"
                    style={{ 
                        color: isNextPrayer 
                            ? nextTextColor 
                            : (isBlackTheme ? '#FFFFFF' : '#0F172A'),
                        textShadow: isNextPrayer && !isLightNextBg ? '0 1px 2px rgba(0,0,0,0.18)' : undefined
                    }}
                    dangerouslySetInnerHTML={{ __html: formatTime12(displayTimeStr) }}
                />
            </div>

            {/* Bottom: Iqama Chip */}
            <div className="w-full flex justify-center items-center pb-0.5 min-h-[20px] z-0 relative">
                {prayerKey !== 'Sunrise' && iqamaTime && !iqamaTime.includes('--') ? (
                    <button 
                        type="button"
                        onClick={() => openSettings(prayerKey)}
                        className="text-[10px] font-bold px-2.5 py-0.5 rounded-full whitespace-nowrap leading-tight cursor-pointer hover:opacity-90 active:scale-95 transition-all flex items-center gap-1 shadow-2xs" 
                        style={{
                            color: isNextPrayer 
                                ? nextTextColor 
                                : (isBlackTheme ? '#FFFFFF' : '#475569'), 
                            backgroundColor: isNextPrayer 
                                ? (isLightNextBg ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255,255,255,0.22)') 
                                : (isBlackTheme ? 'rgba(255,255,255,0.1)' : '#F1F5F9'),
                            border: isNextPrayer
                                ? (isLightNextBg ? '1px solid rgba(0, 0, 0, 0.16)' : '1px solid rgba(255, 255, 255, 0.35)')
                                : 'none'
                        }}
                        title={tPrayer('iqamaButtonTooltip', language)}
                        aria-label={tPrayer('iqamaButtonTooltip', language)}
                    >
                        <span style={{ color: isNextPrayer ? nextTextColor : undefined }}>{tPrayer('iqama', language)}:</span>
                        <span className={`font-mono tabular-nums ${isNextPrayer ? 'font-black' : ''}`} style={{ color: isNextPrayer ? nextTextColor : undefined }} dir="ltr">{iqamaTime}</span>
                    </button>
                ) : (
                    <div className="h-4" />
                )}
            </div>
        </div>
    );
};

export default PrayerCard;
