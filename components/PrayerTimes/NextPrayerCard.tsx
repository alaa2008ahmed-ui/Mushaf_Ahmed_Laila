import React from 'react';
import { Bell, BellOff } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { getPrayerDisplayName, tPrayer } from '../../utils/prayerTimesTranslations';

interface NextPrayerCardProps {
    nextPrayer: { key: string; name: string } | null;
    times: Record<string, string>;
    countdown: string;
    isBlackAndWhite?: boolean;
    themePalette0?: string;
    themePalette1?: string;
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
    isBlackTheme,
    themePalette0,
    nightTimes,
    nightNotifications = { firstThird: true, midnight: true, lastThird: true },
    onToggleNightNotification
}) => {
    const { language, dir } = useLanguage();
    if (!nextPrayer || !times[nextPrayer.key]) return null;

    const primaryColor = isBlackTheme ? '#FFFFFF' : (themePalette0 || '#2E7D5E');
    const dividerClass = isBlackTheme ? 'bg-white/10' : 'bg-slate-100';

    const formatNightTime = (timeStr: string) => {
        if (!timeStr || timeStr.includes('--')) return "--:-- --";
        const [h, m] = timeStr.split(':');
        let hInt = parseInt(h);
        const ap = hInt >= 12 ? 'pm' : 'am';
        hInt = hInt % 12 || 12;
        return `${hInt}:${m.toString().padStart(2, '0')} ${ap}`;
    };

    return (
        <div 
            id="next-prayer-card" 
            dir={dir}
            className={`w-full shrink-0 rounded-2xl mb-2 relative overflow-hidden flex flex-col transition-all duration-300 ${
                isBlackTheme 
                    ? 'bg-[#18181b] border border-white/10 text-white shadow-[0_8px_30px_-4px_rgba(0,0,0,0.7)]' 
                    : 'bg-white text-slate-800 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.06),0_4px_12px_-2px_rgba(0,0,0,0.03)]'
            }`}
            style={{ borderRadius: '16px' }}
        >
            <div className="px-2.5 sm:px-4 py-3 sm:py-4 flex justify-between items-center gap-1.5 sm:gap-3 relative z-10">
                {/* عداد 'المتبقي على الصلاة' داخل حاوية نظيفة بدون حدود، واستخدام لون الثيم لإبراز الأرقام */}
                <div id="next-prayer-countdown-container" className="text-start flex flex-col justify-center shrink-0 min-w-0">
                    <p className="text-[10px] sm:text-xs font-semibold text-slate-500 dark:text-zinc-400 mb-0.5 sm:mb-1 leading-tight flex items-center gap-1">
                        <span>{tPrayer('remainingUntil', language)}</span>
                        <span className="font-bold" style={{ color: primaryColor }}>
                            {getPrayerDisplayName(nextPrayer.key, language)}
                        </span>
                    </p>
                    <p 
                        className="text-lg sm:text-2xl md:text-3xl font-black font-mono tracking-tight leading-none whitespace-nowrap tabular-nums" 
                        dir="ltr"
                        style={{ color: primaryColor }}
                    >
                        {countdown}
                    </p>
                </div>

                {/* أوقات أثلاث الليل */}
                <div id="night-times-container" className="flex gap-1.5 sm:gap-2.5 items-center shrink-0 min-w-0">
                    {/* الثلث الأول */}
                    <div className="flex flex-col items-center">
                        <div className="flex items-center gap-0.5 sm:gap-1 mb-0.5 sm:mb-1">
                            {onToggleNightNotification && (
                                <button 
                                    type="button"
                                    onClick={() => onToggleNightNotification('firstThird')}
                                    className="p-0.5 sm:p-1 rounded-full transition-colors cursor-pointer shrink-0 hover:bg-black/5 dark:hover:bg-white/10"
                                    title={tPrayer('firstThird', language)}
                                >
                                    {nightNotifications.firstThird ? (
                                        <Bell className="w-3 h-3 sm:w-3.5 sm:h-3.5" style={{ color: primaryColor }} />
                                    ) : (
                                        <BellOff className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-red-500 opacity-75" />
                                    )}
                                </button>
                            )}
                            <span className="text-[9px] sm:text-[10.5px] font-medium text-slate-500 dark:text-zinc-400 whitespace-nowrap leading-tight">
                                {tPrayer('firstThird', language)}
                            </span>
                        </div>
                        <span className="text-[9.5px] sm:text-[11.5px] font-bold font-mono text-slate-800 dark:text-zinc-200 whitespace-nowrap leading-none tabular-nums" dir="ltr">
                            {formatNightTime(nightTimes.firstThird)}
                        </span>
                    </div>

                    <div className={`w-px h-6 sm:h-7 ${dividerClass} shrink-0`}></div>

                    {/* نصف الليل */}
                    <div className="flex flex-col items-center">
                        <div className="flex items-center gap-0.5 sm:gap-1 mb-0.5 sm:mb-1">
                            {onToggleNightNotification && (
                                <button 
                                    type="button"
                                    onClick={() => onToggleNightNotification('midnight')}
                                    className="p-0.5 sm:p-1 rounded-full transition-colors cursor-pointer shrink-0 hover:bg-black/5 dark:hover:bg-white/10"
                                    title={tPrayer('midnight', language)}
                                >
                                    {nightNotifications.midnight ? (
                                        <Bell className="w-3 h-3 sm:w-3.5 sm:h-3.5" style={{ color: primaryColor }} />
                                    ) : (
                                        <BellOff className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-red-500 opacity-75" />
                                    )}
                                </button>
                            )}
                            <span className="text-[9px] sm:text-[10.5px] font-medium text-slate-500 dark:text-zinc-400 whitespace-nowrap leading-tight">
                                {tPrayer('midnight', language)}
                            </span>
                        </div>
                        <span className="text-[9.5px] sm:text-[11.5px] font-bold font-mono text-slate-800 dark:text-zinc-200 whitespace-nowrap leading-none tabular-nums" dir="ltr">
                            {formatNightTime(nightTimes.midnight)}
                        </span>
                    </div>

                    <div className={`w-px h-6 sm:h-7 ${dividerClass} shrink-0`}></div>

                    {/* الثلث الأخير */}
                    <div className="flex flex-col items-center">
                        <div className="flex items-center gap-0.5 sm:gap-1 mb-0.5 sm:mb-1">
                            {onToggleNightNotification && (
                                <button 
                                    type="button"
                                    onClick={() => onToggleNightNotification('lastThird')}
                                    className="p-0.5 sm:p-1 rounded-full transition-colors cursor-pointer shrink-0 hover:bg-black/5 dark:hover:bg-white/10"
                                    title={tPrayer('lastThird', language)}
                                >
                                    {nightNotifications.lastThird ? (
                                        <Bell className="w-3 h-3 sm:w-3.5 sm:h-3.5" style={{ color: primaryColor }} />
                                    ) : (
                                        <BellOff className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-red-500 opacity-75" />
                                    )}
                                </button>
                            )}
                            <span className="text-[9px] sm:text-[10.5px] font-medium text-slate-500 dark:text-zinc-400 whitespace-nowrap leading-tight">
                                {tPrayer('lastThird', language)}
                            </span>
                        </div>
                        <span className="text-[9.5px] sm:text-[11.5px] font-bold font-mono text-slate-800 dark:text-zinc-200 whitespace-nowrap leading-none tabular-nums" dir="ltr">
                            {formatNightTime(nightTimes.lastThird)}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NextPrayerCard;
