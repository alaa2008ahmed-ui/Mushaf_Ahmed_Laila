import React from 'react';
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
    const { language, dir, formatNumber } = useLanguage();
    if (!nextPrayer || !times[nextPrayer.key]) return null;

    const isAr = language === 'ar';
    const primaryColor = isBlackTheme ? '#FFFFFF' : (themePalette0 || '#2E7D5E');
    // الفواصل الرأسية بوضوح تام وسمك مميز
    const dividerClass = isBlackTheme ? 'bg-zinc-500' : 'bg-slate-400/80';

    // Night notifications enabled by default
    const isFirstThirdEnabled = nightNotifications?.firstThird !== false;
    const isMidnightEnabled = nightNotifications?.midnight !== false;
    const isLastThirdEnabled = nightNotifications?.lastThird !== false;

    const formatNightTime = (timeStr: string) => {
        if (!timeStr || timeStr.includes('--')) return "--:-- --";
        const [h, m] = timeStr.split(':');
        let hInt = parseInt(h);
        const ap = hInt >= 12 ? (isAr ? 'م' : 'pm') : (isAr ? 'ص' : 'am');
        hInt = hInt % 12 || 12;
        const formattedDigits = isAr 
            ? `${formatNumber(hInt)}:${formatNumber(m.toString().padStart(2, '0'))}` 
            : `${hInt}:${m.toString().padStart(2, '0')}`;
        return `${formattedDigits} ${ap}`;
    };

    return (
        <div 
            id="next-prayer-card" 
            dir={dir}
            className={`app-page-card border-0 w-full shrink-0 rounded-2xl mb-2 relative overflow-hidden flex flex-col transition-all duration-300 ${
                isBlackTheme 
                    ? 'bg-[#18181b] text-white' 
                    : 'bg-white text-slate-800'
            }`}
            style={{ borderRadius: '16px', border: 'none' }}
        >
            <div className="px-1.5 sm:px-3 py-2 sm:py-2.5 flex justify-evenly items-center gap-0.5 sm:gap-2 relative z-10 w-full">
                {/* 1. عداد 'المتبقي على الصلاة' */}
                <div id="next-prayer-countdown-container" className="flex flex-col items-center justify-between text-center shrink-0 min-w-0 px-1">
                    <div className="h-5 flex items-center justify-center text-center gap-0.5 sm:gap-1 w-full">
                        <span className="text-[10px] sm:text-[11.5px] font-extrabold whitespace-nowrap leading-none text-center" style={{ color: isBlackTheme ? '#A1A1AA' : '#000000' }}>
                            {tPrayer('remainingUntil', language)}
                        </span>
                        <span className="text-[10px] sm:text-[11.5px] font-extrabold whitespace-nowrap leading-none text-center" style={{ color: primaryColor }}>
                            {getPrayerDisplayName(nextPrayer.key, language)}
                        </span>
                    </div>
                    <div className="flex items-center justify-center text-center w-full mt-1">
                        <p 
                            className="text-base sm:text-lg font-black font-mono tracking-tight leading-none whitespace-nowrap tabular-nums text-center" 
                            dir={isAr ? "rtl" : "ltr"}
                            style={{ color: primaryColor }}
                        >
                            {isAr ? formatNumber(countdown) : countdown}
                        </p>
                    </div>
                </div>

                {/* فاصل بارز وواضح بين العداد والتوقيتات */}
                <div className={`w-[1.5px] h-8 sm:h-9 ${dividerClass} shrink-0 self-center`}></div>

                {/* 2. أوقات أثلاث الليل: قابلة للضغط للتفعيل والتعطيل مع خط عرضي عند التعطيل بدون أيقونات جرس */}
                <div id="night-times-container" className="flex items-center justify-evenly flex-1 min-w-0">
                    {/* أول الليل */}
                    <button
                        type="button"
                        onClick={() => onToggleNightNotification?.('firstThird')}
                        className="flex flex-col items-center justify-between text-center shrink-0 min-w-0 px-2 sm:px-3 py-0.5 rounded-xl transition-all active:scale-95 cursor-pointer select-none group"
                        title={isFirstThirdEnabled 
                            ? (isAr ? 'تنبيه أول الليل مفعّل (انقر للتعطيل)' : 'First Third alert active (tap to mute)') 
                            : (isAr ? 'تنبيه أول الليل معطّل (انقر للتفعيل)' : 'First Third alert muted (tap to enable)')}
                        aria-label={tPrayer('firstThird', language)}
                    >
                        <div className="h-5 flex items-center justify-center text-center w-full">
                            <span 
                                className={`text-[10px] sm:text-[11.5px] font-extrabold whitespace-nowrap leading-none text-center transition-all ${
                                    isFirstThirdEnabled 
                                        ? '' 
                                        : 'line-through decoration-red-500 decoration-1.5 sm:decoration-2'
                                }`} 
                                style={{ color: isBlackTheme ? '#A1A1AA' : '#000000' }}
                            >
                                {tPrayer('firstThird', language)}
                            </span>
                        </div>
                        <div className="flex items-center justify-center text-center w-full mt-1">
                            <span 
                                className={`text-[10px] sm:text-[11.5px] font-bold font-mono whitespace-nowrap leading-none tabular-nums text-center transition-all ${
                                    isFirstThirdEnabled 
                                        ? '' 
                                        : 'line-through decoration-red-500 decoration-1.5 sm:decoration-2'
                                }`} 
                                style={{ color: isBlackTheme ? '#FFFFFF' : primaryColor }} 
                                dir={isAr ? "rtl" : "ltr"}
                            >
                                {formatNightTime(nightTimes.firstThird)}
                            </span>
                        </div>
                    </button>

                    <div className={`w-[1.5px] h-8 sm:h-9 ${dividerClass} shrink-0 self-center`}></div>

                    {/* منتصف الليل */}
                    <button
                        type="button"
                        onClick={() => onToggleNightNotification?.('midnight')}
                        className="flex flex-col items-center justify-between text-center shrink-0 min-w-0 px-2 sm:px-3 py-0.5 rounded-xl transition-all active:scale-95 cursor-pointer select-none group"
                        title={isMidnightEnabled 
                            ? (isAr ? 'تنبيه منتصف الليل مفعّل (انقر للتعطيل)' : 'Midnight alert active (tap to mute)') 
                            : (isAr ? 'تنبيه منتصف الليل معطّل (انقر للتفعيل)' : 'Midnight alert muted (tap to enable)')}
                        aria-label={tPrayer('midnight', language)}
                    >
                        <div className="h-5 flex items-center justify-center text-center w-full">
                            <span 
                                className={`text-[10px] sm:text-[11.5px] font-extrabold whitespace-nowrap leading-none text-center transition-all ${
                                    isMidnightEnabled 
                                        ? '' 
                                        : 'line-through decoration-red-500 decoration-1.5 sm:decoration-2'
                                }`} 
                                style={{ color: isBlackTheme ? '#A1A1AA' : '#000000' }}
                            >
                                {tPrayer('midnight', language)}
                            </span>
                        </div>
                        <div className="flex items-center justify-center text-center w-full mt-1">
                            <span 
                                className={`text-[10px] sm:text-[11.5px] font-bold font-mono whitespace-nowrap leading-none tabular-nums text-center transition-all ${
                                    isMidnightEnabled 
                                        ? '' 
                                        : 'line-through decoration-red-500 decoration-1.5 sm:decoration-2'
                                }`} 
                                style={{ color: isBlackTheme ? '#FFFFFF' : primaryColor }} 
                                dir={isAr ? "rtl" : "ltr"}
                            >
                                {formatNightTime(nightTimes.midnight)}
                            </span>
                        </div>
                    </button>

                    <div className={`w-[1.5px] h-8 sm:h-9 ${dividerClass} shrink-0 self-center`}></div>

                    {/* الثلث الأخير */}
                    <button
                        type="button"
                        onClick={() => onToggleNightNotification?.('lastThird')}
                        className="flex flex-col items-center justify-between text-center shrink-0 min-w-0 px-2 sm:px-3 py-0.5 rounded-xl transition-all active:scale-95 cursor-pointer select-none group"
                        title={isLastThirdEnabled 
                            ? (isAr ? 'تنبيه الثلث الأخير مفعّل (انقر للتعطيل)' : 'Last Third alert active (tap to mute)') 
                            : (isAr ? 'تنبيه الثلث الأخير معطّل (انقر للتفعيل)' : 'Last Third alert muted (tap to enable)')}
                        aria-label={tPrayer('lastThird', language)}
                    >
                        <div className="h-5 flex items-center justify-center text-center w-full">
                            <span 
                                className={`text-[10px] sm:text-[11.5px] font-extrabold whitespace-nowrap leading-none text-center transition-all ${
                                    isLastThirdEnabled 
                                        ? '' 
                                        : 'line-through decoration-red-500 decoration-1.5 sm:decoration-2'
                                }`} 
                                style={{ color: isBlackTheme ? '#A1A1AA' : '#000000' }}
                            >
                                {tPrayer('lastThird', language)}
                            </span>
                        </div>
                        <div className="flex items-center justify-center text-center w-full mt-1">
                            <span 
                                className={`text-[10px] sm:text-[11.5px] font-bold font-mono whitespace-nowrap leading-none tabular-nums text-center transition-all ${
                                    isLastThirdEnabled 
                                        ? '' 
                                        : 'line-through decoration-red-500 decoration-1.5 sm:decoration-2'
                                }`} 
                                style={{ color: isLastThirdEnabled ? (isBlackTheme ? '#FFFFFF' : primaryColor) : (isBlackTheme ? '#71717A' : '#94A3B8') }} 
                                dir={isAr ? "rtl" : "ltr"}
                            >
                                {formatNightTime(nightTimes.lastThird)}
                            </span>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NextPrayerCard;
