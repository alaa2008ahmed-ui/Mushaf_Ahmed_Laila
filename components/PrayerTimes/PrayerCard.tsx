import React from 'react';

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
        : (isDefaultTheme ? '#FFFFFF' : undefined);

    const activeTextColor = isNextPrayer ? nextPrayerBorderColor : primaryColor;

    return (
        <div 
            className={`prayer-card rounded-2xl p-2 flex flex-col items-center justify-start themed-card relative h-auto min-h-[105px] transition-all duration-200 ${isNextPrayer ? 'shadow-md scale-[1.01]' : 'shadow-xs'}`} 
            style={{
                borderColor: activeBorderColor, 
                borderWidth: activeBorderWidth, 
                borderStyle: 'solid',
                backgroundColor: activeBgColor
            }}
        >
            {/* Top row: Actions */}
            <div className="w-full flex justify-between items-start z-10 relative">
                {prayerKey !== 'Sunrise' ? (
                    <div id={idx === 0 ? "prayer-actions-container" : undefined} className="flex items-center gap-2.5">
                        <div 
                            onClick={() => togglePrayerSound(prayerKey)} 
                            className={`toggle-dot ${isMuted ? 'bg-red-500' : (isBlackTheme ? 'bg-white' : (isNextPrayer ? 'bg-emerald-500' : 'bg-green-500'))} cursor-pointer`} 
                            style={{borderColor: activeBorderColor, width: '16px', height: '16px', borderRadius: '50%', borderWidth: '1.5px', borderStyle: 'solid'}}
                        ></div>
                        <button onClick={() => openSettings(prayerKey)} className="text-base opacity-75 hover:opacity-100 p-1" style={{ color: activeTextColor }}><i className="fa-solid fa-sliders"></i></button>
                    </div>
                ) : (
                    supportsDST ? (
                        <button 
                            onClick={toggleSummerTime}
                            className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors border text-xs ${isSummerTime ? (isBlackTheme ? 'bg-white text-black border-white' : 'bg-green-500 text-white border-green-600') : 'bg-gray-200 text-gray-500 border-gray-300 dark:bg-gray-700 dark:text-gray-400 dark:border-gray-600'}`}
                            style={{ borderColor: activeBorderColor }}
                        >
                            <i className="fa-solid fa-clock"></i>
                        </button>
                    ) : <div />
                )}
                
                <div 
                    className={`${isNextPrayer ? 'text-white' : (isDefaultTheme ? 'bg-black/5' : 'themed-bg-alt')} w-8 h-8 rounded-xl flex items-center justify-center border shrink-0`} 
                    style={{
                        backgroundColor: isNextPrayer ? nextPrayerBorderColor : undefined,
                        color: isNextPrayer ? '#FFFFFF' : (idx % 2 === 0 ? primaryColor : secondaryColor), 
                        borderColor: activeBorderColor,
                        borderWidth: '1px'
                    }}
                >
                     <i className={`fa-regular ${prayerKey === 'Sunrise' ? 'fa-sun' : 'fa-moon'} text-base`}></i>
                </div>
            </div>

            {/* Middle: Name & Next prayer badge if active */}
            <div className="flex flex-col items-center -mt-3 z-0 relative">
                {isNextPrayer && (
                    <span 
                        className="text-[8px] font-black px-2 py-0.5 rounded-full mb-0.5 text-white shadow-xs" 
                        style={{ backgroundColor: nextPrayerBorderColor }}
                    >
                        الصلاة القادمة
                    </span>
                )}
                <h3 className="font-bold text-[10px] mb-0" style={{ color: activeTextColor }}>{prayerNameAr}</h3>
                <span className="font-black text-sm" style={{ color: activeTextColor }} dangerouslySetInnerHTML={{ __html: formatTime12(displayTimeStr) }}></span>
            </div>

            {/* Bottom: Iqama */}
            <div className="mt-auto pb-1 w-full flex justify-center min-h-[18px]">
                {prayerKey !== 'Sunrise' && iqamaTime && !iqamaTime.includes('--') && (
                    <span 
                        className="text-[10px] font-bold px-2.5 py-0.5 rounded-full border whitespace-nowrap" 
                        style={{
                            color: isNextPrayer ? nextPrayerBorderColor : secondaryColor, 
                            backgroundColor: isNextPrayer ? (isDefaultTheme ? '#dcfce7' : `${nextPrayerBorderColor}20`) : (isBlackAndWhite ? '#333' : (isDefaultTheme ? '#f3f4f6' : themePalette1 + '1A')), 
                            borderColor: activeBorderColor
                        }}
                    >
                        إقامة {formatTime12_clean(iqamaTime)}
                    </span>
                )}
            </div>
        </div>
    );
};

export default PrayerCard;
