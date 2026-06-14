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
    togglePrayerSound,
    openSettings,
    formatTime12,
    formatTime12_clean,
    isSummerTime,
    toggleSummerTime,
    supportsDST
}) => {
    return (
        <div className="prayer-card rounded-2xl p-2 flex flex-col items-center justify-start themed-card relative h-auto min-h-[105px]" style={{borderColor: isNextPrayer ? (isDefaultTheme ? '#000000' : primaryColor) : 'var(--card-border)', borderWidth: isNextPrayer ? '2px' : '1px', backgroundColor: isDefaultTheme ? '#FFFFFF' : undefined}}>
            {/* Top row: Actions */}
            <div className="w-full flex justify-between items-start z-10 relative">
                {prayerKey !== 'Sunrise' ? (
                    <div id={idx === 0 ? "prayer-actions-container" : undefined} className="flex items-center gap-3">
                        <div onClick={() => togglePrayerSound(prayerKey)} className={`toggle-dot ${isMuted ? 'bg-red-500' : (isBlackTheme ? 'bg-white' : 'bg-green-500')} cursor-pointer`} style={{borderColor: primaryColor, width: '16px', height: '16px', borderRadius: '50%', borderWidth: '1px', borderStyle: 'solid'}}></div>
                        <button onClick={() => openSettings(prayerKey)} className="text-base opacity-70 hover:opacity-100 p-1" style={{ color: primaryColor }}><i className="fa-solid fa-sliders"></i></button>
                    </div>
                ) : (
                    supportsDST ? (
                        <button 
                            onClick={toggleSummerTime}
                            className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors border text-xs ${isSummerTime ? (isBlackTheme ? 'bg-white text-black border-white' : 'bg-green-500 text-white border-green-600') : 'bg-gray-200 text-gray-500 border-gray-300 dark:bg-gray-700 dark:text-gray-400 dark:border-gray-600'}`}
                        >
                            <i className="fa-solid fa-clock"></i>
                        </button>
                    ) : <div />
                )}
                
                <div className={`${isDefaultTheme ? 'bg-black/5' : 'themed-bg-alt'} w-8 h-8 rounded-xl flex items-center justify-center border shrink-0`} style={{color: idx % 2 === 0 ? primaryColor : secondaryColor, borderColor: 'var(--card-border)'}}>
                     <i className={`fa-regular ${prayerKey === 'Sunrise' ? 'fa-sun' : 'fa-moon'} text-base`}></i>
                </div>
            </div>

            {/* Middle: Name */}
            <div className="flex flex-col items-center -mt-3 z-0 relative">
                <h3 className="font-bold text-[10px] mb-0" style={{ color: primaryColor }}>{prayerNameAr}</h3>
                <span className="font-black text-sm" style={{ color: primaryColor }} dangerouslySetInnerHTML={{ __html: formatTime12(displayTimeStr) }}></span>
            </div>

            {/* Bottom: Iqama */}
            <div className="mt-auto pb-1 w-full flex justify-center min-h-[18px]">
                {prayerKey !== 'Sunrise' && iqamaTime && !iqamaTime.includes('--') && (
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full border whitespace-nowrap" style={{color: secondaryColor, backgroundColor: isBlackAndWhite ? '#333' : (isDefaultTheme ? '#f3f4f6' : themePalette1 + '1A'), borderColor: isBlackAndWhite ? '#FFF' : (isDefaultTheme ? '#e5e7eb' : themePalette1 + '33')}}>إقامة {formatTime12_clean(iqamaTime)}</span>
                )}
            </div>
        </div>
    );
};

export default PrayerCard;
