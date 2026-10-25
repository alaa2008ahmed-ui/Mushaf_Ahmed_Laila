import React from 'react';
import { Moon, Star, Clock, Bell, BellOff } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { getPrayerDisplayName, tPrayer } from '../../utils/prayerTimesTranslations';

interface NextPrayerCardProps {
    nextPrayer: { key: string; name: string } | null;
    times: Record<string, string>;
    countdown: string;
    isBlackAndWhite: boolean;
    themePalette0: string;
    themePalette1: string;
    isDefaultTheme?: boolean;
    isBlackTheme?: boolean;
    isDarkTheme?: boolean;
    themeCardBg?: string;
    themeTextColor?: string;
    cardBorderColor?: string;
    nextPrayerBorderColor?: string;
    formatTime12: (time: string) => string;
    applyOffset: (timeStr: string, offsetMins: number) => string;
    prayerOffset: number;
    nightTimes: { firstThird: string; midnight: string; lastThird: string };
    nightNotifications?: { firstThird: boolean; midnight: boolean; lastThird: boolean };
    onToggleNightNotification?: (key: 'firstThird' | 'midnight' | 'lastThird') => void;
}

const NextPrayerCard: React.FC<NextPrayerCardProps> = ({
    nextPrayer,
    times,
    countdown,
    isBlackAndWhite,
    isDefaultTheme,
    isBlackTheme,
    isDarkTheme,
    themeCardBg,
    themeTextColor,
    themePalette0,
    themePalette1,
    cardBorderColor,
    nextPrayerBorderColor,
    formatTime12,
    applyOffset,
    prayerOffset,
    nightTimes,
    nightNotifications = { firstThird: true, midnight: true, lastThird: true },
    onToggleNightNotification
}) => {
    const { language, dir } = useLanguage();
    if (!nextPrayer || !times[nextPrayer.key]) return null;

    const activeBorderColor = nextPrayerBorderColor || (isDefaultTheme ? '#059669' : (isBlackTheme || isBlackAndWhite ? '#FFFFFF' : themePalette0));
    const isDarkCard = Boolean(!isDefaultTheme && (isBlackTheme || isBlackAndWhite || isDarkTheme));
    const cardBackground = isDefaultTheme
        ? '#FFFFFF'
        : (isBlackTheme || isBlackAndWhite
            ? '#111111'
            : (themeCardBg || (isDarkTheme ? '#1e293b' : '#FFFFFF')));
    const cardTextColor = isDefaultTheme
        ? '#000000'
        : (isBlackTheme || isBlackAndWhite
            ? '#FFFFFF'
            : (themeTextColor || (isDarkTheme ? '#FFFFFF' : themePalette0)));
    const bellAccentColor = isDefaultTheme
        ? '#059669'
        : (isBlackTheme || isBlackAndWhite ? '#FFFFFF' : activeBorderColor);
    const bellBtnClass = isDarkCard ? 'bg-white/10 hover:bg-white/20' : 'bg-black/5 hover:bg-black/10';
    const dividerClass = isDarkCard ? 'bg-white/20' : 'bg-black/15';

    const formatNightTime = (timeStr: string) => {
        if (!timeStr || timeStr.includes('--')) return "--:-- --";
        let [h, m] = timeStr.split(':');
        let hInt = parseInt(h);
        const ap = hInt >= 12 ? 'pm' : 'am';
        hInt = hInt % 12 || 12;
        return `${hInt}:${m.toString().padStart(2, '0')} ${ap}`;
    };

    return (
        <div 
            id="next-prayer-card" 
            dir={dir}
            className="w-full shrink-0 rounded-2xl themed-card mb-1 relative overflow-hidden flex flex-col shadow-sm transition-all duration-200" 
            style={{
                backgroundColor: cardBackground,
                color: cardTextColor,
                border: `2.5px solid ${activeBorderColor}`
            }}
        >
            <div className="px-2.5 sm:px-4 py-4 sm:py-5 flex justify-between items-center gap-1.5 sm:gap-3 relative z-10">
                <div id="next-prayer-countdown-container" className="text-center flex flex-col items-center justify-center shrink-0">
                    <p className={`text-[10px] sm:text-[11px] font-bold opacity-95 mb-1 leading-tight ${language === 'ar' ? 'whitespace-nowrap' : ''}`}>
                        {tPrayer('remainingUntil', language)}{' '}
                        <span className="underline underline-offset-2" style={{ textDecorationColor: bellAccentColor }}>
                            {getPrayerDisplayName(nextPrayer.key, language)}
                        </span>
                    </p>
                    <p className="text-lg sm:text-xl font-black font-mono tracking-tighter leading-none whitespace-nowrap" dir="ltr">{countdown}</p>
                </div>
                <div id="night-times-container" className="flex gap-1.5 sm:gap-3 items-center shrink-0">
                    <div className="flex flex-col items-center">
                        <div className="flex items-center gap-0.5 sm:gap-1 opacity-95 mb-1">
                            {onToggleNightNotification && (
                                <button 
                                    onClick={() => onToggleNightNotification('firstThird')}
                                    className={`p-0.5 sm:p-1 rounded-full ${bellBtnClass} transition-colors cursor-pointer shrink-0`}
                                    title={tPrayer('firstThird', language)}
                                >
                                    {nightNotifications.firstThird ? <Bell className="w-3 h-3" style={{ color: bellAccentColor }} /> : <BellOff className="w-3 h-3 text-red-500 opacity-75" />}
                                </button>
                            )}
                            <span className="text-[9px] sm:text-[10px] font-bold whitespace-nowrap leading-tight">{tPrayer('firstThird', language)}</span>
                        </div>
                        <span className="text-[10px] sm:text-[11px] font-bold font-mono whitespace-nowrap leading-none" dir="ltr">{formatNightTime(nightTimes.firstThird)}</span>
                    </div>
                    <div className={`w-px h-7 ${dividerClass} shrink-0`}></div>
                    <div className="flex flex-col items-center">
                        <div className="flex items-center gap-0.5 sm:gap-1 opacity-95 mb-1">
                            {onToggleNightNotification && (
                                <button 
                                    onClick={() => onToggleNightNotification('midnight')}
                                    className={`p-0.5 sm:p-1 rounded-full ${bellBtnClass} transition-colors cursor-pointer shrink-0`}
                                    title={tPrayer('midnight', language)}
                                >
                                    {nightNotifications.midnight ? <Bell className="w-3 h-3" style={{ color: bellAccentColor }} /> : <BellOff className="w-3 h-3 text-red-500 opacity-75" />}
                                </button>
                            )}
                            <span className="text-[9px] sm:text-[10px] font-bold whitespace-nowrap leading-tight">{tPrayer('midnight', language)}</span>
                        </div>
                        <span className="text-[10px] sm:text-[11px] font-bold font-mono whitespace-nowrap leading-none" dir="ltr">{formatNightTime(nightTimes.midnight)}</span>
                    </div>
                    <div className={`w-px h-7 ${dividerClass} shrink-0`}></div>
                    <div className="flex flex-col items-center">
                        <div className="flex items-center gap-0.5 sm:gap-1 opacity-95 mb-1">
                            {onToggleNightNotification && (
                                <button 
                                    onClick={() => onToggleNightNotification('lastThird')}
                                    className={`p-0.5 sm:p-1 rounded-full ${bellBtnClass} transition-colors cursor-pointer shrink-0`}
                                    title={tPrayer('lastThird', language)}
                                >
                                    {nightNotifications.lastThird ? <Bell className="w-3 h-3" style={{ color: bellAccentColor }} /> : <BellOff className="w-3 h-3 text-red-500 opacity-75" />}
                                </button>
                            )}
                            <span className="text-[9px] sm:text-[10px] font-bold whitespace-nowrap leading-tight">{tPrayer('lastThird', language)}</span>
                        </div>
                        <span className="text-[10px] sm:text-[11px] font-bold font-mono whitespace-nowrap leading-none" dir="ltr">{formatNightTime(nightTimes.lastThird)}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NextPrayerCard;
