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
    Clock
} from 'lucide-react';

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
    cardBorderColor?: string;
    nextPrayerBorderColor?: string;
    togglePrayerSound: (key: string) => void;
    openSettings: (key: string) => void;
    formatTime12: (time: string) => string;
    formatTime12_clean: (time: string) => string;
    isSummerTime?: boolean;
    toggleSummerTime?: () => void;
    supportsDST?: boolean;
}

const PrayerCard: React.FC<PrayerCardProps> = ({
    prayerKey,
    idx,
    displayTimeStr,
    iqamaTime,
    isMuted,
    isNextPrayer,
    primaryColor,
    isBlackTheme,
    togglePrayerSound,
    openSettings,
    formatTime12,
    isSummerTime,
    toggleSummerTime,
    supportsDST
}) => {
    const { language, dir } = useLanguage();

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

    // Soft tinted background for current/next prayer (e.g. Asr) instead of colored border
    const cardBgColor = isNextPrayer
        ? (isBlackTheme ? 'rgba(255, 255, 255, 0.12)' : `${primaryColor}14`)
        : (isBlackTheme ? '#18181b' : '#FFFFFF');

    return (
        <div 
            dir={dir}
            className={`prayer-card rounded-2xl pt-4 pb-2.5 px-3 sm:pt-4 sm:pb-3 sm:px-3.5 flex flex-col items-center justify-between relative min-h-[122px] transition-all duration-300 ${
                isNextPrayer 
                    ? 'shadow-md scale-[1.01]' 
                    : (isBlackTheme 
                        ? 'shadow-[0_4px_20px_-2px_rgba(0,0,0,0.7)]' 
                        : 'shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05),0_2px_6px_-1px_rgba(0,0,0,0.02)]')
            }`}
            style={{
                borderRadius: '16px',
                backgroundColor: cardBgColor,
                border: isBlackTheme ? '1px solid rgba(255,255,255,0.08)' : 'none'
            }}
        >
            {/* Top row: Actions (positioned at top corners with breathing room from border) */}
            <div className="w-full flex justify-between items-center z-10 relative pt-1 px-0.5">
                {/* Prayer Icon Badge */}
                <div 
                    className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-colors"
                    style={{
                        backgroundColor: isBlackTheme 
                            ? 'rgba(255, 255, 255, 0.1)' 
                            : (isNextPrayer ? `${primaryColor}20` : 'rgba(0,0,0,0.04)'),
                        color: isNextPrayer ? primaryColor : (isBlackTheme ? '#FFFFFF' : '#64748B')
                    }}
                >
                    {renderPrayerIcon(prayerKey)}
                </div>

                {prayerKey !== 'Sunrise' ? (
                    <div id={idx === 0 ? "prayer-actions-container" : undefined} className="flex items-center gap-1.5">
                        {/* Sound Toggle (Flat Modern Icon Button) */}
                        <button 
                            id={idx === 0 ? "prayer-sound-toggle-btn" : undefined}
                            type="button"
                            onClick={() => togglePrayerSound(prayerKey)} 
                            className={`w-7 h-7 rounded-full flex items-center justify-center transition-all active:scale-90 cursor-pointer ${
                                isMuted 
                                    ? 'bg-red-500/10 text-red-500' 
                                    : (isBlackTheme 
                                        ? 'bg-white/10 text-white' 
                                        : (isNextPrayer ? `${primaryColor}20` : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'))
                            }`}
                            style={!isMuted && isNextPrayer ? { color: primaryColor } : undefined}
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
                            className="w-7 h-7 rounded-full flex items-center justify-center transition-all hover:bg-black/5 dark:hover:bg-white/10 active:scale-90 cursor-pointer text-slate-400 hover:text-slate-700 dark:hover:text-white"
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
                                isSummerTime 
                                    ? (isBlackTheme ? 'bg-white text-black' : 'text-white') 
                                    : 'bg-slate-100 text-slate-400 dark:bg-white/10'
                            }`}
                            style={isSummerTime && !isBlackTheme ? { backgroundColor: primaryColor } : undefined}
                            title={tPrayer('dstTooltip', language)}
                            aria-label={tPrayer('dstTooltip', language)}
                        >
                            <Clock className="w-3.5 h-3.5" />
                        </button>
                    ) : <div />
                )}
            </div>

            {/* Middle: Name & Time (Dark Gray for standard, Theme Color for current/next) */}
            <div className="flex-1 w-full flex flex-col items-center justify-center text-center py-1 z-0 relative">
                <h3 
                    className="font-bold text-xs sm:text-[13px] text-center leading-tight tracking-wide"
                    style={{ 
                        color: isBlackTheme 
                            ? '#FFFFFF' 
                            : (isNextPrayer ? primaryColor : '#334155') 
                    }}
                >
                    {getPrayerDisplayName(prayerKey, language)}
                </h3>
                <span 
                    className="font-black text-sm sm:text-base text-center leading-tight tracking-normal mt-0.5 tabular-nums"
                    style={{ 
                        color: isBlackTheme 
                            ? '#FFFFFF' 
                            : (isNextPrayer ? primaryColor : '#0F172A') 
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
                        className="text-[10px] font-bold px-2.5 py-0.5 rounded-full whitespace-nowrap leading-tight cursor-pointer hover:opacity-90 active:scale-95 transition-all flex items-center gap-1" 
                        style={{
                            color: isBlackTheme 
                                ? '#FFFFFF' 
                                : (isNextPrayer ? primaryColor : '#475569'), 
                            backgroundColor: isBlackTheme 
                                ? 'rgba(255,255,255,0.1)' 
                                : (isNextPrayer ? `${primaryColor}20` : '#F1F5F9')
                        }}
                        title={tPrayer('iqamaButtonTooltip', language)}
                        aria-label={tPrayer('iqamaButtonTooltip', language)}
                    >
                        <span>{tPrayer('iqama', language)}:</span>
                        <span className="font-mono tabular-nums" dir="ltr">{iqamaTime}</span>
                    </button>
                ) : (
                    <div className="h-4" />
                )}
            </div>
        </div>
    );
};

export default PrayerCard;
