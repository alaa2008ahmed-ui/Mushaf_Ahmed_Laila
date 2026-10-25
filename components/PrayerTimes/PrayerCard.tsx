import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { getPrayerDisplayName, tPrayer } from '../../utils/prayerTimesTranslations';

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
    prayerNameAr,
    primaryColor,
    secondaryColor,
    isBlackAndWhite,
    isDefaultTheme,
    isBlackTheme,
    themePalette1,
    cardBorderColor = isDefaultTheme ? '#000000' : (isBlackTheme ? '#FFFFFF' : primaryColor),
    nextPrayerBorderColor = isDefaultTheme ? '#059669' : (isBlackTheme ? '#10b981' : secondaryColor),
    togglePrayerSound,
    openSettings,
    formatTime12,
    formatTime12_clean,
    isSummerTime,
    toggleSummerTime,
    supportsDST
}) => {
    const { language, isRTL, dir } = useLanguage();
    // Current border color:
    // If next prayer -> always nextPrayerBorderColor
    // Otherwise -> cardBorderColor (#000000 in default theme, changes with each theme)
    const activeBorderColor = isNextPrayer ? nextPrayerBorderColor : cardBorderColor;
    const activeBorderWidth = isNextPrayer ? '2.5px' : '1.5px';
    
    // Background color:
    // If next prayer -> distinct background color / tint
    // In default theme: soft emerald tint (#f0fdf4) vs regular white (#FFFFFF)
    // In black theme: dark emerald tint vs dark
    // In other themes: subtle tint
    const activeBgColor = isNextPrayer
        ? (isDefaultTheme ? '#f0fdf4' : (isBlackTheme ? 'rgba(16, 185, 129, 0.12)' : 'rgba(5, 150, 105, 0.08)'))
        : (isDefaultTheme ? '#FFFFFF' : (isBlackTheme ? '#111111' : undefined));

    const activeTextColor = isBlackTheme ? '#FFFFFF' : (isNextPrayer ? nextPrayerBorderColor : primaryColor);

    return (
        <div 
            dir={dir}
            className={`prayer-card rounded-2xl p-2 flex flex-col items-center justify-between themed-card relative h-auto min-h-[105px] transition-all duration-200 ${isNextPrayer ? 'shadow-md scale-[1.01]' : 'shadow-xs'}`} 
            style={{
                borderColor: isBlackTheme ? '#FFFFFF' : activeBorderColor, 
                borderWidth: activeBorderWidth, 
                borderStyle: 'solid',
                backgroundColor: activeBgColor
            }}
        >
            {/* Top row: Actions (positioned at top corners so texts can be centered and raised) */}
            <div className="w-full flex justify-between items-start z-10 absolute top-2 inset-x-0 px-2.5 pointer-events-none">
                {prayerKey !== 'Sunrise' ? (
                    <div id={idx === 0 ? "prayer-actions-container" : undefined} className="flex items-center gap-2 pointer-events-auto">
                        <div 
                            id={idx === 0 ? "prayer-sound-toggle-btn" : undefined}
                            onClick={() => togglePrayerSound(prayerKey)} 
                            className={`toggle-dot ${isMuted ? 'bg-red-500' : (isBlackTheme ? 'bg-white' : (isNextPrayer ? 'bg-emerald-500' : 'bg-green-500'))} cursor-pointer transition-transform active:scale-90`} 
                            style={{borderColor: isBlackTheme ? '#FFFFFF' : activeBorderColor, width: '15px', height: '15px', borderRadius: '50%', borderWidth: '1.5px', borderStyle: 'solid'}}
                            title={isMuted ? tPrayer('alertsMutedTooltip', language) : tPrayer('alertsActiveTooltip', language)}
                        ></div>
                        <button 
                            id={idx === 0 ? "prayer-settings-btn" : undefined}
                            onClick={() => openSettings(prayerKey)} 
                            className="text-sm opacity-85 hover:opacity-100 p-0.5 transition-opacity cursor-pointer" 
                            style={{ color: isBlackTheme ? '#FFFFFF' : activeTextColor }} 
                            title={tPrayer('customize', language)}
                            aria-label={tPrayer('customize', language)}
                        >
                            <i className="fa-solid fa-sliders"></i>
                        </button>
                    </div>
                ) : (
                    supportsDST ? (
                        <button 
                            onClick={toggleSummerTime}
                            className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors border text-xs pointer-events-auto cursor-pointer ${isSummerTime ? (isBlackTheme ? 'bg-white text-black border-white' : 'bg-green-500 text-white border-green-600') : 'bg-gray-200 text-gray-500 border-gray-300 dark:bg-gray-700 dark:text-gray-400 dark:border-gray-600'}`}
                            style={{ borderColor: isBlackTheme ? '#FFFFFF' : activeBorderColor }}
                            title={tPrayer('dstTooltip', language)}
                            aria-label={tPrayer('dstTooltip', language)}
                        >
                            <i className="fa-solid fa-clock"></i>
                        </button>
                    ) : <div />
                )}
            </div>

            {/* Middle: Name & Time (Centered and raised slightly upwards) */}
            <div className="flex-1 w-full flex flex-col items-center justify-center text-center -mt-1 pt-3.5 pb-0.5 z-0 relative">
                <h3 className="font-bold text-[12px] sm:text-xs mb-0.5 text-center leading-tight tracking-wide" style={{ color: isBlackTheme ? '#FFFFFF' : activeTextColor }}>
                    {getPrayerDisplayName(prayerKey, language)}
                </h3>
                <span className="font-black text-sm sm:text-[15px] text-center leading-tight tracking-normal" style={{ color: isBlackTheme ? '#FFFFFF' : activeTextColor }} dangerouslySetInnerHTML={{ __html: formatTime12(displayTimeStr) }}></span>
            </div>

            {/* Bottom: Iqama */}
            <div className="w-full flex justify-center items-center pb-2.5 -translate-y-1.5 min-h-[18px] z-0 relative pointer-events-auto">
                {prayerKey !== 'Sunrise' && iqamaTime && !iqamaTime.includes('--') ? (
                    <button 
                        type="button"
                        onClick={() => openSettings(prayerKey)}
                        className="text-[10px] font-bold px-2.5 py-0.5 rounded-full border whitespace-nowrap leading-none cursor-pointer hover:opacity-90 active:scale-95 transition-all flex items-center gap-1" 
                        style={{
                            color: isBlackTheme ? '#FFFFFF' : (isNextPrayer ? nextPrayerBorderColor : secondaryColor), 
                            backgroundColor: isNextPrayer ? (isDefaultTheme ? '#dcfce7' : `${nextPrayerBorderColor}20`) : (isBlackTheme || isBlackAndWhite ? '#222222' : (isDefaultTheme ? '#f3f4f6' : themePalette1 + '1A')), 
                            borderColor: isBlackTheme ? '#FFFFFF' : activeBorderColor
                        }}
                        title={tPrayer('iqamaButtonTooltip', language)}
                    >
                        <span>{tPrayer('iqamaPrefix', language)} {formatTime12_clean(iqamaTime)}</span>
                    </button>
                ) : (
                    <div className="h-1" />
                )}
            </div>
        </div>
    );
};

export default PrayerCard;
